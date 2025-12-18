import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserData, UserAccount, SpotlightItem } from '@/types/api';
import { useUserData } from '@/hooks/queries/useUserData';
import { useSpotlightData } from '@/hooks/queries/useSpotlightData';
import { useUserAccountsData } from '@/hooks/queries/useUserAccountsData';
import { useSwitchAccount } from '@/hooks/queries/useSwitchAccount';

interface AccountContextValue {
  userData: UserData | null;
  userDataLoading: boolean;
  userDataError: boolean;
  userAccountsData: UserAccount[];
  spotlightData: Record<string, SpotlightItem[]>;
  spotlightError: boolean;
  spotlightDataLoading: boolean;
  switchAccount: (accountId: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const userId = user?.["https://claims.softwareone.com/userId"];

  const {
    data: userData = null,
    isLoading: userDataLoading,
    isError: userDataError,
  } = useUserData(userId);

  const {
    data: spotlightDataRaw,
    isLoading: spotlightDataLoading,
    isError: spotlightError,
  } = useSpotlightData(userId, userData);

  const spotlightData = spotlightDataRaw ?? {};

  const {
    data: userAccountsData = [],
  } = useUserAccountsData(userId);

  const switchAccountMutation = useSwitchAccount(userId);

  const switchAccount = useCallback(
    async (accountId: string) => {
      if (!userId) return;
      await switchAccountMutation.mutateAsync(accountId);
    },
    [userId, switchAccountMutation]
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
        spotlightDataLoading,
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
