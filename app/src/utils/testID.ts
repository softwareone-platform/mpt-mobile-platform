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
  NAV_MENU_ITEM_PREFIX: 'nav-menu',
  NAV_TAB_PREFIX: 'nav-tab',

  // Profile Screen
  PROFILE_SECTION_YOUR_PROFILE: 'profile-section-yourprofile-text',
  PROFILE_SECTION_SWITCH_ACCOUNT: 'profile-section-switchaccount-text',
  PROFILE_USER_ITEM: 'profile-user-item',
  PROFILE_ACCOUNT_ITEM_PREFIX: 'profile-account-item',

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

  // Common
  HEADER_LOGO: 'header-logo-image',
  LOADING_INDICATOR: 'loading-indicator',

  // Credit Memos Screen
  CREDIT_MEMOS_LOADING_INDICATOR: 'credit-memos-loading-indicator',
  CREDIT_MEMOS_ERROR_STATE: 'credit-memos-error-state',
  CREDIT_MEMOS_EMPTY_STATE: 'credit-memos-empty-state',

  // Credit Memo Details Screen
  CREDIT_MEMO_DETAILS_LOADING_INDICATOR: 'credit-memo-details-loading-indicator',
  CREDIT_MEMO_DETAILS_ERROR_STATE: 'credit-memo-details-error-state',
  CREDIT_MEMO_DETAILS_EMPTY_STATE: 'credit-memo-details-empty-state',

  // Users Screen
  USERS_LOADING_INDICATOR: 'users-loading-indicator',
  USERS_ERROR_STATE: 'users-error-state',
  USERS_EMPTY_STATE: 'users-empty-state',

  // Orders Screen
  ORDERS_LOADING_INDICATOR: 'orders-loading-indicator',
  ORDERS_ERROR_STATE: 'orders-error-state',
  ORDERS_EMPTY_STATE: 'orders-empty-state',

  // Subscriptions Screen
  SUBSCRIPTIONS_LOADING_INDICATOR: 'subscriptions-loading-indicator',
  SUBSCRIPTIONS_ERROR_STATE: 'subscriptions-error-state',
  SUBSCRIPTIONS_EMPTY_STATE: 'subscriptions-empty-state',

  // Invoices Screen
  INVOICES_LOADING_INDICATOR: 'invoices-loading-indicator',
  INVOICES_ERROR_STATE: 'invoices-error-state',
  INVOICES_EMPTY_STATE: 'invoices-empty-state',

  // Statements Screen
  STATEMENTS_LOADING_INDICATOR: 'statements-loading-indicator',
  STATEMENTS_ERROR_STATE: 'statements-error-state',
  STATEMENTS_EMPTY_STATE: 'statements-empty-state',

  // Programs Screen
  PROGRAMS_LOADING_INDICATOR: 'programs-loading-indicator',
  PROGRAMS_ERROR_STATE: 'programs-error-state',
  PROGRAMS_EMPTY_STATE: 'programs-empty-state',

  // Enrollments Screen
  ENROLLMENTS_LOADING_INDICATOR: 'enrollments-loading-indicator',
  ENROLLMENTS_ERROR_STATE: 'enrollments-error-state',
  ENROLLMENTS_EMPTY_STATE: 'enrollments-empty-state',

  // Licensees Screen
  LICENSEES_LOADING_INDICATOR: 'licensees-loading-indicator',
  LICENSEES_ERROR_STATE: 'licensees-error-state',
  LICENSEES_EMPTY_STATE: 'licensees-empty-state',

  // Licensees Screen
  BUYERS_LOADING_INDICATOR: 'buyers-loading-indicator',
  BUYERS_ERROR_STATE: 'buyers-error-state',
  BUYERS_EMPTY_STATE: 'buyers-empty-state',
} as const;

export type TestIDKey = keyof typeof TestIDs;
