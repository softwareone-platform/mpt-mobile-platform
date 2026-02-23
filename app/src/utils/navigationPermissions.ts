import type { AccountType } from '@/types/common';

export type NavigationTarget = 'vendorAccount' | 'clientAccount' | 'buyer' | 'seller';

const navigationPermissions: Record<NavigationTarget, (accountType: AccountType) => boolean> = {
  vendorAccount: (type) => type === 'Operations',
  clientAccount: (type) => type === 'Operations' || type === 'Client',
  buyer: (type) => type === 'Operations' || type === 'Client',
  seller: (type) => type === 'Operations' || type === 'Client',
};

export const canNavigateTo = (target: NavigationTarget, accountType: AccountType): boolean => {
  const permission = navigationPermissions[target];
  return permission ? permission(accountType) : true;
};
