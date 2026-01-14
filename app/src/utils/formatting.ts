export const formatPhoneNumber = (prefix?: string, number?: string): string => {
  const parts = [prefix?.trim(), number?.trim()].filter(Boolean);

  return parts.join(' ');
};
