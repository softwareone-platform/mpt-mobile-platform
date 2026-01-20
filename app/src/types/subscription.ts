export interface Subscription {
  id: string;
  name: string;
  status?: string;

  agreement?: {
    id?: string;
    listing?: {
      priceList?: Record<string, unknown>;
    };
  };
  seller?: {
    address?: Record<string, unknown>;
  };
  audit?: {
    created?: {
      at?: string;
    };
    updated?: {
      at?: string;
    };
  };
}
