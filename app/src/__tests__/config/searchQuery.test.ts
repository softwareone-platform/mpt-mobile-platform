import { searchConfig, agreementSearchConfig, orderSearchConfig } from '@/config/search';
import { buildSearchQuery } from '@/utils/search/searchQueryBuilder';

jest.mock('@/utils/search/searchQueryBuilder', () => ({
  buildSearchQuery: jest.fn(),
}));

const mockedBuildSearchQuery = buildSearchQuery as jest.Mock;
const MOCK_BUILDER_RESULT = 'BUILDER_RESULT';

describe('searchConfig - agreements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes correct config to builder', () => {
    mockedBuildSearchQuery.mockReturnValue(MOCK_BUILDER_RESULT);

    searchConfig.agreements.getQuery('Test', 'Client');

    expect(mockedBuildSearchQuery).toHaveBeenCalledTimes(1);

    const [searchTerm, accountType, config] = mockedBuildSearchQuery.mock.calls[0];

    expect(searchTerm).toBe('Test');
    expect(accountType).toBe('Client');

    expect(config).toEqual(
      expect.objectContaining({
        fullMappings: agreementSearchConfig.fullMappings,
        partialMappings: agreementSearchConfig.partialMappings,
        idFields: agreementSearchConfig.idFields,
        textFields: agreementSearchConfig.textFields,
        includeExternalIds: agreementSearchConfig.includeExternalIds,
      }),
    );
  });
});

describe('searchConfig - orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes correct config to builder', () => {
    mockedBuildSearchQuery.mockReturnValue(MOCK_BUILDER_RESULT);

    searchConfig.orders.getQuery('Test', 'Client');

    expect(mockedBuildSearchQuery).toHaveBeenCalledTimes(1);

    const [searchTerm, accountType, config] = mockedBuildSearchQuery.mock.calls[0];

    expect(searchTerm).toBe('Test');
    expect(accountType).toBe('Client');

    expect(config).toEqual(
      expect.objectContaining({
        fullMappings: orderSearchConfig.fullMappings,
        partialMappings: orderSearchConfig.partialMappings,
        idFields: orderSearchConfig.idFields,
        textFields: orderSearchConfig.textFields,
        includeExternalIds: orderSearchConfig.includeExternalIds,
      }),
    );
  });
});

describe('searchQuery (queries)', () => {
  const value = 'Test';

  describe('invoices', () => {
    it('generates correct query', () => {
      const result = searchConfig.invoices.getQuery(value, 'Operations');

      expect(result).toBe(`&ilike(documentNo,"Test*")`);
    });
  });

  describe('products', () => {
    it('generates correct query', () => {
      const result = searchConfig.products.getQuery(value, 'Operations');

      expect(result).toBe(`&or(ilike(name,"*Test*"),ilike(vendor.name,"*Test*"))`);
    });
  });

  describe('subscriptions', () => {
    it('generates correct query', () => {
      const result = searchConfig.subscriptions.getQuery(value, 'Operations');

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
