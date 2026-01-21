export interface Agreement {
  id: string;
  name: string;
  status?: string;

  externalIds?: {
    client?: string;
  };
  product?: Record<string, unknown>;
  audit?: {
    created?: {
      at?: string;
    };
    updated?: {
      at?: string;
    };
  };
  seller?: {
    address?: Record<string, unknown>;
  };
  listing?: Record<string, unknown>;
  licensee?: {
    eligibility?: Record<string, unknown>;
  };
}
