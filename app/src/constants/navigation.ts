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
  ProductsScreen,
  CreditMemoDetailsScreen,
  OrderDetailsScreen,
  AccountDetailsScreen,
  UserDetailsScreen,
  BuyerDetailsScreen,
  SellerDetailsScreen,
  AgreementDetailsScreen,
  LicenseeDetailsScreen,
  SubscriptionDetailsScreen,
  InvoiceDetailsScreen,
  StatementDetailsScreen,
  ProductDetailsScreen,
  ProgramDetailsScreen,
  EnrollmentDetailsScreen,
  CertificateDetailsScreen,
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
      {
        name: 'allBuyers',
        icon: 'shopping-cart-checkout',
        component: BuyersScreen,
        modules: ['platform-account-management'],
        roles: ['Operations'],
      },
      {
        name: 'allUsers',
        icon: 'group',
        component: UsersScreen,
        modules: ['platform-account-management'],
        roles: ['Operations'],
      },
    ],
  },
  {
    title: 'billing',
    items: [
      {
        name: 'creditMemos',
        icon: 'credit-card',
        component: CreditMemosScreen,
        modules: ['billing'],
        roles: ['Client', 'Operations'],
      },
      {
        name: 'invoices',
        icon: 'receipt-long',
        component: InvoicesScreen,
        modules: ['billing'],
        roles: ['Client', 'Operations'],
      },
      {
        name: 'statements',
        icon: 'receipt',
        component: StatementsScreen,
        modules: ['billing'],
        roles: ['Client', 'Operations'],
      },
    ],
  },
  {
    title: 'catalog',
    items: [
      {
        name: 'products',
        icon: 'inventory-2',
        component: ProductsScreen,
        modules: ['catalog-management'],
        roles: ['Vendor', 'Operations'],
      },
      {
        name: 'clientProducts',
        icon: 'inventory-2',
        component: ProductsScreen,
        modules: ['new-marketplace'],
        roles: ['Client'],
      },
    ],
  },
  {
    title: 'marketplace',
    items: [
      {
        name: 'agreements',
        icon: 'fact-check',
        component: AgreementsScreen,
        modules: ['new-marketplace'],
        roles: ['Client', 'Vendor', 'Operations'],
      },
    ],
  },
  {
    title: 'program',
    items: [
      {
        name: 'enrollments',
        icon: 'badge',
        component: EnrollmentsScreen,
        modules: ['new-marketplace'],
        roles: ['Client', 'Vendor', 'Operations'],
      },
      {
        name: 'programs',
        icon: 'redeem',
        component: ProgramsScreen,
        modules: ['new-marketplace'],
        roles: ['Client', 'Vendor', 'Operations'],
      },
    ],
  },
  {
    title: 'settings',
    items: [
      {
        name: 'buyers',
        icon: 'shopping-cart-checkout',
        component: BuyersScreen,
        modules: ['account-management'],
        roles: ['Client'],
      },
      {
        name: 'users',
        icon: 'group',
        component: UsersScreen,
        modules: ['access-management'],
        roles: ['Client', 'Vendor', 'Operations'],
      },
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
  { name: 'allUsers', component: UsersScreen },
  { name: 'programs', component: ProgramsScreen },
  { name: 'enrollments', component: EnrollmentsScreen },
  { name: 'licensees', component: LicenseesScreen },
  { name: 'buyers', component: BuyersScreen },
  { name: 'allBuyers', component: BuyersScreen },
  { name: 'products', component: ProductsScreen },
  { name: 'clientProducts', component: ProductsScreen },
  { name: 'creditMemoDetails', component: CreditMemoDetailsScreen },
  { name: 'orderDetails', component: OrderDetailsScreen },
  { name: 'accountDetails', component: AccountDetailsScreen },
  { name: 'userDetails', component: UserDetailsScreen },
  { name: 'buyerDetails', component: BuyerDetailsScreen },
  { name: 'sellerDetails', component: SellerDetailsScreen },
  { name: 'agreementDetails', component: AgreementDetailsScreen },
  { name: 'licenseeDetails', component: LicenseeDetailsScreen },
  { name: 'subscriptionDetails', component: SubscriptionDetailsScreen },
  { name: 'invoiceDetails', component: InvoiceDetailsScreen },
  { name: 'statementDetails', component: StatementDetailsScreen },
  { name: 'productDetails', component: ProductDetailsScreen },
  { name: 'programDetails', component: ProgramDetailsScreen },
  { name: 'enrollmentDetails', component: EnrollmentDetailsScreen },
  { name: 'certificateDetails', component: CertificateDetailsScreen },
];
