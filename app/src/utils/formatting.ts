const EMPTY_STRING = '';

export const formatPhoneNumber = (prefix?: string, number?: string): string => {
  const parts = [prefix?.trim(), number?.trim()].filter(Boolean);

  return parts.join(' ');
};

export const formatPercentage = (numberToFormat?: number, decimals: number = 2): string => {
  if (numberToFormat === undefined) {
    return EMPTY_STRING;
  }
  return numberToFormat.toFixed(decimals) + '%';
};
