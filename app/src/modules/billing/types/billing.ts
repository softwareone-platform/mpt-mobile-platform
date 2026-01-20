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
