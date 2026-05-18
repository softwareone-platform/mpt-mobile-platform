import type { AccountType } from '@/types/common';
import { getAgreementSearchQuery } from '@/utils/search/entities/agreement';
import { getEntityTypeBySearchTerm, checkIfIsPartialId } from '@/utils/search/search';

jest.mock('@/utils/search/search', () => ({
  getEntityTypeBySearchTerm: jest.fn(),
  checkIfIsPartialId: jest.fn(),
}));

describe('getAgreementSearchQuery', () => {
  const accountType: AccountType = 'Client';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('guards', () => {
    it('returns undefined when searchTerm is empty string', () => {
      expect(getAgreementSearchQuery(accountType, '')).toBeUndefined();
    });

    it('returns undefined when searchTerm is null', () => {
      expect(getAgreementSearchQuery(accountType, null)).toBeUndefined();
    });

    it('returns undefined when searchTerm is undefined', () => {
      expect(getAgreementSearchQuery(accountType, undefined)).toBeUndefined();
    });
  });

  describe('direct entity matches', () => {
    it('builds Agreement query', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue('Agreement');
      (checkIfIsPartialId as jest.Mock).mockReturnValue(false);

      expect(getAgreementSearchQuery(accountType, 'AGR-1234')).toBe('&eq(id,"AGR-1234")');
    });

    it('builds Buyer query', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue('Buyer');
      (checkIfIsPartialId as jest.Mock).mockReturnValue(false);

      expect(getAgreementSearchQuery(accountType, 'BUY-1234')).toBe('&eq(buyer.id,"BUY-1234")');
    });

    it('builds Account query', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue('Account');
      (checkIfIsPartialId as jest.Mock).mockReturnValue(false);

      expect(getAgreementSearchQuery(accountType, 'ACC-1234')).toBe('&eq(client.id,"ACC-1234")');
    });
  });

  describe('partial entity matches', () => {
    it('builds PartialAgreement query', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue('PartialAgreement');
      (checkIfIsPartialId as jest.Mock).mockReturnValue(true);

      expect(getAgreementSearchQuery(accountType, 'AGR-12')).toBe('&ilike(id,"AGR-12*")');
    });

    it('builds PartialBuyer query', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue('PartialBuyer');
      (checkIfIsPartialId as jest.Mock).mockReturnValue(true);

      expect(getAgreementSearchQuery(accountType, 'BUY-12')).toBe('&ilike(buyer.id,"BUY-12*")');
    });

    it('builds PartialAccount query', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue('PartialAccount');
      (checkIfIsPartialId as jest.Mock).mockReturnValue(true);

      expect(getAgreementSearchQuery(accountType, 'ACC-12')).toBe('&ilike(client.id,"ACC-12*")');
    });
  });

  describe('fallback OR query (entityType null)', () => {
    it('includes expected fields for Client', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue(null);
      (checkIfIsPartialId as jest.Mock).mockReturnValue(false);

      const result = getAgreementSearchQuery('Client', 'test');

      expect(result).toContain('ilike(name,"*test*")');
      expect(result).toContain('ilike(buyer.name,"*test*")');
      expect(result).toContain('ilike(client.name,"*test*")');
      expect(result).toContain('ilike(externalIds.client,"*test*")');

      expect(result).not.toContain('externalIds.vendor');
      expect(result).not.toContain('externalIds.operations');
    });

    it('includes operations externalIds for Operations', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue(null);
      (checkIfIsPartialId as jest.Mock).mockReturnValue(false);

      const result = getAgreementSearchQuery('Operations', 'abc');

      expect(result).toContain('externalIds.operations');
    });

    it('excludes client externalIds for Vendor', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue(null);
      (checkIfIsPartialId as jest.Mock).mockReturnValue(false);

      const result = getAgreementSearchQuery('Vendor', 'abc');

      expect(result).not.toContain('externalIds.client');
    });
  });

  describe('undefined partialId behavior', () => {
    it('treats undefined partialId as both ID and text search enabled', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue(null);
      (checkIfIsPartialId as jest.Mock).mockReturnValue(undefined);

      const result = getAgreementSearchQuery('Client', 'abc');

      expect(result).toContain('ilike(id,"*abc*")');
      expect(result).toContain('ilike(name,"*abc*")');
    });
  });

  describe('default case', () => {
    it('returns undefined for unknown entity type', () => {
      (getEntityTypeBySearchTerm as jest.Mock).mockReturnValue('UnknownType' as unknown);
      (checkIfIsPartialId as jest.Mock).mockReturnValue(false);

      const result = getAgreementSearchQuery('Client', 'abc');

      expect(result).toBeUndefined();
    });
  });
});
