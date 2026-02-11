export const mockSellerId1 = 'SEL-1001';
export const mockSellerId2 = 'SEL-1002';

export const expectedSellerUrl1 =
  `/v1/accounts/sellers/${mockSellerId1}` +
  `?select=audit.created.at,audit.created.by,audit.updated.at,audit.updated.by`;

export const expectedSellerUrl2 =
  `/v1/accounts/sellers/${mockSellerId2}` +
  `?select=audit.created.at,audit.created.by,audit.updated.at,audit.updated.by`;

export const mockSellerData = {
  id: mockSellerId1,
  name: 'Acme Seller',
  status: 'Active',
};

export const mockSellerResponse1 = {
  id: mockSellerId1,
  name: 'Seller One',
};

export const mockSellerResponse2 = {
  id: mockSellerId2,
  name: 'Seller Two',
};

export const mockNetworkError = new Error('Network error');
