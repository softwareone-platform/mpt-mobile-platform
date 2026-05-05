import { searchQuery } from '@/config/searchQuery';

describe('searchQuery (queries)', () => {
  const value = 'Test';

  describe('agreements', () => {
    it('generates correct query', () => {
      const result = searchQuery.agreements(value);

      expect(result).toBe(
        `&or(` +
          `ilike(name,"*Test*"),` +
          `ilike(buyer.name,"*Test*"),` +
          `ilike(client.name,"*Test*"),` +
          `ilike(externalIds.client,"*Test*"),` +
          `ilike(externalIds.operations,"*Test*"),` +
          `ilike(externalIds.vendor,"*Test*")` +
          `)`,
      );
    });
  });
  describe('invoices', () => {
    it('generates correct query', () => {
      const result = searchQuery.invoices(value);

      expect(result).toBe(`&ilike(documentNo,"Test*")`);
    });
  });
  describe('orders', () => {
    it('generates correct query', () => {
      const result = searchQuery.orders(value);

      expect(result).toBe(
        `&or(` +
          `ilike(agreement.name,"*Test*"),` +
          `ilike(agreement.client.name,"*Test*"),` +
          `ilike(buyer.name,"*Test*"),` +
          `ilike(externalIds.client,"*Test*"),` +
          `ilike(externalIds.operations,"*Test*"),` +
          `ilike(externalIds.vendor,"*Test*")` +
          `)`,
      );
    });
  });
});
