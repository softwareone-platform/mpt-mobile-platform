export interface UserAccount {
  id: string;
  name: string;
  type: string;
  icon?: string;
  invitation?: {
    status: string;
  };
}

export interface SwitchAccountBody {
  currentAccount: {
    id: string;
  };
}

export interface UserData {
  currentAccount?: {
    icon?: string;
  };
}

export interface FullUserData {
  id?: string;
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
