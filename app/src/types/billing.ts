import { BaseObjectDetails } from '@/types/common';

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

export interface CreditMemoDetails extends BaseObjectDetails {
  documentNo: string;
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
