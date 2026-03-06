const homePage = require('../spotlights.page');
const verifyPage = require('../verify.page');
const welcomePage = require('../welcome.page');
const headingPage = require('../base/heading.page');
const profilePage = require('../profile.page');
const userSettingsPage = require('../user-settings.page');
const { isAndroid } = require('./selectors');
const { TIMEOUT, PAUSE, REGEX } = require('./constants');
const { restartApp } = require('./app.helper');

const AIRTABLE_EMAIL = process.env.AIRTABLE_EMAIL || 'not-set';
const OTP_TIMEOUT_MS = TIMEOUT.OTP_WAIT_MAX;
const POLL_INTERVAL_MS = PAUSE.OTP_POLL_INTERVAL;

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
  console.info(`🔐 Starting login flow for: ${email}`);

  // Check if already logged in
  if (await isLoggedIn()) {
    console.info('✓ Already logged in, skipping login flow');
    return;
  }

  // Check if we're on the welcome page
  const isWelcomeVisible = await welcomePage.welcomeTitle.isDisplayed().catch(() => false);
  if (!isWelcomeVisible) {
    throw new Error('Not on welcome page and not logged in. Cannot proceed with login flow.');
  }

  // Clear any previous input
  await welcomePage.clearText(welcomePage.emailInput).catch(() => {});

  // Enter email (typeText now has built-in retry logic)
  console.info(`⌨️  Entering email: ${email}`);
  await welcomePage.typeText(welcomePage.emailInput, email);

  // Final verification - the email should be correct after typeText's retries
  // Android uses 'text' attribute, iOS uses 'value'
  const textAttribute = isAndroid() ? 'text' : 'value';
  const enteredValue = await welcomePage.emailInput.getAttribute(textAttribute);
  if (enteredValue !== email) {
    throw new Error(`Email entry failed after all retries. Expected: ${email}, Got: ${enteredValue}`);
  }
  console.info('✓ Email entered successfully');

  // Record timestamp before requesting OTP
  const beforeOTPRequest = new Date();
  console.info(`🕐 Timestamp BEFORE OTP request: ${beforeOTPRequest.toISOString()}`);

  // Click continue to trigger OTP request
  await welcomePage.click(welcomePage.continueButton);
  const afterOTPRequest = new Date();
  console.info(`🕐 Timestamp AFTER OTP request: ${afterOTPRequest.toISOString()}`);

  // Wait for navigation to verify screen
  await verifyPage.verifyTitle.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });
  console.info('✓ Navigated to verification screen');

  // Wait for OTP to arrive via Airtable
  console.info('⏳ Waiting for OTP to arrive via Airtable...');
  let result;
  try {
    result = await global.getOTPFromAirtable(
      email,
      beforeOTPRequest,
      OTP_TIMEOUT_MS,
      POLL_INTERVAL_MS,
    );

    const otpRetrievedTime = new Date();
    console.info(`✅ Retrieved OTP: ${result.otp} at ${otpRetrievedTime.toISOString()}`);
    console.info(`📧 Email subject: ${result.record.fields.Subject}`);
    console.info(`📧 Email created at: ${result.record.fields['Created At']}`);
    console.info(
      `⏱️  Time from request to retrieval: ${(otpRetrievedTime - afterOTPRequest) / 1000}s`,
    );

    // Verify we got a valid 6-digit OTP
    if (!REGEX.OTP_6_DIGITS.test(result.otp)) {
      throw new Error(`Invalid OTP format: ${result.otp}`);
    }
    console.info('✓ OTP verification completed successfully');
  } catch (error) {
    console.error('❌ OTP retrieval or verification failed:', error.message);
    throw error;
  }

  // Enter OTP into the verification screen
  console.info(`⌨️  Entering OTP into verification screen...`);
  const beforeSubmit = new Date();
  console.info(`🚀 Starting OTP entry at: ${beforeSubmit.toISOString()}`);
  await verifyPage.enterOTP(result.otp);

  // Wait for auto-submission and navigation to home page
  console.info(`⏳ Waiting for auto-submission to complete...`);
  await homePage.filterAll.waitForDisplayed({ timeout: TIMEOUT.SCREEN_READY });

  console.info('✅ Login completed successfully');
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
  // First wait for app to reach a ready state
  let appState = await waitForAppReady();
  
  if (appState === 'home') {
    console.info('✓ Already logged in (detected during app ready check)');
    return;
  }
  
  if (appState === 'welcome') {
    console.info('ℹ On welcome page, proceeding with login');
    await loginWithOTP(email);
    return;
  }
  
  // Unknown state - attempt recovery by restarting app
  console.warn('⚠️ App in unknown state, attempting recovery via app restart...');
  await restartApp();
  
  // Check state after restart
  appState = await waitForAppReady();
  
  if (appState === 'home') {
    console.info('✓ Recovery successful - already logged in after restart');
    return;
  }
  
  if (appState === 'welcome') {
    console.info('ℹ Recovery successful - on welcome page, proceeding with login');
    await loginWithOTP(email);
    return;
  }
  
  // Still unknown after restart - try the traditional check as last resort
  console.warn('⚠️ App state still unknown after restart, attempting traditional login check...');
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    await loginWithOTP(email);
  }
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
