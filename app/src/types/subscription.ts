import type { Price } from './common';
import type { DetailsListItemValue } from './lists';

export interface Subscription {
  id: string;
  name: string;
  status?: string;

  agreement?: {
    id?: string;
    listing?: {
      priceList?: Record<string, unknown>;
    };
  };
  seller?: {
    address?: Record<string, unknown>;
  };
  audit?: {
    created?: {
      at?: string;
    };
    updated?: {
      at?: string;
    };
  };
}

export interface SubscriptionData {
  id: string;
  name: string;
  status?: string;
  product?: DetailsListItemValue;
  agreement?: DetailsListItemValue & {
    client?: DetailsListItemValue;
  };
  commitmentDate: string;
  terms: {
    model: Model;
    period: Period;
    commitment: Commitment;
  };
  price?: Price;
}

export type Model = 'one-time' | 'usage' | 'quantity';
export type Period = '1m' | '1y' | '3y' | 'one-time';
export type Commitment = '1m' | '1y' | '3y';
