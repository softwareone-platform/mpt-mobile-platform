export const mockStatementId1 = 'SOM-123';

export const mockStatementId2 = 'SOM-234';

export const mockStatementData = {
  id: 'SOM-123',
  name: 'Test Statement',
  status: 'Cancelled',
};

export const expectedStatementUrl1 = `/v1/billing/statements/${mockStatementId1}?select=seller.address.country,audit,ledger.owner`;
export const expectedStatementUrl2 = `/v1/billing/statements/${mockStatementId2}?select=seller.address.country,audit,ledger.owner`;

export const mockStatementResponse1 = {
  id: 'SOM-123',
  type: 'Debit',
};

export const mockStatementResponse2 = {
  id: 'SOM-234',
  type: 'Credit',
};
