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
  AccountDetailsScreen,
  UserDetailsScreen,
  BuyerDetailsScreen,
  SellerDetailsScreen,
} from '@/screens';
import type {
  MainTabItem,
  SecondaryTabGroup,
  SecondaryTabItem,
  AppScreenItem,
} from '@/types/navigation';

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

export const secondaryTabItems: SecondaryTabItem[] = secondaryTabsData.flatMap(
  (section) => section.items,
);

export const appScreensData: AppScreenItem[] = [
  { name: 'agreements', component: AgreementsScreen },
  { name: 'creditMemos', component: CreditMemosScreen },
  { name: 'invoices', component: InvoicesScreen },
  { name: 'statements', component: StatementsScreen },
  { name: 'users', component: UsersScreen },
  { name: 'programs', component: ProgramsScreen },
  { name: 'enrollments', component: EnrollmentsScreen },
  { name: 'licensees', component: LicenseesScreen },
  { name: 'buyers', component: BuyersScreen },
  { name: 'creditMemoDetails', component: CreditMemoDetailsScreen },
  { name: 'orderDetails', component: OrderDetailsScreen },
  { name: 'accountDetails', component: AccountDetailsScreen },
  { name: 'userDetails', component: UserDetailsScreen },
  { name: 'buyerDetails', component: BuyerDetailsScreen },
  { name: 'sellerDetails', component: SellerDetailsScreen },
];
