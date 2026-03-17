/**
 * Test framework timing and layout constants
 * Centralizes magic numbers for maintainability and tuning
 *
 * Usage:
 *   const { TIMEOUT, PAUSE, SCROLL, GESTURE } = require('./utils/constants');
 *
 *   await element.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });
 *   await browser.pause(PAUSE.NAVIGATION);
 */

// ============ Timeout Constants (milliseconds) ============
const TIMEOUT = {
  /** Default wait for screen to be ready after navigation */
  SCREEN_READY: 30000,

  /** Wait for individual element to appear */
  ELEMENT_DISPLAYED: 10000,

  /** Wait for header elements */
  HEADER_WAIT: 5000,

  /** Short element wait for fast-loading content */
  SHORT_WAIT: 3000,

  /** Extended wait for post-logout redirect screen */
  POST_LOGOUT_REDIRECT: 15000,

  /** Max wait for OTP retrieval polling */
  OTP_WAIT_MAX: 60000,

  /** Extended OTP e2e flow max wait */
  OTP_E2E_MAX: 260000,

  /** Additional buffer for OTP e2e test-level timeout */
  OTP_E2E_BUFFER: 120000,

  /** Max wait for auth flow navigation after OTP submit */
  AUTH_FLOW_WAIT: 90000,

  /** Standard suite setup timeout used by e2e specs */
  TEST_SETUP_LONG: 150000,

  /** Default Mocha suite timeout in WDIO config */
  MOCHA_SUITE: 600000,
};

// ============ Pause/Delay Constants (milliseconds) ============
const PAUSE = {
  /** After navigation actions (tab clicks, page transitions) */
  NAVIGATION: 500,

  /** Wait for animations to settle */
  ANIMATION_SETTLE: 300,

  /** After text entry for verification */
  TEXT_ENTRY: 200,

  /** After swipe gestures for animation */
  SWIPE_ANIMATION: 150,

  /** Between retry attempts */
  RETRY_DELAY: 100,

  /** Character-by-character typing delay */
  CHARACTER_INPUT: 50,

  /** Wait after scroll for pagination loading */
  SCROLL_PAGINATION: 800,

  /** Polling interval for status checks */
  POLL_INTERVAL: 1000,

  /** Polling interval for OTP inbox checks */
  OTP_POLL_INTERVAL: 5000,

  /** Polling interval used by long-running OTP e2e validation */
  OTP_E2E_POLL: 13000,

  /** Polling interval while waiting for post-auth home state */
  AUTH_FLOW_POLL: 10000,

  /** App restart pause after terminate */
  APP_TERMINATE: 2000,

  /** App restart pause after activate */
  APP_ACTIVATE: 3000,
};

// ============ Scroll Constants ============
const SCROLL = {
  /** Default scroll distance percentage */
  DEFAULT_PERCENT: 0.5,

  /** Scroll percentage for pagination loading */
  PAGINATION_PERCENT: 0.75,

  /** Maximum scroll attempts before giving up */
  MAX_SCROLL_ATTEMPTS: 10,

  /** Consecutive no-change scrolls to detect bottom */
  NO_CHANGE_THRESHOLD: 3,
};

// ============ Gesture Constants (Android swipe coordinates) ============
const GESTURE = {
  /** Swipe start X coordinate */
  SWIPE_LEFT: 100,

  /** Swipe start Y coordinate */
  SWIPE_TOP: 300,

  /** Swipe gesture width */
  SWIPE_WIDTH: 880,

  /** Swipe gesture height */
  SWIPE_HEIGHT: 800,

  /** iOS swipe velocity */
  IOS_VELOCITY: 800,

  /** Base page scroll start Y */
  BASE_SCROLL_TOP: 500,

  /** Base page scroll width */
  BASE_SCROLL_WIDTH: 200,

  /** Base page scroll height */
  BASE_SCROLL_HEIGHT: 500,
};

// ============ Retry Constants ============
const RETRY = {
  /** Maximum retries for text entry */
  TEXT_ENTRY_MAX: 3,

  /** Maximum back button attempts for navigation */
  MAX_BACK_ATTEMPTS: 5,
};

// ============ Regex / Parsing Constants ============
const REGEX = {
  /** Generic leading/trailing whitespace matcher */
  TRIM_WHITESPACE: /^\s+|\s+$/g,

  /** OTP extraction pattern from email body */
  OTP_FROM_EMAIL_BODY: /verification code is:\s*(\d{6})/i,

  /** OTP must be exactly six digits */
  OTP_6_DIGITS: /^\d{6}$/,

  /** Basic email format validation */
  EMAIL_BASIC: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /** Entity ID formats */
  ORDER_ID: /^ORD-\d{4}-\d{4}-\d{4}$/,
  SUBSCRIPTION_ID: /^SUB-\d{4}-\d{4}-\d{4}$/,
  AGREEMENT_ID: /^AGR-\d{4}-\d{4}-\d{4}$/,
  AGREEMENT_ID_FLEX: /^AGR-(\d{4}-)+\d{4}$/,
  INVOICE_ID: /^INV-(\d{4}-)+\d{4}$/,
  CREDIT_MEMO_ID: /^CRD-\d{4}-\d{4}-\d{4}-\d{4}$/,
  CREDIT_MEMO_ID_EXTRACT: /(CRD-\d{4}-\d{4}-\d{4}-\d{4})/,
  STATEMENT_ID: /^SOM-\d{4}-\d{4}-\d{4}-\d{4}$/,
  STATEMENT_ID_EXTRACT: /(SOM-\d{4}-\d{4}-\d{4}-\d{4})/,
  USER_ID: /^USR-\d{4}-\d{4}$/,
  USER_ID_FLEX: /^USR-(\d{4}-)+\d{4}$/,
  PROGRAM_ID: /^PRG-\d{4}-\d{4}$/,
  BUYER_ID: /^BUY-\d{4}-\d{4}$/,
  BUYER_ID_FLEX: /^BUY-(\d{4}-?)+\d{4}$/,
  LICENSEE_ID: /^LCE-\d{4}-\d{4}-\d{4}$/,
  ENROLLMENT_ID: /^ENR-\d{4}-\d{4}-\d{4}$/,
};

// ============ Default / Sentinel Constants ============
const DEFAULTS = {
  /** Placeholder used for empty text values */
  DASH_FOR_EMPTY: '-',
};

// ============ Limits Constants ============
const LIMITS = {
  /** Generic minimum expected count for list validations */
  MIN_EXPECTED_COUNT: 1,
};

// ============ Platform Behavior Constants ============
const PLATFORM = {
  /** iOS platform identifier */
  IOS: 'ios',

  /** Android platform identifier */
  ANDROID: 'android',
};

module.exports = {
  TIMEOUT,
  PAUSE,
  SCROLL,
  GESTURE,
  RETRY,
  REGEX,
  DEFAULTS,
  LIMITS,
  PLATFORM,
};
