import type { AccountType } from '@/types/common';
import { checkIfIsPartialId, getEntityTypeBySearchTerm } from '@/utils/search/search';

export function getAgreementSearchQuery(
  accountType: AccountType | undefined,
  searchTerm: string | null | undefined,
): string | undefined {
  if (!searchTerm) {
    return undefined;
  }

  const entityType = getEntityTypeBySearchTerm(searchTerm);
  const isPartialId = checkIfIsPartialId(searchTerm);

  const isToFilterById = isPartialId === undefined ? true : isPartialId;

  const isToFilterByText = isPartialId === undefined ? true : !isPartialId;

  switch (entityType) {
    case 'Agreement':
      return `&eq(id,"${searchTerm}")`;

    case 'Buyer':
      return `&eq(buyer.id,"${searchTerm}")`;

    case 'Account':
      return `&eq(client.id,"${searchTerm}")`;

    case 'PartialAgreement':
      return `&ilike(id,"${searchTerm}*")`;

    case 'PartialBuyer':
      return `&ilike(buyer.id,"${searchTerm}*")`;

    case 'PartialAccount':
      return `&ilike(client.id,"${searchTerm}*")`;

    case null: {
      let query = `&or(`;

      if (isToFilterById) {
        query +=
          `ilike(id,"*${searchTerm}*"),` +
          `ilike(buyer.id,"*${searchTerm}*"),` +
          `ilike(client.id,"*${searchTerm}*"),`;
      }

      if (isToFilterByText) {
        query +=
          `ilike(name,"*${searchTerm}*"),` +
          `ilike(buyer.name,"*${searchTerm}*"),` +
          `ilike(client.name,"*${searchTerm}*"),`;
      }

      if (accountType !== 'Vendor') {
        query += `ilike(externalIds.client,"*${searchTerm}*"),`;
      }

      if (accountType === 'Operations') {
        query += `ilike(externalIds.operations,"*${searchTerm}*"),`;
      }

      if (accountType !== 'Client') {
        query += `ilike(externalIds.vendor,"*${searchTerm}*"),`;
      }

      // remove trailing comma
      if (query.endsWith(',')) {
        query = query.slice(0, -1);
      }

      query += `)`;

      return query;
    }

    default:
      return undefined;
  }
}
