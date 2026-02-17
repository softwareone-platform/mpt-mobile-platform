export const mockSubscriptionId1 = 'SUB-123';

export const mockSubscriptionId2 = 'SUB-234';

export const mockSubscriptionData = {
  id: 'SUB-123',
  name: 'Test Subscription',
  status: 'Active',
};

export const expectedUrl1 =
  `/v1/commerce/subscriptions/${mockSubscriptionId1}` +
  `?select=-agreement.subscriptions,-agreement.parameters,-agreement.lines,agreement,` +
  `lines,lines.item.terms,lines.item.unit,lines.item.quantityNotApplicable,` +
  `agreement.listing.priceList,licensee,buyer,seller,audit,split.allocations,` +
  `product.settings.splitBilling,product.settings.subscriptionCessation`;

export const expectedUrl2 =
  `/v1/commerce/subscriptions/${mockSubscriptionId2}` +
  `?select=-agreement.subscriptions,-agreement.parameters,-agreement.lines,agreement,` +
  `lines,lines.item.terms,lines.item.unit,lines.item.quantityNotApplicable,` +
  `agreement.listing.priceList,licensee,buyer,seller,audit,split.allocations,` +
  `product.settings.splitBilling,product.settings.subscriptionCessation`;

export const mockResponse1 = {
  id: 'SUB-123',
  name: 'Subscription One',
};

export const mockResponse2 = {
  id: 'SUB-234',
  name: 'Subscription Two',
};
