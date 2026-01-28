export type DetailsFieldConfig = {
  value: string; // dot-path
  imagePath?: string; // dot-path
  id?: string; // dot-path
  navigateTo?: string; // screen name
};

export type DetailsConfig = {
  id: string;

  details?: Record<string, DetailsFieldConfig>;
  address?: Record<string, DetailsFieldConfig>;
  timestamps?: Record<string, DetailsFieldConfig>;
};

export const creditMemoDetailsConfig: DetailsConfig = {
  id: 'id',

  details: {
    documentNo: {
      value: 'documentNo',
    },
    currency: {
      value: 'erpData.currencyCode',
    },
    seller: {
      value: 'seller.name',
      imagePath: 'seller.icon',
      id: 'seller.id',
      navigateTo: 'sellerDetails',
    },
  },

  address: {
    billTo: {
      value: 'erpData.addresses.billTo.name',
    },
    shipTo: {
      value: 'erpData.addresses.shipTo.name',
    },
    country: {
      value: 'seller.address.country',
    },
  },

  timestamps: {
    createdAt: {
      value: 'audit.created.at',
    },
    updatedAt: {
      value: 'audit.updated.at',
    },
  },
};
