import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, User, UserData, SsoStatus } from '@/types/api';

export function useUserApi() {
  const api = useApi();

  const getUsers = useCallback(
    async (
      accountId: string,
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<User>> => {
      const endpoint =
        `v1/accounts/accounts/${accountId}/users` +
        //TODO: once unselect param bug will be fixed, change select to `select=-*,id,name,status,icon`
        `?select=id,name,status,icon` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<User>>(endpoint);
    },
    [api],
  );

  const getAllUsers = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<User>> => {
      const endpoint =
        `v1/accounts/users` +
        `?select=-*,id,name,status,icon` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<User>>(endpoint);
    },
    [api],
  );

  const getUserData = useCallback(
    async (userId: string): Promise<UserData> => {
      const endpoint = `/v1/accounts/users/${userId}?select=audit,accounts`;
      return api.get<UserData>(endpoint);
    },
    [api],
  );

  const getSsoStatus = useCallback(
    async (userId: string): Promise<SsoStatus> => {
      const endpoint = `/v1/accounts/users/${userId}/sso`;
      return api.get<SsoStatus>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getUsers,
      getAllUsers,
      getUserData,
      getSsoStatus,
    }),
    [getUsers, getAllUsers, getUserData, getSsoStatus],
  );
}
