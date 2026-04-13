import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { PaginatedResponse, ListItemNoImage } from '@/types/api';
import type { CertificateDetails } from '@/types/program';

export function useCertificateApi() {
  const api = useApi();

  const getCertificates = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemNoImage>> => {
      const endpoint =
        `/v1/program/certificates` +
        `?select=-*,id,name,status` +
        `&ne(status,%22Deleted%22)` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemNoImage>>(endpoint);
    },
    [api],
  );

  const getCertificateData = useCallback(
    async (certificateId: string): Promise<CertificateDetails> => {
      const endpoint =
        `/v1/program/certificates/${certificateId}` +
        `?select=licensee.account.id,template.id,terms,program.vendor`;

      return api.get<CertificateDetails>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getCertificates,
      getCertificateData,
    }),
    [getCertificates, getCertificateData],
  );
}
