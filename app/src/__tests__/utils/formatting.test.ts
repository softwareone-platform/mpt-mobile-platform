import {
  formatPhoneNumber,
  formatPercentage,
  numberFormatter,
  formatNumber,
  formatDateForLocale,
  getTime,
  FUTURE,
  PAST,
  getUtcStartOfDay,
  formatUtcDate,
  calculateRelativeDate,
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

describe('formatDateForLocale', () => {
  const locale = 'en-US';

  it('returns EMPTY_STRING when isoDate is empty string', () => {
    expect(formatDateForLocale('', locale)).toBe(EMPTY_STRING);
  });

  it('returns EMPTY_STRING when isoDate is null', () => {
    expect(formatDateForLocale(null as unknown as string, locale)).toBe(EMPTY_STRING);
  });

  it('returns EMPTY_STRING when isoDate is undefined', () => {
    expect(formatDateForLocale(undefined as unknown as string, locale)).toBe(EMPTY_STRING);
  });

  it('returns EMPTY_STRING when isoDate is invalid', () => {
    expect(formatDateForLocale('invalid-date', locale)).toBe(EMPTY_STRING);
    expect(formatDateForLocale('2025-13-01T00:00:00Z', locale)).toBe(EMPTY_STRING);
  });

  it('formats a valid ISO date correctly', () => {
    expect(formatDateForLocale('2025-04-23T11:06:29.000Z', locale)).toBe('23 Apr 2025');
    expect(formatDateForLocale('2023-12-05T00:00:00.000Z', locale)).toBe('05 Dec 2023');
  });

  it('formats different locales correctly - for example German and French', () => {
    expect(formatDateForLocale('2025-04-23T11:06:29.000Z', 'de-DE')).toBe('23 Apr. 2025');
    expect(formatDateForLocale('2025-04-23T11:06:29.000Z', 'fr-FR')).toBe('23 avr. 2025');
  });

  it('returns EMPTY_STRING if Intl.DateTimeFormat returns parts with missing day, month, or year', () => {
    const originalFormatToParts = Intl.DateTimeFormat.prototype.formatToParts;

    Intl.DateTimeFormat.prototype.formatToParts = jest.fn(() => [
      { type: 'month', value: 'Apr' },
      { type: 'year', value: '2025' },
    ]);

    expect(formatDateForLocale('2025-04-23T11:06:29.000Z', locale)).toBe(EMPTY_STRING);

    Intl.DateTimeFormat.prototype.formatToParts = originalFormatToParts;
  });

  it('pads day with leading zero correctly', () => {
    expect(formatDateForLocale('2025-04-05T11:06:29.000Z', locale)).toBe('05 Apr 2025');
  });
});

describe('getTime', () => {
  describe('valid ISO dates (UTC)', () => {
    it('returns correct UTC time (HH:mm)', () => {
      expect(getTime('2026-02-17T09:55:24.190Z')).toBe('09:55');
    });

    it('pads single digit hours and minutes', () => {
      expect(getTime('2026-02-17T05:07:00.000Z')).toBe('05:07');
    });

    it('handles midnight correctly', () => {
      expect(getTime('2026-02-17T00:00:00.000Z')).toBe('00:00');
    });

    it('handles end of day correctly', () => {
      expect(getTime('2026-02-17T23:59:59.999Z')).toBe('23:59');
    });
  });

  describe('invalid input', () => {
    it('returns EMPTY_STRING for empty string', () => {
      expect(getTime('')).toBe(EMPTY_STRING);
    });

    it('returns EMPTY_STRING for invalid date string', () => {
      expect(getTime('not-a-date')).toBe(EMPTY_STRING);
    });

    it('returns EMPTY_STRING for malformed ISO string', () => {
      expect(getTime('2026-99-99T99:99:99Z')).toBe(EMPTY_STRING);
    });

    it('returns EMPTY_STRING for null (runtime edge case)', () => {
      expect(getTime(null as unknown as string)).toBe(EMPTY_STRING);
    });

    it('returns EMPTY_STRING for undefined (runtime edge case)', () => {
      expect(getTime(undefined as unknown as string)).toBe(EMPTY_STRING);
    });
  });
});

describe('Date Utilities', () => {
  describe('getUtcStartOfDay', () => {
    it('should return UTC midnight for a given date', () => {
      const date = new Date('2026-02-26T15:30:45Z'); // 3:30 PM UTC
      const result = getUtcStartOfDay(date);

      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
      expect(result.getUTCDate()).toBe(26);
      expect(result.getUTCMonth()).toBe(1); // Feb = 1
      expect(result.getUTCFullYear()).toBe(2026);
    });

    it('should handle end of month correctly', () => {
      const date = new Date('2026-02-28T23:59:59Z');
      const result = getUtcStartOfDay(date);
      expect(result.getUTCDate()).toBe(28);
      expect(result.getUTCMonth()).toBe(1);
      expect(result.getUTCFullYear()).toBe(2026);
    });

    it('should handle leap year February correctly', () => {
      const date = new Date('2024-02-29T12:00:00Z');
      const result = getUtcStartOfDay(date);
      expect(result.getUTCDate()).toBe(29);
      expect(result.getUTCMonth()).toBe(1);
      expect(result.getUTCFullYear()).toBe(2024);
    });
  });

  describe('formatUtcDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(Date.UTC(2026, 1, 26)); // Feb 26, 2026
      expect(formatUtcDate(date)).toBe('2026-02-26');
    });

    it('should pad month and day with leading zeros', () => {
      const date = new Date(Date.UTC(2026, 0, 5)); // Jan 5, 2026
      expect(formatUtcDate(date)).toBe('2026-01-05');
    });

    it('should handle December correctly', () => {
      const date = new Date(Date.UTC(2026, 11, 31)); // Dec 31, 2026
      expect(formatUtcDate(date)).toBe('2026-12-31');
    });
  });

  describe('calculateRelativeDate', () => {
    const baseDate = new Date(Date.UTC(2026, 1, 26)); // Feb 26, 2026

    it('should calculate past date correctly with 0 adjustment', () => {
      const result = calculateRelativeDate('5', baseDate, PAST);
      // past offset = -5 + 0 adjustment = -5 days → 2026-02-21
      expect(result).toBe('2026-02-21');
    });

    it('should calculate future date correctly with +1 adjustment', () => {
      const result = calculateRelativeDate('5', baseDate, FUTURE);
      // future offset = 5 + 1 adjustment = 6 days → 2026-03-04
      expect(result).toBe('2026-03-04');
    });

    it('should handle zero days for past', () => {
      const result = calculateRelativeDate('0', baseDate, PAST);
      expect(result).toBe('2026-02-26');
    });

    it('should handle zero days for future', () => {
      const result = calculateRelativeDate('0', baseDate, FUTURE);
      // future adjustment adds 1 day → 2026-02-27
      expect(result).toBe('2026-02-27');
    });

    it('should handle negative day string for past', () => {
      const result = calculateRelativeDate('-3', baseDate, PAST);
      // parsedDays = -3, direction = -1 → -3 * -1 = 3, PAST_ADJUSTMENT=0 → +3 → 2026-03-01
      expect(result).toBe('2026-03-01');
    });

    it('should handle negative day string for future', () => {
      const result = calculateRelativeDate('-2', baseDate, FUTURE);
      // parsedDays=-2, direction=1 → -2*1=-2, FUTURE_ADJUSTMENT=1 → -2+1=-1 → 2026-02-25
      expect(result).toBe('2026-02-25');
    });

    it('should return empty string for invalid day string', () => {
      const result = calculateRelativeDate('abc', baseDate, FUTURE);
      expect(result).toBe('');
    });

    it('should handle large day offsets correctly', () => {
      const result = calculateRelativeDate('100', baseDate, FUTURE);
      // 100*1 + 1 = 101 days → baseDate + 101 days
      expect(result).toBe('2026-06-07');
    });

    it('should handle leap year when adding days', () => {
      const leapBase = new Date(Date.UTC(2024, 1, 28)); // Feb 28, 2024
      const result = calculateRelativeDate('1', leapBase, FUTURE);
      // 1*1 + 1 = 2 days → Feb 28 + 2 days = Mar 1, 2024
      expect(result).toBe('2024-03-01');
    });
  });
});
