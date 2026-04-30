import { searchQuery } from '@/config/searchQuery';

describe('searchQuery (queries)', () => {
  const value = 'Adobe';

  describe('agreements', () => {
    it('generates correct query', () => {
      const result = searchQuery.agreements(value);

      expect(result).toBe(
        `&or(` +
          `ilike(name,"*${value}*"),` +
          `ilike(buyer.name,"*${value}*"),` +
          `ilike(client.name,"*${value}*"),` +
          `ilike(externalIds.client,"*${value}*"),` +
          `ilike(externalIds.operations,"*${value}*"),` +
          `ilike(externalIds.vendor,"*${value}*")` +
          `)`,
      );
    });
  });
});
