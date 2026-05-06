import {
  createPaginatedContext,
  type PaginatedContextValue,
} from '@/context/shared/PaginatedContext';
import { useSellersData } from '@/hooks/queries/useSellersData';
import type { ListItemFull } from '@/types/api';

export type SellersContextValue = PaginatedContextValue<ListItemFull>;

const { Provider, useContextHook } = createPaginatedContext<ListItemFull>({
  useDataHook: useSellersData,
  contextName: 'Sellers',
});

export const SellersProvider = Provider;
export const useSellers = useContextHook;
