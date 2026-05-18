import type { SearchCategory } from '@/config/search';
import { searchConfig } from '@/config/search';
import type { AccountType } from '@/types/common';
import { getAgreementSearchQuery } from '@/utils/search/entities/agreement';

type searchQueryByCategoryParams = {
  category: SearchCategory;
  accountType: AccountType | undefined;
  searchTerm: string;
};

export function getSearchQueryByCategory({
  category,
  accountType,
  searchTerm,
}: searchQueryByCategoryParams): string | undefined {
  if (!searchTerm) {
    return undefined;
  }

  switch (category) {
    case 'agreements':
      return getAgreementSearchQuery(accountType, searchTerm);
    // TODO: defauls case will be eventually removed, as we only search within selected category
    // at all times a category will be selected
    default:
      return searchConfig[category].getQuery(searchTerm);
  }
}
