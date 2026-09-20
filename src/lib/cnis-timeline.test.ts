import { describe, expect, it } from "vitest";
import { buildCnisTimeline } from "./cnis-timeline";
import type { StructuredCnis } from "./cnis-structured";

const source = (excerpt: string, page = 1) => ({ page, excerpt });

describe("linha do tempo do CNIS", () => {
  it("combina vínculos, competências, indicadores e alertas em ordem cronológica", () => {
    const structured: StructuredCnis = {
      employments: [{ start: "01/2018", end: "12/2020", employer: "EMPRESA ALFA", category: "Empregado", indicators: [], source: source("Período: 01/2018 a 12/2020") }],
      contributions: [{ competency: "01/2018", value: null, indicator: null, status: "identified", source: source("Competência: 01/2018") }, { competency: "12/2020", value: null, indicator: null, status: "identified", source: source("Competência: 12/2020") }],
      benefits: [],
      indicators: [{ code: "PEXT", periods: ["06/2019"], source: source("Indicador PEXT") }],
    };
    const findings = [{ kind: "ALERTA", code: "SOBREPOSICAO_DE_VINCULOS", title: "Sobreposição", description: "Há sobreposição.", recommendedAction: "Conferir", severity: "média", relatedPeriods: ["01/2018 a 12/2020"] }] as any;
    const timeline = buildCnisTimeline(structured, findings);
    expect(timeline.some((event) => event.kind === "vinculo")).toBe(true);
    expect(timeline.some((event) => event.kind === "competencias")).toBe(true);
    expect(timeline.some((event) => event.kind === "indicador")).toBe(true);
    expect(timeline.some((event) => event.kind === "alerta")).toBe(true);
    expect(timeline[0].source?.page).toBe(1);
  });

  it("inclui benefícios sem inventar datas ausentes", () => {
    const structured: StructuredCnis = { employments: [], contributions: [], benefits: [{ kind: "Benefício fictício", start: null, end: null, source: source("Benefício: fictício") }], indicators: [] };
    const timeline = buildCnisTimeline(structured, []);
    expect(timeline[0]).toEqual(expect.objectContaining({ kind: "beneficio", period: "Data não identificada" }));
  });
});
