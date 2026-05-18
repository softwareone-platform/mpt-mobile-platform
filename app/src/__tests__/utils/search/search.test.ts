import {
  getEntityTypeBySearchTerm,
  checkIfIsPartialId,
  sanitizeSearchInput,
} from '@/utils/search/search';

describe('getEntityTypeBySearchTerm', () => {
  it('detects full Agreement ID', () => {
    expect(getEntityTypeBySearchTerm('AGR-1234-5678-9012')).toBe('Agreement');
  });

  it('detects partial Agreement ID', () => {
    expect(getEntityTypeBySearchTerm('AGR-1234')).toBe('PartialAgreement');
  });

  it('detects full Order ID', () => {
    expect(getEntityTypeBySearchTerm('ORD-1234-5678-9012')).toBe('Order');
  });

  it('detects partial Order ID', () => {
    expect(getEntityTypeBySearchTerm('ORD-1234')).toBe('PartialOrder');
  });

  it('detects full Subscription ID', () => {
    expect(getEntityTypeBySearchTerm('SUB-1234-5678-9012')).toBe('Subscription');
  });

  it('detects partial Subscription ID', () => {
    expect(getEntityTypeBySearchTerm('SUB-1234')).toBe('PartialSubscription');
  });

  it('detects full Buyer ID', () => {
    expect(getEntityTypeBySearchTerm('BUY-1234-5678')).toBe('Buyer');
  });

  it('detects partial Buyer ID', () => {
    expect(getEntityTypeBySearchTerm('BUY-1234')).toBe('PartialBuyer');
  });

  it('detects full Account ID', () => {
    expect(getEntityTypeBySearchTerm('ACC-1234-5678')).toBe('Account');
  });

  it('detects partial Account ID', () => {
    expect(getEntityTypeBySearchTerm('ACC-1234')).toBe('PartialAccount');
  });

  it('detects full Product ID', () => {
    expect(getEntityTypeBySearchTerm('PRD-1234-5678')).toBe('Product');
  });

  it('detects partial Product ID', () => {
    expect(getEntityTypeBySearchTerm('PRD-1234')).toBe('PartialProduct');
  });

  it('detects full ProductItem ID', () => {
    expect(getEntityTypeBySearchTerm('ITM-1234-5678-9012')).toBe('ProductItem');
  });

  it('detects partial ProductItem ID', () => {
    expect(getEntityTypeBySearchTerm('ITM-1234')).toBe('PartialProductItem');
  });

  it('returns null for non-matching string', () => {
    expect(getEntityTypeBySearchTerm('random text')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getEntityTypeBySearchTerm('')).toBeNull();
  });

  it('does not match malformed IDs', () => {
    expect(getEntityTypeBySearchTerm('AGR-12A4-5678')).toBeNull();
    expect(getEntityTypeBySearchTerm('SUB1234')).toBeNull();
  });
});

describe('checkIfIsPartialId', () => {
  it('returns undefined for 1–4 digit numeric input', () => {
    expect(checkIfIsPartialId('1')).toBeUndefined();
    expect(checkIfIsPartialId('1234')).toBeUndefined();
  });

  it('returns true for valid partial structured IDs', () => {
    expect(checkIfIsPartialId('1234-5678')).toBe(true);
    expect(checkIfIsPartialId('1234-5678-9012')).toBe(true);
  });

  it('returns false for invalid patterns', () => {
    expect(checkIfIsPartialId('abc')).toBe(false);
    expect(checkIfIsPartialId('12-ABCD')).toBe(false);
    expect(checkIfIsPartialId('----')).toBe(false);
  });

  it('handles empty string safely', () => {
    expect(checkIfIsPartialId('')).toBe(false);
  });
});

describe('sanitizeSearchInput', () => {
  it('removes quotes', () => {
    expect(sanitizeSearchInput('"AGR-1234"')).toBe('AGR-1234');
  });

  it('trims whitespace', () => {
    expect(sanitizeSearchInput('  AGR-1234  ')).toBe('AGR-1234');
  });

  it('removes quotes and trims together', () => {
    expect(sanitizeSearchInput('  "AGR-1234"  ')).toBe('AGR-1234');
  });

  it('keeps pipes, dashes and valid ID chars (web parity)', () => {
    expect(sanitizeSearchInput('AGR-1371|123')).toBe('AGR-1371|123');
  });

  it('handles empty string', () => {
    expect(sanitizeSearchInput('')).toBe('');
  });

  it('handles whitespace-only string', () => {
    expect(sanitizeSearchInput('   ')).toBe('');
  });

  it('does not modify already clean input', () => {
    expect(sanitizeSearchInput('INV-1234-223-332')).toBe('INV-1234-223-332');
  });
});
