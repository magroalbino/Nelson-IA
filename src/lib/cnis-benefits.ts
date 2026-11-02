import type { StructuredCnis } from "@/lib/cnis-structured";
import type { CnisMetrics } from "@/lib/cnis-metrics";

export type PotentialBenefitStatus =
  | "possibilidade_identificada"
  | "carencia_potencialmente_suficiente"
  | "dados_insuficientes"
  | "nao_identificado";

export type CnisProfile = {
  label: string;
  summary: string;
  signals: string[];
  limitations: string[];
};

export type PotentialBenefit = {
  code: string;
  name: string;
  status: PotentialBenefitStatus;
  summary: string;
  evidence: string[];
  missingRequirements: string[];
  normativeSource: string;
};

export type BenefitAssessment = {
  profile: CnisProfile;
  benefits: PotentialBenefit[];
};

const SOURCES = {
  temporaryIncapacity: "https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-por-incapacidade/auxilio-por-incapacidade-temporaria",
  permanentIncapacity: "https://www.gov.br/inss/pt-br/direitos-e-deveres/aposentadorias/aposentadoria-por-incapacidade-permanente",
  maternity: "https://www.gov.br/inss/pt-br/direitos-e-deveres/salario-maternidade/salario-maternidade",
  programmedRetirement: "https://www.gov.br/inss/pt-br/direitos-e-deveres/aposentadorias/aposentadoria-programada",
  insuredStatus: "https://www.gov.br/inss/pt-br/saiba-mais/seus-direitos-e-deveres/qualidade-de-segurado",
};

function hasText(values: Array<string | null | undefined>, pattern: RegExp) {
  return values.some((value) => pattern.test(value ?? ""));
}

function buildProfile(metrics: CnisMetrics, structured: StructuredCnis): CnisProfile {
  const signals: string[] = [];
  const limitations = [
    "O CNIS não informa idade, sexo, estado de saúde ou a data do requerimento.",
    "A qualidade de segurado e a validade de cada competência precisam ser confirmadas pelo INSS.",
  ];

  if (structured.employments.length > 0) {
    signals.push(`${structured.employments.length} vínculo(s) estruturado(s) foram localizados.`);
  }
  if (structured.contributions.length > 0) {
    signals.push(`${structured.contributions.length} contribuição(ões) aparecem no extrato.`);
  }
  if (structured.benefits.length > 0) {
    signals.push(`${structured.benefits.length} benefício(s) ou registro(s) de benefício foram identificados.`);
  }
  if (metrics.gaps.length > 0) {
    signals.push(`${metrics.gaps.length} lacuna(s) entre períodos exigem conferência.`);
  }
  if (metrics.overlaps.length > 0) {
    signals.push(`${metrics.overlaps.length} sobreposição(ões) de períodos exigem conferência.`);
  }
  if (signals.length === 0) {
    signals.push("Poucos elementos contributivos estruturados foram encontrados no documento.");
  }

  const label = structured.employments.length > 0 && structured.contributions.length > 0
    ? "Histórico misto de vínculos e contribuições"
    : structured.employments.length > 0
      ? "Perfil com vínculos identificados"
      : structured.contributions.length > 0
        ? "Perfil com contribuições identificadas"
        : "Perfil contributivo insuficiente para classificação";

  return {
    label,
    summary: `O CNIS apresenta ${metrics.carenciaPotencial} competência(s) potencialmente aproveitável(is) e ${metrics.periodMonths} mês(es) em períodos consolidados. Isso orienta a triagem, mas não confirma benefícios.`,
    signals,
    limitations,
  };
}

export function assessPotentialBenefits(
  metrics: CnisMetrics,
  structured: StructuredCnis,
): BenefitAssessment {
  const profile = buildProfile(metrics, structured);
  const potential = metrics.carenciaPotencial;
  const confirmed = metrics.carenciaConfirmada;
  const hasGaps = metrics.gaps.length > 0 || metrics.overlaps.length > 0 || metrics.competenciesOutsidePeriods.length > 0;
  const benefitNames = structured.benefits.map((benefit) => benefit.kind);
  const hasMaternitySignal = hasText(benefitNames, /matern|gesta|sal[aá]rio/i);

  const temporaryStatus: PotentialBenefitStatus = potential < 12
    ? "dados_insuficientes"
    : hasGaps || confirmed < 12
      ? "carencia_potencialmente_suficiente"
      : "possibilidade_identificada";

  const benefits: PotentialBenefit[] = [
    {
      code: "auxilio_incapacidade_temporaria",
      name: "Auxílio por incapacidade temporária",
      status: temporaryStatus,
      summary: potential >= 12
        ? "A carência potencial aparece compatível com a regra geral, mas o CNIS não comprova incapacidade nem qualidade de segurado na data do afastamento."
        : `Foram identificadas ${potential} competência(s) potencial(is); a regra geral considera 12 contribuições mensais, salvo hipóteses legais de dispensa.`,
      evidence: [
        `${potential} competência(s) potencialmente aproveitável(is).`,
        confirmed > 0 ? `${confirmed} competência(s) foram classificadas como confirmadas automaticamente.` : "Nenhuma competência foi confirmada automaticamente.",
      ],
      missingRequirements: [
        "Qualidade de segurado na data da incapacidade.",
        "Comprovação médica de incapacidade temporária por mais de 15 dias.",
        "Validação da carência e das contribuições pelo INSS.",
      ],
      normativeSource: SOURCES.temporaryIncapacity,
    },
    {
      code: "aposentadoria_programada",
      name: "Aposentadoria programada",
      status: potential >= 180 ? (hasGaps ? "carencia_potencialmente_suficiente" : "possibilidade_identificada") : "dados_insuficientes",
      summary: potential >= 180
        ? "A carência potencial alcança 180 meses, mas idade, sexo, tempo de contribuição e regra aplicável não estão completos no CNIS."
        : `A carência potencial atual é de ${potential} mês(es), abaixo do parâmetro geral de 180 meses usado nesta triagem.`,
      evidence: [`${potential} competência(s) potencialmente aproveitável(is).`, `${metrics.periodMonths} mês(es) em períodos consolidados.`],
      missingRequirements: [
        "Idade e sexo para avaliar a regra aplicável.",
        "Tempo de contribuição e eventual regra de transição.",
        "Validação individual das competências e dos períodos pelo INSS.",
      ],
      normativeSource: SOURCES.programmedRetirement,
    },
    {
      code: "aposentadoria_incapacidade_permanente",
      name: "Aposentadoria por incapacidade permanente",
      status: potential >= 12 ? "dados_insuficientes" : "nao_identificado",
      summary: "O CNIS pode ajudar a verificar histórico contributivo, mas não permite avaliar incapacidade permanente ou impossibilidade de reabilitação.",
      evidence: [`${potential} competência(s) potencial(is) identificada(s) no histórico.`],
      missingRequirements: [
        "Avaliação médico-pericial da incapacidade permanente.",
        "Análise de possibilidade de reabilitação para outra atividade.",
        "Qualidade de segurado e carência, quando exigíveis.",
      ],
      normativeSource: SOURCES.permanentIncapacity,
    },
    {
      code: "salario_maternidade",
      name: "Salário-maternidade",
      status: hasMaternitySignal ? "dados_insuficientes" : "nao_identificado",
      summary: hasMaternitySignal
        ? "Há registro relacionado a maternidade no CNIS, mas o documento não comprova o evento, a data nem a qualidade de segurada no momento devido."
        : "O CNIS analisado não apresentou sinal suficiente para uma triagem específica deste benefício.",
      evidence: hasMaternitySignal ? ["Registro relacionado a maternidade identificado na seção de benefícios."] : ["Nenhum sinal específico de maternidade foi identificado."],
      missingRequirements: [
        "Comprovação do evento e da data correspondente.",
        "Qualidade de segurada na data relevante.",
        "Conferência da categoria e dos documentos exigidos pelo INSS.",
      ],
      normativeSource: SOURCES.maternity,
    },
  ];

  return { profile, benefits };
}
