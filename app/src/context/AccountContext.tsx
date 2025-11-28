import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAccountApi } from '@/services/accountService';
import { useAuth } from '@/context/AuthContext';
import { UserData } from '@/types/api';

interface AccountContextValue {
  userData: UserData | null;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { getUserData } = useAccountApi();

  const userId = user?.["https://claims.softwareone.com/userId"];

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const res = await getUserData(userId);

      setUserData(res);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching full user data:", error.message);
      }
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, getUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <AccountContext.Provider
      value={{
        userData,
        isLoading,
        refreshUserData: fetchUserData,
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
