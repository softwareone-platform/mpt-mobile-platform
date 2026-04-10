import {
  createPaginatedContext,
  type PaginatedContextValue,
} from '@/context/shared/PaginatedContext';
import { useVendorsData } from '@/hooks/queries/useVendorsData';
import type { ListItemFull } from '@/types/api';

export type VendorsContextValue = PaginatedContextValue<ListItemFull>;

const { Provider, useContextHook } = createPaginatedContext<ListItemFull>({
  useDataHook: useVendorsData,
  contextName: 'Vendors',
});

export const VendorsProvider = Provider;
export const useVendors = useContextHook;
