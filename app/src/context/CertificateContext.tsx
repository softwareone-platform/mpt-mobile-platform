import {
  createPaginatedContext,
  type PaginatedContextValue,
} from '@/context/shared/PaginatedContext';
import { useCertificatesData } from '@/hooks/queries/useProgramsData';
import type { ListItemNoImage } from '@/types/api';

export type CertificateContextValue = PaginatedContextValue<ListItemNoImage>;

const { Provider, useContextHook } = createPaginatedContext<ListItemNoImage>({
  useDataHook: useCertificatesData,
  contextName: 'Certificates',
});

export const CertificateProvider = Provider;
export const useCertificates = useContextHook;
