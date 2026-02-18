import { CommonBillingDetails, Price, Audit } from '@/types/common';
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

export interface CreditMemoDetails extends CommonBillingDetails {
  documentNo: string;
  price: Price;
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

export interface InvoiceDetails extends CommonBillingDetails {
  documentNo: string;
  statement?: {
    id: string;
    customLedger: {
      id: string;
      name: string;
    };
    ledger?: {
      id: string;
      owner?: DetailsListItemValue;
    };
  };
  attributes?: {
    dueDate: string;
    orderNo: string;
  };
  price: Price;
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

export interface StatementDetails extends CommonBillingDetails {
  type: 'Debit' | 'Credit';
  ledger?: {
    id: string;
    owner?: DetailsListItemValue;
  };
  price: {
    currency: {
      purchase: string;
      sale: string;
      rate: number;
    };
    markup: number;
    margin: number;
    totalPP: number;
    totalSP: number;
  };
  audit: Audit;
}
