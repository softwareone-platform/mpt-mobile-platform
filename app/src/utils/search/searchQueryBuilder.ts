import type { AccountType } from '@/types/common';
import type { EntitySearchConfig, EntityType, PartialEntityType } from '@/types/search';
import { checkIfIsPartialId, getEntityTypeBySearchTerm } from '@/utils/search/search';

export function buildSearchQuery(
  searchTerm: string | null | undefined,
  accountType: AccountType | undefined,
  config: EntitySearchConfig,
): string | undefined {
  if (!searchTerm) {
    return undefined;
  }

  const entityType = getEntityTypeBySearchTerm(searchTerm);
  const isPartialId = checkIfIsPartialId(searchTerm);

  const isToFilterById = isPartialId === undefined ? true : isPartialId;
  const isToFilterByText = isPartialId === undefined ? true : !isPartialId;

  if (entityType && config.fullMappings[entityType as EntityType]) {
    return `&eq(${config.fullMappings[entityType as EntityType]},"${searchTerm}")`;
  }

  if (entityType && config.partialMappings[entityType as PartialEntityType]) {
    return `&ilike(${config.partialMappings[entityType as PartialEntityType]},"${searchTerm}*")`;
  }

  if (entityType === null) {
    const conditions: string[] = [];

    if (isToFilterById) {
      conditions.push(...config.idFields.map((field) => `ilike(${field},"*${searchTerm}*")`));
    }

    if (isToFilterByText) {
      conditions.push(...config.textFields.map((field) => `ilike(${field},"*${searchTerm}*")`));
    }

    if (config.includeExternalIds) {
      if (accountType !== 'Vendor') {
        conditions.push(`ilike(externalIds.client,"*${searchTerm}*")`);
      }

      if (accountType === 'Operations') {
        conditions.push(`ilike(externalIds.operations,"*${searchTerm}*")`);
      }

      if (accountType !== 'Client') {
        conditions.push(`ilike(externalIds.vendor,"*${searchTerm}*")`);
      }
    }

    return `&or(${conditions.join(',')})`;
  }

  return undefined;
}
