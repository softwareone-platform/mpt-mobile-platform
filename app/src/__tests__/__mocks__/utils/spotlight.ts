import type { SpotlightTemplateName } from '@/types/spotlight';
import type { SpotlightItem } from '@/types/api';

export const categories = [
  { name: 'orders', templates: ['savedOrdersClient', 'queryingOrders'] as SpotlightTemplateName[] },
  { name: 'subscriptions', templates: ['renewingSubscriptions', 'expiringSubscriptions'] as SpotlightTemplateName[] },
];

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
  total: 0,
  top: [],
  query: { id: 'q3', name: 'Querying Orders', template: 'queryingOrders' },
};

export const spotlightItem4: SpotlightItem = {
  id: '4',
  total: 7,
  top: [],
  query: { id: 'q4', name: 'Expiring Subscriptions', template: 'expiringSubscriptions' },
};

export const spotlightData: SpotlightItem[] = [
  spotlightItem1,
  spotlightItem2,
  spotlightItem3,
  spotlightItem4,
];

export const categoryLookup = {
  savedOrdersClient: 'orders',
  queryingOrders: 'orders',
  renewingSubscriptions: 'subscriptions',
  expiringSubscriptions: 'subscriptions',
};
