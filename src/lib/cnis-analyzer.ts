import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";
import { z } from "zod";

const execFileAsync = promisify(execFile);

export const CnisAnalysisSchema = z.object({
  qualityScore: z.number().min(0).max(100),
  riskLevel: z.string(),
  contributionStatus: z.string(),
  tempoContribuicaoTotal: z.string(),
  carenciaTotal: z.number().nonnegative(),
  estimativaAposentadoria: z.string(),
  progressoAposentadoria: z.number().min(0).max(100),
  pendencies: z.array(z.object({
    indicator: z.string(),
    description: z.string(),
    recommendedAction: z.string(),
    relatedPeriods: z.array(z.string()).default([]),
    severity: z.string(),
  })),
  summary: z.string(),
  recommendations: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export type CnisAnalysis = z.infer<typeof CnisAnalysisSchema>;

export type CnisFacts = {
  text: string;
  pages: number;
  competencies: string[];
  indicators: string[];
  periods: Array<{ start: string; end: string; source: string }>;
  extractedByOcr: boolean;
};

const INDICATOR_RE = /\b(?:PEXT|AEXT|PREC-MENOR-MIN|IREC-LC123|IREC-MEI|PSC-MEN-SM|ACRÉSCIMO|EXTEMP|PEN|INDPEND|SAL-MIN)\b/gi;
const MONTH_RE = /\b(\d{2})\/(\d{4})\b/g;

function unique(values: string[]) {
  return [...new Set(values)];
}

export async function extractCnisFacts(pdf: Buffer): Promise<CnisFacts> {
  const parsed = await pdfParse(pdf);
  const text = parsed.text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").trim();
  const competencies = unique([...text.matchAll(MONTH_RE)].map((m) => `${m[1]}/${m[2]}`));
  const indicators = unique([...text.matchAll(INDICATOR_RE)].map((m) => m[0].toUpperCase()));

  if (text.length >= 250) {
    return { text, pages: parsed.numpages, competencies, indicators, periods: inferPeriods(text), extractedByOcr: false };
  }

  const ocrText = await ocrPdf(pdf);
  const combined = ocrText.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").trim();
  return {
    text: combined,
    pages: parsed.numpages,
    competencies: unique([...combined.matchAll(MONTH_RE)].map((m) => `${m[1]}/${m[2]}`)),
    indicators: unique([...combined.matchAll(INDICATOR_RE)].map((m) => m[0].toUpperCase())),
    periods: inferPeriods(combined),
    extractedByOcr: true,
  };
}

function inferPeriods(text: string) {
  const periods: Array<{ start: string; end: string; source: string }> = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const dates = [...line.matchAll(MONTH_RE)].map((m) => `${m[1]}/${m[2]}`);
    if (dates.length >= 2) periods.push({ start: dates[0], end: dates[1], source: line.slice(0, 180) });
  }
  return periods.slice(0, 500);
}

async function ocrPdf(pdf: Buffer): Promise<string> {
  const workdir = await mkdtemp(join(tmpdir(), "nelson-cnis-"));
  const pdfPath = join(workdir, "document.pdf");
  try {
    await (await import("node:fs/promises")).writeFile(pdfPath, pdf);
    await execFileAsync("pdftoppm", ["-jpeg", "-r", "160", "-f", "1", "-l", "20", pdfPath, join(workdir, "page")]);
    const images = (await readdir(workdir)).filter((name) => name.endsWith(".jpg")).sort();
    if (!images.length) throw new Error("Não foi possível converter as páginas do PDF para OCR.");
    const worker = await createWorker("por");
    try {
      const chunks: string[] = [];
      for (const image of images) {
        const result = await worker.recognize(await readFile(join(workdir, image)));
        chunks.push(result.data.text);
      }
      return chunks.join("\n");
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "erro desconhecido";
    if (message.includes("pdftoppm") || message.includes("ENOENT")) {
      throw new Error("O PDF não possui texto selecionável e o OCR não está disponível neste servidor.");
    }
    throw new Error(`Falha ao executar OCR: ${message}`);
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

export function calculateCnisMetrics(facts: CnisFacts) {
  const months = unique(facts.competencies).length;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const progress = Math.min(100, Math.round((months / (35 * 12)) * 100));
  return {
    carenciaTotal: months,
    tempoContribuicaoTotal: `${years} anos e ${remainder} meses (estimativa por competências identificadas)`,
    progressoAposentadoria: progress,
    indicatorsCount: facts.indicators.length,
  };
}

export async function interpretCnisWithGemini(facts: CnisFacts): Promise<CnisAnalysis> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) throw new Error("A variável GOOGLE_GENAI_API_KEY não está configurada no servidor.");
  const metrics = calculateCnisMetrics(facts);
  const prompt = `Você é um analista previdenciário. Analise os fatos extraídos de um CNIS e retorne SOMENTE JSON válido, sem markdown. Não invente dados: deixe claro quando algo for estimativa.\n\nFATOS: ${JSON.stringify({ ...facts, text: facts.text.slice(0, 50000), ...metrics })}\n\nRetorne exatamente estes campos: qualityScore (0-100), riskLevel, contributionStatus, tempoContribuicaoTotal, carenciaTotal (número), estimativaAposentadoria, progressoAposentadoria (0-100), pendencies (array com indicator, description, recommendedAction, relatedPeriods, severity), summary, recommendations (array), nextSteps (array). Os cálculos de carência, tempo e progresso devem respeitar os valores determinísticos fornecidos; não trate a estimativa como aconselhamento jurídico.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: "application/json" } }),
  });
  if (!response.ok) throw new Error(`A API Gemini respondeu com HTTP ${response.status}.`);
  const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const raw = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("A API Gemini não retornou uma análise.");
  const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ""));
  return CnisAnalysisSchema.parse({ ...parsed, ...metrics, tempoContribuicaoTotal: metrics.tempoContribuicaoTotal, carenciaTotal: metrics.carenciaTotal, progressoAposentadoria: metrics.progressoAposentadoria });
}

export async function analyzeCnisPdf(pdf: Buffer) {
  const facts = await extractCnisFacts(pdf);
  if (facts.text.length < 80) throw new Error("Não foi possível extrair texto suficiente. Envie um PDF CNIS legível.");
  return interpretCnisWithGemini(facts);
}
