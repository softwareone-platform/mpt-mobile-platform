import { useCallback, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET } from '@/constants/api';
import type {
  UserAccount,
  UserData,
  PaginatedUserAccounts,
  SwitchAccountBody,
  FullUserData,
  SpotlightItem,
  SubscriptionItem,
} from '@/types/api';

export function useAccountApi() {
  const api = useApi();
  const { refreshAuth } = useAuth();

  const getUserData = useCallback(
    async (userId: string): Promise<UserData> => {
      const endpoint = `/v1/accounts/users/${userId}`;
      return api.get<UserData>(endpoint);
    },
    [api]
  );

  const getCurrentAccountIcon = useCallback(
    async (userId: string): Promise<FullUserData> => {
      const endpoint = `/v1/accounts/users/${userId}?select=currentAccount.icon`;
      return api.get<FullUserData>(endpoint);
    },
    [api]
  );

  const getAllUserAccounts = useCallback(
    async (userId: string): Promise<UserAccount[]> => {
      const endpoint = `/v1/accounts/users/${userId}/accounts`;
      return api.get<UserAccount[]>(endpoint);
    },
    [api]
  );

  const getUserAccountsData = useCallback(
    async (
      userId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE
    ): Promise<PaginatedUserAccounts> => {
      const endpoint = `/v1/accounts/users/${userId}/accounts` +
        `?select=id,name,type,icon,-*` +
        `&eq(invitation.status,"Active")` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedUserAccounts>(endpoint);
    },
    [api]
  );

  const getSpotlightData = useCallback(
    async (limit: number = DEFAULT_PAGE_SIZE): Promise<SpotlightItem[]> => {
      const endpoint = `/v1/spotlight/objects?Select=top&limit=${limit}`;
      return api.get<SpotlightItem[]>(endpoint);
    },
    [api]
  );

  const getSubscriptionsData = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE
    ): Promise<SubscriptionItem[]> => {
      const endpoint =
        `/v1/commerce/subscriptions?filter(group.buyers)` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<SubscriptionItem[]>(endpoint);
    },
    [api]
  );

  const switchAccount = useCallback(
    async (userId: string, accountId: string): Promise<void> => {
      if (!userId) {
        throw {
          name: 'API Error',
          status: null,
          message: 'User ID missing',
        };
      }

      const body: SwitchAccountBody = {
        currentAccount: { id: accountId },
      };

      const endpoint = `/v1/accounts/users/${userId}`;

      await api.put<void, SwitchAccountBody>(endpoint, body);
      try {
        await refreshAuth();
      } catch (error) {
        console.warn('Failed to refresh token after account switch', error);
      }
    },
    [api, refreshAuth]
  );

  return useMemo(
    () => ({
      getUserData,
      getCurrentAccountIcon,
      getAllUserAccounts,
      getUserAccountsData,
      getSpotlightData,
      getSubscriptionsData,
      switchAccount,
    }),
    [
      getUserData,
      getCurrentAccountIcon,
      getAllUserAccounts,
      getUserAccountsData,
      getSpotlightData,
      getSubscriptionsData,
      switchAccount,
    ]
  );
}
