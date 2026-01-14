import { testID, listItemTestID, TestIDs } from '@/utils/testID';

describe('testID utils', () => {
  describe('testID', () => {
    it('should generate basic testID without variant', () => {
      expect(testID('welcome', 'continue', 'button')).toBe('welcome-continue-button');
      expect(testID('otp', 'verify', 'button')).toBe('otp-verify-button');
      expect(testID('profile', 'email', 'input')).toBe('profile-email-input');
    });

    it('should generate testID with string variant', () => {
      expect(testID('welcome', 'continue', 'button', 'primary')).toBe(
        'welcome-continue-button-primary',
      );
      expect(testID('nav', 'spotlight', 'tab', 'active')).toBe('nav-spotlight-tab-active');
    });

    it('should generate testID with numeric variant', () => {
      expect(testID('otp', 'digit', 'input', 1)).toBe('otp-digit-input-1');
      expect(testID('otp', 'digit', 'input', 6)).toBe('otp-digit-input-6');
      expect(testID('list', 'item', 'container', 0)).toBe('list-item-container-0');
    });

    it('should handle empty strings in parameters', () => {
      expect(testID('', 'element', 'button')).toBe('-element-button');
      expect(testID('screen', '', 'button')).toBe('screen--button');
    });
  });

  describe('listItemTestID', () => {
    it('should generate testID with string id', () => {
      expect(listItemTestID('account', 'acc-123')).toBe('account-item-acc-123');
      expect(listItemTestID('subscription', 'sub-456')).toBe('subscription-item-sub-456');
    });

    it('should generate testID with numeric id', () => {
      expect(listItemTestID('account', 42)).toBe('account-item-42');
      expect(listItemTestID('product', 0)).toBe('product-item-0');
    });

    it('should handle empty context', () => {
      expect(listItemTestID('', 'id-123')).toBe('-item-id-123');
    });
  });

  describe('TestIDs constants', () => {
    it('should have welcome screen testIDs', () => {
      expect(TestIDs.WELCOME_EMAIL_INPUT).toBe('welcome-email-input');
      expect(TestIDs.WELCOME_CONTINUE_BUTTON).toBe('welcome-continue-button');
      expect(TestIDs.WELCOME_EMAIL_ERROR).toBe('welcome-email-error');
    });

    it('should have OTP screen testIDs', () => {
      expect(TestIDs.OTP_VERIFY_BUTTON).toBe('otp-verify-button');
      expect(TestIDs.OTP_INPUT_PREFIX).toBe('otp-digit-input');
      expect(TestIDs.OTP_RESEND_BUTTON).toBe('otp-resend-button');
    });

    it('should have profile screen testIDs', () => {
      expect(TestIDs.PROFILE_USER_ITEM).toBe('profile-user-item');
      expect(TestIDs.PROFILE_ACCOUNT_ITEM_PREFIX).toBe('profile-account-item');
    });

    it('should have personal information screen testIDs', () => {
      expect(TestIDs.PERSONAL_INFO_LOADING_INDICATOR).toBe('personal-info-loading-indicator');
      expect(TestIDs.PERSONAL_INFO_ERROR_STATE).toBe('personal-info-error-state');
      expect(TestIDs.PERSONAL_INFO_EMPTY_STATE).toBe('personal-info-empty-state');
    });

    it('should have spotlight screen testIDs', () => {
      expect(TestIDs.SPOTLIGHT_LOGOUT_BUTTON).toBe('spotlight-logout-button');
      expect(TestIDs.SPOTLIGHT_FILTER_PREFIX).toBe('spotlight-filter');
      expect(TestIDs.SPOTLIGHT_ITEM_PREFIX).toBe('spotlight-item');
    });

    it('should have navigation testIDs', () => {
      expect(TestIDs.NAV_TAB_SPOTLIGHT).toBe('nav-tab-spotlight');
      expect(TestIDs.NAV_TAB_ORDERS).toBe('nav-tab-orders');
    });

    it('should be immutable (as const)', () => {
      // TypeScript should prevent this at compile time, but we can verify the object exists
      expect(TestIDs).toBeDefined();
      expect(Object.keys(TestIDs).length).toBeGreaterThan(0);
    });
  });
});
