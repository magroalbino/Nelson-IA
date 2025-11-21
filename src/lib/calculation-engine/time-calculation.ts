import { parse, differenceInDays, add } from 'date-fns';

/**
 * Represents a period of time in years, months, and days.
 */
export interface ContributionTime {
  years: number;
  months: number;
  days: number;
}

/**
 * Calculates the exact contribution time between a start and end date,
 * according to common social security calculation rules (inclusive of both dates).
 * 
 * @param startDate The start date of the period in 'yyyy-MM-dd' or 'dd/MM/yyyy' format.
 * @param endDate The end date of the period in 'yyyy-MM-dd' or 'dd/MM/yyyy' format.
 * @returns An object containing the years, months, and days of contribution.
 */
export function calculateContributionPeriod(startDate: string, endDate: string): ContributionTime {
  // Normalize dates to 'yyyy-MM-dd' for consistent parsing
  const normalizeDate = (dateStr: string): string => {
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };
  
  const start = parse(normalizeDate(startDate), 'yyyy-MM-dd', new Date());
  const end = parse(normalizeDate(endDate), 'yyyy-MM-dd', new Date());

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format. Please use yyyy-MM-dd or dd/MM/yyyy.');
  }

  // Social security calculations often add 1 day to the total difference
  // because the start and end dates are inclusive.
  let days = differenceInDays(end, start) + 1;

  if (days < 0) {
      return { years: 0, months: 0, days: 0 };
  }

  const years = Math.floor(days / 365);
  days %= 365;
  
  const months = Math.floor(days / 30);
  days %= 30;

  // Simple conversion can be imprecise. A more accurate method is to iterate.
  let tempDate = start;
  let calculatedYears = 0;
  let calculatedMonths = 0;

  // Calculate full years
  while (add(tempDate, { years: 1 }) <= end) {
    tempDate = add(tempDate, { years: 1 });
    calculatedYears++;
  }

  // Calculate full months
  while (add(tempDate, { months: 1 }) <= end) {
    tempDate = add(tempDate, { months: 1 });
    calculatedMonths++;
  }

  // The remaining days
  const calculatedDays = differenceInDays(end, tempDate) + 1;

  return {
    years: calculatedYears,
    months: calculatedMonths,
    days: calculatedDays,
  };
}

/**
 * Sums an array of contribution time objects into a single total.
 * 
 * @param periods An array of ContributionTime objects.
 * @returns A single ContributionTime object representing the total sum.
 */
export function sumContributionPeriods(periods: ContributionTime[]): ContributionTime {
    const totalDays = periods.reduce((acc, period) => {
        return acc + (period.years * 365.25) + (period.months * 30.4375) + period.days;
    }, 0);

    const totalYears = Math.floor(totalDays / 365.25);
    let remainingDays = totalDays % 365.25;
    
    const totalMonths = Math.floor(remainingDays / 30.4375);
    remainingDays = remainingDays % 30.4375;

    return {
        years: totalYears,
        months: totalMonths,
        days: Math.round(remainingDays),
    };
}
