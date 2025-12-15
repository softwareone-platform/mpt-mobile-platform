import { formatPhoneNumber } from '@/utils/formatting';

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
