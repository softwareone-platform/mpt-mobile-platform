export const mockLicenseeId1 = 'LCE-123';

export const mockLicenseeId2 = 'LCE-234';

export const mockLicenseeData = {
  id: 'LCE-123',
  name: 'Test Licensee',
  status: 'Active',
  account: {
    id: 'ACC-0001',
  },
};

export const expectedUrl1 =
  `/v1/accounts/licensees/${mockLicenseeId1}` +
  `?select=audit.created.at,audit.created.by,audit.updated.at,seller,buyer.status`;

export const expectedUrl2 =
  `/v1/accounts/licensees/${mockLicenseeId2}` +
  `?select=audit.created.at,audit.created.by,audit.updated.at,seller,buyer.status`;

export const mockResponse1 = {
  id: 'LCE-123',
  name: 'Licensee One',
};

export const mockResponse2 = {
  id: 'LCE-234',
  name: 'Licensee Two',
};
