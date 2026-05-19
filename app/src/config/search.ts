import type { AccountType } from '@/types/common';
import type { EntitySearchConfig } from '@/types/search';
import { buildSearchQuery } from '@/utils/search/searchQueryBuilder';

type SearchConfigItem = {
  getQuery: (searchTerm: string, accountType: AccountType | undefined) => string | undefined;
  roles: AccountType[];
};

export const agreementSearchConfig: EntitySearchConfig = {
  fullMappings: {
    Agreement: 'id',
    Buyer: 'buyer.id',
    Account: 'client.id',
  },
  partialMappings: {
    PartialAgreement: 'id',
    PartialBuyer: 'buyer.id',
    PartialAccount: 'client.id',
  },
  idFields: ['id', 'buyer.id', 'client.id'],
  textFields: ['name', 'buyer.name', 'client.name'],
  includeExternalIds: true,
};

export const orderSearchConfig: EntitySearchConfig = {
  fullMappings: {
    Order: 'id',
    Agreement: 'agreement.id',
    Buyer: 'buyer.id',
    Account: 'client.id',
  },
  partialMappings: {
    PartialOrder: 'id',
    PartialAgreement: 'agreement.id',
    PartialBuyer: 'buyer.id',
    PartialAccount: 'client.id',
  },
  idFields: ['id', 'agreement.id', 'buyer.id', 'agreement.client.id'],
  textFields: ['agreement.name', 'agreement.client.name', 'buyer.name'],
  includeExternalIds: true,
};

export const searchConfig: Record<string, SearchConfigItem> = {
  agreements: {
    getQuery: (searchTerm, accountType) =>
      buildSearchQuery(searchTerm, accountType, agreementSearchConfig),
    roles: ['Client', 'Vendor', 'Operations'],
  },
  invoices: {
    getQuery: (query: string) => `&ilike(documentNo,"${query}*")`,
    roles: ['Client', 'Vendor', 'Operations'],
  },
  orders: {
    getQuery: (searchTerm, accountType) =>
      buildSearchQuery(searchTerm, accountType, orderSearchConfig),
    roles: ['Client', 'Vendor', 'Operations'],
  },
  products: {
    getQuery: (query: string) => `&or(ilike(name,"*${query}*"),ilike(vendor.name,"*${query}*"))`,
    roles: ['Vendor', 'Operations'],
  },
  subscriptions: {
    getQuery: (query: string) =>
      `&or(` +
      `ilike(name,"*${query}*"),` +
      `ilike(agreement.name,"*${query}*"),` +
      `ilike(agreement.client.name,"*${query}*"),` +
      `ilike(buyer.name,"*${query}*"),` +
      `ilike(externalIds.client,"*${query}*"),` +
      `ilike(externalIds.operations,"*${query}*"),` +
      `ilike(externalIds.vendor,"*${query}*")` +
      `)`,
    roles: ['Client', 'Vendor', 'Operations'],
  },
} as const;

export type SearchCategory = keyof typeof searchConfig;
