import { createContext, useContext, useCallback, ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useSpotlightData } from '../hooks/useSpotlightData';
import { useSwitchAccount } from '../hooks/useSwitchAccount';
import { useUserAccountsData } from '../hooks/useUserAccountsData';
import { useUserData } from '../hooks/useUserData';
import { UserData, FormattedUserAccounts, SpotlightItem } from '../types';

interface AccountContextValue {
  userData: UserData | null;
  userDataLoading: boolean;
  userDataError: boolean;
  userAccountsData: FormattedUserAccounts;
  spotlightData: Record<string, SpotlightItem[]>;
  spotlightError: boolean;
  spotlightDataLoading: boolean;
  switchAccount: (accountId: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const userId = user?.['https://claims.softwareone.com/userId'] as string | undefined;

  const {
    data: userData = null,
    isLoading: userDataLoading,
    isError: userDataError,
  } = useUserData(userId);

  const {
    data: spotlightDataRaw,
    isLoading: spotlightDataLoading,
    isError: spotlightError,
    fetchStatus,
  } = useSpotlightData(userId);

  const spotlightData = spotlightDataRaw ?? {};

  const isSpotlightLoading = userDataLoading || spotlightDataLoading || fetchStatus === 'fetching';

  const { data: userAccountsData = { all: [], favourites: [], recent: [] } } =
    useUserAccountsData(userId);

  const switchAccountMutation = useSwitchAccount(userId);

  const switchAccount = useCallback(
    async (accountId: string) => {
      if (!userId) return;
      await switchAccountMutation.mutateAsync(accountId);
    },
    [userId, switchAccountMutation],
  );

  return (
    <AccountContext.Provider
      value={{
        userData,
        userDataLoading,
        userDataError,
        userAccountsData,
        spotlightData,
        spotlightError,
        spotlightDataLoading: isSpotlightLoading,
        switchAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used inside AccountProvider');
  }
  return context;
};
