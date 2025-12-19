import { UserAccount, FormattedUserAccounts } from '@/types/api';

export const getFavouriteAccounts = (data: UserAccount[]): UserAccount[] => {

  const favourites = data.filter(item => item.favorite) || [];

  return favourites;
};

export const getRecentAccounts = (data: UserAccount[], maxRecentAccounts: number): UserAccount[] => {

  const sortedByAccess = [...data].sort((a, b) => {
    const dateA = new Date(a.audit?.access?.at || 0).getTime();
    const dateB = new Date(b.audit?.access?.at || 0).getTime();
    return dateB - dateA;
  });

  return sortedByAccess.slice(0, maxRecentAccounts);
};

export const formatUserAccountsData = (data: UserAccount[], maxRecentAccounts: number): FormattedUserAccounts => {
  const formattedData: FormattedUserAccounts = {
    all: data,
    favourites: getFavouriteAccounts(data),
    recent: getRecentAccounts(data, maxRecentAccounts),
  };

  return formattedData;
};
