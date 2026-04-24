import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useCallback, useState, ReactNode, useMemo } from 'react';

import { AnalyticsEvents } from '@/constants/analytics';
import { MAX_RECENT_ACCOUNTS } from '@/constants/api';
import { useAuth } from '@/context/AuthContext';
import { useSpotlightData } from '@/hooks/queries/useSpotlightData';
import { useSwitchAccount } from '@/hooks/queries/useSwitchAccount';
import { useUserAccountsData } from '@/hooks/queries/useUserAccountsData';
import { useUserData } from '@/hooks/queries/useUserData';
import { trackEvent } from '@/hooks/useTrackEvent';
import { authService } from '@/services/authService';
import { logger } from '@/services/loggerService';
import { UserData, FormattedUserAccounts, SpotlightItem } from '@/types/api';
import { formatUserAccountsData } from '@/utils/account';

interface AccountContextValue {
  userData: UserData | null;
  isUserDataLoading: boolean;
  isUserDataError: boolean;
  userAccountsData: FormattedUserAccounts;
  accountsFetchingNext: boolean;
  hasMoreAccounts: boolean;
  fetchNextAccounts: () => void;
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

  const userId = authService.getUserIdFromUser(user);

  if (user && (!userId || userId.trim() === '')) {
    logger.error('User authentication token is missing required userId claim');
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

  const {
    data: userAccountsPages,
    isFetchingNextPage: accountsFetchingNext,
    hasNextPage: hasMoreAccounts,
    fetchNextPage: fetchNextAccounts,
  } = useUserAccountsData(userId);

  const userAccountsData = useMemo(() => {
    const allAccounts = userAccountsPages?.pages?.flatMap((page) => page.data ?? []) ?? [];
    return formatUserAccountsData(allAccounts, MAX_RECENT_ACCOUNTS);
  }, [userAccountsPages]);

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
        queryClient.removeQueries({ queryKey: ['contacts'] });

        trackEvent(AnalyticsEvents.ACCOUNT_SWITCHED, { accountId });
      } catch (error) {
        logger.error('Failed to switch account', error, {
          operation: 'switchAccount',
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
        accountsFetchingNext,
        hasMoreAccounts: hasMoreAccounts ?? false,
        fetchNextAccounts,
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
