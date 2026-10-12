import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { analyzeCnisPdf, extractCnisFacts, interpretCnisWithGemini } from "./cnis-analyzer";
import { sanitizeAnalysis, sanitizeFileName } from "./cnis-privacy";
import { validateCnisUpload, MAX_CNIS_BYTES } from "./cnis-upload";

const fixturesDir = join(process.cwd(), "tests", "fixtures", "cnis");
const fixture = (name: string) => readFileSync(join(fixturesDir, name));
const metadata = (name: string) => JSON.parse(readFileSync(join(fixturesDir, `${name}.json`), "utf8"));

const previousGeminiKey = process.env.GOOGLE_GENAI_API_KEY;

beforeAll(() => {
  delete process.env.GOOGLE_GENAI_API_KEY;
});

afterAll(() => {
  if (previousGeminiKey === undefined) delete process.env.GOOGLE_GENAI_API_KEY;
  else process.env.GOOGLE_GENAI_API_KEY = previousGeminiKey;
});

describe("Missão 8 — fluxo integrado sintético do CNIS", () => {
  it.each([
    ["01-simples-texto", "fluxo simples", false],
    ["02-lacuna", "lacuna", false],
    ["03-sobreposicao", "sobreposição", false],
    ["04-indicadores", "indicadores", false],
    ["05-ocr", "OCR", true],
    ["06-incompleto", "dados insuficientes", false],
  ])("processa %s (%s)", async (id, _label, shouldUseOcr) => {
    const expected = metadata(id).expected;
    const pdf = fixture(metadata(id).pdf);
    const facts = await extractCnisFacts(pdf);
    const result = await analyzeCnisPdf(pdf);

    expect(result.structured).toBeDefined();
    expect(result.timeline).toBeInstanceOf(Array);
    expect(result.simulation).toBeDefined();
    expect(result.simulation.normativeSource).toContain("gov.br/inss");
    expect(facts.extractedByOcr).toBe(shouldUseOcr);
    for (const competency of expected.competencies_include) {
      expect(result.competenciasIdentificadas).toBeGreaterThan(0);
      expect(result.structured.contributions.some((item) => item.competency === competency) || result.timeline.some((item) => item.period.includes(competency))).toBe(true);
    }
    if (id === "02-lacuna") expect(result.gaps.length).toBeGreaterThan(0);
    if (id === "03-sobreposicao") expect(result.overlaps.length).toBeGreaterThan(0);
    if (id === "04-indicadores") expect(result.structured.indicators.length).toBeGreaterThan(0);
    if (id === "06-incompleto") expect(result.simulation.status).toBe("nao_atingido");
    expect(JSON.stringify(result)).not.toContain("%PDF-");
    expect(JSON.stringify(result)).not.toContain("base64");
  }, 120_000);

  it("mantém o resultado estruturado sem nome original ou PDF ao preparar o histórico", () => {
    const result = sanitizeAnalysis({
      fileName: "Maria-Silva-CNIS.pdf",
      pdf: "%PDF-1.7 conteúdo",
      pdfBase64: "data:application/pdf;base64,AAAA",
      summary: "Análise sintética",
    });
    expect(JSON.stringify(result)).not.toContain("Maria-Silva");
    expect(JSON.stringify(result)).not.toContain("%PDF-");
    expect(JSON.stringify(result)).not.toContain("base64");
    expect(sanitizeFileName("Maria-Silva-CNIS.pdf")).toMatch(/^CNIS-\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it("valida PDF, arquivo vazio, formato inválido e limite de tamanho", () => {
    expect(validateCnisUpload({ size: 10, bytes: Buffer.from("%PDF-1.7") })).toBeNull();
    expect(validateCnisUpload({ size: 0, bytes: Buffer.alloc(0) })).toContain("vazio");
    expect(validateCnisUpload({ size: 10, bytes: Buffer.from("not-pdf") })).toContain("PDF válido");
    expect(validateCnisUpload({ size: MAX_CNIS_BYTES + 1, bytes: Buffer.from("%PDF-") })).toContain("25 MB");
  });

  it("não registra corpo sensível quando a Gemini falha", async () => {
    const facts = await extractCnisFacts(fixture("01-simples-texto.pdf"));
    const previousKey = process.env.GOOGLE_GENAI_API_KEY;
    const previousFetch = globalThis.fetch;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.GOOGLE_GENAI_API_KEY = "test-key";
    globalThis.fetch = vi.fn(async () => new Response("CPF: 123.456.789-09 texto integral do CNIS", { status: 500 })) as typeof fetch;

    try {
      await interpretCnisWithGemini(facts);
      const logs = JSON.stringify(errorSpy.mock.calls);
      expect(logs).not.toContain("123.456.789-09");
      expect(logs).not.toContain("texto integral");
      expect(logs).toContain("status");
    } finally {
      errorSpy.mockRestore();
      globalThis.fetch = previousFetch;
      if (previousKey === undefined) delete process.env.GOOGLE_GENAI_API_KEY;
      else process.env.GOOGLE_GENAI_API_KEY = previousKey;
    }
  }, 30_000);
});
