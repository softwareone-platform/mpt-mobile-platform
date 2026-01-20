export type SpotlightTemplateName =
  | 'savedOrdersClient'
  | 'queryingOrders'
  | 'processingOrders'
  | 'savedOrdersOperations'
  | 'longRunningOrders'
  | 'renewingSubscriptions'
  | 'expiringSubscriptions'
  | 'expiringSubscriptionsOfMyClients'
  | 'pendingInvites'
  | 'pendingInvitesOfMyClients'
  | 'expiredInvites'
  | 'expiredInvitesOfMyClients'
  | 'unpaidInvoices'
  | 'invoicesPastDue'
  | 'unpaidInvoicesOfMyClients'
  | 'invoicesPastDueOfMyClients'
  | 'queryingEnrollments'
  | 'processingEnrollments'
  | 'longRunningEnrollmentsOfMyClients'
  | 'inProgressJournals'
  | 'mismatchingBuyersClient'
  | 'mismatchingBuyersOfMyClients'
  | 'buyersWithBlockedSellerConnectionsOfMyClients';

export interface SpotlightItem {
  id: string;
  total: number;
  top: SpotlightTopItem[];
  query?: {
    id: string;
    name: string;
    template?: string;
  };
}

export interface SpotlightTopItem {
  id: string;
  name?: string;
  documentNo?: string;
  icon?: string;
  program?: {
    id?: string;
    name: string;
    icon: string;
  };
  product?: {
    id?: string;
    name: string;
    icon: string;
  };
  buyer?: {
    id?: string;
    name: string;
    icon: string;
    account: {
      id: string;
      type: string;
    };
  };
  user?: {
    id?: string;
    name: string;
    icon: string;
  };
}

export interface SpotlightData {
  $meta: {
    pagination: { offset: number; limit: number; total: number };
    omitted: string[];
  };
  data: SpotlightItem[];
}
