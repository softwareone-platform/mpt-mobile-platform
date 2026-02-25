import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useCallback, useState, ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useSpotlightData } from '@/hooks/queries/useSpotlightData';
import { useSwitchAccount } from '@/hooks/queries/useSwitchAccount';
import { useUserAccountsData } from '@/hooks/queries/useUserAccountsData';
import { useUserData } from '@/hooks/queries/useUserData';
import { logger } from '@/services/loggerService';
import { UserData, FormattedUserAccounts, SpotlightItem } from '@/types/api';

interface AccountContextValue {
  userData: UserData | null;
  isUserDataLoading: boolean;
  isUserDataError: boolean;
  userAccountsData: FormattedUserAccounts;
  spotlightData: Record<string, SpotlightItem[]>;
  isSpotlightError: boolean;
  isSpotlightDataLoading: boolean;
  isSwitchingAccount: boolean;
  pendingAccountId: string | null;
  switchAccount: (accountId: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const userId = user?.['https://claims.softwareone.com/userId'] as string | undefined;

  if (user && (!userId || userId.trim() === '')) {
    logger.error('User authentication token is missing required userId claim', undefined, {
      category: 'auth',
      component: 'AccountProvider',
    });
  }

  const {
    data: userData = null,
    isLoading: isUserDataLoading,
    isError: isUserDataError,
  } = useUserData(userId);

  const {
    data: spotlightDataRaw,
    isLoading: isSpotlightDataLoading,
    isError: isSpotlightError,
    fetchStatus,
  } = useSpotlightData(userId);

  const spotlightData = spotlightDataRaw ?? {};

  const isSpotlightLoading =
    isUserDataLoading || isSpotlightDataLoading || fetchStatus === 'fetching';

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
        logger.error('Failed to switch account', error, {
          category: 'api',
          component: 'AccountProvider',
          userId,
          accountId,
        });
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
        isUserDataLoading,
        isUserDataError,
        userAccountsData,
        spotlightData,
        isSpotlightError,
        isSpotlightDataLoading: isSpotlightLoading,
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
