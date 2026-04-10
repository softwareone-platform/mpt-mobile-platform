import { useAccount } from '@/context/AccountContext';
import type { AccountType } from '@/types/common';

type UseAccountTypeResult = {
  accountType: AccountType | undefined;
  isClient: boolean;
  isVendor: boolean;
  isOperations: boolean;
};

export const useAccountType = (): UseAccountTypeResult => {
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type;

  return {
    accountType,
    isClient: accountType === 'Client',
    isVendor: accountType === 'Vendor',
    isOperations: accountType === 'Operations',
  };
};
