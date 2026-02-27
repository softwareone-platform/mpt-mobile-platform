const EMPTY_STRING = '';
const DEFAULT_DECIMAL_SPACES = 2;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const FUTURE = 1 as const;
export const PAST = -1 as const;
const FUTURE_ADJUSTMENT = 1;
const PAST_ADJUSTMENT = 0;

type RelativeDirection = typeof FUTURE | typeof PAST;

export const formatPhoneNumber = (prefix?: string, number?: string): string => {
  const parts = [prefix?.trim(), number?.trim()].filter(Boolean);

  return parts.join(' ');
};

export const formatPercentage = (
  numberToFormat?: number,
  decimals: number = DEFAULT_DECIMAL_SPACES,
): string => {
  if (numberToFormat === undefined || !numberToFormat) {
    return EMPTY_STRING;
  }

  return numberToFormat.toFixed(decimals) + '%';
};

export const numberFormatter = (fractionDigits: number, language: string) =>
  new Intl.NumberFormat(language || 'en-GB', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

export const formatNumber = (
  numberToFormat: number | undefined,
  fractionDigits: number,
  language: string,
): string => {
  if (!numberToFormat || Number.isNaN(numberToFormat)) {
    return EMPTY_STRING;
  }

  const formattedNumber = numberFormatter(fractionDigits, language).format(numberToFormat);

  return formattedNumber;
};

export const formatDateForLocale = (isoDate: string | undefined, locale: string) => {
  if (!isoDate) {
    return EMPTY_STRING;
  }
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_STRING;
  }

  const parts = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date);

  const day = parts.find((p) => p.type === 'day')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const year = parts.find((p) => p.type === 'year')?.value;

  if (!day || !month || !year) return EMPTY_STRING;

  return `${day} ${month} ${year}`;
};

export function getTime(isoDate: string): string {
  if (!isoDate) {
    return EMPTY_STRING;
  }
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_STRING;
  }

  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export const getUtcStartOfDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const formatUtcDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * function to calculate date realtive to base date, in direction of past or future
 * @param days - number of days relative to base date
 * @param baseDate - date as a base date to calculate relative date
 * @param direction - either future or past
 * @returns date relative to base date in number of days into past or future
 */
export const calculateRelativeDate = (
  days: string,
  baseDate: Date,
  direction: RelativeDirection,
): string => {
  const parsedDays = parseInt(days, 10);

  if (isNaN(parsedDays)) {
    return '';
  }

  const baseOffset = parsedDays * direction;

  // add one day for the future and zero for the past
  const boundaryAdjustment = direction === FUTURE ? FUTURE_ADJUSTMENT : PAST_ADJUSTMENT;

  const totalOffset = baseOffset + boundaryAdjustment;

  const shifted = new Date(baseDate.getTime() + totalOffset * MS_PER_DAY);
  const utcStartOfDay = getUtcStartOfDay(shifted);

  return formatUtcDate(utcStartOfDay);
};
