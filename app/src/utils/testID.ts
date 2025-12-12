type TestIDSuffix = 'button' | 'input' | 'text' | 'label' | 'icon' | 'tab' | 'item' | 'container' | 'image' | 'link';

// Generates a consistent testID string.
export function testID(
    screen: string,
    element: string,
    suffix: TestIDSuffix,
    variant?: string | number
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

    // Profile Screen
    PROFILE_SECTION_YOUR_PROFILE: 'profile-section-yourprofile-text',
    PROFILE_SECTION_SWITCH_ACCOUNT: 'profile-section-switchaccount-text',
    PROFILE_USER_ITEM: 'profile-user-item',
    PROFILE_ACCOUNT_ITEM_PREFIX: 'profile-account-item',

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

    // Common
    HEADER_LOGO: 'header-logo-image',
    LOADING_INDICATOR: 'loading-indicator',
} as const;

export type TestIDKey = keyof typeof TestIDs;
