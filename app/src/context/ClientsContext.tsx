import {
  createPaginatedContext,
  type PaginatedContextValue,
} from '@/context/shared/PaginatedContext';
import { useClientsData } from '@/hooks/queries/useClientsData';
import type { ListItemFull } from '@/types/api';

export type ClientsContextValue = PaginatedContextValue<ListItemFull>;

const { Provider, useContextHook } = createPaginatedContext<ListItemFull>({
  useDataHook: useClientsData,
  contextName: 'Clients',
});

export const ClientsProvider = Provider;
export const useClients = useContextHook;
