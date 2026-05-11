import type { Price } from '@/types/common';
import type { DetailsListItemValue } from '@/types/lists';

export interface CommonProcurementDetails {
  id: string;
  status: string;
  externalIds: {
    operations: string;
  };
  client?: DetailsListItemValue;
  buyer?: DetailsListItemValue;
  seller?: DetailsListItemValue;
  vendors?: DetailsListItemValue[];
  products?: DetailsListItemValue[];
  price: Price;
  lines: LineItem[];
}

export interface SalesQuote {
  id: string;
  status: string;
  externalIds: {
    operations: string;
  };
}

export interface Navision {
  amountIncludingVat: number;
}

export interface LineItem {
  attributes: {
    navision: Navision;
  };
}

export interface SalesOrderDetails extends CommonProcurementDetails {
  source?: string;
  salesQuote?: SalesQuote;
}

export interface SalesQuoteDetails extends CommonProcurementDetails {
  expiryDate: string;
  salesOrders: DetailsListItemValue[];
}
