import { searchConfig } from '@/config/search';

describe('searchQuery (queries)', () => {
  const value = 'Test';

  describe('agreements', () => {
    it('generates correct query', () => {
      const result = searchConfig.agreements.getQuery(value);

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
      const result = searchConfig.invoices.getQuery(value);

      expect(result).toBe(`&ilike(documentNo,"Test*")`);
    });
  });
  describe('orders', () => {
    it('generates correct query', () => {
      const result = searchConfig.orders.getQuery(value);

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
  describe('products', () => {
    it('generates correct query', () => {
      const result = searchConfig.products.getQuery(value);

      expect(result).toBe(`&or(ilike(name,"*Test*"),ilike(vendor.name,"*Test*"))`);
    });
  });
  describe('subscriptions', () => {
    it('generates correct query', () => {
      const result = searchConfig.subscriptions.getQuery(value);

      expect(result).toBe(
        `&or(` +
          `ilike(name,"*Test*"),` +
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
