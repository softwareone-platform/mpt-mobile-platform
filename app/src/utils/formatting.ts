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
  if (numberToFormat === undefined) {
    return EMPTY_STRING;
  }
  return numberToFormat.toFixed(decimals) + '%';
};
