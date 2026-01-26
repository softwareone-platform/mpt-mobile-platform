import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { ComponentType } from 'react';

import { ListItemWithStatusProps } from './lists';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileRoot: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  OTPVerification: { email: string };
};

export type TabParamList = {
  spotlight: undefined;
  orders: undefined;
  subscriptions: undefined;
  agreements: undefined;
  invoices: undefined;
  creditMemos: undefined;
  creditMemoDetails: {
    headerProps: ListItemWithStatusProps;
  };
  statements: undefined;
  users: undefined;
  programs: undefined;
  more: undefined;
  moreMenu: undefined;
  ProfileRoot: undefined;
};

export type MenuRouteName = {
  [K in keyof TabParamList]: TabParamList[K] extends undefined ? K : never;
}[keyof TabParamList];

export type ScreenComponent<
  ParamList extends Record<string, object | undefined>,
  RouteName extends keyof ParamList,
> = React.ComponentType<{
  navigation: NavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
}>;

export type TabItem<RouteName extends keyof TabParamList = keyof TabParamList> = {
  name: RouteName;
  icon: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component?: ComponentType<any>;
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
