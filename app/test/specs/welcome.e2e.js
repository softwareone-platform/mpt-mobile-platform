const { expect } = require('@wdio/globals');

const homePage = require('../pageobjects/spotlights.page');
const { restartApp } = require('../pageobjects/utils/app.helper');
const { AIRTABLE_EMAIL } = require('../pageobjects/utils/auth.helper');
const { isAndroid } = require('../pageobjects/utils/selectors');
const verifyPage = require('../pageobjects/verify.page');
const welcomePage = require('../pageobjects/welcome.page');

const otpTimeoutMs = 260000;
const pollIntervalMs = 13000;

describe('Welcome page of application', () => {
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
    // Set timeout for this specific test
    this.timeout(otpTimeoutMs + 8000);

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

    // Note: The app auto-submits when 6 digits are entered (via useEffect)
    // So we DON'T need to click the verify button - just wait for navigation
    console.info(`⏳ Waiting for auto-submission to complete...`);

    // After OTP entry, check for successful login (app auto-submits)
    // Login can take a while, so we use a longer timeout
    await homePage.header.logoTitle.waitForDisplayed({ timeout: 30000 });
    await expect(homePage.header.logoTitle).toBeDisplayed();
  });

  it('should keep user logged in after app restart', async () => {
    // Restart the app
    await restartApp();

    // Verify user is still logged in by checking for home page elements
    await homePage.header.logoTitle.waitForDisplayed({ timeout: 15000 });
    await expect(homePage.header.logoTitle).toBeDisplayed();
    console.log('✅ User is still logged in after app restart');
  });
});
