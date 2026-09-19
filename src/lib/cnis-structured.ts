import type { CnisPeriod } from "@/lib/cnis-metrics";

export type SourceRef = {
  page: number;
  excerpt: string;
};

export type StructuredEmployment = Omit<CnisPeriod, "source"> & {
  employer: string | null;
  category: string | null;
  indicators: string[];
  source: SourceRef;
};

export type StructuredContribution = {
  competency: string;
  value: number | null;
  indicator: string | null;
  status: "identified" | "unknown";
  source: SourceRef;
};

export type StructuredBenefit = {
  kind: string | null;
  start: string | null;
  end: string | null;
  source: SourceRef;
};

export type StructuredIndicator = {
  code: string;
  periods: string[];
  source: SourceRef;
};

export type StructuredCnis = {
  employments: StructuredEmployment[];
  contributions: StructuredContribution[];
  benefits: StructuredBenefit[];
  indicators: StructuredIndicator[];
};

const MONTH_RE = /\b(0[1-9]|1[0-2])\/((?:19|20)\d{2})\b/g;
const INDICATOR_RE = /\b(?:PEXT|AEXT(?:-VI)?|PREC-MENOR-MIN|IREC-LC123|IREC-MEI|PSC-MEN-SM|ACRÉSCIMO|EXTEMP|PEN|INDPEND|SAL-MIN)\b/gi;
const PERIOD_RE = /(?:per[ií]odo|de)\s*:?\s*(0[1-9]|1[0-2]\/\d{4})\s*(?:a|até|[-–])\s*(0[1-9]|1[0-2]\/\d{4})/i;

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function monthIndex(value: string): number {
  const [month, year] = value.split("/").map(Number);
  return year * 12 + month;
}

function expandCompetencyRange(start: string, end: string): string[] {
  const result: string[] = [];
  for (let current = monthIndex(start); current <= monthIndex(end); current += 1) {
    const year = Math.floor((current - 1) / 12);
    const month = ((current - 1) % 12) + 1;
    result.push(`${String(month).padStart(2, "0")}/${year}`);
  }
  return result;
}

function extractDates(line: string): string[] {
  return [...line.matchAll(MONTH_RE)].map((match) => `${match[1]}/${match[2]}`);
}

function source(page: number, excerpt: string): SourceRef {
  return { page, excerpt: excerpt.trim().slice(0, 240) };
}

function extractPeriod(line: string): { start: string; end: string } | null {
  const dates = extractDates(line);
  return dates.length >= 2 ? { start: dates[0], end: dates[1] } : null;
}

function extractCompetencies(line: string): string[] {
  const dates = extractDates(line);
  const range = dates.length >= 2 && /\b(?:a|até|[-–])\b/.test(line);
  if (range) return expandCompetencyRange(dates[0], dates[1]);
  return dates;
}

function indicatorCodes(line: string): string[] {
  return unique([...line.matchAll(INDICATOR_RE)].map((match) => match[0].toUpperCase()));
}

function parseEmployments(pageTexts: string[]): StructuredEmployment[] {
  const employments: StructuredEmployment[] = [];
  for (let pageIndex = 0; pageIndex < pageTexts.length; pageIndex += 1) {
    const lines = pageTexts[pageIndex].split("\n").map((line) => line.trim()).filter(Boolean);
    let employer: string | null = null;
    let category: string | null = null;
    for (const line of lines) {
      if (/^empregador\s*:/i.test(line)) employer = line.replace(/^empregador\s*:/i, "").trim() || null;
      if (/^categoria\s*:/i.test(line)) category = line.replace(/^categoria\s*:/i, "").trim() || null;
      const period = /\bper[ií]odo\s*:/i.test(line) ? extractPeriod(line) : null;
      if (period) {
        employments.push({
          ...period,
          employer,
          category,
          indicators: indicatorCodes(line),
          source: source(pageIndex + 1, line),
        });
      }
    }
  }
  return employments;
}

function parseContributions(pageTexts: string[]): StructuredContribution[] {
  const contributions = new Map<string, StructuredContribution>();
  for (let pageIndex = 0; pageIndex < pageTexts.length; pageIndex += 1) {
    for (const line of pageTexts[pageIndex].split("\n").map((item) => item.trim()).filter(Boolean)) {
      if (!/^compet[eê]ncia(?:s)?\s*:/i.test(line)) continue;
      const competencies = extractCompetencies(line);
      const indicators = indicatorCodes(line);
      for (const competency of competencies) {
        const existing = contributions.get(competency);
        contributions.set(competency, {
          competency,
          value: existing?.value ?? null,
          indicator: existing?.indicator ?? indicators[0] ?? null,
          status: "identified",
          source: existing?.source || source(pageIndex + 1, line),
        });
      }
    }
  }
  return [...contributions.values()].sort((a, b) => monthIndex(a.competency) - monthIndex(b.competency));
}

function parseBenefits(pageTexts: string[]): StructuredBenefit[] {
  const benefits: StructuredBenefit[] = [];
  for (let pageIndex = 0; pageIndex < pageTexts.length; pageIndex += 1) {
    for (const line of pageTexts[pageIndex].split("\n").map((item) => item.trim()).filter(Boolean)) {
      if (!/benef[ií]cio/i.test(line)) continue;
      const dates = extractDates(line);
      benefits.push({ kind: line.replace(/benef[ií]cio\s*:?/i, "").split(/per[ií]odo/i)[0].replace(/[—–-]\s*$/, "").trim() || null, start: dates[0] || null, end: dates[1] || null, source: source(pageIndex + 1, line) });
    }
  }
  return benefits;
}

function parseIndicators(pageTexts: string[]): StructuredIndicator[] {
  const indicators = new Map<string, StructuredIndicator>();
  for (let pageIndex = 0; pageIndex < pageTexts.length; pageIndex += 1) {
    for (const line of pageTexts[pageIndex].split("\n").map((item) => item.trim()).filter(Boolean)) {
      const codes = indicatorCodes(line);
      const periods = extractDates(line);
      for (const code of codes) {
        const existing = indicators.get(code);
        indicators.set(code, { code, periods: unique([...(existing?.periods || []), ...periods]), source: existing?.source || source(pageIndex + 1, line) });
      }
    }
  }
  return [...indicators.values()];
}

export function structureCnis(pageTexts: string[]): StructuredCnis {
  return {
    employments: parseEmployments(pageTexts),
    contributions: parseContributions(pageTexts),
    benefits: parseBenefits(pageTexts),
    indicators: parseIndicators(pageTexts),
  };
}
