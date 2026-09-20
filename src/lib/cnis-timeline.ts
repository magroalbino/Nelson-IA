import type { AuditFinding } from "@/lib/cnis-audit";
import type { SourceRef, StructuredCnis } from "@/lib/cnis-structured";

export type TimelineEvent = {
  kind: "vinculo" | "beneficio" | "competencias" | "indicador" | "alerta";
  title: string;
  period: string;
  detail: string;
  source?: SourceRef;
  tone: "blue" | "green" | "amber" | "red" | "slate";
};

function sortKey(period: string): number {
  const match = period.match(/(\d{2})\/(\d{4})/);
  return match ? Number(match[2]) * 12 + Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export function buildCnisTimeline(structured: StructuredCnis, findings: AuditFinding[]): TimelineEvent[] {
  const events: TimelineEvent[] = structured.employments.map((employment) => ({
    kind: "vinculo",
    title: employment.employer || "Vínculo sem empregador identificado",
    period: `${employment.start} a ${employment.end}`,
    detail: employment.category ? `Categoria: ${employment.category}` : "Categoria não identificada",
    source: employment.source,
    tone: "blue",
  }));

  events.push(...structured.benefits.map((benefit) => ({
    kind: "beneficio" as const,
    title: benefit.kind || "Benefício identificado",
    period: benefit.start && benefit.end ? `${benefit.start} a ${benefit.end}` : "Data não identificada",
    detail: "Benefício localizado no texto do CNIS.",
    source: benefit.source,
    tone: "green" as const,
  })));

  if (structured.contributions.length > 0) {
    const first = structured.contributions[0];
    const last = structured.contributions[structured.contributions.length - 1];
    events.push({
      kind: "competencias",
      title: "Competências identificadas",
      period: first.competency === last.competency ? first.competency : `${first.competency} a ${last.competency}`,
      detail: `${structured.contributions.length} competência(s) localizada(s) no texto. Isso não confirma carência.` ,
      source: first.source,
      tone: "slate",
    });
  }

  events.push(...structured.indicators.map((indicator) => ({
    kind: "indicador" as const,
    title: `Indicador ${indicator.code}`,
    period: indicator.periods.length ? indicator.periods.join(", ") : "Período não identificado",
    detail: "Indicador que merece conferência específica.",
    source: indicator.source,
    tone: "amber" as const,
  })));

  events.push(...findings.filter((finding) => finding.kind === "ALERTA" && ["LACUNA_ENTRE_VINCULOS", "SOBREPOSICAO_DE_VINCULOS"].includes(finding.code)).map((finding) => ({
    kind: "alerta" as const,
    title: finding.title,
    period: finding.relatedPeriods?.join(" / ") || "Período não identificado",
    detail: finding.description,
    source: finding.source,
    tone: "red" as const,
  })));

  return events.sort((a, b) => sortKey(a.period) - sortKey(b.period));
}
