import { describe, expect, it } from "vitest";
import { assessPotentialBenefits } from "@/lib/cnis-benefits";
import type { CnisMetrics } from "@/lib/cnis-metrics";
import type { StructuredCnis } from "@/lib/cnis-structured";

const baseMetrics: CnisMetrics = {
  competenciesIdentified: 14,
  carenciaTotal: 14,
  carenciaPotencial: 14,
  carenciaConfirmada: 0,
  tempoContribuicaoTotal: "1 ano e 2 meses",
  progressoAposentadoria: 8,
  indicatorsCount: 0,
  calculationBasis: "Teste",
  periodMonths: 14,
  overlappingMonths: 0,
  consolidatedPeriods: [],
  gaps: [],
  overlaps: [],
  invalidPeriods: [],
  competenciesOutsidePeriods: [],
};

const baseStructured: StructuredCnis = {
  employments: [],
  contributions: [],
  benefits: [],
  indicators: [],
};

describe("benefícios potencialmente compatíveis", () => {
  it("identifica um perfil contributivo e carência compatível com incapacidade temporária", () => {
    const result = assessPotentialBenefits(baseMetrics, {
      ...baseStructured,
      contributions: [{ competency: "01/2025", value: null, indicator: null, status: "identified", source: { page: 1, excerpt: "competência" } }],
    });

    expect(result.profile.label).toContain("contribuições");
    expect(result.benefits.find((item) => item.code === "auxilio_incapacidade_temporaria")?.status).toBe("carencia_potencialmente_suficiente");
  });

  it("não apresenta carência suficiente quando há poucas competências", () => {
    const result = assessPotentialBenefits({ ...baseMetrics, carenciaPotencial: 8, competenciesIdentified: 8 }, baseStructured);

    expect(result.benefits.find((item) => item.code === "auxilio_incapacidade_temporaria")?.status).toBe("dados_insuficientes");
    expect(result.benefits.find((item) => item.code === "aposentadoria_programada")?.status).toBe("dados_insuficientes");
  });

  it("sinaliza possível aposentadoria programada sem ocultar os dados ausentes", () => {
    const result = assessPotentialBenefits({ ...baseMetrics, carenciaPotencial: 180, periodMonths: 180 }, baseStructured);
    const benefit = result.benefits.find((item) => item.code === "aposentadoria_programada");

    expect(benefit?.status).toBe("possibilidade_identificada");
    expect(benefit?.missingRequirements).toContain("Idade e sexo para avaliar a regra aplicável.");
  });

  it("identifica sinal de maternidade, mas não confirma o benefício", () => {
    const result = assessPotentialBenefits(baseMetrics, {
      ...baseStructured,
      benefits: [{ kind: "Salário-maternidade", start: "01/2025", end: "04/2025", source: { page: 2, excerpt: "salário-maternidade" } }],
    });
    const benefit = result.benefits.find((item) => item.code === "salario_maternidade");

    expect(benefit?.status).toBe("dados_insuficientes");
    expect(benefit?.summary).toContain("registro relacionado");
  });
});
