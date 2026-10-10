import { execFile } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { z } from "zod";
import { calculateCnisMetrics as calculateDeterministicMetrics, type CnisPeriod } from "@/lib/cnis-metrics";
import { structureCnis, type StructuredCnis } from "@/lib/cnis-structured";
import { auditStructuredCnis } from "@/lib/cnis-audit";
import { normalizeEstimate } from "@/lib/cnis-response";
import { buildCnisTimeline } from "@/lib/cnis-timeline";
import { sanitizeAnalysis, sanitizeSensitiveText } from "@/lib/cnis-privacy";
import { withTemporaryDirectory } from "@/lib/cnis-temp";

const execFileAsync = promisify(execFile);
const execFileWithInput = execFileAsync as unknown as (file: string, args: string[], options?: { timeout?: number; maxBuffer?: number }) => Promise<{ stdout: string; stderr: string }>;

export const CnisAnalysisSchema = z.object({
  qualityScore: z.number().min(0).max(100),
  riskLevel: z.string(),
  contributionStatus: z.string(),
  tempoContribuicaoTotal: z.string(),
  carenciaTotal: z.number().nonnegative(),
  carenciaPotencial: z.number().nonnegative().default(0),
  carenciaConfirmada: z.number().nonnegative().default(0),
  competenciasIdentificadas: z.number().nonnegative().optional(),
  calculationBasis: z.string().optional(),
  periodMonths: z.number().nonnegative().default(0),
  overlappingMonths: z.number().nonnegative().default(0),
  gaps: z.array(z.object({ start: z.string(), end: z.string(), months: z.number().nonnegative() })).default([]),
  overlaps: z.array(z.object({ start: z.string(), end: z.string(), months: z.number().nonnegative() })).default([]),
  invalidPeriods: z.array(z.object({ start: z.string(), end: z.string(), source: z.string(), page: z.number().optional() })).default([]),
  competenciesOutsidePeriods: z.array(z.string()).default([]),
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
  timeline: z.array(z.object({
    kind: z.enum(["vinculo", "beneficio", "competencias", "indicador", "alerta"]),
    title: z.string(),
    period: z.string(),
    detail: z.string(),
    source: z.object({ page: z.number(), excerpt: z.string() }).optional(),
    tone: z.enum(["blue", "green", "amber", "red", "slate"]),
  })).default([]),
  structured: z.object({
    employments: z.array(z.object({
      start: z.string(), end: z.string(), employer: z.string().nullable(), category: z.string().nullable(), indicators: z.array(z.string()), source: z.object({ page: z.number(), excerpt: z.string() }),
    })),
    contributions: z.array(z.object({ competency: z.string(), value: z.number().nullable(), indicator: z.string().nullable(), status: z.enum(["identified", "unknown"]), source: z.object({ page: z.number(), excerpt: z.string() }) })),
    benefits: z.array(z.object({ kind: z.string().nullable(), start: z.string().nullable(), end: z.string().nullable(), source: z.object({ page: z.number(), excerpt: z.string() }) })),
    indicators: z.array(z.object({ code: z.string(), periods: z.array(z.string()), source: z.object({ page: z.number(), excerpt: z.string() }) })),
  }).default({ employments: [], contributions: [], benefits: [], indicators: [] }),
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
  const parsed = await Promise.race([
    pdfParse(pdf, {
      pagerender: async (page) => {
        const text = await renderPdfPage(page);
        parsedPages.push(text);
        return text;
      },
    }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Tempo limite excedido na extração do PDF.")), 25000)),
  ]);
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
  return withTemporaryDirectory("nelson-cnis-", async (workdir) => {
    const pdfPath = join(workdir, "document.pdf");
    const pages: string[] = [];
    try {
      await writeFile(pdfPath, pdf);
      await execFileWithInput("pdftoppm", ["-jpeg", "-r", "160", "-f", "1", "-l", "20", pdfPath, join(workdir, "page")], { timeout: 45000, maxBuffer: 1024 * 1024 });
      const images = (await readdir(workdir)).filter((name) => name.endsWith(".jpg")).sort();
      if (!images.length) throw new Error("Não foi possível converter as páginas do PDF para OCR.");
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("por");
      try {
        for (const image of images) {
          const recognition = worker.recognize(await readFile(join(workdir, image)));
          const result = await Promise.race([
            recognition,
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Tempo limite excedido no OCR.")), 20000)),
          ]);
          pages.push(normalizeText(result.data.text));
        }
        return pages;
      } finally {
        await worker.terminate();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "erro desconhecido";
      if (pages.length && message.includes("Tempo limite")) return pages;
      throw error;
    }
  }).catch((error) => {
    const message = error instanceof Error ? error.message : "erro desconhecido";
    if (message.includes("pdftoppm") || message.includes("ENOENT")) throw new Error("O PDF não possui texto selecionável e o OCR não está disponível neste servidor.");
    throw new Error(`Falha ao executar OCR: ${sanitizeSensitiveText(message)}`);
  });
}

export function calculateCnisMetrics(facts: CnisFacts) {
  return calculateDeterministicMetrics(facts.competencies, facts.indicators.length, facts.periods);
}

function buildDeterministicFallback(facts: CnisFacts, reason: string): CnisAnalysis {
  const metrics = calculateCnisMetrics(facts);
  const auditFindings = auditStructuredCnis(facts.structured, facts.text.length);
  const timeline = buildCnisTimeline(facts.structured, auditFindings);
  const extractionNote = facts.extractedByOcr ? " O documento foi lido com OCR; confira as fontes com atenção." : "";
  const fallback = {
    qualityScore: Math.min(100, Math.max(20, Math.round((facts.text.length / 12000) * 100) - (facts.extractedByOcr ? 15 : 0))),
    riskLevel: "Indeterminado",
    contributionStatus: "Leitura concluída; validação previdenciária necessária.",
    estimativaAposentadoria: "Não foi possível gerar uma estimativa confiável apenas com a leitura automática disponível.",
    pendencies: [
      ...(metrics.gaps.length ? [{ indicator: "LACUNAS", description: `${metrics.gaps.length} lacuna(s) foram encontradas entre períodos identificados.`, recommendedAction: "Confira o CNIS original, a CTPS e os comprovantes dos períodos ausentes.", relatedPeriods: metrics.gaps.map((gap) => `${gap.start}–${gap.end}`), severity: "média" }] : []),
      ...(metrics.overlaps.length ? [{ indicator: "SOBREPOSIÇÃO", description: `${metrics.overlaps.length} sobreposição(ões) de períodos foi(ram) identificada(s).`, recommendedAction: "Confirme se os vínculos simultâneos e suas contribuições estão corretos.", relatedPeriods: metrics.overlaps.map((overlap) => `${overlap.start}–${overlap.end}`), severity: "média" }] : []),
      ...(reason ? [{ indicator: "IA_INDISPONÍVEL", description: "A leitura estruturada foi concluída, mas a explicação da IA não ficou disponível.", recommendedAction: "Use as tabelas, fontes e alertas deste relatório e tente novamente mais tarde para obter a explicação complementar.", relatedPeriods: [], severity: "baixa" }] : []),
    ],
    summary: `A análise conseguiu extrair ${facts.competencies.length} competência(s), ${facts.structured.employments.length} vínculo(s) e ${facts.structured.benefits.length} benefício(s).${extractionNote} Os números de carência são potenciais e não confirmam direito previdenciário.`,
    recommendations: ["Confira as tabelas e as páginas de origem no CNIS original.", "Separe documentos dos períodos apontados como lacuna ou inconsistência.", "Leve o relatório a um profissional previdenciário para validação."],
    nextSteps: ["Revisar lacunas, sobreposições e competências fora dos períodos.", "Validar indicadores e valores de contribuição.", "Refazer a análise quando houver um PDF mais legível, se necessário."],
  };
  return CnisAnalysisSchema.parse({ ...fallback, ...metrics, auditFindings, timeline, structured: facts.structured, reason });
}

export async function interpretCnisWithGemini(facts: CnisFacts): Promise<CnisAnalysis> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) return buildDeterministicFallback(facts, "Chave da IA ausente");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite";
  const metrics = calculateCnisMetrics(facts);
  const auditFindings = auditStructuredCnis(facts.structured, facts.text.length);
  const timeline = buildCnisTimeline(facts.structured, auditFindings);
  const compactFacts = sanitizeAnalysis({
    text: sanitizeSensitiveText(facts.text).slice(0, 28000),
    pages: facts.pages,
    extractedByOcr: facts.extractedByOcr,
    competencies: facts.competencies.slice(0, 1200),
    indicators: facts.indicators.slice(0, 100),
    periods: facts.periods.slice(0, 300),
    structured: {
      employments: facts.structured.employments.slice(0, 200),
      contributions: facts.structured.contributions.slice(0, 1200),
      benefits: facts.structured.benefits.slice(0, 100),
      indicators: facts.structured.indicators.slice(0, 100),
    },
    auditFindings: auditFindings.slice(0, 100),
    metrics,
  });
  const prompt = `Você é um analista previdenciário. Retorne SOMENTE JSON válido, sem markdown. Não invente dados e não diga que carência está confirmada apenas porque uma competência foi identificada. Use os cálculos determinísticos fornecidos e explique limitações.\n\nFATOS ESTRUTURADOS: ${JSON.stringify(compactFacts)}\n\nRetorne exatamente: qualityScore (0-100), riskLevel, contributionStatus, tempoContribuicaoTotal, carenciaTotal, carenciaPotencial, carenciaConfirmada, competenciasIdentificadas, calculationBasis, periodMonths, overlappingMonths, gaps, overlaps, invalidPeriods, competenciesOutsidePeriods, estimativaAposentadoria, progressoAposentadoria (0-100), pendencies, summary, recommendations, nextSteps. Os arrays pendencies devem conter indicator, description, recommendedAction, relatedPeriods e severity.`;

  const payload = JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: "application/json" } });
  let response: Response | undefined;
  let lastStatus = 0;
  for (const candidate of [...new Set([model, fallbackModel])]) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(candidate)}:generateContent?key=${encodeURIComponent(apiKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, signal: AbortSignal.timeout(30000) });
      } catch (error) {
        response = undefined;
        lastStatus = 504;
        console.error(`[GEMINI] modelo=${candidate} falhou antes de responder:`, error instanceof Error ? error.message : error);
        continue;
      }
      if (response.ok) break;
      lastStatus = response.status;
      const details = await response.text();
      console.error(`[GEMINI] modelo=${candidate} tentativa=${attempt + 1} HTTP ${response.status}:`, details);
      if (![429, 500, 502, 503, 504].includes(response.status)) break;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 700));
    }
    if (response?.ok) break;
  }
  if (!response?.ok) return buildDeterministicFallback(facts, `Gemini HTTP ${lastStatus}`);
  try {
    const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const raw = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return buildDeterministicFallback(facts, "Resposta vazia da Gemini");
    const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ""));
    return CnisAnalysisSchema.parse({ ...parsed, estimativaAposentadoria: normalizeEstimate(parsed.estimativaAposentadoria), ...metrics, auditFindings, timeline, structured: facts.structured, tempoContribuicaoTotal: metrics.tempoContribuicaoTotal, carenciaTotal: metrics.carenciaTotal, progressoAposentadoria: metrics.progressoAposentadoria });
  } catch (error) {
    console.error("[GEMINI] resposta inválida; usando fallback determinístico", error instanceof Error ? error.message : error);
    return buildDeterministicFallback(facts, "Resposta inválida da Gemini");
  }
}

export async function analyzeCnisPdf(pdf: Buffer) {
  const facts = await extractCnisFacts(pdf);
  if (facts.text.length < 80) throw new Error("Não foi possível extrair texto suficiente. Envie um PDF CNIS legível.");
  return interpretCnisWithGemini(facts);
}
