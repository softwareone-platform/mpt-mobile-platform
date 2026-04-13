import type { SubListItem } from '@/types/navigation';

export const getAgreementsSubList = (id: string): SubListItem[] => {
  const defaultQuery = `&eq(agreement.id,"${id}")&order=-audit.created.at`;

  return [
    {
      name: 'subscriptions',
      roles: ['Client', 'Operations'],
      query: `&agreement.id="${id}"&filter(group.buyers)`,
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

export const getCertificatesSubList = (id: string): SubListItem[] => {
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
