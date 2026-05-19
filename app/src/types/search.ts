export type EntityType =
  | 'Order'
  | 'Agreement'
  | 'Subscription'
  | 'Product'
  | 'ProductItem'
  | 'Buyer'
  | 'Account';

export type PartialEntityType =
  | 'PartialOrder'
  | 'PartialAgreement'
  | 'PartialSubscription'
  | 'PartialProduct'
  | 'PartialProductItem'
  | 'PartialBuyer'
  | 'PartialAccount';

export interface EntitySearchConfig {
  fullMappings: Record<string, string>;
  partialMappings: Record<string, string>;
  idFields: string[];
  textFields: string[];
  includeExternalIds: boolean;
}
