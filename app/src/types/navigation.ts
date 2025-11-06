import type { NavigationProp, RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Main: undefined;
};

export type TabParamList = {
  Spotlight: undefined;
  Orders: undefined;
  Subscriptions: undefined;
  Agreements: undefined;
  Invoices: undefined;
  CreditMemos: undefined;
  Statements: undefined;
  More: undefined;
  MoreMenu: undefined
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
  label: string;
  icon: string;
  component?: ScreenComponent<TabParamList, RouteName>;
};
