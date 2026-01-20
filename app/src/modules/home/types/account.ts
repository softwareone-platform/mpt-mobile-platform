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
