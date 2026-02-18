import { CommonBillingDetails, Price } from '@/types/common';
import type { DetailsListItemValue } from '@/types/lists';

export interface Order {
  id: string;
  status: string;

  audit?: {
    created?: {
      at?: string;
    };
    updated?: {
      at?: string;
    };
  };
}

export interface OrderDetails extends CommonBillingDetails {
  type: string;
  assignee: DetailsListItemValue;
  price: Price;
}
