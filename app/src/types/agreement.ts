import type { Price } from './common';
import type { DetailsListItemValue } from './lists';

export interface AgreementData {
  id: string;
  name: string;
  status?: string;
  vendor?: DetailsListItemValue;
  product?: DetailsListItemValue;
  client?: DetailsListItemValue;
  licensee?: {
    eligibility?: {
      partner: boolean;
    };
  };
  price?: Price;
}
