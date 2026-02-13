export const mockAgreementId1 = 'AGR-123';

export const mockAgreementId2 = 'AGR-234';

export const mockAgreementData = {
  id: 'AGR-123',
  name: 'Test Agreement',
  status: 'Active',
};

export const expectedUrl1 =
  `/v1/commerce/agreements/${mockAgreementId1}` +
  `?select=+listing,product,audit,licensee,buyer,seller,certificates,-subscriptions,-lines,termsAndConditions,termsAndConditions.acceptedBy`;

export const expectedUrl2 =
  `/v1/commerce/agreements/${mockAgreementId2}` +
  `?select=+listing,product,audit,licensee,buyer,seller,certificates,-subscriptions,-lines,termsAndConditions,termsAndConditions.acceptedBy`;

export const mockResponse1 = {
  id: 'AGR-123',
  name: 'Agreement One',
};

export const mockResponse2 = {
  id: 'AGR-234',
  name: 'Agreement Two',
};

export const mockNetworkError = new Error('Network error');
