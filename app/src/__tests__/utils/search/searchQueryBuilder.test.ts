import { checkIfIsPartialId, getEntityTypeBySearchTerm } from '@/utils/search/search';
import { buildSearchQuery } from '@/utils/search/searchQueryBuilder';

jest.mock('@/utils/search/search', () => ({
  checkIfIsPartialId: jest.fn(),
  getEntityTypeBySearchTerm: jest.fn(),
}));

const mockedCheckIfIsPartialId = checkIfIsPartialId as jest.Mock;
const mockedGetEntityTypeBySearchTerm = getEntityTypeBySearchTerm as jest.Mock;

const baseConfig = {
  fullMappings: {
    Agreement: 'id',
    Buyer: 'buyer.id',
  },
  partialMappings: {
    PartialAgreement: 'id',
    PartialBuyer: 'buyer.id',
  },
  idFields: ['id', 'buyer.id'],
  textFields: ['name', 'buyer.name'],
  includeExternalIds: true,
};

describe('buildSearchQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const searchTerm = 'Test';

  it('returns undefined when searchTerm is empty', () => {
    expect(buildSearchQuery('', 'Client', baseConfig)).toBeUndefined();
    expect(buildSearchQuery(null, 'Client', baseConfig)).toBeUndefined();
  });

  it('builds exact match query when fullMapping exists', () => {
    mockedGetEntityTypeBySearchTerm.mockReturnValue('Agreement');
    mockedCheckIfIsPartialId.mockReturnValue(undefined);

    const result = buildSearchQuery('AGR-1234-5678-9900', 'Client', baseConfig);

    expect(result).toBe(`&eq(id,"AGR-1234-5678-9900")`);
  });

  it('builds partial mapping query when partialMapping exists', () => {
    mockedGetEntityTypeBySearchTerm.mockReturnValue('PartialAgreement');
    mockedCheckIfIsPartialId.mockReturnValue(undefined);

    const result = buildSearchQuery('AGR-1234', 'Client', baseConfig);

    expect(result).toBe(`&ilike(id,"AGR-1234*")`);
  });

  it('when isPartialId is undefined, includes both idFields and textFields', () => {
    mockedGetEntityTypeBySearchTerm.mockReturnValue(null);
    mockedCheckIfIsPartialId.mockReturnValue(undefined);

    const result = buildSearchQuery(searchTerm, 'Client', baseConfig);

    expect(result).toContain(`ilike(id,"*Test*")`);
    expect(result).toContain(`ilike(buyer.id,"*Test*")`);

    expect(result).toContain(`ilike(name,"*Test*")`);
    expect(result).toContain(`ilike(buyer.name,"*Test*")`);
  });

  it('when isPartialId is true, uses only idFields', () => {
    mockedGetEntityTypeBySearchTerm.mockReturnValue(null);
    mockedCheckIfIsPartialId.mockReturnValue(true);

    const result = buildSearchQuery(searchTerm, 'Client', baseConfig);

    expect(result).toContain(`ilike(id,"*Test*")`);
    expect(result).toContain(`ilike(buyer.id,"*Test*")`);

    expect(result).not.toContain(`ilike(name,`);
    expect(result).not.toContain(`ilike(buyer.name,`);
  });

  it('when isPartialId is false, uses only textFields', () => {
    mockedGetEntityTypeBySearchTerm.mockReturnValue(null);
    mockedCheckIfIsPartialId.mockReturnValue(false);

    const result = buildSearchQuery(searchTerm, 'Client', baseConfig);

    expect(result).toContain(`ilike(name,"*Test*")`);
    expect(result).toContain(`ilike(buyer.name,"*Test*")`);

    expect(result).not.toContain(`ilike(id,`);
    expect(result).not.toContain(`ilike(buyer.id,`);
  });

  it('includes externalIds when enabled', () => {
    mockedGetEntityTypeBySearchTerm.mockReturnValue(null);
    mockedCheckIfIsPartialId.mockReturnValue(undefined);

    const result = buildSearchQuery(searchTerm, 'Operations', baseConfig);

    expect(result).toContain('externalIds.client');
    expect(result).toContain('externalIds.operations');
    expect(result).toContain('externalIds.vendor');
  });

  it('skips externalIds when disabled', () => {
    const config = { ...baseConfig, includeExternalIds: false };

    mockedGetEntityTypeBySearchTerm.mockReturnValue(null);
    mockedCheckIfIsPartialId.mockReturnValue(undefined);

    const result = buildSearchQuery(searchTerm, 'Client', config);

    expect(result).not.toContain('externalIds');
  });

  it('respects Vendor rules for externalIds', () => {
    mockedGetEntityTypeBySearchTerm.mockReturnValue(null);
    mockedCheckIfIsPartialId.mockReturnValue(undefined);

    const result = buildSearchQuery(searchTerm, 'Vendor', baseConfig);

    expect(result).not.toContain('externalIds.client');
    expect(result).toContain('externalIds.vendor');
  });

  it('respects Client rules for externalIds', () => {
    mockedGetEntityTypeBySearchTerm.mockReturnValue(null);
    mockedCheckIfIsPartialId.mockReturnValue(undefined);

    const result = buildSearchQuery(searchTerm, 'Client', baseConfig);

    expect(result).toContain('externalIds.client');
    expect(result).not.toContain('externalIds.vendor');
  });

  it('returns OR query with correct structure', () => {
    mockedGetEntityTypeBySearchTerm.mockReturnValue(null);
    mockedCheckIfIsPartialId.mockReturnValue(undefined);

    const result = buildSearchQuery(searchTerm, 'Client', baseConfig);

    expect(result?.startsWith('&or(')).toBe(true);
    expect(result?.endsWith(')')).toBe(true);
  });
});
