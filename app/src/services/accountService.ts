import { useCallback, useMemo } from 'react';

import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET, DEFAULT_SPOTLIGHT_LIMIT } from '@/constants/api';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import type {
  UserAccount,
  UserData,
  PaginatedUserAccounts,
  SwitchAccountBody,
  FullUserData,
  SubscriptionItem,
  SpotlightData,
  AccountDetails,
} from '@/types/api';

export function useAccountApi() {
  const api = useApi();
  const { refreshAuth } = useAuth();

  const getUserData = useCallback(
    async (userId: string): Promise<UserData> => {
      const endpoint = `/v1/accounts/users/${userId}`;
      return api.get<UserData>(endpoint);
    },
    [api],
  );

  const getCurrentAccountIcon = useCallback(
    async (userId: string): Promise<FullUserData> => {
      const endpoint = `/v1/accounts/users/${userId}?select=currentAccount.icon`;
      return api.get<FullUserData>(endpoint);
    },
    [api],
  );

  const getAllUserAccounts = useCallback(
    async (userId: string): Promise<UserAccount[]> => {
      const endpoint = `/v1/accounts/users/${userId}/accounts`;
      return api.get<UserAccount[]>(endpoint);
    },
    [api],
  );

  const getUserAccountsData = useCallback(
    async (
      userId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedUserAccounts> => {
      const endpoint =
        `/v1/accounts/users/${userId}/accounts` +
        `?select=id,name,type,icon,favorite,audit.access.at,-*` +
        `&eq(invitation.status,"Active")` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedUserAccounts>(endpoint);
    },
    [api],
  );

  const getSpotlightData = useCallback(
    async (limit: number = DEFAULT_SPOTLIGHT_LIMIT): Promise<SpotlightData> => {
      const endpoint = `/v1/spotlight/objects?select=query.filter,top&limit=${limit}`;
      return api.get<SpotlightData>(endpoint);
    },
    [api],
  );

  const getSubscriptionsData = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<SubscriptionItem[]> => {
      const endpoint =
        `/v1/commerce/subscriptions?filter(group.buyers)` + `&offset=${offset}` + `&limit=${limit}`;

      return api.get<SubscriptionItem[]>(endpoint);
    },
    [api],
  );

  const switchAccount = useCallback(
    async (userId: string, accountId: string): Promise<void> => {
      if (!userId) {
        throw new Error('User ID is required to switch accounts');
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
    [api, refreshAuth],
  );

  const getAccountData = useCallback(
    async (accountId: string): Promise<AccountDetails> => {
      const endpoint = `/v1/accounts/accounts/${accountId}?select=audit,groups`;
      return api.get<AccountDetails>(endpoint);
    },
    [api],
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
      getAccountData,
    }),
    [
      getUserData,
      getCurrentAccountIcon,
      getAllUserAccounts,
      getUserAccountsData,
      getSpotlightData,
      getSubscriptionsData,
      switchAccount,
      getAccountData,
    ],
  );
}
