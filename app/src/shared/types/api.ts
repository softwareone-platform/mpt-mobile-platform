export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface PaginationMeta {
  offset: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  $meta: {
    pagination: PaginationMeta;
  };
  data: T[];
}

export interface UserAccount {
  id: string;
  name: string;
  type: string;
  icon?: string;
  invitation?: {
    status: string;
  };
  favorite?: boolean;
  audit?: {
    access: {
      at: string;
    };
  };
}

export interface User {
  id: string;
  name: string;
  status?: string;
  icon?: string;
  email?: string;
  accounts?: UserAccount[];
  audit?: {
    created?: {
      at?: string;
    };
    updated?: {
      at?: string;
    };
  };
  [key: string]: unknown;
}
