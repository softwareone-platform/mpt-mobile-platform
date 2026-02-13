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
  if (!numberToFormat || isNaN(numberToFormat)) {
    return EMPTY_STRING;
  }

  const formattedNumber = numberFormatter(fractionDigits, language).format(numberToFormat);

  return formattedNumber;
};
