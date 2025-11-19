import type { NavigationProp, RouteProp } from '@react-navigation/native';

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
  statements: undefined;
  more: undefined;
  moreMenu: undefined;
};

export type ScreenComponent<
  ParamList extends Record<string, object | undefined>,
  RouteName extends keyof ParamList
> = React.ComponentType<{
  navigation: NavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
}>;

export type TabItem<RouteName extends keyof TabParamList = keyof TabParamList> = {
  name: RouteName;
  icon: string;
  component?: ScreenComponent<TabParamList, RouteName>;
};

export type ProfileStackParamList = {
  Profile: undefined;
  UserSettings: undefined;
};
