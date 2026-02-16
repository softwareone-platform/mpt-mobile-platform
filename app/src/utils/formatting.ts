const EMPTY_STRING = '';
const DEFAULT_DECIMAL_SPACES = 2;

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

export const formatDateForLocale = (isoDate: string, locale: string) => {
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
