import { describe, expect, it } from "vitest";
import { calculateCnisMetrics, detectOverlaps, uniqueCompetencies } from "./cnis-metrics";

describe("métricas determinísticas do CNIS", () => {
  it("remove competências duplicadas e ordena por competência", () => {
    expect(uniqueCompetencies(["02/2020", "01/2020", "02/2020"])).toEqual(["01/2020", "02/2020"]);
  });

  it("calcula uma contagem preliminar reproduzível", () => {
    const metrics = calculateCnisMetrics(["01/2020", "02/2020", "02/2020", "03/2020"], 2);
    expect(metrics.competenciesIdentified).toBe(3);
    expect(metrics.carenciaTotal).toBe(3);
    expect(metrics.tempoContribuicaoTotal).toContain("estimativa por competências identificadas");
    expect(metrics.indicatorsCount).toBe(2);
  });

  it("limita o indicador visual de progresso a 100", () => {
    const competencies = Array.from({ length: 500 }, (_, index) => `${(index % 12) + 1}/${1980 + Math.floor(index / 12)}`.replace(/\b(\d)\//, "0$1/"));
    expect(calculateCnisMetrics(competencies, 0).progressoAposentadoria).toBe(100);
  });

  it("detecta períodos que se sobrepõem", () => {
    const overlaps = detectOverlaps([
      { start: "01/2020", end: "06/2020", source: "vínculo A" },
      { start: "05/2020", end: "08/2020", source: "vínculo B" },
      { start: "09/2020", end: "12/2020", source: "vínculo C" },
    ]);
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].first.source).toBe("vínculo A");
    expect(overlaps[0].second.source).toBe("vínculo B");
  });
});
