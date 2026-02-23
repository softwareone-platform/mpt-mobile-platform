import type { AccountType } from '@/types/common';

export type NavigationTarget = 'vendorAccount' | 'clientAccount' | 'buyer' | 'seller';

const navigationPermissions: Record<NavigationTarget, (accountType: AccountType) => boolean> = {
  vendorAccount: (type) => type === 'Operations',
  clientAccount: (type) => type !== 'Vendor',
  buyer: (type) => type !== 'Vendor',
  seller: (type) => type !== 'Vendor',
};

export const canNavigateTo = (target: NavigationTarget, accountType: AccountType): boolean => {
  const permission = navigationPermissions[target];
  return permission ? permission(accountType) : true;
};
