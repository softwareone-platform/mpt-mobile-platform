import type { AccountType } from '@/types/common';

type SearchConfigItem = {
  getQuery: (query: string) => string;
  roles: AccountType[];
};

export const searchConfig: Record<string, SearchConfigItem> = {
  agreements: {
    getQuery: (query: string) =>
      `&or(` +
      `ilike(name,"*${query}*"),` +
      `ilike(buyer.name,"*${query}*"),` +
      `ilike(client.name,"*${query}*"),` +
      `ilike(externalIds.client,"*${query}*"),` +
      `ilike(externalIds.operations,"*${query}*"),` +
      `ilike(externalIds.vendor,"*${query}*")` +
      `)`,
    roles: ['Client', 'Vendor', 'Operations'],
  },
  invoices: {
    getQuery: (query: string) => `&ilike(documentNo,"${query}*")`,
    roles: ['Client', 'Vendor', 'Operations'],
  },
  orders: {
    getQuery: (query: string) =>
      `&or(` +
      `ilike(agreement.name,"*${query}*"),` +
      `ilike(agreement.client.name,"*${query}*"),` +
      `ilike(buyer.name,"*${query}*"),` +
      `ilike(externalIds.client,"*${query}*"),` +
      `ilike(externalIds.operations,"*${query}*"),` +
      `ilike(externalIds.vendor,"*${query}*")` +
      `)`,
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
