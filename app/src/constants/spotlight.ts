import type { SpotlightTemplateName } from '../types/spotlight';

export const ORDERS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'savedOrdersClient',
  'queryingOrders',
  'processingOrders',
  'savedOrdersOperations',
  'longRunningOrders'
];

export const SUBSCRIPTION_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'renewingSubscriptions',
  'expiringSubscriptions',
  'expiringSubscriptionsOfMyClients'
];

export const USERS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'pendingInvites',
  'pendingInvitesOfMyClients',
  'expiredInvites',
  'expiredInvitesOfMyClients'
];

export const INVOICES_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'unpaidInvoices',
  'invoicesPastDue',
  'unpaidInvoicesOfMyClients',
  'invoicesPastDueOfMyClients'
];

export const ENROLLMENTS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'queryingEnrollments',
  'processingEnrollments',
  'longRunningEnrollmentsOfMyClients'
];

export const JOURNALS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'inProgressJournals',
];

export const BUYERS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'mismatchingBuyersClient',
  'mismatchingBuyersOfMyClients',
  'buyersWithBlockedSellerConnectionsOfMyClients'
];

export const SPOTLIGHT_CATEGORY: Array<{ name: string; templates: SpotlightTemplateName[] }> = [
  { name: 'orders', templates: ORDERS_SPOTLIGHTS },
  { name: 'subscriptions', templates: SUBSCRIPTION_SPOTLIGHTS },
  { name: 'users', templates: USERS_SPOTLIGHTS },
  { name: 'invoices', templates: INVOICES_SPOTLIGHTS },
  { name: 'enrollments', templates: ENROLLMENTS_SPOTLIGHTS },
  { name: 'journals', templates: JOURNALS_SPOTLIGHTS },
  { name: 'buyers', templates: BUYERS_SPOTLIGHTS },
];

export const SPOTLIGHT_ORDER = [
  'orders',
  'subscriptions',
  'users',
  'invoices',
  'enrollments',
  'journals',
  'buyers',
];
