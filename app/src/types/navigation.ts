import { ListItemWithStatusProps } from './lists';

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
  programs: undefined;
  enrollments: undefined;
  licensees: undefined;
  buyers: undefined;
};

export type AppScreensParamList = {
  creditMemoDetails: { headerProps: ListItemWithStatusProps };
  orderDetails: { headerProps: ListItemWithStatusProps };
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
  icon: string;
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
