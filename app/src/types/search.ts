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
  fullMappings: Partial<Record<EntityType, string>>;
  partialMappings: Partial<Record<PartialEntityType, string>>;
  idFields: string[];
  textFields: string[];
  includeExternalIds: boolean;
}
