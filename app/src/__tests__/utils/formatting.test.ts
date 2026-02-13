import {
  formatPhoneNumber,
  formatPercentage,
  numberFormatter,
  formatNumber,
} from '@/utils/formatting';

const EMPTY_STRING = '';

describe('formatPhoneNumber', () => {
  it('returns combined prefix and number when both are provided', () => {
    expect(formatPhoneNumber('+1', '123456789')).toBe('+1 123456789');
  });

  it('trims extra spaces from prefix and number', () => {
    expect(formatPhoneNumber(' +1 ', ' 123456789 ')).toBe('+1 123456789');
  });

  it('returns only prefix if number is undefined', () => {
    expect(formatPhoneNumber('+1', undefined)).toBe('+1');
  });

  it('returns only number if prefix is undefined', () => {
    expect(formatPhoneNumber(undefined, '123456789')).toBe('123456789');
  });

  it('returns empty string if both prefix and number are undefined', () => {
    expect(formatPhoneNumber(undefined, undefined)).toBe('');
  });

  it('returns empty string if both prefix and number are empty strings', () => {
    expect(formatPhoneNumber('', '')).toBe('');
  });

  it('returns trimmed prefix if number is empty string', () => {
    expect(formatPhoneNumber(' +1 ', '')).toBe('+1');
  });

  it('returns trimmed number if prefix is empty string', () => {
    expect(formatPhoneNumber('', ' 123456789 ')).toBe('123456789');
  });

  it('handles whitespace-only strings', () => {
    expect(formatPhoneNumber('   ', '   ')).toBe('');
    expect(formatPhoneNumber('   ', ' 123 ')).toBe('123');
    expect(formatPhoneNumber(' +1 ', '   ')).toBe('+1');
  });

  it('handles numeric string inputs', () => {
    expect(formatPhoneNumber('1', '123')).toBe('1 123');
  });
});

describe('formatPercentage', () => {
  it('should return EMPTY_STRING when numberToFormat is undefined', () => {
    expect(formatPercentage(undefined)).toBe(EMPTY_STRING);
  });

  it('should format number with default 2 decimals', () => {
    expect(formatPercentage(12.3456)).toBe('12.35%');
    expect(formatPercentage(12)).toBe('12.00%');
  });

  it('should format number with specified decimals', () => {
    expect(formatPercentage(12.3456, 1)).toBe('12.3%');
    expect(formatPercentage(12.3456, 3)).toBe('12.346%');
  });

  it('should handle zero correctly', () => {
    expect(formatPercentage(0)).toBe('');
  });

  it('should handle negative numbers', () => {
    expect(formatPercentage(-5.6789)).toBe('-5.68%');
  });

  it('should handle very small numbers', () => {
    expect(formatPercentage(0.0001, 4)).toBe('0.0001%');
    expect(formatPercentage(0.00012345, 6)).toBe('0.000123%');
  });

  it('should handle very large numbers', () => {
    expect(formatPercentage(1234567.89, 2)).toBe('1234567.89%');
  });
});

describe('numberFormatter', () => {
  it('returns a NumberFormat instance', () => {
    const nf = numberFormatter(2, 'en-GB');
    expect(nf.format).toBeDefined();
    expect(typeof nf.format).toBe('function');
  });

  it('formats number with correct fraction digits', () => {
    const nf = numberFormatter(3, 'en-GB');
    expect(nf.format(1.23456)).toBe('1.235'); // rounded
  });

  it('defaults language to en-GB when undefined', () => {
    const nf = numberFormatter(2, '');
    expect(nf.format(1234.56)).toBe('1,234.56');
  });

  it('works for other locales', () => {
    const nf = numberFormatter(2, 'de-DE');
    expect(nf.format(1234.56)).toBe('1.234,56');
  });
});

describe('formatNumber', () => {
  const language = 'en';

  it('formats valid numbers correctly', () => {
    expect(formatNumber(1234.567, 2, language)).toBe('1,234.57');
    /**
     * note: 0 should be treated as empty (platform behaviour)
     */
    expect(formatNumber(0, 2, language)).toBe('');
  });

  it('returns EMPTY_STRING for undefined', () => {
    expect(formatNumber(undefined, 2, language)).toBe('');
  });

  it('returns EMPTY_STRING for NaN', () => {
    expect(formatNumber(NaN, 2, language)).toBe('');
  });

  it('respects fraction digits', () => {
    expect(formatNumber(1.234567, 0, language)).toBe('1');
    expect(formatNumber(1.234567, 4, language)).toBe('1.2346');
  });

  it('respects different locales', () => {
    expect(formatNumber(1234.56, 2, 'de-DE')).toBe('1.234,56');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1234.56, 2, language)).toBe('-1,234.56');
  });
});
