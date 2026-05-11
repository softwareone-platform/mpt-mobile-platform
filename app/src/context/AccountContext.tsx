import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useCallback, useState, ReactNode, useMemo } from 'react';

import { AnalyticsEvents } from '@/constants/analytics';
import { MAX_RECENT_ACCOUNTS } from '@/constants/api';
import { ACCOUNT_ID_CLAIM_KEY } from '@/constants/auth';
import { useAuth } from '@/context/AuthContext';
import { useSpotlightData } from '@/hooks/queries/useSpotlightData';
import { useSwitchAccount } from '@/hooks/queries/useSwitchAccount';
import { useUserAccountsData } from '@/hooks/queries/useUserAccountsData';
import { useUserData } from '@/hooks/queries/useUserData';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { trackEvent } from '@/hooks/useTrackEvent';
import { authService } from '@/services/authService';
import { logger } from '@/services/loggerService';
import { UserData, FormattedUserAccounts, SpotlightItem } from '@/types/api';
import { AccountType } from '@/types/common';
import { formatUserAccountsData } from '@/utils/account';

interface AccountContextValue {
  userData: UserData | null;
  isUserDataLoading: boolean;
  isUserDataError: boolean;
  currentAccountId: string | undefined;
  currentAccountType: AccountType | undefined;
  userAccountsData: FormattedUserAccounts;
  accountsFetchingNext: boolean;
  hasMoreAccounts: boolean;
  fetchNextAccounts: () => void;
  refetchAccounts: () => void;
  isAccountsRefetching: boolean;
  spotlightData: Record<string, SpotlightItem[]>;
  isSpotlightError: boolean;
  isSpotlightDataLoading: boolean;
  isSwitchingAccount: boolean;
  pendingAccountId: string | null;
  switchAccount: (accountId: string) => Promise<void>;
  refetchSpotlight: () => void;
  isSpotlightRefetching: boolean;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { user, accountId: storedAccountId, accountType: tokenAccountType } = useAuth();
  const { isEnabled } = useFeatureFlags();

  const userId = authService.getUserIdFromUser(user);

  if (user && (!userId || userId.trim() === '')) {
    logger.error('User authentication token is missing required userId claim');
  }

  const isMultiAccountEnabled = isEnabled('FEATURE_MULTI_ACCOUNT');
  const jwtAccountId = user?.[ACCOUNT_ID_CLAIM_KEY] as string | undefined;

  const {
    data: userData = null,
    isLoading: isUserDataLoading,
    isError: isUserDataError,
  } = useUserData(userId);

  const currentAccountId = isMultiAccountEnabled
    ? (storedAccountId ?? jwtAccountId ?? undefined)
    : (userData?.currentAccount?.id ?? undefined);

  const currentAccountType = isMultiAccountEnabled
    ? (tokenAccountType ?? undefined)
    : (userData?.currentAccount?.type as AccountType | undefined);

  const {
    data: spotlightDataRaw,
    isLoading: isSpotlightDataLoading,
    isError: isSpotlightError,
    fetchStatus,
    refetch: refetchSpotlight,
    isRefetching: isSpotlightRefetching,
  } = useSpotlightData(userId, currentAccountId);

  const spotlightData = spotlightDataRaw ?? {};

  // Suppress the full-screen loader during user-initiated pull-to-refresh so only the spinner shows.
  const isSpotlightLoading =
    isUserDataLoading ||
    isSpotlightDataLoading ||
    (fetchStatus === 'fetching' && !isSpotlightRefetching);

  const {
    data: userAccountsPages,
    isFetchingNextPage: accountsFetchingNext,
    hasNextPage: hasMoreAccounts,
    fetchNextPage: fetchNextAccounts,
    refetch: refetchAccounts,
    isRefetching: isAccountsRefetching,
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
        currentAccountId,
        currentAccountType,
        userAccountsData,
        accountsFetchingNext,
        hasMoreAccounts: hasMoreAccounts ?? false,
        fetchNextAccounts,
        refetchAccounts,
        isAccountsRefetching,
        spotlightData,
        isSpotlightError,
        isSpotlightDataLoading: isSpotlightLoading,
        isSwitchingAccount,
        pendingAccountId,
        switchAccount,
        refetchSpotlight,
        isSpotlightRefetching,
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
