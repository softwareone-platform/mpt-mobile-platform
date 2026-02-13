import type { Price } from './common';
import type { DetailsListItemValue } from './lists';

export interface Agreement {
  id: string;
  name: string;
  status?: string;

  externalIds?: {
    client?: string;
  };
  product?: Record<string, unknown>;
  audit?: {
    created?: {
      at?: string;
    };
    updated?: {
      at?: string;
    };
  };
  seller?: {
    address?: Record<string, unknown>;
  };
  listing?: Record<string, unknown>;
  licensee?: {
    eligibility?: Record<string, unknown>;
  };
}

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
