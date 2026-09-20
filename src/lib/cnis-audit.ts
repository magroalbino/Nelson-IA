import type { CnisPeriod } from "@/lib/cnis-metrics";
import type { SourceRef, StructuredCnis } from "@/lib/cnis-structured";

export type AuditFindingKind = "DADO" | "ALERTA" | "HIPÓTESE";
export type AuditSeverity = "baixa" | "média" | "alta";

export type AuditFinding = {
  kind: AuditFindingKind;
  code: string;
  title: string;
  description: string;
  recommendedAction: string;
  severity: AuditSeverity;
  source?: SourceRef;
  relatedPeriods?: string[];
};

export type StructuredValidation = {
  valid: boolean;
  issues: Array<{
    code: string;
    message: string;
    source?: SourceRef;
  }>;
};

function monthIndex(value: string): number {
  const [month, year] = value.split("/").map(Number);
  return year * 12 + month;
}

function periodLabel(period: { start: string; end: string }): string {
  return `${period.start} a ${period.end}`;
}

function toLegacyPeriod(period: { start: string; end: string; source: SourceRef }): CnisPeriod {
  return { start: period.start, end: period.end, source: period.source.excerpt, page: period.source.page };
}

export function validateStructuredCnis(structured: StructuredCnis): StructuredValidation {
  const issues: StructuredValidation["issues"] = [];
  for (const employment of structured.employments) {
    if (monthIndex(employment.start) > monthIndex(employment.end)) {
      issues.push({ code: "PERIODO_INVERTIDO", message: `O período ${periodLabel(employment)} possui início posterior ao fim.`, source: employment.source });
    }
    if (!employment.source.excerpt || employment.source.page < 1) {
      issues.push({ code: "FONTE_INVALIDA", message: "O vínculo não possui uma fonte de origem válida.", source: employment.source });
    }
  }
  for (const contribution of structured.contributions) {
    if (!/^\d{2}\/\d{4}$/.test(contribution.competency)) {
      issues.push({ code: "COMPETENCIA_INVALIDA", message: `A competência ${contribution.competency} não está no formato MM/AAAA.`, source: contribution.source });
    }
  }
  for (const indicator of structured.indicators) {
    if (!indicator.source.excerpt || indicator.source.page < 1) {
      issues.push({ code: "INDICADOR_SEM_FONTE", message: `O indicador ${indicator.code} não possui fonte de origem válida.`, source: indicator.source });
    }
  }
  return { valid: issues.length === 0, issues };
}

export function auditStructuredCnis(
  structured: StructuredCnis,
  textLength: number,
  validation = validateStructuredCnis(structured),
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const employments = structured.employments.map(toLegacyPeriod).sort((a, b) => monthIndex(a.start) - monthIndex(b.start));

  for (const employment of structured.employments) {
    findings.push({
      kind: "DADO",
      code: "VINCULO_IDENTIFICADO",
      title: "Vínculo identificado",
      description: `${employment.employer || "Empregador não identificado"} — ${periodLabel(employment)}.`,
      recommendedAction: "Confira o vínculo e a página de origem no seu CNIS.",
      severity: "baixa",
      source: employment.source,
      relatedPeriods: [periodLabel(employment)],
    });
  }

  for (let index = 1; index < employments.length; index += 1) {
    const previous = employments[index - 1];
    const current = employments[index];
    const previousEnd = monthIndex(previous.end);
    const currentStart = monthIndex(current.start);
    if (currentStart > previousEnd + 1) {
      findings.push({
        kind: "ALERTA",
        code: "LACUNA_ENTRE_VINCULOS",
        title: "Lacuna entre períodos identificados",
        description: `Foi identificado um intervalo entre ${previous.end} e ${current.start}. Isso não confirma ausência de contribuição, apenas ausência de vínculo estruturado nesse intervalo.`,
        recommendedAction: "Confira se existem contribuições, atividade ou documentos referentes ao intervalo.",
        severity: "média",
        relatedPeriods: [periodLabel(previous), periodLabel(current)],
      });
    }
    if (currentStart <= previousEnd) {
      findings.push({
        kind: "ALERTA",
        code: "SOBREPOSICAO_DE_VINCULOS",
        title: "Períodos sobrepostos",
        description: `Os períodos ${periodLabel(previous)} e ${periodLabel(current)} se sobrepõem. A sobreposição não indica, sozinha, erro ou impossibilidade de aproveitamento.`,
        recommendedAction: "Confira os vínculos e a forma como os períodos devem ser considerados na análise previdenciária.",
        severity: "média",
        relatedPeriods: [periodLabel(previous), periodLabel(current)],
      });
    }
  }

  for (const indicator of structured.indicators) {
    findings.push({
      kind: "ALERTA",
      code: "INDICADOR_IDENTIFICADO",
      title: `Indicador ${indicator.code} identificado`,
      description: `O indicador ${indicator.code} foi localizado no documento. Seu impacto não é determinado automaticamente apenas pelo texto extraído.`,
      recommendedAction: "Confira o significado do indicador e reúna documentos de suporte, se necessário.",
      severity: "média",
      source: indicator.source,
      relatedPeriods: indicator.periods,
    });
  }

  if (textLength < 250 || structured.contributions.length === 0) {
    findings.push({
      kind: "HIPÓTESE",
      code: "DADOS_INSUFICIENTES",
      title: "Dados insuficientes para uma conclusão completa",
      description: "O texto extraído não contém informação estruturada suficiente para confirmar todos os períodos e competências do CNIS.",
      recommendedAction: "Envie um PDF completo e legível e confira manualmente as páginas não identificadas.",
      severity: "alta",
    });
  }

  for (const issue of validation.issues) {
    findings.push({
      kind: "ALERTA",
      code: issue.code,
      title: "Inconsistência na extração",
      description: issue.message,
      recommendedAction: "Confira a página indicada e não trate este campo como confirmado até a revisão.",
      severity: "alta",
      source: issue.source,
    });
  }

  if (structured.contributions.length > 0) {
    findings.push({
      kind: "HIPÓTESE",
      code: "COMPETENCIAS_NAO_CONFIRMAM_CARENCIA",
      title: "Competências identificadas não confirmam carência",
      description: "A presença de uma competência no texto não comprova, por si só, que ela seja válida para carência ou para uma regra específica de aposentadoria.",
      recommendedAction: "Use a contagem como estimativa inicial e confirme as competências conforme a regra aplicável.",
      severity: "média",
    });
  }

  return findings;
}
