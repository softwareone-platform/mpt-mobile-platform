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
  revision: number;
  countryCode: string;
  documentNo: string;
  status: 'Issued' | 'Draft' | string;

  attributes: {
    postingDate: string;
    documentDate: string;
    externalDocumentNo?: string;
    externalDocumentNo2?: string;
    yourReference?: string;
  };

  erpData: {
    addresses: {
      billTo?: unknown;
      licenseTo?: unknown;
      sellTo?: unknown;
      shipTo?: unknown;
    };
    appliesToDocNo?: string;
    currencyCode: string;
    documentDate: string;
    documentNo: string;
    externalDocumentNo?: string;
    externalDocumentNo2?: string;
    insideSalesCode?: string;
    navisionCountryCode: string;
    postingDate: string;
    responsibilityCenterCode?: string;
    salesPersonCode?: string;
    shipmentMethodCode?: string;
    vatRegistrationNo?: string;
    yourReference?: string;
  };

  buyer: {
    id: string;
    name: string;
    revision: number;
  };

  seller: {
    id: string;
    name: string;
    icon?: string;
    revision: number;
    externalId?: string;
    address?: {
      country?: string;
    };
  };

  lines: unknown[];

  price: unknown;

  analytics?: {
    status?: string;
  };

  audit: unknown;
}
