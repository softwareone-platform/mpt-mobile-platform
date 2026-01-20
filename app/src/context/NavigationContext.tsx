import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import { SpotlightScreen } from '@/modules/home';
import { OrdersScreen, SubscriptionsScreen, AgreementsScreen } from '@/modules/marketplace';
import { InvoicesScreen, CreditMemosScreen, StatementsScreen } from '@/modules/billing';
import { UsersScreen } from '@/modules/settings';
import type { TabItem, MenuRouteName } from '@/types/navigation';

type NavigationDataContextType = {
  mainTabsData: TabItem<MenuRouteName>[];
  secondaryTabsData: TabItem<MenuRouteName>[];
  setMainTabsData: React.Dispatch<React.SetStateAction<TabItem<MenuRouteName>[]>>;
  setSecondaryTabsData: React.Dispatch<React.SetStateAction<TabItem<MenuRouteName>[]>>;
};

const NavigationDataContext = createContext<NavigationDataContextType | undefined>(undefined);

const DEFAULT_MAIN_TABS: TabItem<MenuRouteName>[] = [
  { name: 'spotlight', icon: 'flare', component: SpotlightScreen },
  { name: 'orders', icon: 'shopping-basket', component: OrdersScreen },
  { name: 'subscriptions', icon: 'sell', component: SubscriptionsScreen },
  { name: 'more', icon: 'more-horiz' },
];

const DEFAULT_SECONDARY_TABS: TabItem<MenuRouteName>[] = [
  { name: 'agreements', icon: 'assignment', component: AgreementsScreen },
  { name: 'creditMemos', icon: 'description', component: CreditMemosScreen },
  { name: 'invoices', icon: 'receipt-long', component: InvoicesScreen },
  { name: 'statements', icon: 'receipt', component: StatementsScreen },
  { name: 'users', icon: 'how-to-reg', component: UsersScreen },
];

export const NavigationDataProvider = ({ children }: { children: ReactNode }) => {
  const [mainTabsData, setMainTabsData] = useState<TabItem<MenuRouteName>[]>(DEFAULT_MAIN_TABS);
  const [secondaryTabsData, setSecondaryTabsData] =
    useState<TabItem<MenuRouteName>[]>(DEFAULT_SECONDARY_TABS);

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
