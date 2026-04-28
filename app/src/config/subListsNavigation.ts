import type { SubListItem } from '@/types/navigation';

export const getAgreementSubList = (id: string): SubListItem[] => {
  const defaultQuery = `&eq(agreement.id,"${id}")&order=-audit.created.at`;

  return [
    {
      name: 'subscriptions',
      roles: ['Client', 'Operations'],
      query: `&eq(agreement.id,"${id}")&filter(group.buyers)`,
    },
    {
      name: 'orders',
      roles: ['Client', 'Vendor', 'Operations'],
      query: defaultQuery,
    },
    {
      name: 'invoices',
      roles: ['Client', 'Operations'],
      query: defaultQuery,
    },
    {
      name: 'statements',
      roles: ['Client', 'Operations'],
      query: defaultQuery,
    },
  ];
};

export const getCertificateSubList = (id: string): SubListItem[] => {
  return [
    {
      name: 'enrollments',
      roles: ['Client', 'Operations'],
      query: `&and(eq(certificate.id,"${id}"),ne(status,"Deleted"))`,
    },
    {
      name: 'agreements',
      roles: ['Client', 'Operations'],
      query: `&any(certificates,eq(id, "${id}"))`,
    },
  ];
};

export const getAccountSubList = (id: string): SubListItem[] => {
  return [
    {
      name: 'buyers',
      roles: ['Client', 'Operations'],
      query: `&and(ne(status,"Deleted"),eq(account.id,"${id}"))&order=name`,
    },
    {
      name: 'licensees',
      roles: ['Client', 'Operations'],
      query: `&eq(account.id,"${id}")&order=name`,
    },
    {
      name: 'users',
      roles: ['Client', 'Vendor', 'Operations'],
      query: '&order=name',
      accountId: id,
    },
  ];
};

export const getBuyerSubList = (id: string): SubListItem[] => {
  return [
    {
      name: 'licensees',
      roles: ['Client', 'Operations'],
      query: `&eq(buyer.id,"${id}")&order=name`,
    },
  ];
};

export const getSubscriptionSubList = (id: string): SubListItem[] => {
  return [
    {
      name: 'orders',
      roles: ['Client', 'Vendor', 'Operations'],
      query: `&any(subscriptions,id=${id})`,
    },
  ];
};

export const getOrderSubList = (id: string): SubListItem[] => {
  return [
    {
      name: 'subscriptions',
      roles: ['Client', 'Operations'],
      source: {
        type: 'order',
        id,
      },
    },
  ];
};
