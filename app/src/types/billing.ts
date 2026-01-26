import type { DetailsListItemValue } from '@/types/lists';

export interface CreditMemo {
  id: string;
  documentNo: string;
  status: string;

  attributes?: Record<string, unknown>;
  erpData?: Record<string, unknown>;
  buyer?: Record<string, unknown>;
  seller?: Record<string, unknown>;
  price?: Record<string, unknown>;
  audit?: Record<string, unknown>;
}

export interface CreditMemoDetails {
  id: string;
  documentNo: string;
  status: string;

  client?: DetailsListItemValue;
  buyer?: DetailsListItemValue;
  licencee?: DetailsListItemValue;
  vendor?: DetailsListItemValue;
  product?: DetailsListItemValue;
  agreement?: DetailsListItemValue;
  seller?: DetailsListItemValue;
  price: {
    currency: string;
    totalSP: number;
    totalGT: number;
  };
}

export interface Invoice {
  id: string;
  documentNo: string;
  status?: string;

  audit?: {
    created?: {
      at?: string;
    };
    updated?: {
      at?: string;
    };
  };
}

export interface Statement {
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
