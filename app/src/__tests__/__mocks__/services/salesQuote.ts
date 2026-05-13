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
