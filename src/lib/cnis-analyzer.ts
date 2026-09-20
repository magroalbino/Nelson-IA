import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { z } from "zod";
import { calculateCnisMetrics as calculateDeterministicMetrics, detectOverlaps, type CnisPeriod } from "@/lib/cnis-metrics";
import { structureCnis, type StructuredCnis } from "@/lib/cnis-structured";
import { auditStructuredCnis, type AuditFinding } from "@/lib/cnis-audit";

const execFileAsync = promisify(execFile);
const execFileWithInput = execFileAsync as unknown as (file: string, args: string[]) => Promise<{ stdout: string; stderr: string }>;

export const CnisAnalysisSchema = z.object({
  qualityScore: z.number().min(0).max(100),
  riskLevel: z.string(),
  contributionStatus: z.string(),
  tempoContribuicaoTotal: z.string(),
  carenciaTotal: z.number().nonnegative(),
  competenciasIdentificadas: z.number().nonnegative().optional(),
  calculationBasis: z.string().optional(),
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
  auditFindings: z.array(z.object({
    kind: z.enum(["DADO", "ALERTA", "HIPÓTESE"]),
    code: z.string(),
    title: z.string(),
    description: z.string(),
    recommendedAction: z.string(),
    severity: z.enum(["baixa", "média", "alta"]),
    source: z.object({ page: z.number(), excerpt: z.string() }).optional(),
    relatedPeriods: z.array(z.string()).optional(),
  })).default([]),
});

export type CnisAnalysis = z.infer<typeof CnisAnalysisSchema>;

export type CnisEvidence = {
  page: number;
  excerpt: string;
  kind: "competency" | "indicator" | "period" | "text";
};

export type CnisFacts = {
  text: string;
  pages: number;
  pageTexts: string[];
  competencies: string[];
  indicators: string[];
  periods: CnisPeriod[];
  evidence: CnisEvidence[];
  structured: StructuredCnis;
  extractedByOcr: boolean;
};

const INDICATOR_RE = /\b(?:PEXT|AEXT(?:-VI)?|PREC-MENOR-MIN|IREC-LC123|IREC-MEI|PSC-MEN-SM|ACRÉSCIMO|EXTEMP|PEN|INDPEND|SAL-MIN)\b/gi;
const MONTH_RE = /\b(0[1-9]|1[0-2])\/((?:19|20)\d{2})\b/g;

type PdfPage = {
  getTextContent: (options: { normalizeWhitespace: boolean; disableCombineTextItems: boolean }) => Promise<{
    items: Array<{ str?: string; transform?: number[] }>;
  }>;
};

type PdfParseOptions = {
  pagerender?: (page: PdfPage) => Promise<string>;
};

type PdfParseResult = { text: string; numpages: number };

function normalizeText(text: string): string {
  return text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

async function renderPdfPage(page: PdfPage): Promise<string> {
  const content = await page.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false });
  let lastY: number | undefined;
  let text = "";
  for (const item of content.items) {
    const value = item.str || "";
    const currentY = item.transform?.[5];
    if (text && currentY !== undefined && lastY !== undefined && currentY !== lastY) text += "\n";
    text += value;
    if (currentY !== undefined) lastY = currentY;
  }
  return normalizeText(text);
}

function findEvidence(pageTexts: string[], competencies: string[], indicators: string[], periods: CnisPeriod[]): CnisEvidence[] {
  const evidence: CnisEvidence[] = [];
  for (let index = 0; index < pageTexts.length; index += 1) {
    const page = pageTexts[index];
    for (const competency of competencies) {
      if (page.includes(competency)) evidence.push({ page: index + 1, excerpt: page.slice(Math.max(0, page.indexOf(competency) - 90), page.indexOf(competency) + competency.length + 120), kind: "competency" });
    }
    for (const indicator of indicators) {
      const indicatorIndex = page.toUpperCase().indexOf(indicator.toUpperCase());
      if (indicatorIndex >= 0) evidence.push({ page: index + 1, excerpt: page.slice(Math.max(0, indicatorIndex - 90), indicatorIndex + indicator.length + 120), kind: "indicator" });
    }
  }
  for (const period of periods) {
    if (period.page) evidence.push({ page: period.page, excerpt: period.source, kind: "period" });
  }
  return evidence.slice(0, 1000);
}

export async function extractCnisFacts(pdf: Buffer): Promise<CnisFacts> {
  const pdfModule = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = (pdfModule.default || pdfModule) as unknown as (buffer: Buffer, options?: PdfParseOptions) => Promise<PdfParseResult>;
  const parsedPages: string[] = [];
  const parsed = await pdfParse(pdf, {
    pagerender: async (page) => {
      const text = await renderPdfPage(page);
      parsedPages.push(text);
      return text;
    },
  });
  const textPages = parsedPages.length ? parsedPages : [normalizeText(parsed.text)];
  const text = normalizeText(textPages.join("\n\n"));
  const structured = structureCnis(textPages);
  const competencies = unique([...text.matchAll(MONTH_RE)].map((match) => `${match[1]}/${match[2]}`));
  const indicators = unique([...text.matchAll(INDICATOR_RE)].map((match) => match[0].toUpperCase()));

  if (text.length >= 250) {
    const periods = inferPeriods(textPages);
    return { text, pages: parsed.numpages, pageTexts: textPages, competencies, indicators, periods, evidence: findEvidence(textPages, competencies, indicators, periods), structured, extractedByOcr: false };
  }

  const ocrPages = await ocrPdf(pdf);
  const ocrText = normalizeText(ocrPages.join("\n\n"));
  const ocrStructured = structureCnis(ocrPages);
  const ocrCompetencies = unique([...ocrText.matchAll(MONTH_RE)].map((match) => `${match[1]}/${match[2]}`));
  const ocrIndicators = unique([...ocrText.matchAll(INDICATOR_RE)].map((match) => match[0].toUpperCase()));
  const periods = inferPeriods(ocrPages);
  return { text: ocrText, pages: parsed.numpages, pageTexts: ocrPages, competencies: ocrCompetencies, indicators: ocrIndicators, periods, evidence: findEvidence(ocrPages, ocrCompetencies, ocrIndicators, periods), structured: ocrStructured, extractedByOcr: true };
}

function inferPeriods(pageTexts: string[]): CnisPeriod[] {
  const periods: CnisPeriod[] = [];
  for (let pageIndex = 0; pageIndex < pageTexts.length; pageIndex += 1) {
    for (const line of pageTexts[pageIndex].split("\n")) {
      const dates = [...line.matchAll(MONTH_RE)].map((match) => `${match[1]}/${match[2]}`);
      if (dates.length >= 2) periods.push({ start: dates[0], end: dates[1], source: line.slice(0, 180), page: pageIndex + 1 });
    }
  }
  return periods.slice(0, 500);
}

async function ocrPdf(pdf: Buffer): Promise<string[]> {
  const workdir = await mkdtemp(join(tmpdir(), "nelson-cnis-"));
  const pdfPath = join(workdir, "document.pdf");
  try {
    await writeFile(pdfPath, pdf);
    await execFileWithInput("pdftoppm", ["-jpeg", "-r", "160", "-f", "1", "-l", "20", pdfPath, join(workdir, "page")]);
    const images = (await readdir(workdir)).filter((name) => name.endsWith(".jpg")).sort();
    if (!images.length) throw new Error("Não foi possível converter as páginas do PDF para OCR.");
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("por");
    try {
      const pages: string[] = [];
      for (const image of images) pages.push(normalizeText((await worker.recognize(await readFile(join(workdir, image)))).data.text));
      return pages;
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "erro desconhecido";
    if (message.includes("pdftoppm") || message.includes("ENOENT")) throw new Error("O PDF não possui texto selecionável e o OCR não está disponível neste servidor.");
    throw new Error(`Falha ao executar OCR: ${message}`);
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

export function calculateCnisMetrics(facts: CnisFacts) {
  return calculateDeterministicMetrics(facts.competencies, facts.indicators.length);
}

export async function interpretCnisWithGemini(facts: CnisFacts): Promise<CnisAnalysis> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) throw new Error("A variável GOOGLE_GENAI_API_KEY não está configurada no servidor.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite";
  const metrics = calculateCnisMetrics(facts);
  const overlaps = detectOverlaps(facts.periods);
  const auditFindings = auditStructuredCnis(facts.structured, facts.text.length);
  const prompt = `Você é um analista previdenciário. Analise os fatos extraídos de um CNIS e retorne SOMENTE JSON válido, sem markdown. Não invente dados: deixe claro quando algo for estimativa ou hipótese. Use os achados determinísticos fornecidos como base e não os contradiga.\n\nFATOS: ${JSON.stringify({ ...facts, text: facts.text.slice(0, 50000), evidence: facts.evidence.slice(0, 250), overlaps: overlaps.length, auditFindings, ...metrics })}\n\nRetorne exatamente estes campos: qualityScore (0-100), riskLevel, contributionStatus, tempoContribuicaoTotal, carenciaTotal (número), competenciasIdentificadas, calculationBasis, estimativaAposentadoria, progressoAposentadoria (0-100), pendencies (array com indicator, description, recommendedAction, relatedPeriods, severity), summary, recommendations (array), nextSteps (array). Os cálculos de carência, tempo e progresso devem respeitar os valores determinísticos fornecidos; não trate a estimativa como aconselhamento jurídico.`;

  const payload = JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: "application/json" } });
  let response: Response | undefined;
  let lastStatus = 0;
  for (const candidate of [...new Set([model, fallbackModel])]) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidate)}:generateContent?key=${encodeURIComponent(apiKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
      if (response.ok) break;
      lastStatus = response.status;
      const details = await response.text();
      console.error(`[GEMINI] modelo=${candidate} tentativa=${attempt + 1} HTTP ${response.status}:`, details);
      if (![429, 500, 502, 503, 504].includes(response.status)) break;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 700));
    }
    if (response?.ok) break;
  }
  if (!response?.ok) {
    if (lastStatus === 429) throw new Error("A API Gemini atingiu o limite temporário de solicitações. Aguarde alguns segundos e tente novamente.");
    if ([500, 502, 503, 504].includes(lastStatus)) throw new Error("A API Gemini está temporariamente indisponível. Tente novamente em alguns segundos.");
    throw new Error(`A API Gemini respondeu com HTTP ${lastStatus}. Verifique GEMINI_MODEL e a chave da API.`);
  }
  const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const raw = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("A API Gemini não retornou uma análise.");
  const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ""));
  return CnisAnalysisSchema.parse({ ...parsed, ...metrics, auditFindings, tempoContribuicaoTotal: metrics.tempoContribuicaoTotal, carenciaTotal: metrics.carenciaTotal, progressoAposentadoria: metrics.progressoAposentadoria });
}

export async function analyzeCnisPdf(pdf: Buffer) {
  const facts = await extractCnisFacts(pdf);
  if (facts.text.length < 80) throw new Error("Não foi possível extrair texto suficiente. Envie um PDF CNIS legível.");
  return interpretCnisWithGemini(facts);
}
