export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface UserAccount {
  id: string;
  name: string;
  type: string;
  icon?: string;
  invitation?: {
    status: string;
  };
}

export interface PaginatedUserAccounts {
  $meta: {
    pagination: { offset: number; limit: number; total: number };
    omitted: string[];
  };
  data: UserAccount[];
}

export interface SwitchAccountBody {
  currentAccount: {
    id: string;
  };
}

export interface UserData {
  id: string,
  name: string,
  icon?: string,
  avatar?: string,
  currentAccount?: {
    id?: string;
    name?: string;
    type?: string;
    icon?: string;
  }
  data?: { [key: string]: unknown }[];
}

export interface FullUserData {
  id: string;
  name?: string;
  email?: string;
  currentAccount?: {
    id?: string;
    name?: string;
    type?: string;
    icon?: string;
  };
  [key: string]: unknown;
}

export interface SpotlightItem {
  id: string;
  title: string;
  icon?: string;
  url?: string;
  description?: string;
  [key: string]: unknown;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  status?: string;
  buyerId?: string;
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  quantity?: number;
  [key: string]: unknown;
}
