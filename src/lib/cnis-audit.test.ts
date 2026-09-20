import { describe, expect, it } from "vitest";
import { auditStructuredCnis, validateStructuredCnis } from "./cnis-audit";
import type { StructuredCnis } from "./cnis-structured";

const source = (excerpt: string, page = 1) => ({ page, excerpt });

describe("auditoria estruturada do CNIS", () => {
  it("gera dado para vínculo e alerta para lacuna", () => {
    const structured: StructuredCnis = {
      employments: [
        { start: "01/2015", end: "06/2017", employer: "ALFA", category: "Empregado", indicators: [], source: source("Período: 01/2015 a 06/2017") },
        { start: "09/2017", end: "12/2019", employer: "BETA", category: "Empregado", indicators: [], source: source("Período: 09/2017 a 12/2019") },
      ],
      contributions: [],
      benefits: [],
      indicators: [],
    };
    const findings = auditStructuredCnis(structured, 500);
    expect(findings.some((item) => item.kind === "DADO" && item.code === "VINCULO_IDENTIFICADO")).toBe(true);
    expect(findings.some((item) => item.code === "LACUNA_ENTRE_VINCULOS")).toBe(true);
  });

  it("gera alerta para sobreposição e indicador", () => {
    const structured: StructuredCnis = {
      employments: [
        { start: "01/2020", end: "08/2020", employer: "ALFA", category: null, indicators: [], source: source("Período: 01/2020 a 08/2020") },
        { start: "06/2020", end: "12/2021", employer: "BETA", category: null, indicators: [], source: source("Período: 06/2020 a 12/2021") },
      ],
      contributions: [],
      benefits: [],
      indicators: [{ code: "PEXT", periods: ["03/2020"], source: source("Indicador: PEXT") }],
    };
    const findings = auditStructuredCnis(structured, 500);
    expect(findings.some((item) => item.code === "SOBREPOSICAO_DE_VINCULOS")).toBe(true);
    expect(findings.some((item) => item.code === "INDICADOR_IDENTIFICADO" && item.source?.page === 1)).toBe(true);
  });

  it("classifica competência identificada como hipótese, não como carência confirmada", () => {
    const structured: StructuredCnis = {
      employments: [],
      contributions: [{ competency: "07/2022", value: null, indicator: null, status: "identified", source: source("Competência: 07/2022") }],
      benefits: [],
      indicators: [],
    };
    const findings = auditStructuredCnis(structured, 500);
    expect(findings.some((item) => item.kind === "HIPÓTESE" && item.code === "COMPETENCIAS_NAO_CONFIRMAM_CARENCIA")).toBe(true);
  });

  it("detecta período invertido na validação", () => {
    const structured: StructuredCnis = {
      employments: [{ start: "12/2022", end: "01/2022", employer: null, category: null, indicators: [], source: source("Período inválido") }],
      contributions: [],
      benefits: [],
      indicators: [],
    };
    const validation = validateStructuredCnis(structured);
    expect(validation.valid).toBe(false);
    expect(validation.issues[0].code).toBe("PERIODO_INVERTIDO");
  });
});
