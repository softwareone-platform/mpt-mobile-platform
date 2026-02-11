export const mockBuyerId1 = 'BUY-123';

export const mockBuyerId2 = 'BUY-234';

export const mockBuyerData = {
  id: 'BUY-1234-5678',
  name: 'Enterprise Buyer Corp',
  status: 'Active',
  account: {
    id: 'ACC-0001',
  },
};

export const expectedUrl1 =
  `/v1/accounts/buyers/${mockBuyerId1}` +
  `?select=audit.created.at,audit.created.by,audit.updated.at,sellers,account,account.groups`;

export const expectedUrl2 =
  `/v1/accounts/buyers/${mockBuyerId2}` +
  `?select=audit.created.at,audit.created.by,audit.updated.at,sellers,account,account.groups`;

export const mockResponse1 = {
  id: 'BUY-123',
  name: 'Buyer One',
};

export const mockResponse2 = {
  id: 'BUY-234',
  name: 'Buyer Two',
};

export const mockNetworkError = new Error('Network error');
