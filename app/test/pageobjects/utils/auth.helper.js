const homePage = require('../spotlights.page');
const verifyPage = require('../verify.page');
const welcomePage = require('../welcome.page');
const footerPage = require('../base/footer.page');
const headingPage = require('../base/heading.page');
const profilePage = require('../profile.page');
const userSettingsPage = require('../user-settings.page');
const { isAndroid } = require('./selectors');
const { TIMEOUT, PAUSE, REGEX } = require('./constants');
const { restartApp } = require('./app.helper');

const AIRTABLE_EMAIL = process.env.AIRTABLE_EMAIL || 'not-set';
const OTP_TIMEOUT_MS = TIMEOUT.OTP_E2E_MAX;
const POLL_INTERVAL_MS = PAUSE.OTP_E2E_POLL;
const MAX_SEND_RETRIES = 3;
const SEND_RETRY_PAUSE_MS = 5000;
const VERIFY_SCREEN_WAIT_MS = 15000;

/**
 * Checks if the user is already logged in by checking for home page elements
 * @returns {Promise<boolean>} true if logged in, false otherwise
 */
async function isLoggedIn() {
  try {
    // First, positively check if we're on the home page by looking for key elements
    const isHomeVisible = await homePage.filterAll.isDisplayed().catch(() => false);
    if (isHomeVisible) {
      console.info('✓ User is already logged in (home page detected)');
      return true;
    }

    // Check if the spotlight header is visible (another home page indicator)
    const isSpotlightVisible = await homePage.spotlightHeader.isDisplayed().catch(() => false);
    if (isSpotlightVisible) {
      console.info('✓ User is already logged in (spotlight header detected)');
      return true;
    }

    // Check if we're on the profile page (user is logged in but navigated away from home)
    const isProfileVisible = await profilePage.profileHeaderTitle.isDisplayed().catch(() => false);
    if (isProfileVisible) {
      console.info('✓ User is already logged in (profile page detected)');
      return true;
    }

    // Check for authenticated shell markers that are visible across many pages
    const hasAnyFooterTab =
      (await footerPage.spotlightsTab.isDisplayed().catch(() => false)) ||
      (await footerPage.chatTab.isDisplayed().catch(() => false)) ||
      (await footerPage.subscriptionsTab.isDisplayed().catch(() => false)) ||
      (await footerPage.moreTab.isDisplayed().catch(() => false));

    if (hasAnyFooterTab) {
      console.info('✓ User is already logged in (footer navigation detected)');
      return true;
    }

    const isAccountButtonVisible = await headingPage.navAccountButton
      .isDisplayed()
      .catch(() => false);
    if (isAccountButtonVisible) {
      console.info('✓ User is already logged in (header account button detected)');
      return true;
    }

    // If we see the welcome page email input, user is definitely not logged in
    const isWelcomeVisible = await welcomePage.emailInput.isDisplayed().catch(() => false);
    if (isWelcomeVisible) {
      console.info('ℹ User is not logged in (welcome page detected)');
      return false;
    }

    // If none of the above, assume not logged in
    console.info('ℹ Unable to determine login state, assuming not logged in');
    return false;
  } catch (error) {
    console.info(`ℹ Error checking login state: ${error.message}, assuming not logged in`);
    return false;
  }
}

/**
 * Performs the complete login flow with OTP verification
 * @param {string} email - Email address to login with (defaults to AIRTABLE_EMAIL)
 * @returns {Promise<void>}
 */
async function loginWithOTP(email = AIRTABLE_EMAIL) {
  console.info(`🔐 [loginWithOTP] Starting login flow for: ${email}`);

  // Check if already logged in
  if (await isLoggedIn()) {
    console.info('✓ [loginWithOTP] Already logged in, skipping login flow');
    return;
  }

  // Check if we're on the welcome page
  const isWelcomeVisible = await welcomePage.welcomeTitle.isDisplayed().catch(() => false);
  if (!isWelcomeVisible) {
    throw new Error('[loginWithOTP] Not on welcome page and not logged in. Cannot proceed with login flow.');
  }

  // Clear any previous input
  await welcomePage.clearText(welcomePage.emailInput).catch(() => {});

  // Enter email (typeText now has built-in retry logic)
  console.info(`⌨️  [loginWithOTP] Entering email: ${email}`);
  await welcomePage.typeText(welcomePage.emailInput, email);

  // Final verification - the email should be correct after typeText's retries
  // Android uses 'text' attribute, iOS uses 'value'
  const textAttribute = isAndroid() ? 'text' : 'value';
  const enteredValue = await welcomePage.emailInput.getAttribute(textAttribute);
  if (enteredValue !== email) {
    throw new Error(`[loginWithOTP] Email entry failed after all retries. Expected: ${email}, Got: ${enteredValue}`);
  }
  console.info('✓ [loginWithOTP] Email entered successfully');

  // Submit email with retry logic — Auth0 passwordless API can transiently fail
  let beforeOTPRequest = new Date();
  let afterOTPRequest;

  for (let attempt = 1; attempt <= MAX_SEND_RETRIES; attempt++) {
    beforeOTPRequest = new Date();
    console.info(`📧 [loginWithOTP] Attempt ${attempt}/${MAX_SEND_RETRIES}: Sending authentication email...`);
    console.info(`🕐 [loginWithOTP] Timestamp BEFORE OTP request: ${beforeOTPRequest.toISOString()}`);

    await welcomePage.click(welcomePage.continueButton);
    afterOTPRequest = new Date();
    console.info(`🕐 [loginWithOTP] Timestamp AFTER OTP request: ${afterOTPRequest.toISOString()}`);

    try {
      await verifyPage.verifyTitle.waitForDisplayed({ timeout: VERIFY_SCREEN_WAIT_MS });
      console.info(`✅ [loginWithOTP] OTP screen displayed on attempt ${attempt}`);
      break;
    } catch {
      const pageSource = await browser.getPageSource();
      if (pageSource.includes('Failed to send authentication email')) {
        console.warn(`⚠️ [loginWithOTP] Auth0 email send failed on attempt ${attempt}/${MAX_SEND_RETRIES}`);
        if (attempt < MAX_SEND_RETRIES) {
          console.info(`🔄 [loginWithOTP] Waiting ${SEND_RETRY_PAUSE_MS}ms before retry...`);
          await browser.pause(SEND_RETRY_PAUSE_MS);
        } else {
          throw new Error(
            `[loginWithOTP] Auth0 failed to send authentication email after ${MAX_SEND_RETRIES} attempts`,
          );
        }
      } else {
        // Check if we landed on home directly (no OTP challenge)
        const landedOnHome =
          (await homePage.filterAll.isDisplayed().catch(() => false)) ||
          (await homePage.spotlightHeader.isDisplayed().catch(() => false)) ||
          (await homePage.emptyState.isDisplayed().catch(() => false));

        if (landedOnHome) {
          console.info('✓ [loginWithOTP] Login completed successfully (no OTP challenge required)');
          return;
        }

        throw new Error('[loginWithOTP] OTP screen not displayed and no known Auth0 error found on page');
      }
    }
  }

  console.info('✓ [loginWithOTP] Navigated to verification screen');

  // Wait for OTP to arrive via Airtable
  console.info('⏳ [loginWithOTP] Waiting for OTP to arrive via Airtable...');
  console.info(`   [loginWithOTP] Using timeout=${OTP_TIMEOUT_MS}ms, pollInterval=${POLL_INTERVAL_MS}ms`);
  let result;
  try {
    result = await global.getOTPFromAirtable(
      email,
      beforeOTPRequest,
      OTP_TIMEOUT_MS,
      POLL_INTERVAL_MS,
    );

    const otpRetrievedTime = new Date();
    console.info(`✅ [loginWithOTP] Retrieved OTP: ${result.otp} at ${otpRetrievedTime.toISOString()}`);
    console.info(`📧 [loginWithOTP] Email subject: ${result.record.fields.Subject}`);
    console.info(`📧 [loginWithOTP] Email created at: ${result.record.fields['Created At']}`);
    console.info(
      `⏱️  [loginWithOTP] Time from request to retrieval: ${(otpRetrievedTime - afterOTPRequest) / 1000}s`,
    );

    // Verify we got a valid 6-digit OTP
    if (!REGEX.OTP_6_DIGITS.test(result.otp)) {
      throw new Error(`[loginWithOTP] Invalid OTP format: ${result.otp}`);
    }
    console.info('✓ [loginWithOTP] OTP format validated');
  } catch (error) {
    console.error('❌ [loginWithOTP] OTP retrieval or verification failed:', error.message);
    throw error;
  }

  // Enter OTP into the verification screen
  console.info(`⌨️  [loginWithOTP] Entering OTP into verification screen...`);
  const beforeSubmit = new Date();
  console.info(`🚀 [loginWithOTP] Starting OTP entry at: ${beforeSubmit.toISOString()}`);
  await verifyPage.enterOTP(result.otp);
  const afterOTPEntry = new Date();
  console.info(`✅ [loginWithOTP] OTP entry completed at: ${afterOTPEntry.toISOString()}`);
  console.info(`⏱️  [loginWithOTP] OTP entry took: ${(afterOTPEntry - beforeSubmit) / 1000}s`);

  // Wait for auto-submission and navigation to home page with robust polling
  console.info(`⏳ [loginWithOTP] Waiting for post-auth navigation to home (timeout: ${TIMEOUT.AUTH_FLOW_WAIT}ms)...`);
  const beforeHomeWait = new Date();
  const waitTimeout = TIMEOUT.AUTH_FLOW_WAIT;
  const pollInterval = PAUSE.AUTH_FLOW_POLL;
  let elapsed = 0;
  let homePageFound = false;

  while (elapsed < waitTimeout && !homePageFound) {
    try {
      const isHome =
        (await homePage.filterAll.isDisplayed().catch(() => false)) ||
        (await homePage.spotlightHeader.isDisplayed().catch(() => false)) ||
        (await homePage.emptyState.isDisplayed().catch(() => false));

      if (isHome) {
        homePageFound = true;
        const foundAt = new Date();
        console.info(`✅ [loginWithOTP] Home page FOUND after ${(foundAt - beforeHomeWait) / 1000}s`);
      } else {
        elapsed += pollInterval;
        const now = new Date();
        console.info(`⏳ [loginWithOTP] Still waiting for home page... (${elapsed / 1000}s elapsed, ${(waitTimeout - elapsed) / 1000}s remaining)`);
        await browser.pause(pollInterval);
      }
    } catch (pollError) {
      elapsed += pollInterval;
      console.info(`⚠️ [loginWithOTP] Polling error: ${pollError.message}, continuing...`);
      await browser.pause(pollInterval);
    }
  }

  if (!homePageFound) {
    const failedAt = new Date();
    console.error(`❌ [loginWithOTP] Home page NOT found after ${(failedAt - beforeHomeWait) / 1000}s`);
    throw new Error(`[loginWithOTP] Home page not displayed after ${waitTimeout / 1000}s timeout`);
  }

  console.info('✅ [loginWithOTP] Login completed successfully');
}

/**
 * Waits for the app to reach a ready state (either welcome page or home page)
 * This should be called before checking login state when the app first launches
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<'welcome'|'home'|'unknown'>} The detected app state
 */
async function waitForAppReady(timeout = TIMEOUT.SCREEN_READY) {
  console.info('⏳ Waiting for app to reach ready state...');
  const startTime = Date.now();
  const pollInterval = PAUSE.NAVIGATION;

  while (Date.now() - startTime < timeout) {
    // Check for home page elements
    const isHomeVisible = await homePage.filterAll.isDisplayed().catch(() => false);
    if (isHomeVisible) {
      console.info('✓ App ready: Home page detected');
      return 'home';
    }

    const isSpotlightVisible = await homePage.spotlightHeader.isDisplayed().catch(() => false);
    if (isSpotlightVisible) {
      console.info('✓ App ready: Spotlight header detected');
      return 'home';
    }

    // Check for welcome page elements
    const isWelcomeVisible = await welcomePage.emailInput.isDisplayed().catch(() => false);
    if (isWelcomeVisible) {
      console.info('✓ App ready: Welcome page detected');
      return 'welcome';
    }

    const isWelcomeTitleVisible = await welcomePage.welcomeTitle.isDisplayed().catch(() => false);
    if (isWelcomeTitleVisible) {
      console.info('✓ App ready: Welcome title detected');
      return 'welcome';
    }

    // Check for profile page (user logged in but on profile)
    const isProfileVisible = await profilePage.profileHeaderTitle.isDisplayed().catch(() => false);
    if (isProfileVisible) {
      console.info('✓ App ready: Profile page detected');
      return 'home';
    }

    await browser.pause(pollInterval);
  }

  console.warn('⚠ App ready state detection timed out');
  return 'unknown';
}

/**
 * Ensures the user is logged in before running tests
 * Call this in beforeEach or before hooks
 * @param {string} email - Email address to login with (defaults to AIRTABLE_EMAIL)
 * @returns {Promise<void>}
 */
async function ensureLoggedIn(email = AIRTABLE_EMAIL) {
  console.info(`🔐 [ensureLoggedIn] Starting for: ${email}`);

  // First wait for app to reach a ready state
  let appState = await waitForAppReady();
  console.info(`📍 [ensureLoggedIn] Initial app state: ${appState}`);
  
  if (appState === 'home') {
    console.info('✓ [ensureLoggedIn] Already logged in (detected during app ready check)');
    return;
  }
  
  if (appState === 'welcome') {
    console.info('ℹ [ensureLoggedIn] On welcome page, proceeding with login');
    await loginWithOTP(email);
    return;
  }
  
  // Unknown state - attempt recovery by restarting app
  console.warn('⚠️ [ensureLoggedIn] App in unknown state, attempting recovery via app restart...');
  const detectedState = await restartApp();
  console.info(`📍 [ensureLoggedIn] restartApp returned state: ${detectedState}`);
  
  // Check state after restart
  appState = await waitForAppReady();
  console.info(`📍 [ensureLoggedIn] App state after restart: ${appState}`);
  
  if (appState === 'home') {
    console.info('✓ [ensureLoggedIn] Recovery successful - already logged in after restart');
    return;
  }
  
  if (appState === 'welcome') {
    console.info('ℹ [ensureLoggedIn] Recovery successful - on welcome page, proceeding with login');
    await loginWithOTP(email);
    return;
  }
  
  // Fail fast with diagnostic snapshot instead of continuing long probe loops
  console.error('❌ [ensureLoggedIn] App state still unknown after restart - capturing diagnostics');
  try {
    const pageSource = await browser.getPageSource();
    const truncated = pageSource.length > 3000 ? pageSource.substring(0, 3000) + '...(truncated)' : pageSource;
    console.error(`📄 [ensureLoggedIn] Page source at failure:\n${truncated}`);
  } catch (diagError) {
    console.error(`⚠️ [ensureLoggedIn] Could not capture page source: ${diagError.message}`);
  }
  throw new Error(
    '[ensureLoggedIn] App state is unknown after restart recovery. ' +
    'Neither home, welcome, nor profile page detected. Cannot proceed.',
  );
}

/**
 * Logs out the user if they are currently logged in
 * Navigates through Profile -> User Settings -> Sign Out
 * @returns {Promise<void>}
 */
async function ensureLoggedOut() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    console.info('✓ User is already logged out');
    return;
  }

  console.info('🔓 User is logged in, performing logout...');

  try {
    // Navigate to Profile page via account button
    await headingPage.navAccountButton.click();
    await profilePage.profileHeaderTitle.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });
    console.info('✓ Navigated to Profile page');

    // Navigate to User Settings by clicking current user card
    await profilePage.currentUserCard.click();
    await userSettingsPage.headerTitle.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });
    console.info('✓ Navigated to User Settings');

    // Click sign out button
    await userSettingsPage.signOut();

    // Wait for welcome page to confirm logout
    await welcomePage.welcomeTitle.waitForDisplayed({ timeout: TIMEOUT.POST_LOGOUT_REDIRECT });
    console.info('✅ User successfully logged out');
  } catch (error) {
    console.error('❌ Logout failed:', error.message);
    throw error;
  }
}

module.exports = {
  isLoggedIn,
  loginWithOTP,
  ensureLoggedIn,
  ensureLoggedOut,
  AIRTABLE_EMAIL,
};
