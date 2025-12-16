import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccountApi } from '@/services/accountService';
import { useAuth } from '@/context/AuthContext';
import { UserData, UserAccount, SpotlightItem } from '@/types/api';
import { arrangeSpotlightData } from '@/utils/spotlight';
import { SPOTLIGHT_CATEGORY } from '@/constants/spotlight';

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
  const [userAccountsData, setUserAccountsData] = useState<UserAccount[]>([]);
  const [spotlightData, setSpotlightData] = useState<Record<string, SpotlightItem[]>>({});
  const [spotlightError, setSpotlightError] = useState<boolean>(false);
  const [spotlightDataLoading, setSpotlightDataLoading] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const {
    getUserData,
    getUserAccountsData,
    getSpotlightData,
    switchAccount: apiSwitchAccount 
  } = useAccountApi();

  const userId = user?.["https://claims.softwareone.com/userId"];

  const {
    data: userData = null,
    isLoading: userDataLoading,
    isError: userDataError,
  } = useQuery({
    queryKey: ['userData', userId],
    queryFn: () => getUserData(userId!),
    enabled: !!userId,
  });

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
        queryClient.invalidateQueries({ queryKey: ['userData', userId] });
      } catch (error) {
        console.error("Error switching account:", error);
        throw error;
      }
    },
    [userId, apiSwitchAccount, queryClient]
  );

  const fetchSpotlightData = useCallback(async () => {
    if (!userId) return;

    try {
      setSpotlightDataLoading(true);
      const { data } = await getSpotlightData(userId);
      const arrangedData = arrangeSpotlightData(data, SPOTLIGHT_CATEGORY);

      setSpotlightData(arrangedData);
      setSpotlightError(false); 
    } catch (error) {
      setSpotlightData({});
      setSpotlightError(true);

      console.error("Error fetching spotlight data:", error);
    } finally {
      setSpotlightDataLoading(false);
    }
  }, [userId, getSpotlightData]);

  useEffect(() => {
    if (!userData) return;

    fetchSpotlightData();
  }, [userData, fetchSpotlightData]);

  useEffect(() => {
    fetchUserAccountsData();
  }, [fetchUserAccountsData]);

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
