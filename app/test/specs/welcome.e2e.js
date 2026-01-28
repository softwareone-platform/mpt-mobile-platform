const { expect } = require('@wdio/globals');

const homePage = require('../pageobjects/spotlights.page');
const { restartApp } = require('../pageobjects/utils/app.helper');
const { AIRTABLE_EMAIL, ensureLoggedOut } = require('../pageobjects/utils/auth.helper');
const { isAndroid } = require('../pageobjects/utils/selectors');
const verifyPage = require('../pageobjects/verify.page');
const welcomePage = require('../pageobjects/welcome.page');
const { TIMEOUT } = require('../pageobjects/utils/constants');

const otpTimeoutMs = 260000;
const pollIntervalMs = 13000;

describe('Welcome page of application', () => {
  before(async function () {
    // Set timeout for potential logout flow
    this.timeout(TIMEOUT.SCREEN_READY);
    // Ensure user is logged out before running welcome tests
    await ensureLoggedOut();
  });

  it('to display welcome title', async () => {
    await expect(welcomePage.welcomeTitle).toBeDisplayed();
    await expect(welcomePage.welcomeTitle).toHaveText('Welcome');
    await expect(welcomePage.enterEmailSubTitle).toBeDisplayed();
    await expect(welcomePage.enterEmailSubTitle).toHaveText(
      'Existing Marketplace users can now enjoy our mobile experience. Enter your registered email address below to gain access.',
    );
  });

  it('to display email input and submit button', async () => {
    await expect(welcomePage.emailInput).toBeDisplayed();
    await expect(welcomePage.continueButton).toBeDisplayed();
  });

  it('to show email required error when progressing without entering one', async () => {
    await welcomePage.click(welcomePage.continueButton);
    await expect(welcomePage.emailRequiredErrorLabel).toBeDisplayed();
    await expect(welcomePage.emailRequiredErrorLabel).toHaveText('Email is required');
  });

  it('to show invalid email error when progressing with invalid one', async () => {
    await welcomePage.typeText(welcomePage.emailInput, 'invalid-email');
    await welcomePage.click(welcomePage.continueButton);
    await expect(welcomePage.validEmailErrorLabel).toBeDisplayed();
    await expect(welcomePage.validEmailErrorLabel).toHaveText('Please enter a valid email address');
  });

  it('to complete OTP flow with valid email and retrieve OTP from Airtable', async function () {
    // Set timeout for this specific test (OTP retrieval can take up to 260s + 90s for auth flow)
    this.timeout(otpTimeoutMs + 120000);

    // Clear any previous input
    await welcomePage.clearText(welcomePage.emailInput);

    // Use the Gmail account hooked up to automation
    const testEmail = AIRTABLE_EMAIL;

    // Enter valid test email
    await welcomePage.typeText(welcomePage.emailInput, testEmail);
    // Verify the email was entered correctly
    // Android uses 'text' attribute, iOS uses 'value'
    const enteredValue = await welcomePage.emailInput.getAttribute(isAndroid() ? 'text' : 'value');
    expect(enteredValue).toBe(testEmail);

    // Record timestamp before requesting OTP to avoid picking up old emails
    const beforeOTPRequest = new Date();
    console.info(`🕐 Timestamp BEFORE OTP request: ${beforeOTPRequest.toISOString()}`);

    // Click continue to trigger OTP request
    await welcomePage.click(welcomePage.continueButton);
    const afterOTPRequest = new Date();
    console.info(`🕐 Timestamp AFTER OTP request: ${afterOTPRequest.toISOString()}`);

    // Wait for navigation to verify screen
    await expect(verifyPage.verifyTitle).toBeDisplayed();
    await expect(verifyPage.verificationCodeMessage).toBeDisplayed();

    let result = null;
    try {
      // Wait for OTP to arrive in Airtable
      console.info('⏳ Waiting for OTP to arrive via Airtable...');
      result = await global.getOTPFromAirtable(
        testEmail,
        beforeOTPRequest,
        otpTimeoutMs,
        pollIntervalMs,
      );
      const otpRetrievedTime = new Date();
      console.info(`✅ Retrieved OTP: ${result.otp} at ${otpRetrievedTime.toISOString()}`);
      console.info(`📧 Email subject: ${result.record.fields.Subject}`);
      console.info(`📧 Email created at: ${result.record.fields['Created At']}`);
      console.info(
        `⏱️  Time from request to retrieval: ${(otpRetrievedTime - afterOTPRequest) / 1000}s`,
      );

      // Verify we got a valid 6-digit OTP
      expect(result.otp).toMatch(/^\d{6}$/);
      console.info('✓ OTP verification completed successfully');
    } catch (error) {
      console.error('OTP retrieval or verification failed:', error.message);
      throw error;
    }

    // Enter OTP into the verification screen
    console.info(`⌨️  Entering OTP into verification screen...`);
    const beforeSubmit = new Date();
    console.info(`🚀 Starting OTP entry at: ${beforeSubmit.toISOString()}`);
    console.info(
      `⏱️  Time from OTP creation to entry start: ${(beforeSubmit - new Date(result.record.fields['Created At'])) / 1000}s`,
    );
    await verifyPage.enterOTP(result.otp);
    const afterOTPEntry = new Date();
    console.info(`✅ OTP entry completed at: ${afterOTPEntry.toISOString()}`);
    console.info(`⏱️  OTP entry took: ${(afterOTPEntry - beforeSubmit) / 1000}s`);

    // Note: The app auto-submits when 6 digits are entered (via useEffect)
    // So we DON'T need to click the verify button - just wait for navigation
    console.info(`⏳ Waiting for auto-submission to complete...`);

    // After OTP entry, check for successful login (app auto-submits)
    // Login can take a while (auth0, token exchange, user data fetch), so we use a longer timeout
    // The full auth flow can take 60+ seconds in some cases
    const beforeHomeWait = new Date();
    console.info(`⏳ [${beforeHomeWait.toISOString()}] Starting to wait for home page (timeout: 90s)...`);
    
    // Add periodic logging while waiting
    const waitTimeout = 90000;
    const pollInterval = 10000;
    let elapsed = 0;
    let homePageFound = false;
    
    while (elapsed < waitTimeout && !homePageFound) {
      const checkStart = new Date();
      try {
        // Check if home page is visible (short timeout for quick polling)
        await homePage.header.logoTitle.waitForDisplayed({ timeout: pollInterval });
        homePageFound = true;
        const foundAt = new Date();
        console.info(`✅ [${foundAt.toISOString()}] Home page FOUND after ${(foundAt - beforeHomeWait) / 1000}s`);
      } catch {
        elapsed += pollInterval;
        const now = new Date();
        console.info(`⏳ [${now.toISOString()}] Still waiting for home page... (${elapsed / 1000}s elapsed, ${(waitTimeout - elapsed) / 1000}s remaining)`);
        
        // Log what's currently visible on screen for debugging
        try {
          const currentPageSource = await browser.getPageSource();
          // Check for common elements to understand current state
          const hasSpotlight = currentPageSource.includes('Spotlight');
          const hasWelcome = currentPageSource.includes('Welcome');
          const hasVerify = currentPageSource.includes('Verify') || currentPageSource.includes('verification');
          const hasError = currentPageSource.includes('error') || currentPageSource.includes('Error');
          console.info(`   📍 Page state: Spotlight=${hasSpotlight}, Welcome=${hasWelcome}, Verify=${hasVerify}, Error=${hasError}`);
        } catch (e) {
          console.info(`   ⚠️ Could not get page source: ${e.message}`);
        }
      }
    }
    
    if (!homePageFound) {
      const failedAt = new Date();
      console.error(`❌ [${failedAt.toISOString()}] Home page NOT found after ${(failedAt - beforeHomeWait) / 1000}s`);
      throw new Error(`Home page not displayed after ${waitTimeout / 1000}s timeout`);
    }
    
    console.info(`✅ Home page loaded successfully`);
    await expect(homePage.header.logoTitle).toBeDisplayed();
    
    // Log completion time for the entire OTP test
    const testEnd = new Date();
    console.info(`🏁 [${testEnd.toISOString()}] OTP test completed. Total auth flow time: ${(testEnd - afterOTPEntry) / 1000}s`);
  });

  it('should keep user logged in after app restart', async () => {
    const restartTestStart = new Date();
    console.info(`🔄 [${restartTestStart.toISOString()}] Starting app restart test`);
    
    // Restart the app
    const beforeRestart = new Date();
    console.info(`🔄 [${beforeRestart.toISOString()}] Calling restartApp()...`);
    await restartApp();
    const afterRestart = new Date();
    console.info(`✅ [${afterRestart.toISOString()}] restartApp() completed in ${(afterRestart - beforeRestart) / 1000}s`);

    // Verify user is still logged in by checking for home page elements
    const beforeCheck = new Date();
    console.info(`⏳ [${beforeCheck.toISOString()}] Waiting for home page after restart (timeout: 15s)...`);
    await homePage.header.logoTitle.waitForDisplayed({ timeout: 15000 });
    const afterCheck = new Date();
    console.info(`✅ [${afterCheck.toISOString()}] Home page found after ${(afterCheck - beforeCheck) / 1000}s`);
    await expect(homePage.header.logoTitle).toBeDisplayed();
    console.info('✅ User is still logged in after app restart');
  });
});
