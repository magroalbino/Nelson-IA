export type CnisPeriod = {
  start: string;
  end: string;
  source: string;
  page?: number;
};

export type CnisMetrics = {
  competenciesIdentified: number;
  carenciaTotal: number;
  tempoContribuicaoTotal: string;
  progressoAposentadoria: number;
  indicatorsCount: number;
  calculationBasis: string;
};

export function uniqueCompetencies(competencies: string[]): string[] {
  return [...new Set(competencies)].sort((a, b) => {
    const [monthA, yearA] = a.split("/").map(Number);
    const [monthB, yearB] = b.split("/").map(Number);
    return yearA - yearB || monthA - monthB;
  });
}

export function calculateCnisMetrics(
  competencies: string[],
  indicatorsCount: number,
): CnisMetrics {
  const normalizedCompetencies = uniqueCompetencies(competencies);
  const months = normalizedCompetencies.length;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const progress = Math.min(100, Math.round((months / (35 * 12)) * 100));

  return {
    competenciesIdentified: months,
    // Até existir classificação de competência paga/válida, este valor é apenas
    // uma contagem preliminar e não deve ser tratado como carência previdenciária.
    carenciaTotal: months,
    tempoContribuicaoTotal: `${years} anos e ${remainder} meses (estimativa por competências identificadas)`,
    progressoAposentadoria: progress,
    indicatorsCount,
    calculationBasis: "Contagem preliminar de competências únicas identificadas no texto; não substitui a validação previdenciária.",
  };
}

export function detectOverlaps(periods: CnisPeriod[]): Array<{ first: CnisPeriod; second: CnisPeriod }> {
  const parse = (value: string) => {
    const [month, year] = value.split("/").map(Number);
    return year * 12 + month;
  };
  const ordered = periods
    .filter((period) => period.start && period.end)
    .sort((a, b) => parse(a.start) - parse(b.start));
  const overlaps: Array<{ first: CnisPeriod; second: CnisPeriod }> = [];

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (parse(current.start) <= parse(previous.end)) {
      overlaps.push({ first: previous, second: current });
    }
  }
  return overlaps;
}
