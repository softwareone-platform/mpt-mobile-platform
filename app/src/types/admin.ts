import type { Address } from '@/types/api';
import type { DetailsListItemValue } from '@/types/lists';

export interface BuyerData {
  id: string;
  name: string;
  icon?: string;
  avatar?: string;
  email?: string;
  phone?: {
    prefix?: string;
    number?: string;
  };
  externalIds?: {
    erpCustomer?: string;
  };
  taxId: string;
  address: Address;
  account: DetailsListItemValue;
  data?: { [key: string]: unknown }[];
}
