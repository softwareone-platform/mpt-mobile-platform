import { AccountType } from '@/types/common';
import { ModuleName } from '@/types/modules';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileRoot: undefined;
} & MainTabsParamList &
  SecondaryTabsParamList &
  AppScreensParamList;

export type MainTabsParamList = {
  spotlight: undefined;
  orders: undefined;
  subscriptions: undefined;
  more: undefined;
};

export type SecondaryTabsParamList = {
  agreements: undefined;
  invoices: undefined;
  creditMemos: undefined;
  statements: undefined;
  users: undefined;
  allUsers: undefined;
  programs: undefined;
  enrollments: undefined;
  licensees: undefined;
  buyers: undefined;
  allBuyers: undefined;
  products: undefined;
};

export type AppScreensParamList = {
  creditMemoDetails: { id: string };
  orderDetails: { id: string };
  accountDetails: { id: string | undefined; type: 'client' | 'vendor' | 'operations' | 'account' };
  userDetails: { id: string | undefined };
  buyerDetails: { id: string | undefined };
  sellerDetails: { id: string | undefined };
  agreementDetails: { id: string | undefined };
  licenseeDetails: { id: string | undefined };
  subscriptionDetails: { id: string | undefined };
  invoiceDetails: { id: string | undefined };
  statementDetails: { id: string | undefined };
  productDetails: { id: string | undefined };
  programDetails: { id: string | undefined };
  enrollmentDetails: { id: string | undefined };
  certificateDetails: { id: string | undefined };
};

export type MainTabRouteName = keyof MainTabsParamList;

export type SecondaryTabRouteName = keyof SecondaryTabsParamList;

export type AuthStackParamList = {
  Welcome: undefined;
  OTPVerification: { email: string };
};

export type AppScreenRouteName = keyof RootStackParamList;

export type StackRootName = 'spotlightRoot' | 'ordersRoot' | 'subscriptionsRoot' | 'moreRoot';

export type MainTabItem = {
  name: MainTabRouteName;
  icon: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component?: React.ComponentType<any>;
  stackRootName: StackRootName;
};

export type SecondaryTabItem = {
  name: keyof SecondaryTabsParamList;
  icon: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component?: React.ComponentType<any>;
  modules?: ModuleName[];
  roles?: AccountType[];
};

export type SecondaryTabGroupTitle =
  | 'administration'
  | 'billing'
  | 'catalog'
  | 'helpdesk'
  | 'marketplace'
  | 'program'
  | 'settings';

export type SecondaryTabGroup = {
  title: SecondaryTabGroupTitle;
  items: SecondaryTabItem[];
};

export type AppScreenItem = {
  name: keyof AppScreensParamList | keyof SecondaryTabsParamList;
  icon?: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component?: React.ComponentType<any>;
};

export type ProfileStackParamList = {
  profile: undefined;
  userSettings: {
    id: string;
    name: string;
    icon: string | undefined;
  };
  personalInformation: undefined;
  regionalSettings: undefined;
  security: undefined;
  notificationSettings: undefined;
  emailSettings: undefined;
};

export interface NavigationPermission {
  modules: ModuleName[];
  roles?: AccountType[];
}

export type NavigationMapper = Record<string, NavigationPermission>;
