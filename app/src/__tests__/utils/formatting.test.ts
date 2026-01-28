import { formatPhoneNumber, formatPercentage } from '@/utils/formatting';

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
    expect(formatPercentage(0)).toBe('0.00%');
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
