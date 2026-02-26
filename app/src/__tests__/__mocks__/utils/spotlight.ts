import type { SpotlightItem } from '@/types/api';
import type {
  SpotlightTemplateName,
  SpotlightCategoryName,
  SpotlightCategory,
} from '@/types/spotlight';

export const categories: Array<SpotlightCategory> = [
  {
    name: 'orders',
    templates: ['savedOrdersClient', 'queryingOrders'],
    detailsScreenName: 'orderDetails',
    listScreenName: 'orders',
  },
  {
    name: 'subscriptions',
    templates: ['renewingSubscriptions', 'expiringSubscriptions'],
    detailsScreenName: 'subscriptionDetails',
    listScreenName: 'subscriptions',
  },
];

export const duplicateCategories: Array<SpotlightCategory> = [
  {
    name: 'orders',
    templates: ['savedOrdersClient'],
    detailsScreenName: 'orderDetails',
    listScreenName: 'orders',
  },
  {
    name: 'subscriptions',
    templates: ['savedOrdersClient'],
    detailsScreenName: 'subscriptionDetails',
    listScreenName: 'subscriptions',
  },
];

export const categoryLookup: Record<SpotlightTemplateName, SpotlightCategoryName> = {
  savedOrdersClient: 'orders',
  queryingOrders: 'orders',
  renewingSubscriptions: 'subscriptions',
  expiringSubscriptions: 'subscriptions',
} as Record<SpotlightTemplateName, SpotlightCategoryName>;

export const spotlightItem1: SpotlightItem = {
  id: '1',
  total: 5,
  top: [],
  query: { id: 'q1', name: 'Saved Orders', template: 'savedOrdersClient' },
};

export const spotlightItem2: SpotlightItem = {
  id: '2',
  total: 3,
  top: [],
  query: { id: 'q2', name: 'Renewing Subscriptions', template: 'renewingSubscriptions' },
};

export const spotlightItem3: SpotlightItem = {
  id: '3',
  total: 7,
  top: [],
  query: { id: 'q3', name: 'Querying Orders', template: 'queryingOrders' },
};

export const spotlightItem4: SpotlightItem = {
  id: '4',
  total: 0,
  top: [],
  query: { id: 'q4', name: 'Expiring Subscriptions', template: 'expiringSubscriptions' },
};

export const spotlightItemMissingQuery: SpotlightItem = {
  id: '5',
  total: 4,
  top: [],
};

export const spotlightItemMissingTemplate: SpotlightItem = {
  id: '6',
  total: 2,
  top: [],
  query: { id: 'q6', name: 'Expiring Subscriptions' },
};

export const spotlightItemUndefinedTemplate: SpotlightItem = {
  id: '7',
  total: 2,
  top: [],
  query: { id: 'q7', name: 'Expiring Subscriptions', template: undefined },
};

export const spotlightItemUnknownTemplate: SpotlightItem = {
  id: '8',
  total: 7,
  top: [],
  query: {
    id: 'q8',
    name: 'Unknown Template',
    template: 'notExistingTemplate' as SpotlightTemplateName,
  },
};

export const spotlightData: SpotlightItem[] = [
  spotlightItem1,
  spotlightItem2,
  spotlightItem3,
  spotlightItem4,
];

export const spotlightDataMissingQuery: SpotlightItem[] = [
  ...spotlightData,
  spotlightItemMissingQuery,
];

export const spotlightDataMissingTemplate: SpotlightItem[] = [
  ...spotlightData,
  spotlightItemMissingTemplate,
];

export const spotlightDataUndefinedTemplate: SpotlightItem[] = [
  ...spotlightData,
  spotlightItemUndefinedTemplate,
];

export const spotlightDataUnknownTemplate: SpotlightItem[] = [
  ...spotlightData,
  spotlightItemUnknownTemplate,
];

export const spotlightDataNullItem: SpotlightItem[] = [
  ...spotlightData,
  null as unknown as SpotlightItem,
];

export const spotlightDataUndefinedItem: SpotlightItem[] = [
  ...spotlightData,
  undefined as unknown as SpotlightItem,
];

export const spotlightDataZeroTotal: SpotlightItem[] = [
  { ...spotlightItem1, total: 0 },
  { ...spotlightItem2, total: 0 },
  { ...spotlightItem4, total: 0 },
];

export const spotlightDataEmpty: SpotlightItem[] = [];

export const groupedSpotlightData: Record<string, SpotlightItem[]> = {
  orders: [spotlightItem1, spotlightItem3],
  subscriptions: [spotlightItem2],
};

export const groupedSpotlightDataSingleItemPerCategory: Record<string, SpotlightItem[]> = {
  orders: [spotlightItem1],
  subscriptions: [spotlightItem2],
};

/**
 * Generates a large array of spotlight items for testing - 100 in total, equally split between two categories
 * @return spotlight items array
 */
export const largeSpotlightData: SpotlightItem[] = Array.from({ length: 100 }, (_, i) => {
  const id = (i + 1).toString();
  const even = i % 2 === 0;

  const template: SpotlightTemplateName = even ? 'savedOrdersClient' : 'renewingSubscriptions';

  return {
    id,
    total: (i % 5) + 1,
    top: [],
    query: {
      id: `q${id}`,
      name: `Mock Item ${id}`,
      template,
    },
  };
});
