export const mockInvoiceId1 = 'INV-123';

export const mockInvoiceId2 = 'INV-234';

export const mockInvoiceData = {
  id: 'INV-123',
  name: 'Test Invoice',
  status: 'Issued',
};

export const expectedUrl1 =
  `/v1/billing/invoices/${mockInvoiceId1}` +
  `?select=seller.address.country,statement,statement.ledger.owner,audit`;
export const expectedUrl2 =
  `/v1/billing/invoices/${mockInvoiceId2}` +
  `?select=seller.address.country,statement,statement.ledger.owner,audit`;

export const mockResponse1 = {
  id: 'INV-123',
  name: 'Invoice One',
};

export const mockResponse2 = {
  id: 'INV-234',
  name: 'Invoice Two',
};
