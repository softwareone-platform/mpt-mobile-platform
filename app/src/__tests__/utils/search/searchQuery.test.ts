import type { AccountType } from '@/types/common';
import { getAgreementSearchQuery } from '@/utils/search/entities/agreement';
import { getSearchQueryByCategory } from '@/utils/search/searchQuery';

jest.mock('@/utils/search/entities/agreement', () => ({
  getAgreementSearchQuery: jest.fn(),
}));

describe('getSearchQueryByCategory', () => {
  const accountType: AccountType = 'Operations';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getAgreementSearchQuery once for agreements category', () => {
    getSearchQueryByCategory({
      category: 'agreements',
      accountType,
      searchTerm: 'AGR-1234',
    });

    expect(getAgreementSearchQuery).toHaveBeenCalledTimes(1);
    expect(getAgreementSearchQuery).toHaveBeenCalledWith(accountType, 'AGR-1234');
  });
});
