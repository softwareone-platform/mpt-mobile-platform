export const mockSalesOrderId1 = 'SOR-1234-7564';
export const mockSalesOrderId2 = 'SOR-1234-7565';

export const mockSalesOrderResponse1 = {
  id: mockSalesOrderId1,
  name: 'Sales Order One',
  status: 'Draft',
};

export const mockSalesOrderResponse2 = {
  id: mockSalesOrderId2,
  name: 'Sales Order Two longer name',
  status: 'Completed',
};

export const expectedSalesOrderUrl1 = `/v1/procurement/sales-orders/${mockSalesOrderId1}?select=vendors,products`;

export const expectedSalesOrderUrl2 = `/v1/procurement/sales-orders/${mockSalesOrderId2}?select=vendors,products`;

export const mockSalesOrderData = {
  id: mockSalesOrderId1,
  name: 'Sales Order for Microsoft Licenses',
  status: 'Completed',

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
