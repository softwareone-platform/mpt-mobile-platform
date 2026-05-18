type TestIDSuffix =
  | 'button'
  | 'input'
  | 'text'
  | 'label'
  | 'icon'
  | 'tab'
  | 'item'
  | 'container'
  | 'image'
  | 'link';

// Generates a consistent testID string.
export function testID(
  screen: string,
  element: string,
  suffix: TestIDSuffix,
  variant?: string | number,
): string {
  const parts = [screen, element, suffix];
  if (variant !== undefined) {
    parts.push(String(variant));
  }
  return parts.join('-');
}

// Generates testID for list items with dynamic IDs.
export function listItemTestID(context: string, id: string | number): string {
  return `${context}-item-${id}`;
}

export const TestIDs = {
  // Welcome Screen
  WELCOME_EMAIL_INPUT: 'welcome-email-input',
  WELCOME_EMAIL_ERROR: 'welcome-email-error',
  WELCOME_CONTINUE_BUTTON: 'welcome-continue-button',
  WELCOME_TROUBLE_LINK: 'welcome-trouble-link',
  WELCOME_TITLE: 'welcome-title-text',
  WELCOME_SUBTITLE: 'welcome-subtitle-text',
  WELCOME_LOGO: 'welcome-logo-image',

  // OTP Verification Screen
  OTP_TITLE: 'otp-title-text',
  OTP_MESSAGE: 'otp-message-text',
  OTP_INPUT_PREFIX: 'otp-digit-input',
  OTP_VERIFY_BUTTON: 'otp-verify-button',
  OTP_CHANGE_EMAIL_BUTTON: 'otp-change-email-button',
  OTP_RESEND_BUTTON: 'otp-resend-button',
  OTP_ERROR: 'otp-error-text',

  // Navigation
  NAV_TAB_SPOTLIGHT: 'nav-tab-spotlight',
  NAV_TAB_ORDERS: 'nav-tab-orders',
  NAV_TAB_SUBSCRIPTIONS: 'nav-tab-subscriptions',
  NAV_TAB_MORE: 'nav-tab-more',
  NAV_ACCOUNT_BUTTON: 'nav-account-button',
  NAV_ACCOUNT_USER_ID: 'nav-account-user-id',
  NAV_MENU_ITEM_PREFIX: 'nav-menu',
  NAV_TAB_PREFIX: 'nav-tab',

  // Profile Screen
  PROFILE_SECTION_YOUR_PROFILE: 'profile-section-yourprofile-text',
  PROFILE_SECTION_SWITCH_ACCOUNT: 'profile-section-switchaccount-text',
  PROFILE_USER_ITEM: 'profile-user-item',
  PROFILE_ACCOUNT_ITEM_PREFIX: 'profile-account-item',
  PROFILE_ACCOUNT_TABS: 'profile-account-tabs',
  PROFILE_TAB_PREFIX: 'profile-tab',

  // Personal Information Screen
  PERSONAL_INFO_LOADING_INDICATOR: 'personal-info-loading-indicator',
  PERSONAL_INFO_ERROR_STATE: 'personal-info-error-state',
  PERSONAL_INFO_EMPTY_STATE: 'personal-info-empty-state',

  // Spotlight Screen
  SPOTLIGHT_LOGOUT_BUTTON: 'spotlight-logout-button',
  SPOTLIGHT_LOADING_INDICATOR: 'spotlight-loading-indicator',
  SPOTLIGHT_ERROR_STATE: 'spotlight-error-state',
  SPOTLIGHT_EMPTY_STATE: 'spotlight-empty-state',
  SPOTLIGHT_FILTER_PREFIX: 'spotlight-filter',
  SPOTLIGHT_CARD_PREFIX: 'spotlight-card',
  SPOTLIGHT_CARD_HEADER_PREFIX: 'spotlight-card-header',
  SPOTLIGHT_CARD_FOOTER_PREFIX: 'spotlight-card-footer',
  SPOTLIGHT_ITEM_PREFIX: 'spotlight-item',

  // Agreements Screen
  AGREEMENTS_LOADING_INDICATOR: 'agreements-loading-indicator',
  AGREEMENTS_ERROR_STATE: 'agreements-error-state',
  AGREEMENTS_EMPTY_STATE: 'agreements-empty-state',

  // Agreement Details Screen
  AGREEMENT_DETAILS_LOADING_INDICATOR: 'agreement-details-loading-indicator',
  AGREEMENT_DETAILS_ERROR_STATE: 'agreement-details-error-state',
  AGREEMENT_DETAILS_EMPTY_STATE: 'agreement-details-empty-state',
  AGREEMENT_DETAILS_HEADER_TITLE: 'agreement-details-header-title',
  AGREEMENT_DETAILS_HEADER_STATUS: 'agreement-details-header-status',

  // Common
  HEADER_LOGO: 'header-logo-image',
  LOADING_INDICATOR: 'loading-indicator',
  DETAILS_HEADER_AVATAR_CONTAINER: 'details-header-avatar-container',

  // Credit Memos Screen
  CREDIT_MEMOS_LOADING_INDICATOR: 'credit-memos-loading-indicator',
  CREDIT_MEMOS_ERROR_STATE: 'credit-memos-error-state',
  CREDIT_MEMOS_EMPTY_STATE: 'credit-memos-empty-state',

  // Credit Memo Details Screen
  CREDIT_MEMO_DETAILS_LOADING_INDICATOR: 'credit-memo-details-loading-indicator',
  CREDIT_MEMO_DETAILS_ERROR_STATE: 'credit-memo-details-error-state',
  CREDIT_MEMO_DETAILS_EMPTY_STATE: 'credit-memo-details-empty-state',
  CREDIT_MEMO_DETAILS_HEADER_TITLE: 'credit-memo-details-header-title',
  CREDIT_MEMO_DETAILS_HEADER_STATUS: 'credit-memo-details-header-status',

  // Journals Screen
  JOURNALS_LOADING_INDICATOR: 'journals-loading-indicator',
  JOURNALS_ERROR_STATE: 'journals-error-state',
  JOURNALS_EMPTY_STATE: 'journals-empty-state',

  // Journal Details Screen
  JOURNAL_DETAILS_LOADING_INDICATOR: 'journal-details-loading-indicator',
  JOURNAL_DETAILS_ERROR_STATE: 'journal-details-error-state',
  JOURNAL_DETAILS_EMPTY_STATE: 'journal-details-empty-state',
  JOURNAL_DETAILS_HEADER_TITLE: 'journal-details-header-title',
  JOURNAL_DETAILS_HEADER_STATUS: 'journal-details-header-status',

  // Users Screen
  USERS_LOADING_INDICATOR: 'users-loading-indicator',
  USERS_ERROR_STATE: 'users-error-state',
  USERS_EMPTY_STATE: 'users-empty-state',

  // User Details Screen
  USER_DETAILS_LOADING_INDICATOR: 'user-details-loading-indicator',
  USER_DETAILS_ERROR_STATE: 'user-details-error-state',
  USER_DETAILS_EMPTY_STATE: 'user-details-empty-state',
  USER_DETAILS_HEADER_TITLE: 'user-details-header-title',
  USER_DETAILS_HEADER_STATUS: 'user-details-header-status',

  // Orders Screen
  ORDERS_LOADING_INDICATOR: 'orders-loading-indicator',
  ORDERS_ERROR_STATE: 'orders-error-state',
  ORDERS_EMPTY_STATE: 'orders-empty-state',

  // Order Details Screen
  ORDER_DETAILS_LOADING_INDICATOR: 'order-details-loading-indicator',
  ORDER_DETAILS_ERROR_STATE: 'order-details-error-state',
  ORDER_DETAILS_EMPTY_STATE: 'order-details-empty-state',
  ORDER_DETAILS_HEADER_TITLE: 'order-details-header-title',
  ORDER_DETAILS_HEADER_STATUS: 'order-details-header-status',

  // Subscriptions Screen
  SUBSCRIPTIONS_LOADING_INDICATOR: 'subscriptions-loading-indicator',
  SUBSCRIPTIONS_ERROR_STATE: 'subscriptions-error-state',
  SUBSCRIPTIONS_EMPTY_STATE: 'subscriptions-empty-state',

  // Subscription Details Screen
  SUBSCRIPTION_DETAILS_LOADING_INDICATOR: 'subscription-details-loading-indicator',
  SUBSCRIPTION_DETAILS_ERROR_STATE: 'subscription-details-error-state',
  SUBSCRIPTION_DETAILS_EMPTY_STATE: 'subscription-details-empty-state',
  SUBSCRIPTION_DETAILS_HEADER_TITLE: 'subscription-details-header-title',
  SUBSCRIPTION_DETAILS_HEADER_STATUS: 'subscription-details-header-status',

  // Invoices Screen
  INVOICES_LOADING_INDICATOR: 'invoices-loading-indicator',
  INVOICES_ERROR_STATE: 'invoices-error-state',
  INVOICES_EMPTY_STATE: 'invoices-empty-state',

  // Invoice Details Screen
  INVOICE_DETAILS_LOADING_INDICATOR: 'invoice-details-loading-indicator',
  INVOICE_DETAILS_ERROR_STATE: 'invoice-details-error-state',
  INVOICE_DETAILS_EMPTY_STATE: 'invoice-details-empty-state',
  INVOICE_DETAILS_HEADER_TITLE: 'invoice-details-header-title',
  INVOICE_DETAILS_HEADER_STATUS: 'invoice-details-header-status',

  // Statements Screen
  STATEMENTS_LOADING_INDICATOR: 'statements-loading-indicator',
  STATEMENTS_ERROR_STATE: 'statements-error-state',
  STATEMENTS_EMPTY_STATE: 'statements-empty-state',

  // Statement Details Screen
  STATEMENT_DETAILS_LOADING_INDICATOR: 'statement-details-loading-indicator',
  STATEMENT_DETAILS_ERROR_STATE: 'statement-details-error-state',
  STATEMENT_DETAILS_EMPTY_STATE: 'statement-details-empty-state',
  STATEMENT_DETAILS_HEADER_TITLE: 'statement-details-header-title',
  STATEMENT_DETAILS_HEADER_STATUS: 'statement-details-header-status',

  // Programs Screen
  PROGRAMS_LOADING_INDICATOR: 'programs-loading-indicator',
  PROGRAMS_ERROR_STATE: 'programs-error-state',
  PROGRAMS_EMPTY_STATE: 'programs-empty-state',

  // Program Details Screen
  PROGRAM_DETAILS_LOADING_INDICATOR: 'program-details-loading-indicator',
  PROGRAM_DETAILS_ERROR_STATE: 'program-details-error-state',
  PROGRAM_DETAILS_EMPTY_STATE: 'program-details-empty-state',
  PROGRAM_DETAILS_HEADER_TITLE: 'program-details-header-title',
  PROGRAM_DETAILS_HEADER_STATUS: 'program-details-header-status',

  // Enrollments Screen
  ENROLLMENTS_LOADING_INDICATOR: 'enrollments-loading-indicator',
  ENROLLMENTS_ERROR_STATE: 'enrollments-error-state',
  ENROLLMENTS_EMPTY_STATE: 'enrollments-empty-state',

  // Enrollment Details Screen
  ENROLLMENT_DETAILS_LOADING_INDICATOR: 'enrollment-details-loading-indicator',
  ENROLLMENT_DETAILS_ERROR_STATE: 'enrollment-details-error-state',
  ENROLLMENT_DETAILS_EMPTY_STATE: 'enrollment-details-empty-state',
  ENROLLMENT_DETAILS_HEADER_TITLE: 'enrollment-details-header-title',
  ENROLLMENT_DETAILS_HEADER_STATUS: 'enrollment-details-header-status',

  // Certificates Screen
  CERTIFICATES_LOADING_INDICATOR: 'certificates-loading-indicator',
  CERTIFICATES_ERROR_STATE: 'certificates-error-state',
  CERTIFICATES_EMPTY_STATE: 'certificates-empty-state',

  // Certificate Details Screen
  CERTIFICATE_DETAILS_LOADING_INDICATOR: 'certificate-details-loading-indicator',
  CERTIFICATE_DETAILS_ERROR_STATE: 'certificate-details-error-state',
  CERTIFICATE_DETAILS_EMPTY_STATE: 'certificate-details-empty-state',
  CERTIFICATE_DETAILS_HEADER_TITLE: 'certificate-details-header-title',
  CERTIFICATE_DETAILS_HEADER_STATUS: 'certificate-details-header-status',

  // Licensees Screen
  LICENSEES_LOADING_INDICATOR: 'licensees-loading-indicator',
  LICENSEES_ERROR_STATE: 'licensees-error-state',
  LICENSEES_EMPTY_STATE: 'licensees-empty-state',

  // Licensee Details Screen
  LICENSEE_DETAILS_LOADING_INDICATOR: 'licensee-details-loading-indicator',
  LICENSEE_DETAILS_ERROR_STATE: 'licensee-details-error-state',
  LICENSEE_DETAILS_EMPTY_STATE: 'licensee-details-empty-state',
  LICENSEE_DETAILS_HEADER_TITLE: 'licensee-details-header-title',
  LICENSEE_DETAILS_HEADER_STATUS: 'licensee-details-header-status',

  // Buyers Screen
  BUYERS_LOADING_INDICATOR: 'buyers-loading-indicator',
  BUYERS_ERROR_STATE: 'buyers-error-state',
  BUYERS_EMPTY_STATE: 'buyers-empty-state',

  // Buyer Details Screen
  BUYER_DETAILS_LOADING_INDICATOR: 'buyer-details-loading-indicator',
  BUYER_DETAILS_ERROR_STATE: 'buyer-details-error-state',
  BUYER_DETAILS_EMPTY_STATE: 'buyer-details-empty-state',
  BUYER_DETAILS_HEADER_TITLE: 'buyer-details-header-title',
  BUYER_DETAILS_HEADER_STATUS: 'buyer-details-header-status',

  // User Accounts Screen
  USER_ACCOUNTS_LOADING_INDICATOR: 'user-accounts-loading-indicator',
  USER_ACCOUNTS_ERROR_STATE: 'user-accounts-error-state',
  USER_ACCOUNTS_EMPTY_STATE: 'user-accounts-empty-state',

  // Clients Screen
  CLIENTS_LOADING_INDICATOR: 'clients-loading-indicator',
  CLIENTS_ERROR_STATE: 'clients-error-state',
  CLIENTS_EMPTY_STATE: 'clients-empty-state',

  // Vendors Screen
  VENDORS_LOADING_INDICATOR: 'vendors-loading-indicator',
  VENDORS_ERROR_STATE: 'vendors-error-state',
  VENDORS_EMPTY_STATE: 'vendors-empty-state',

  // Sellers Screen
  SELLERS_LOADING_INDICATOR: 'sellers-loading-indicator',
  SELLERS_ERROR_STATE: 'sellers-error-state',
  SELLERS_EMPTY_STATE: 'sellers-empty-state',

  // Account Details Screen
  ACCOUNT_DETAILS_LOADING_INDICATOR: 'account-details-loading-indicator',
  ACCOUNT_DETAILS_ERROR_STATE: 'account-details-error-state',
  ACCOUNT_DETAILS_EMPTY_STATE: 'account-details-empty-state',
  ACCOUNT_DETAILS_HEADER_TITLE: 'account-details-header-title',
  ACCOUNT_DETAILS_HEADER_STATUS: 'account-details-header-status',

  // Seller Details Screen
  SELLER_DETAILS_LOADING_INDICATOR: 'seller-details-loading-indicator',
  SELLER_DETAILS_ERROR_STATE: 'seller-details-error-state',
  SELLER_DETAILS_EMPTY_STATE: 'seller-details-empty-state',
  SELLER_DETAILS_HEADER_TITLE: 'seller-details-header-title',
  SELLER_DETAILS_HEADER_STATUS: 'seller-details-header-status',

  // Product Details Screen
  PRODUCT_DETAILS_LOADING_INDICATOR: 'product-details-loading-indicator',
  PRODUCT_DETAILS_ERROR_STATE: 'product-details-error-state',
  PRODUCT_DETAILS_EMPTY_STATE: 'product-details-empty-state',
  PRODUCT_DETAILS_HEADER_TITLE: 'product-details-header-title',
  PRODUCT_DETAILS_HEADER_STATUS: 'product-details-header-status',

  // Products Screen
  PRODUCTS_LOADING_INDICATOR: 'products-loading-indicator',
  PRODUCTS_ERROR_STATE: 'products-error-state',
  PRODUCTS_EMPTY_STATE: 'products-empty-state',

  // Sales Orders Screen
  SALES_ORDERS_LOADING_INDICATOR: 'sales-orders-loading-indicator',
  SALES_ORDERS_ERROR_STATE: 'sales-orders-error-state',
  SALES_ORDERS_EMPTY_STATE: 'sales-orders-empty-state',

  // Sales Order Details Screen
  SALES_ORDER_DETAILS_LOADING_INDICATOR: 'sales-order-details-loading-indicator',
  SALES_ORDER_DETAILS_ERROR_STATE: 'sales-order-details-error-state',
  SALES_ORDER_DETAILS_EMPTY_STATE: 'sales-order-details-empty-state',
  SALES_ORDER_DETAILS_HEADER_TITLE: 'sales-order-details-header-title',
  SALES_ORDER_DETAILS_HEADER_STATUS: 'sales-order-details-header-status',

  // Sales Quotes Screen
  SALES_QUOTES_LOADING_INDICATOR: 'sales-quotes-loading-indicator',
  SALES_QUOTES_ERROR_STATE: 'sales-quotes-error-state',
  SALES_QUOTES_EMPTY_STATE: 'sales-quotes-empty-state',

  // Sales Quote Details Screen
  SALES_QUOTE_DETAILS_LOADING_INDICATOR: 'sales-quote-details-loading-indicator',
  SALES_QUOTE_DETAILS_ERROR_STATE: 'sales-quote-details-error-state',
  SALES_QUOTE_DETAILS_EMPTY_STATE: 'sales-quote-details-empty-state',
  SALES_QUOTE_DETAILS_HEADER_TITLE: 'sales-quote-details-header-title',
  SALES_QUOTE_DETAILS_HEADER_STATUS: 'sales-quote-details-header-status',

  // Chats Screen
  CHATS_LOADING_INDICATOR: 'chats-loading-indicator',
  CHATS_ERROR_STATE: 'chats-error-state',
  CHATS_EMPTY_STATE: 'chats-empty-state',

  // Chat Conversation Screen
  CHAT_CONVERSATION_LOADING_INDICATOR: 'chat-conversation-loading-indicator',
  CHAT_CONVERSATION_ERROR_STATE: 'chat-conversation-error-state',
  CHAT_CONVERSATION_EMPTY_STATE: 'chat-conversation-empty-state',

  // Create Chat
  CREATE_CHAT_BUTTON: 'create-chat-button',
  CREATE_CHAT_MODAL: 'create-chat-modal',
  CHAT_TYPES: 'chat-types',
  CREATE_CHAT_CONTACT_SEARCH: 'create-chat-contact-search',

  // Search
  SEARCH_EMPTY_STATE: 'search-empty-state',
  SEARCH_INVALID_QUERY_STATE: 'search-invalid-query-state',
  SEARCH_FILTER: 'search-filter',
} as const;

export type TestIDKey = keyof typeof TestIDs;
