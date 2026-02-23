import { AppScreensParamList } from './navigation';

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
  | 'longRunningEnrollmentsOfMyClients'
  | 'inProgressJournals';

export type SpotlightCategoryName =
  | 'orders'
  | 'subscriptions'
  | 'users'
  | 'invoices'
  | 'enrollments'
  | 'journals'
  | 'buyers';

export type SpotlightDetailsScreen =
  | 'orderDetails'
  | 'subscriptionDetails'
  | 'userDetails'
  | 'invoiceDetails'
  | 'enrollmentDetails'
  | 'journalDetails'
  | 'buyerDetails';

export type SpotlightCategory = {
  name: SpotlightCategoryName;
  templates: SpotlightTemplateName[];
  detailsScreenName: keyof AppScreensParamList;
};
