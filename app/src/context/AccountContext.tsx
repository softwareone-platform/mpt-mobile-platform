import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAccountApi } from '@/services/accountService';
import { useAuth } from '@/context/AuthContext';
import { UserData, UserAccount } from '@/types/api';
import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';

interface AccountContextValue {
  userData: UserData | null;
  userAccountsData: UserAccount[];
  switchAccount: (accountId: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userAccountsData, setUserAccountsData] = useState<UserAccount[]>([]);

  const { user } = useAuth();
  const { getUserData, getUserAccountsData, switchAccount: apiSwitchAccount } = useAccountApi();

  const userId = user?.["https://claims.softwareone.com/userId"];

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await getUserData(userId);

      setUserData(response);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching full user data:", error.message);
      }
      setUserData(null);
    }
  }, [userId, getUserData]);

  const fetchUserAccountsData = useCallback(async () => {
    if (!userId) return;

    try {
      const { data } = await getUserAccountsData(userId);

      setUserAccountsData(data);
    } catch (error) {
      console.error('Error fetching user accounts:', error);
      setUserAccountsData([]);
    }
  }, [userId, getUserAccountsData]);

  const switchAccount = useCallback(
    async (accountId: string) => {
      if (!userId) return;

      try {
        await apiSwitchAccount(userId, accountId);
        await fetchUserData();
      } catch (error) {
        console.error("Error switching account:", error);
      }
    },
    [userId, apiSwitchAccount, fetchUserData]
  );

  useEffect(() => {
    fetchUserData();
    fetchUserAccountsData();
  }, [fetchUserData, fetchUserAccountsData]);

  return (
    <AccountContext.Provider
      value={{
        userData,
        userAccountsData,
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
