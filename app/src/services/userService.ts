import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, User, Licensee, Buyer } from '@/types/api';

export function useUserApi() {
  const api = useApi();

  const getUsers = useCallback(
    async (
      accountId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<User>> => {
      const endpoint =
        `/v1/accounts/accounts/${accountId}/users` +
        `?order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<User>>(endpoint);
    },
    [api],
  );

  const getLicensees = useCallback(
    async (
      accountId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<Licensee>> => {
      const endpoint =
        `/v1/accounts/licensees` +
        `?select=seller,buyer.status` +
        `&eq(account.id,%22${accountId}%22)` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<Licensee>>(endpoint);
    },
    [api],
  );

  const getBuyers = useCallback(
    async (
      accountId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<Buyer>> => {
      const endpoint =
        `/v1/accounts/buyers` +
        `?select=sellers,audit.created.at
,audit.updated.at,sellers.erpLink.status` +
        `&ne(status,%22Deleted%22)` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<Buyer>>(endpoint);
    },
    [api],
  );

  // TODO: Administration operations context: Get all users across accounts
  const getAllUsers = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<User>> => {
      const endpoint =
        `/v1/accounts/users` + `?order=name` + `&offset=${offset}` + `&limit=${limit}`;

      return api.get<PaginatedResponse<User>>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getUsers,
      getLicensees,
      getBuyers,
      getAllUsers,
    }),
    [getUsers, getLicensees, getBuyers, getAllUsers],
  );
}
