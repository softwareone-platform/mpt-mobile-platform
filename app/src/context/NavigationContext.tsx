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
  { name: 'Spotlight', label: 'Spotlight', icon: 'flare', component: SpotlightScreen },
  { name: 'Orders', label: 'Orders', icon: 'shopping-basket', component: OrdersScreen },
  { name: 'Subscriptions', label: 'Subscriptions', icon: 'sell', component: SubscriptionsScreen },
  { name: 'More', label: 'More', icon: 'more-horiz' },
];

const DEFAULT_SECONDARY_TABS: TabItem<keyof TabParamList>[] = [
  { name: 'Agreements', label: 'Agreements', icon: 'assignment', component: AgreementsScreen },
  { name: 'CreditMemos', label: 'Credit Memos', icon: 'description', component: CreditMemosScreen },
  { name: 'Invoices', label: 'Invoices', icon: 'receipt-long', component: InvoicesScreen },
  { name: 'Statements', label: 'Statements', icon: 'receipt', component: StatementsScreen },
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
