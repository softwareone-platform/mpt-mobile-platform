import type { DetailsListItemValue } from '@/types/lists';

export type AccountType = 'Client' | 'Vendor' | 'Operations';

export interface CommonBillingDetails {
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

export interface AuditTimestamp {
  at: string;
  by: {
    id: string;
    name: string;
    icon: string;
  };
}

export interface Audit {
  created?: AuditTimestamp;
  updated?: AuditTimestamp;
  generated?: AuditTimestamp;
  queued?: AuditTimestamp;
  error: AuditTimestamp;
  cancelled: AuditTimestamp;
  pending: AuditTimestamp;
  issued: AuditTimestamp;
  generating: AuditTimestamp;
}
