import type { AppScreensParamList, MainTabRouteName, SecondaryTabRouteName } from './navigation';

export type SpotlightTemplateName =
  | 'savedOrdersClient'
  | 'queryingOrders'
  | 'processingOrders'
  | 'savedOrdersOperations'
  | 'longRunningOrders'
  | 'renewingSubscriptions'
  | 'expiringSubscriptions'
  | 'pendingInvites'
  | 'pendingInvitesOfMyClients'
  | 'expiredInvites'
  | 'expiredInvitesOfMyClients'
  | 'mismatchingBuyersClient'
  | 'mismatchingBuyersOfMyClients'
  | 'buyersWithBlockedSellerConnectionsOfMyClients'
  | 'expiringSubscriptionsOfMyClients'
  | 'unpaidInvoices'
  | 'invoicesPastDue'
  | 'unpaidInvoicesOfMyClients'
  | 'invoicesPastDueOfMyClients'
  | 'queryingEnrollments'
  | 'processingEnrollments'
  | 'longRunningEnrollmentsOfMyClients';
// TODO: add back when Journal screens are ready
// | 'inProgressJournals';

export type SpotlightCategoryName =
  | 'orders'
  | 'subscriptions'
  | 'users'
  | 'allUsers'
  | 'invoices'
  | 'enrollments'
  | 'journals'
  | 'buyers';

export type SpotlightCategory = {
  name: SpotlightCategoryName;
  templates: SpotlightTemplateName[];
};

export type SpotlightTemplateConfig = {
  category: SpotlightCategoryName;
  detailsScreenName: keyof AppScreensParamList;
  listScreenName: MainTabRouteName | SecondaryTabRouteName;
};
