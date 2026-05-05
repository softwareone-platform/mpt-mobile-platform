export const searchQuery = {
  agreements: (query: string) =>
    `&or(` +
    `ilike(name,"*${query}*"),` +
    `ilike(buyer.name,"*${query}*"),` +
    `ilike(client.name,"*${query}*"),` +
    `ilike(externalIds.client,"*${query}*"),` +
    `ilike(externalIds.operations,"*${query}*"),` +
    `ilike(externalIds.vendor,"*${query}*")` +
    `)`,
  invoices: (query: string) => `&ilike(documentNo,"${query}*")`,
  orders: (query: string) =>
    `&or(` +
    `ilike(agreement.name,"*${query}*"),` +
    `ilike(agreement.client.name,"*${query}*"),` +
    `ilike(buyer.name,"*${query}*"),` +
    `ilike(externalIds.client,"*${query}*"),` +
    `ilike(externalIds.operations,"*${query}*"),` +
    `ilike(externalIds.vendor,"*${query}*")` +
    `)`,
} as const;

export type SearchCategory = keyof typeof searchQuery;
