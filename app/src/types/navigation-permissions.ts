import { AccountType } from '@/types/common';
import { ModuleName } from '@/types/modules';

export interface NavigationPermission {
  modules: ModuleName[];
  roles?: AccountType[];
}

export type NavigationMapper = Record<string, NavigationPermission>;
