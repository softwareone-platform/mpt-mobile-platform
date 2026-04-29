export const mockSellerId1 = 'SEL-1001';
export const mockSellerId2 = 'SEL-1002';
export const mockSellerListId1 = 'SEL-LIST-0001';
export const mockSellerListId2 = 'SEL-LIST-0002';
export const mockSellerListId3 = 'SEL-LIST-0003';
export const mockSellerListId4 = 'SEL-LIST-0004';

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

export const mockSellerListItem1 = {
  id: mockSellerListId1,
  name: 'Acme Seller One',
  status: 'Active',
  icon: '/v1/accounts/sellers/SEL-LIST-0001/icon',
};

export const mockSellerListItem2 = {
  id: mockSellerListId2,
  name: 'Beta Seller Two',
  status: 'Disabled',
  icon: '/v1/accounts/sellers/SEL-LIST-0002/icon',
};

export const mockSellerListItem3 = {
  id: mockSellerListId3,
  name: 'Gamma Seller Three',
  status: 'Offline',
  icon: '/v1/accounts/sellers/SEL-LIST-0003/icon',
};

export const mockSellerListItem4 = {
  id: mockSellerListId4,
  name: 'Delta Seller Four',
  status: 'Deleted',
  icon: '/v1/accounts/sellers/SEL-LIST-0004/icon',
};
