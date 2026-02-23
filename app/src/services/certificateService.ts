import { useCallback, useMemo } from 'react';

import { useApi } from '@/hooks/useApi';
import type { CertificateDetails } from '@/types/program';

export function useCertificateApi() {
  const api = useApi();

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
      getCertificateData,
    }),
    [getCertificateData],
  );
}
