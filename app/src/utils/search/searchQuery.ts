import type { SearchCategory } from '@/config/search';
import { searchConfig } from '@/config/search';
import type { AccountType } from '@/types/common';
import { getAgreementSearchQuery } from '@/utils/search/entities/agreement';

type searhcQueryByCategoryParams = {
  category: SearchCategory;
  accountType: AccountType | undefined;
  searchTerm: string;
};

export function getSearchQueryByCategory({
  category,
  accountType,
  searchTerm,
}: searhcQueryByCategoryParams): string | undefined {
  if (!searchTerm) {
    return undefined;
  }

  switch (category) {
    case 'agreements':
      return getAgreementSearchQuery(accountType, searchTerm);

    default:
      return searchConfig[category].getQuery(searchTerm);
  }
}
