import type { DetailsListItemValue } from '@/types/lists';

export type AccountType = 'Client' | 'Vendor' | 'Operations';

export interface BaseObjectDetails {
  id: string;
  status: string;
  client?: DetailsListItemValue;
  buyer?: DetailsListItemValue;
  licensee?: DetailsListItemValue & {
    eligibility?: {
      partner?: boolean;
    };
  };
  vendor?: DetailsListItemValue;
  product?: DetailsListItemValue;
  agreement?: DetailsListItemValue;
  seller?: DetailsListItemValue;
  price: Price;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
}

export interface Price {
  currency: string;
  totalPP?: number;
  totalSP?: number;
  totalST?: number;
  totalGT?: number;
  markup?: number;
  margin?: number;
  defaultMarkup?: number;
  defaultMargin?: number;
  SPxY?: number;
  SPxM?: number;
  PPxY?: number;
  PPxM?: number;
  billingCurrency?: string;
  source?: string;
  defaultMarkupSource?: {
    type?: string;
    ref?: {
      id: string;
    };
  };
}
