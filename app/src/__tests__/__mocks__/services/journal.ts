export const mockJournalId1 = 'BJO-1234-7564';
export const mockJournalId2 = 'BJO-1234-7565';

export const mockJournalResponse1 = {
  id: mockJournalId1,
  name: 'Journal One',
  status: 'Draft',
};

export const mockJournalResponse2 = {
  id: mockJournalId2,
  name: 'Journal Two longer name',
  status: 'Validated',
};

export const expectedUrl1 = `/v1/billing/journals/${mockJournalId1}?select=audit.created.at,audit.updated.at,owner.address.country,audit`;
export const expectedUrl2 = `/v1/billing/journals/${mockJournalId2}?select=audit.created.at,audit.updated.at,owner.address.country,audit`;

export const mockJournalData = {
  id: mockJournalId1,
  name: 'Journal generated for Invoice',
  status: 'Validated',
  authorization: {
    id: 'AUT-1111-2026',
    name: 'Authorization One',
  },
  product: {
    id: 'PRD-1234-5678',
    name: 'Microsoft Azure',
    icon: '/v1/catalog/products/PRD-1234-5678/icon',
  },
  owner: {
    id: 'SEL-1234-4567',
    name: 'Switzerland',
    icon: '/v1/accounts/sellers/SEL-1234-4567/icon',
  },
  vendor: {
    id: 'ACC-9011-1234',
    name: 'CSP Microsoft',
    icon: '/v1/accounts/accounts/ACC-1111-1234/icon',
  },
  dueDate: '2026-03-31T10:00:00Z',
  price: {
    currency: 'EUR',
    totalPP: 1234.4523,
  },
  processing: {
    total: 10,
    ready: 5,
    ignored: 1,
    split: 0,
    error: 1,
    skipped: 1,
  },
  assignee: {
    id: 'USR-1234-5678',
    name: 'Marta Smith',
  },
  audit: {
    created: {
      at: '2026-04-01T10:00:00Z',
      by: {
        id: 'TKN-1111-2345',
        name: 'Microsoft Fulfillment Automation',
        icon: '',
      },
    },
    updated: {
      at: '2026-03-15T10:00:00Z',
      by: {
        id: 'USR-1234-4444',
        name: 'John Doe',
        icon: 'john-doe-icon',
      },
    },
  },
};
