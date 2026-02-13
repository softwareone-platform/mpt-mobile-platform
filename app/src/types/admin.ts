import type { Address } from '@/types/common';
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
  status?: string;
  data?: { [key: string]: unknown }[];
}

export interface SellerData {
  id: string;
  name: string;
  icon?: string;
  phone?: {
    prefix?: string;
    number?: string;
  };
  address: Address;
  status?: string;
  data?: { [key: string]: unknown }[];
}

export interface LicenseeData {
  id: string;
  name: string;
  icon?: string;
  address: Address;
  status?: string;
  eligibility?: {
    partner: boolean;
  };
  buyer: DetailsListItemValue;
  seller: DetailsListItemValue;
  account: DetailsListItemValue;
  data?: { [key: string]: unknown }[];
}
