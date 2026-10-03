import { describe, expect, it } from "vitest";
import {
  calculateCnisMetrics,
  calculatePeriodMetrics,
  consolidatePeriods,
  detectGaps,
  detectOverlaps,
  uniqueCompetencies,
} from "./cnis-metrics";

const period = (start: string, end: string, source: string) => ({ start, end, source });

describe("métricas determinísticas do CNIS", () => {
  it("normaliza, remove competências duplicadas e ordena por competência", () => {
    expect(uniqueCompetencies(["2/2020", "01/2020", "02/2020", "13/2020", "02/2020"])).toEqual(["01/2020", "02/2020", "13/2020"]);
  });

  it("calcula competências identificadas como carência potencial, sem confirmar carência", () => {
    const metrics = calculateCnisMetrics(["01/2020", "02/2020", "02/2020", "03/2020"], 2);
    expect(metrics.competenciesIdentified).toBe(3);
    expect(metrics.carenciaPotencial).toBe(3);
    expect(metrics.carenciaConfirmada).toBe(0);
    expect(metrics.carenciaTotal).toBe(3);
    expect(metrics.indicatorsCount).toBe(2);
  });

  it("une períodos contíguos e não duplica meses", () => {
    const consolidated = consolidatePeriods([
      period("01/2020", "06/2020", "A"),
      period("07/2020", "12/2020", "B"),
      period("05/2020", "08/2020", "C"),
    ]);
    expect(consolidated).toEqual([period("01/2020", "12/2020", "A")]);
    expect(calculatePeriodMetrics([
      period("01/2020", "06/2020", "A"),
      period("05/2020", "08/2020", "B"),
    ], []).periodMonths).toBe(8);
  });

  it("detecta lacunas entre períodos consolidados", () => {
    const gaps = detectGaps([
      period("01/2020", "03/2020", "A"),
      period("06/2020", "08/2020", "B"),
    ]);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({ start: "04/2020", end: "05/2020", months: 2 });
  });

  it("detecta todas as sobreposições reais, inclusive quando há mais de dois períodos", () => {
    const overlaps = detectOverlaps([
      period("01/2020", "06/2020", "A"),
      period("05/2020", "08/2020", "B"),
      period("07/2020", "09/2020", "C"),
    ]);
    expect(overlaps).toHaveLength(2);
    expect(overlaps.map((item) => item.months)).toEqual([2, 2]);
  });

  it("identifica competências fora dos períodos de vínculo", () => {
    const metrics = calculatePeriodMetrics([
      period("01/2020", "03/2020", "A"),
    ], ["01/2020", "03/2020", "05/2020", "invalid"]);
    expect(metrics.competenciesOutsidePeriods).toEqual(["05/2020", "invalid"]);
  });

  it("separa e preserva períodos inválidos", () => {
    const metrics = calculatePeriodMetrics([
      period("05/2020", "03/2020", "invertido"),
      period("01/2020", "02/2020", "válido"),
    ], []);
    expect(metrics.invalidPeriods).toHaveLength(1);
    expect(metrics.validPeriods).toHaveLength(1);
  });

  it("limita o indicador visual de progresso a 100", () => {
    const competencies = Array.from({ length: 500 }, (_, index) => `${(index % 12) + 1}/${1980 + Math.floor(index / 12)}`.replace(/\b(\d)\//, "0$1/"));
    expect(calculateCnisMetrics(competencies, 0).progressoAposentadoria).toBe(100);
  });
});
