import { describe, expect, it } from "vitest";
import { calculateCnisMetrics, type CnisPeriod } from "./cnis-metrics";
import { simulateProgrammedRetirement } from "./cnis-simulation";

const months = (count: number) => Array.from({ length: count }, (_, index) => `${String((index % 12) + 1).padStart(2, "0")}/${2010 + Math.floor(index / 12)}`);
const period = (start: string, end: string): CnisPeriod => ({ start, end, source: "fixture sintética" });

function simulation(competencies: string[], periods: CnisPeriod[] = []) {
  return simulateProgrammedRetirement(calculateCnisMetrics(competencies, 0, periods));
}

describe("simulação verificável de carência da aposentadoria programada", () => {
  it("classifica 180 competências sem anomalias como requisito potencialmente atendido", () => {
    const result = simulation(months(180), [period("01/2010", "12/2024")]);
    expect(result.status).toBe("requisito_potencialmente_atendido");
    expect(result.potentialMonths).toBe(180);
    expect(result.remainingPotentialMonths).toBe(0);
    expect(result.missingData.length).toBeGreaterThan(0);
  });

  it("classifica menos de 180 competências como não atingido", () => {
    const result = simulation(months(120), [period("01/2010", "12/2019")]);
    expect(result.status).toBe("nao_atingido");
    expect(result.remainingPotentialMonths).toBe(60);
  });

  it("classifica documento sem competências como insuficiente", () => {
    const result = simulation([]);
    expect(result.status).toBe("insuficiente");
    expect(result.calculationMemory[0]).toContain("0 competência");
  });

  it("exige conferência quando há lacuna ou sobreposição", () => {
    const result = simulation(months(180), [period("01/2010", "12/2014"), period("01/2016", "12/2024")]);
    expect(result.status).toBe("conferencia_necessaria");
    expect(result.excludedOrUncertainPeriods.some((item) => item.includes("lacuna"))).toBe(true);
  });

  it("registra sobreposição como período incerto, sem duplicar a carência potencial", () => {
    const result = simulation(months(180), [period("01/2010", "12/2015"), period("01/2015", "12/2024")]);
    expect(result.status).toBe("conferencia_necessaria");
    expect(result.excludedOrUncertainPeriods.some((item) => item.includes("sobreposição"))).toBe(true);
    expect(result.potentialMonths).toBe(180);
  });

  it("mantém contribuição não confirmada separada da carência potencial", () => {
    const result = simulation(months(180), [period("01/2010", "12/2024")]);
    expect(result.confirmedMonths).toBe(0);
    expect(result.calculationMemory[2]).toContain("confirmadas automaticamente");
    expect(result.limitation.toLowerCase()).toContain("não confirma");
  });

  it("classifica o resultado como conferência necessária quando há hipótese estrutural", () => {
    const result = simulation(months(180), [period("01/2010", "12/2024"), period("13/2020", "12/2020")]);
    expect(result.status).toBe("conferencia_necessaria");
    expect(result.excludedOrUncertainPeriods.some((item) => item.includes("período inválido"))).toBe(true);
  });
});
