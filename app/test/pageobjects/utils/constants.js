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

module.exports = {
  TIMEOUT,
  PAUSE,
  SCROLL,
  GESTURE,
  RETRY,
};
