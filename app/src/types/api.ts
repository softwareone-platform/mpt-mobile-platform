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
  favorite?: boolean;
  audit?: {
    access: {
      at: string;
    };
  };
}

export interface PaginatedUserAccounts {
  $meta: {
    pagination: { offset: number; limit: number; total: number };
    omitted: string[];
  };
  data: UserAccount[];
}

export interface FormattedUserAccounts {
  all: UserAccount[];
  favourites: UserAccount[];
  recent: UserAccount[];
}

export interface SwitchAccountBody {
  currentAccount: {
    id: string;
  };
}

export interface UserData {
  id: string;
  name: string;
  icon?: string;
  avatar?: string;
  email?: string;
  phone?: {
    prefix?: string;
    number?: string;
  };
  firstName?: string;
  lastName?: string;
  currentAccount?: {
    id?: string;
    name?: string;
    type?: string;
    icon?: string;
  };
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
  total: number;
  top: SpotlightTopItem[];
  query?: {
    id: string;
    name: string;
    template?: string;
  };
}

export interface SpotlightTopItem {
  id: string;
  name?: string;
  documentNo?: string;
  icon?: string;
  program?: {
    id?: string;
    name: string;
    icon: string;
  };
  product?: {
    id?: string;
    name: string;
    icon: string;
  };
  buyer?: {
    id?: string;
    name: string;
    icon: string;
    account: {
      id: string;
      type: string;
    };
  };
  user?: {
    id?: string;
    name: string;
    icon: string;
  };
}

export interface SpotlightData {
  $meta: {
    pagination: { offset: number; limit: number; total: number };
    omitted: string[];
  };
  data: SpotlightItem[];
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

export interface ListItemFull {
  id: string;
  name: string;
  status?: string;
  icon?: string;
}

export interface ListItemNoImageNoSubtitle {
  id: string;
  status?: string;
}

export interface AccountDetails {
  id: string;
  name: string;
  icon?: string;
  externalIds?: { pyraTenantId: string };
  serviceLevel?: string;
  address?: Address;
  technicalSupportEmail?: string;
  website?: string;
  description?: string;
  type: string;
  status: string;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
}
