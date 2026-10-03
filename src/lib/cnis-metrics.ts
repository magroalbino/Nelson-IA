export type CnisPeriod = {
  start: string;
  end: string;
  source: string;
  page?: number;
};

export type PeriodGap = {
  start: string;
  end: string;
  months: number;
  before: CnisPeriod;
  after: CnisPeriod;
};

export type PeriodOverlap = {
  first: CnisPeriod;
  second: CnisPeriod;
  start: string;
  end: string;
  months: number;
};

export type PeriodMetrics = {
  validPeriods: CnisPeriod[];
  consolidatedPeriods: CnisPeriod[];
  invalidPeriods: CnisPeriod[];
  gaps: PeriodGap[];
  overlaps: PeriodOverlap[];
  periodMonths: number;
  overlappingMonths: number;
  competenciesOutsidePeriods: string[];
};

export type CnisMetrics = {
  competenciesIdentified: number;
  carenciaTotal: number;
  carenciaPotencial: number;
  carenciaConfirmada: number;
  tempoContribuicaoTotal: string;
  progressoAposentadoria: number;
  indicatorsCount: number;
  calculationBasis: string;
  periodMonths: number;
  overlappingMonths: number;
  consolidatedPeriods: CnisPeriod[];
  gaps: PeriodGap[];
  overlaps: PeriodOverlap[];
  invalidPeriods: CnisPeriod[];
  competenciesOutsidePeriods: string[];
};

export function competencyToIndex(value: string): number | null {
  const match = String(value).trim().match(/^(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12 || year < 1900 || year > 2200) return null;
  return year * 12 + month;
}

export function indexToCompetency(index: number): string {
  const year = Math.floor((index - 1) / 12);
  const month = ((index - 1) % 12) + 1;
  return `${String(month).padStart(2, "0")}/${year}`;
}

export function uniqueCompetencies(competencies: string[]): string[] {
  return [...new Set(competencies.map((value) => {
    const index = competencyToIndex(value);
    return index === null ? value.trim() : indexToCompetency(index);
  }).filter(Boolean))].sort((a, b) => (competencyToIndex(a) ?? Number.MAX_SAFE_INTEGER) - (competencyToIndex(b) ?? Number.MAX_SAFE_INTEGER));
}

function periodBounds(period: CnisPeriod): { start: number | null; end: number | null } {
  return { start: competencyToIndex(period.start), end: competencyToIndex(period.end) };
}

function periodFromBounds(start: number, end: number, source: CnisPeriod): CnisPeriod {
  return { start: indexToCompetency(start), end: indexToCompetency(end), source: source.source, page: source.page };
}

export function normalizePeriods(periods: CnisPeriod[]): { valid: CnisPeriod[]; invalid: CnisPeriod[] } {
  const valid: CnisPeriod[] = [];
  const invalid: CnisPeriod[] = [];
  for (const period of periods) {
    const { start, end } = periodBounds(period);
    if (start === null || end === null || start > end) invalid.push(period);
    else valid.push({ ...period, start: indexToCompetency(start), end: indexToCompetency(end) });
  }
  valid.sort((a, b) => (competencyToIndex(a.start) || 0) - (competencyToIndex(b.start) || 0) || (competencyToIndex(a.end) || 0) - (competencyToIndex(b.end) || 0));
  return { valid, invalid };
}

export function consolidatePeriods(periods: CnisPeriod[]): CnisPeriod[] {
  const { valid } = normalizePeriods(periods);
  const consolidated: CnisPeriod[] = [];
  for (const period of valid) {
    const current = consolidated[consolidated.length - 1];
    if (!current) {
      consolidated.push({ ...period });
      continue;
    }
    const currentEnd = competencyToIndex(current.end)!;
    const nextStart = competencyToIndex(period.start)!;
    if (nextStart <= currentEnd + 1) {
      if (competencyToIndex(period.end)! > currentEnd) current.end = period.end;
    } else {
      consolidated.push({ ...period });
    }
  }
  return consolidated;
}

export function countPeriodMonths(periods: CnisPeriod[]): number {
  return consolidatePeriods(periods).reduce((total, period) => total + competencyToIndex(period.end)! - competencyToIndex(period.start)! + 1, 0);
}

export function detectOverlaps(periods: CnisPeriod[]): PeriodOverlap[] {
  const { valid } = normalizePeriods(periods);
  const overlaps: PeriodOverlap[] = [];
  for (let index = 0; index < valid.length; index += 1) {
    const current = valid[index];
    const currentStart = competencyToIndex(current.start)!;
    const currentEnd = competencyToIndex(current.end)!;
    for (let previousIndex = 0; previousIndex < index; previousIndex += 1) {
      const previous = valid[previousIndex];
      const previousStart = competencyToIndex(previous.start)!;
      const previousEnd = competencyToIndex(previous.end)!;
      const start = Math.max(currentStart, previousStart);
      const end = Math.min(currentEnd, previousEnd);
      if (start <= end) overlaps.push({ first: previous, second: current, start: indexToCompetency(start), end: indexToCompetency(end), months: end - start + 1 });
    }
  }
  return overlaps;
}

export function detectGaps(periods: CnisPeriod[]): PeriodGap[] {
  const consolidated = consolidatePeriods(periods);
  const gaps: PeriodGap[] = [];
  for (let index = 1; index < consolidated.length; index += 1) {
    const before = consolidated[index - 1];
    const after = consolidated[index];
    const start = competencyToIndex(before.end)! + 1;
    const end = competencyToIndex(after.start)! - 1;
    if (start <= end) gaps.push({ start: indexToCompetency(start), end: indexToCompetency(end), months: end - start + 1, before, after });
  }
  return gaps;
}

export function calculatePeriodMetrics(periods: CnisPeriod[], competencies: string[]): PeriodMetrics {
  const { valid, invalid } = normalizePeriods(periods);
  const consolidatedPeriods = consolidatePeriods(valid);
  const normalizedCompetencies = uniqueCompetencies(competencies);
  const competenciesOutsidePeriods = normalizedCompetencies.filter((competency) => {
    const index = competencyToIndex(competency);
    return index === null || !valid.some((period) => index >= competencyToIndex(period.start)! && index <= competencyToIndex(period.end)!);
  });
  const overlaps = detectOverlaps(valid);
  return {
    validPeriods: valid,
    consolidatedPeriods,
    invalidPeriods: invalid,
    gaps: detectGaps(valid),
    overlaps,
    periodMonths: countPeriodMonths(valid),
    overlappingMonths: [...new Set(overlaps.flatMap((overlap) => Array.from({ length: overlap.months }, (_, index) => (competencyToIndex(overlap.start)! + index))))].length,
    competenciesOutsidePeriods,
  };
}

export function calculateCnisMetrics(competencies: string[], indicatorsCount: number, periods: CnisPeriod[] = []): CnisMetrics {
  const normalizedCompetencies = uniqueCompetencies(competencies);
  const periodMetrics = calculatePeriodMetrics(periods, normalizedCompetencies);
  const monthsForTime = periodMetrics.periodMonths || normalizedCompetencies.length;
  const years = Math.floor(monthsForTime / 12);
  const remainder = monthsForTime % 12;
  const progress = Math.min(100, Math.round((monthsForTime / (35 * 12)) * 100));
  const potential = normalizedCompetencies.length;
  return {
    competenciesIdentified: potential,
    carenciaTotal: potential,
    carenciaPotencial: potential,
    carenciaConfirmada: 0,
    tempoContribuicaoTotal: `${years} anos e ${remainder} meses (tempo consolidado por períodos identificados)`,
    progressoAposentadoria: progress,
    indicatorsCount,
    calculationBasis: "Tempo calculado pela união mensal de períodos válidos, sem duplicidades. Competências identificadas e carência potencial não confirmam carência previdenciária.",
    periodMonths: periodMetrics.periodMonths,
    overlappingMonths: periodMetrics.overlappingMonths,
    consolidatedPeriods: periodMetrics.consolidatedPeriods,
    gaps: periodMetrics.gaps,
    overlaps: periodMetrics.overlaps,
    invalidPeriods: periodMetrics.invalidPeriods,
    competenciesOutsidePeriods: periodMetrics.competenciesOutsidePeriods,
  };
}
