import type {
  SpotlightTemplateName,
  SpotlightCategory,
  SpotlightTemplateConfig,
} from '../types/spotlight';

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

export const USERS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'pendingInvites',
  'pendingInvitesOfMyClients',
  'expiredInvites',
  'expiredInvitesOfMyClients',
];

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

// export const JOURNALS_SPOTLIGHTS: Array<SpotlightTemplateName> = ['inProgressJournals'];

export const BUYERS_SPOTLIGHTS: Array<SpotlightTemplateName> = [
  'mismatchingBuyersClient',
  'mismatchingBuyersOfMyClients',
  'buyersWithBlockedSellerConnectionsOfMyClients',
];

const ordersConfig: SpotlightTemplateConfig = {
  category: 'orders',
  detailsScreenName: 'orderDetails',
  listScreenName: 'orders',
};

const subscriptionsConfig: SpotlightTemplateConfig = {
  category: 'subscriptions',
  detailsScreenName: 'subscriptionDetails',
  listScreenName: 'subscriptions',
};

const usersConfig: SpotlightTemplateConfig = {
  category: 'users',
  detailsScreenName: 'userDetails',
  listScreenName: 'users',
};

const allUsersConfig: SpotlightTemplateConfig = {
  category: 'users',
  detailsScreenName: 'userDetails',
  listScreenName: 'allUsers',
};

const invoicesConfig: SpotlightTemplateConfig = {
  category: 'invoices',
  detailsScreenName: 'invoiceDetails',
  listScreenName: 'invoices',
};

const enrollmentsConfig: SpotlightTemplateConfig = {
  category: 'enrollments',
  detailsScreenName: 'enrollmentDetails',
  listScreenName: 'enrollments',
};
// TODO: add back when Journal screens are ready
// const journalsConfig: SpotlightTemplateConfig = {
//   category: 'journals',
//   detailsScreenName: 'journalDetails',
//   listScreenName: 'journals',
// };

const buyersConfig: SpotlightTemplateConfig = {
  category: 'buyers',
  detailsScreenName: 'buyerDetails',
  listScreenName: 'buyers',
};

export const templateLookup: Record<SpotlightTemplateName, SpotlightTemplateConfig> = {
  savedOrdersClient: ordersConfig,
  queryingOrders: ordersConfig,
  processingOrders: ordersConfig,
  savedOrdersOperations: ordersConfig,
  longRunningOrders: ordersConfig,
  renewingSubscriptions: subscriptionsConfig,
  expiringSubscriptions: subscriptionsConfig,
  expiringSubscriptionsOfMyClients: subscriptionsConfig,
  pendingInvitesOfMyClients: usersConfig,
  expiredInvitesOfMyClients: usersConfig,
  pendingInvites: allUsersConfig,
  expiredInvites: allUsersConfig,
  unpaidInvoices: invoicesConfig,
  invoicesPastDue: invoicesConfig,
  unpaidInvoicesOfMyClients: invoicesConfig,
  invoicesPastDueOfMyClients: invoicesConfig,
  queryingEnrollments: enrollmentsConfig,
  processingEnrollments: enrollmentsConfig,
  longRunningEnrollmentsOfMyClients: enrollmentsConfig,
  // TODO: add back when Journal screens are ready
  // inProgressJournals: journalsConfig,
  mismatchingBuyersClient: buyersConfig,
  mismatchingBuyersOfMyClients: buyersConfig,
  buyersWithBlockedSellerConnectionsOfMyClients: buyersConfig,
};

export const SPOTLIGHT_CATEGORY: Array<SpotlightCategory> = [
  {
    name: 'orders',
    templates: ORDERS_SPOTLIGHTS,
  },
  {
    name: 'subscriptions',
    templates: SUBSCRIPTION_SPOTLIGHTS,
  },
  {
    name: 'users',
    templates: USERS_SPOTLIGHTS,
  },
  {
    name: 'invoices',
    templates: INVOICES_SPOTLIGHTS,
  },
  {
    name: 'enrollments',
    templates: ENROLLMENTS_SPOTLIGHTS,
  },
  // TODO: add Journals back when details screen is ready
  // {
  // name: 'journals',
  // templates: JOURNALS_SPOTLIGHTS,
  // },
  {
    name: 'buyers',
    templates: BUYERS_SPOTLIGHTS,
  },
];
