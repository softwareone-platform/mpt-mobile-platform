import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, ListItemNoImageNoSubtitle } from '@/types/api';
import type { EnrollmentDetails } from '@/types/program';

export function useEnrollmentApi() {
  const api = useApi();

  const getEnrollments = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemNoImageNoSubtitle>> => {
      const endpoint =
        `/v1/program/enrollments` +
        `?select=-*,id,status` +
        `&order=-id` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemNoImageNoSubtitle>>(endpoint);
    },
    [api],
  );

  const getEnrollmentData = useCallback(
    async (enrollmentId: string): Promise<EnrollmentDetails> => {
      const endpoint =
        `/v1/program/enrollments/${enrollmentId}` +
        `?select=assignee.currentAccount.id,buyer.address,licensee.account.id,licensee.address`;

      return api.get<EnrollmentDetails>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getEnrollments,
      getEnrollmentData,
    }),
    [getEnrollments, getEnrollmentData],
  );
}
