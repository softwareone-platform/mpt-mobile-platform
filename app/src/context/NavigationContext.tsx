import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { TabItem, TabParamList } from '@/types/navigation';
import {
  SpotlightScreen,
  OrdersScreen,
  SubscriptionsScreen,
  AgreementsScreen,
  InvoicesScreen,
  CreditMemosScreen,
  StatementsScreen,
} from '@/screens';

type NavigationDataContextType = {
  mainTabsData: TabItem<keyof TabParamList>[];
  secondaryTabsData: TabItem<keyof TabParamList>[];
  setMainTabsData: React.Dispatch<
    React.SetStateAction<TabItem<keyof TabParamList>[]>
  >;
  setSecondaryTabsData: React.Dispatch<
    React.SetStateAction<TabItem<keyof TabParamList>[]>
  >;
};

const NavigationDataContext = createContext<NavigationDataContextType | undefined>(undefined);

const DEFAULT_MAIN_TABS: TabItem<keyof TabParamList>[] = [
  { name: 'spotlight', icon: 'flare', component: SpotlightScreen },
  { name: 'orders', icon: 'shopping-basket', component: OrdersScreen },
  { name: 'subscriptions', icon: 'sell', component: SubscriptionsScreen },
  { name: 'more', icon: 'more-horiz' },
];

const DEFAULT_SECONDARY_TABS: TabItem<keyof TabParamList>[] = [
  { name: 'agreements', icon: 'assignment', component: AgreementsScreen },
  { name: 'creditMemos', icon: 'description', component: CreditMemosScreen },
  { name: 'invoices', icon: 'receipt-long', component: InvoicesScreen },
  { name: 'statements', icon: 'receipt', component: StatementsScreen },
];

export const NavigationDataProvider = ({ children }: { children: ReactNode }) => {
  const [mainTabsData, setMainTabsData] = useState<
    TabItem<keyof TabParamList>[]
  >(DEFAULT_MAIN_TABS);
  const [secondaryTabsData, setSecondaryTabsData] = useState<
    TabItem<keyof TabParamList>[]
  >(DEFAULT_SECONDARY_TABS);

  return (
    <NavigationDataContext.Provider
      value={{ mainTabsData, secondaryTabsData, setMainTabsData, setSecondaryTabsData }}
    >
      {children}
    </NavigationDataContext.Provider>
  );
};

export const useNavigationData = () => {
  const context = useContext(NavigationDataContext);
  if (!context) throw new Error('useNavigationData must be used within NavigationDataProvider');
  return context;
};
