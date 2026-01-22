export interface CreditMemo {
  id: string;
  documentNo: string;
  status: string;

  attributes?: Record<string, unknown>;
  erpData?: Record<string, unknown>;
  buyer?: Record<string, unknown>;
  seller?: Record<string, unknown>;
  price?: Record<string, unknown>;
  audit?: Record<string, unknown>;
}

export interface CreditMemoDetails {
  id: string;
  documentNo: string;
  status: string;

  postingDate: string;
  documentDate: string;

  buyerName: string;
  sellerName: string;
  sellerCountry?: string;

  totalAmount?: number;
  currency?: string;
  audit: unknown;
}

export interface Invoice {
  id: string;
  documentNo: string;
  status?: string;

  audit?: {
    created?: {
      at?: string;
    };
    updated?: {
      at?: string;
    };
  };
}
