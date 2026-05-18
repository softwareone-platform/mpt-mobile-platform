import type { EntityType, PartialEntityType } from '@/types/search';

export function getEntityTypeBySearchTerm(
  searchTerm: string,
): EntityType | PartialEntityType | null {
  if (/^AGR(-[0-9]{4}){3}$/.test(searchTerm)) {
    return 'Agreement';
  } else if (/^AGR(-[0-9]{0,4}){0,3}?$/.test(searchTerm)) {
    return `PartialAgreement`;
  }

  if (/^ORD(-[0-9]{4}){3}$/.test(searchTerm)) {
    return 'Order';
  } else if (/^ORD(-[0-9]{0,4}){0,3}?$/.test(searchTerm)) {
    return `PartialOrder`;
  }

  if (/^SUB(-[0-9]{4}){3}$/.test(searchTerm)) {
    return 'Subscription';
  } else if (/^SUB(-[0-9]{0,4}){0,3}?$/.test(searchTerm)) {
    return `PartialSubscription`;
  }

  if (/^BUY(-[0-9]{4}){2}$/.test(searchTerm)) {
    return 'Buyer';
  } else if (/^BUY(-[0-9]{0,4}){0,2}?$/.test(searchTerm)) {
    return `PartialBuyer`;
  }

  if (/^ACC(-[0-9]{4}){2}$/.test(searchTerm)) {
    return 'Account';
  } else if (/^ACC(-[0-9]{0,4}){0,2}?$/.test(searchTerm)) {
    return `PartialAccount`;
  }

  if (/^PRD(-[0-9]{4}){2}$/.test(searchTerm)) {
    return 'Product';
  } else if (/^PRD(-[0-9]{0,4}){0,2}?$/.test(searchTerm)) {
    return `PartialProduct`;
  }

  if (/^ITM(-[0-9]{4}){3}$/.test(searchTerm)) {
    return 'ProductItem';
  } else if (/^ITM(-[0-9]{0,4}){0,3}?$/.test(searchTerm)) {
    return `PartialProductItem`;
  }

  return null;
}

export function checkIfIsPartialId(searchTerm: string): boolean | undefined {
  if (/^[0-9]{1,4}$/.test(searchTerm)) {
    // 1-4 digits
    return undefined;
  }
  return /^-?[0-9]{1,4}(-[0-9]{4}){0,3}-[0-9]{0,4}$/.test(searchTerm); // (0-4 digits)-(0-3 groups of 4 digits)-(0-4 digits)
}

export function sanitizeSearchInput(value: string) {
  return value.replace(/"/g, '').trim();
}
