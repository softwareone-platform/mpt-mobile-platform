import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import {
  SpotlightScreen,
  OrdersScreen,
  SubscriptionsScreen,
  AgreementsScreen,
  InvoicesScreen,
  CreditMemosScreen,
  StatementsScreen,
  UsersScreen,
  ProgramsScreen,
  EnrollmentsScreen,
  LicenseesScreen,
  BuyersScreen,
  CreditMemoDetailsScreen,
  OrderDetailsScreen,
} from '@/screens';
import type { MainTabItem, SecondaryTabItem, AppScreenItem } from '@/types/navigation';

type NavigationDataContextType = {
  mainTabsData: MainTabItem[];
  secondaryTabsData: SecondaryTabItem[];
  setMainTabsData: React.Dispatch<React.SetStateAction<MainTabItem[]>>;
  setSecondaryTabsData: React.Dispatch<React.SetStateAction<SecondaryTabItem[]>>;
  appScreensData: AppScreenItem[];
  setAppScreensData: React.Dispatch<React.SetStateAction<AppScreenItem[]>>;
};

const NavigationDataContext = createContext<NavigationDataContextType | undefined>(undefined);

const DEFAULT_MAIN_TABS: MainTabItem[] = [
  { name: 'spotlight', icon: 'flare', component: SpotlightScreen, stackRootName: 'spotlightRoot' },
  { name: 'orders', icon: 'shopping-basket', component: OrdersScreen, stackRootName: 'ordersRoot' },
  {
    name: 'subscriptions',
    icon: 'sell',
    component: SubscriptionsScreen,
    stackRootName: 'subscriptionsRoot',
  },
  { name: 'more', icon: 'more-horiz', stackRootName: 'moreRoot' },
];

const DEFAULT_SECONDARY_TABS: SecondaryTabItem[] = [
  { name: 'agreements', icon: 'assignment', component: AgreementsScreen },
  { name: 'creditMemos', icon: 'description', component: CreditMemosScreen },
  { name: 'invoices', icon: 'receipt-long', component: InvoicesScreen },
  { name: 'statements', icon: 'receipt', component: StatementsScreen },
  { name: 'users', icon: 'how-to-reg', component: UsersScreen },
  { name: 'programs', icon: 'assignment', component: ProgramsScreen },
  { name: 'enrollments', icon: 'receipt-long', component: EnrollmentsScreen },
  { name: 'licensees', icon: 'how-to-reg', component: LicenseesScreen },
  { name: 'buyers', icon: 'assignment', component: BuyersScreen },
];

const APP_SCREENS: AppScreenItem[] = [
  { name: 'agreements', icon: 'assignment', component: AgreementsScreen },
  { name: 'creditMemos', icon: 'description', component: CreditMemosScreen },
  { name: 'invoices', icon: 'receipt-long', component: InvoicesScreen },
  { name: 'statements', icon: 'receipt', component: StatementsScreen },
  { name: 'users', icon: 'how-to-reg', component: UsersScreen },
  { name: 'programs', icon: 'assignment', component: ProgramsScreen },
  { name: 'enrollments', icon: 'receipt-long', component: EnrollmentsScreen },
  { name: 'licensees', icon: 'how-to-reg', component: LicenseesScreen },
  { name: 'buyers', icon: 'assignment', component: BuyersScreen },
  { name: 'creditMemoDetails', icon: 'assignment', component: CreditMemoDetailsScreen },
  { name: 'orderDetails', icon: 'assignment', component: OrderDetailsScreen },
];

export const NavigationDataProvider = ({ children }: { children: ReactNode }) => {
  const [mainTabsData, setMainTabsData] = useState<MainTabItem[]>(DEFAULT_MAIN_TABS);
  const [secondaryTabsData, setSecondaryTabsData] =
    useState<SecondaryTabItem[]>(DEFAULT_SECONDARY_TABS);
  const [appScreensData, setAppScreensData] = useState<AppScreenItem[]>(APP_SCREENS);

  return (
    <NavigationDataContext.Provider
      value={{
        mainTabsData,
        secondaryTabsData,
        setMainTabsData,
        setSecondaryTabsData,
        appScreensData,
        setAppScreensData,
      }}
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
