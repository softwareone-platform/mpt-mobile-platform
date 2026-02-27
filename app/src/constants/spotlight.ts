import type { SpotlightTemplateName, SpotlightCategory } from '../types/spotlight';

export const ORDERS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'savedOrdersClient',
  'queryingOrders',
  'processingOrders',
  'savedOrdersOperations',
  'longRunningOrders',
];

export const SUBSCRIPTION_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'renewingSubscriptions',
  'expiringSubscriptions',
  'expiringSubscriptionsOfMyClients',
];

export const USERS_ALL_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'pendingInvitesOfMyClients',
  'expiredInvitesOfMyClients',
];

export const USERS_SPOTLIGHTS: Array<SpotlightTemplateName> = ['pendingInvites', 'expiredInvites'];

export const INVOICES_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'unpaidInvoices',
  'invoicesPastDue',
  'unpaidInvoicesOfMyClients',
  'invoicesPastDueOfMyClients',
];

export const ENROLLMENTS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'queryingEnrollments',
  'processingEnrollments',
  'longRunningEnrollmentsOfMyClients',
];

export const JOURNALS_SPOTLIGHTS: Array<SpotlightTemplateName> = ['inProgressJournals'];

export const BUYERS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'mismatchingBuyersClient',
  'mismatchingBuyersOfMyClients',
  'buyersWithBlockedSellerConnectionsOfMyClients',
];

export const SPOTLIGHT_CATEGORY: Array<SpotlightCategory> = [
  {
    name: 'orders',
    templates: ORDERS_SPOTLIGHTS,
    detailsScreenName: 'orderDetails',
    listScreenName: 'orders',
  },
  {
    name: 'subscriptions',
    templates: SUBSCRIPTION_SPOTLIGHTS,
    detailsScreenName: 'subscriptionDetails',
    listScreenName: 'subscriptions',
  },
  {
    name: 'allUsers',
    templates: USERS_ALL_SPOTLIGHTS,
    detailsScreenName: 'userDetails',
    listScreenName: 'allUsers',
  },
  {
    name: 'users',
    templates: USERS_SPOTLIGHTS,
    detailsScreenName: 'userDetails',
    listScreenName: 'users',
  },
  {
    name: 'invoices',
    templates: INVOICES_SPOTLIGHTS,
    detailsScreenName: 'invoiceDetails',
    listScreenName: 'invoices',
  },
  {
    name: 'enrollments',
    templates: ENROLLMENTS_SPOTLIGHTS,
    detailsScreenName: 'enrollmentDetails',
    listScreenName: 'enrollments',
  },
  // TODO: add Journals back when details screen is ready
  // { name: 'journals', templates: JOURNALS_SPOTLIGHTS, detailsScreenName: 'journalDetails', listScreenName: 'journals', },
  {
    name: 'buyers',
    templates: BUYERS_SPOTLIGHTS,
    detailsScreenName: 'buyerDetails',
    listScreenName: 'buyers',
  },
];
