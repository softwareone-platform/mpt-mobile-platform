export const mockProductId1 = 'PRD-7208-0459';
export const mockProductId2 = 'PRD-1234-5678';

export const expectedProductUrl1 = `/v1/catalog/products/${mockProductId1}`;

export const expectedProductUrl2 = `/v1/catalog/products/${mockProductId2}`;

export const mockProductData = {
  id: mockProductId1,
  name: 'SoftwareOne FinOps for Cloud',
  icon: '/v1/catalog/products/PRD-7208-0459/icon',
  shortDescription:
    'SoftwareOne FinOps for Cloud helps businesses optimize cloud spending by providing real-time insights, budget tracking, and cost management.',
  vendor: {
    id: 'ACC-3805-2089',
    name: 'SoftwareOne Vendor',
    icon: '/v1/accounts/accounts/ACC-3805-2089/icon',
  },
  status: 'Published',
};

export const mockProductResponse1 = {
  id: mockProductId1,
  name: 'SoftwareOne FinOps for Cloud',
  vendor: {
    id: 'ACC-3805-2089',
    name: 'SoftwareOne Vendor',
  },
  status: 'Published',
};

export const mockProductResponse2 = {
  id: mockProductId2,
  name: 'Test Product',
  vendor: {
    id: 'ACC-1111-2222',
    name: 'Test Vendor',
  },
  status: 'Draft',
};

// List item mocks for getProducts
export const mockProductListItem1 = {
  id: mockProductId1,
  name: 'SoftwareOne FinOps for Cloud',
  icon: '/v1/catalog/products/PRD-7208-0459/icon',
  status: 'Published',
};

export const mockProductListItem2 = {
  id: mockProductId2,
  name: 'Test Product',
  icon: '/v1/catalog/products/PRD-1234-5678/icon',
  status: 'Published',
};

export const mockProductListItem3 = {
  id: "PRD-1234-5673",
  name: 'Amazon Web Services',
  icon: '/v1/catalog/products/PRD-1234-5673/icon',
  status: 'Published',
};

export const mockProductListItem4 = {
  id: "PRD-1234-5674",
  name: 'Microsoft Azure',
  icon: '/v1/catalog/products/PRD-1234-5674/icon',
  status: 'Published',
};
