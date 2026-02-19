import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useCallback, useState, ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useSpotlightData } from '@/hooks/queries/useSpotlightData';
import { useSwitchAccount } from '@/hooks/queries/useSwitchAccount';
import { useUserAccountsData } from '@/hooks/queries/useUserAccountsData';
import { useUserData } from '@/hooks/queries/useUserData';
import { UserData, FormattedUserAccounts, SpotlightItem } from '@/types/api';

interface AccountContextValue {
  userData: UserData | null;
  userDataLoading: boolean;
  userDataError: boolean;
  userAccountsData: FormattedUserAccounts;
  spotlightData: Record<string, SpotlightItem[]>;
  spotlightError: boolean;
  spotlightDataLoading: boolean;
  isSwitchingAccount: boolean;
  pendingAccountId: string | null;
  switchAccount: (accountId: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const userId = user?.['https://claims.softwareone.com/userId'] as string | undefined;

  if (user && (!userId || userId.trim() === '')) {
    console.error('User authentication token is missing required userId claim.');
  }

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
  const queryClient = useQueryClient();
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);

  const switchAccount = useCallback(
    async (accountId: string) => {
      if (!userId) return;
      setIsSwitchingAccount(true);
      setPendingAccountId(accountId);
      try {
        await switchAccountMutation.mutateAsync(accountId);

        queryClient.removeQueries({ queryKey: ['userData', userId] });
        queryClient.removeQueries({ queryKey: ['spotlightData', userId] });
      } catch (error) {
        console.error('Failed to switch account', error);
        throw error;
      } finally {
        setIsSwitchingAccount(false);
        setPendingAccountId(null);
      }
    },
    [userId, switchAccountMutation, queryClient],
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
        isSwitchingAccount,
        pendingAccountId,
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
