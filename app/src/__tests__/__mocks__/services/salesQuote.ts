import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import type { PaginatedResponse, ListItemNoImageWithExternalIds } from '@/types/api';

export const CUSTOM_OFFSET = 50;
export const CUSTOM_PAGE_SIZE = 25;

export const expectedUrlBase = `/v1/procurement/sales-quotes?select=-*,id,externalIds.operations,status`;

export const expectedUrlDefaultOffset =
  expectedUrlBase +
  `&order=-audit.created.at` +
  `&offset=${DEFAULT_OFFSET}` +
  `&limit=${DEFAULT_PAGE_SIZE}`;

export const expectedUrlCustomOffset =
  expectedUrlBase + `&order=-audit.created.at` + `&offset=50` + `&limit=25`;

export const customQuery = '&filter=status=Ready&order=status';

export const invalidQuery = 'INVALID_QUERY_STRING';

export const expectedUrlCustomQuery =
  expectedUrlBase + customQuery + `&offset=${DEFAULT_OFFSET}` + `&limit=${DEFAULT_PAGE_SIZE}`;

export const expectedUrlInvalidQuery =
  `/v1/procurement/sales-quotes` +
  `?select=-*,id,externalIds.operations,status` +
  `${invalidQuery}` +
  `&offset=${DEFAULT_OFFSET}` +
  `&limit=${DEFAULT_PAGE_SIZE}`;

export const mockResponseEmptyData: PaginatedResponse<ListItemNoImageWithExternalIds> = {
  $meta: {
    pagination: {
      offset: DEFAULT_OFFSET,
      limit: DEFAULT_PAGE_SIZE,
      total: 0,
    },
  },
  data: [],
};

export const mockResponseCustomOffset: PaginatedResponse<ListItemNoImageWithExternalIds> = {
  $meta: {
    pagination: {
      offset: CUSTOM_OFFSET,
      limit: CUSTOM_PAGE_SIZE,
      total: 100,
    },
  },
  data: [],
};

export const mockResponse1: PaginatedResponse<ListItemNoImageWithExternalIds> = {
  $meta: { pagination: { offset: DEFAULT_OFFSET, limit: 2, total: 4 } },
  data: [
    {
      id: 'SQT-7839-0957-0317',
      status: 'Ready',
      externalIds: {
        operations: 'US-SQU-1668259',
      },
    },
    {
      id: 'SQT-9568-0315-3598',
      status: 'Error',
      externalIds: {
        operations: 'US-SQU-1597874',
      },
    },
  ],
};

export const mockResponse2: PaginatedResponse<ListItemNoImageWithExternalIds> = {
  $meta: { pagination: { offset: 2, limit: 2, total: 4 } },
  data: [
    {
      id: 'SQT-1111-2222-3333',
      status: 'Processing',
      externalIds: {
        operations: 'US-SQU-0000001',
      },
    },
    {
      id: 'SQT-4444-5555-6666',
      status: 'Completed',
      externalIds: {
        operations: 'US-SQU-0000002',
      },
    },
  ],
};

export const mockQuoteValid: ListItemNoImageWithExternalIds = {
  id: 'SQT-7839-0957-0317',
  status: 'Ready',
  externalIds: {
    operations: 'US-SQU-1668259',
  },
};

export const mockResponseValid: PaginatedResponse<ListItemNoImageWithExternalIds> = {
  $meta: {
    pagination: {
      offset: 0,
      limit: 10,
      total: 1,
    },
  },
  data: [mockQuoteValid],
};

export const mockSalesQuoteId1 = 'SQT-1234-7564';
export const mockSalesQuoteId2 = 'SQT-1234-7565';

export const mockSalesQuoteResponse1 = {
  id: mockSalesQuoteId1,
  name: 'Sales Quote One',
  status: 'Draft',
};

export const mockSalesQuoteResponse2 = {
  id: mockSalesQuoteId2,
  name: 'Sales Quote Two longer name',
  status: 'Completed',
};

export const expectedSalesQuoteUrl1 =
  `/v1/procurement/sales-quotes/${mockSalesQuoteId1}` +
  `?select=salesOrders,products,vendors,attributes.navision.navisionCountryCode`;

export const expectedSalesQuoteUrl2 =
  `/v1/procurement/sales-quotes/${mockSalesQuoteId2}` +
  `?select=salesOrders,products,vendors,attributes.navision.navisionCountryCode`;

export const mockSalesQuoteData = {
  id: mockSalesQuoteId1,
  name: 'Sales Quote for Microsoft Licenses',
  status: 'Completed',

  salesOrders: [
    {
      id: 'SOR-1234-5678',
      externalIds: {
        operations: 'US-SCO-1234567',
      },
    },
  ],

  vendors: [
    {
      id: 'VEN-1234-5678',
      name: 'Microsoft CSP Distributor',
      icon: '/v1/accounts/vendors/VEN-1234-5678/icon',
    },
  ],

  products: [
    {
      id: 'PRD-1111-2222',
      name: 'Microsoft 365 Business Premium',
      icon: '/v1/catalog/products/PRD-1111-2222/icon',
    },
    {
      id: 'PRD-3333-4444',
      name: 'Microsoft Azure Subscription',
      icon: '/v1/catalog/products/PRD-3333-4444/icon',
    },
  ],

  attributes: {
    navision: {
      navisionCountryCode: 'IE',
    },
  },

  total: {
    currency: 'EUR',
    amount: 2450.75,
  },

  audit: {
    created: {
      at: '2026-04-10T09:00:00Z',
      by: {
        id: 'USR-1111-2222',
        name: 'Jane Smith',
        icon: 'jane-smith-icon',
      },
    },

    updated: {
      at: '2026-04-15T15:30:00Z',
      by: {
        id: 'USR-3333-4444',
        name: 'Michael Brown',
        icon: 'michael-brown-icon',
      },
    },
  },
};
