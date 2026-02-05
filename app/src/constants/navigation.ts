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
import type { MainTabItem, SecondaryTabGroup, AppScreenItem } from '@/types/navigation';

export const mainTabsData: MainTabItem[] = [
  { name: 'spotlight', icon: 'flare', component: SpotlightScreen, stackRootName: 'spotlightRoot' },
  { name: 'orders', icon: 'shopping-cart', component: OrdersScreen, stackRootName: 'ordersRoot' },
  {
    name: 'subscriptions',
    icon: 'subscriptions',
    component: SubscriptionsScreen,
    stackRootName: 'subscriptionsRoot',
  },
  { name: 'more', icon: 'more-horiz', stackRootName: 'moreRoot' },
];

export const secondaryTabsData: SecondaryTabGroup[] = [
  {
    title: 'administration',
    items: [
      { name: 'buyers', icon: 'shopping-cart-checkout', component: BuyersScreen },
      { name: 'users', icon: 'group', component: UsersScreen },
    ],
  },
  {
    title: 'billing',
    items: [
      { name: 'creditMemos', icon: 'credit-card', component: CreditMemosScreen },
      { name: 'invoices', icon: 'receipt-long', component: InvoicesScreen },
      { name: 'statements', icon: 'receipt', component: StatementsScreen },
    ],
  },
  {
    title: 'marketplace',
    items: [{ name: 'agreements', icon: 'fact-check', component: AgreementsScreen }],
  },
  {
    title: 'program',
    items: [
      { name: 'enrollments', icon: 'badge', component: EnrollmentsScreen },
      { name: 'programs', icon: 'redeem', component: ProgramsScreen },
    ],
  },
];

export const appScreensData: AppScreenItem[] = [
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
