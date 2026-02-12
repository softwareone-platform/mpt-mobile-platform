import type { DetailsListItemValue } from '@/types/lists';

export type AccountType = 'Client' | 'Vendor' | 'Operations';

export interface BaseObjectDetails {
  id: string;
  status: string;
  client?: DetailsListItemValue;
  buyer?: DetailsListItemValue;
  licencee?: DetailsListItemValue & {
    eligibility?: {
      partner?: boolean;
    };
  };
  vendor?: DetailsListItemValue;
  product?: DetailsListItemValue;
  agreement?: DetailsListItemValue;
  seller?: DetailsListItemValue;
  price: {
    currency: string;
    totalSP: number;
    totalGT: number;
    markup?: number;
    margin?: number;
    defaultMarkup?: number;
  };
}
