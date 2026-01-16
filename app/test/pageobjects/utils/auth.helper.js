const welcomePage = require('../welcome.page');
const verifyPage = require('../verify.page');
const homePage = require('../spotlights.page');

const AIRTABLE_EMAIL = process.env.AIRTABLE_EMAIL || 'not-set';
const OTP_TIMEOUT_MS = 120000;
const POLL_INTERVAL_MS = 10000;

/**
 * Checks if the user is already logged in by checking for home page elements
 * @returns {Promise<boolean>} true if logged in, false otherwise
 */
async function isLoggedIn() {
    try {
        // Check if we're on the home page by looking for the spotlight header
        const isWelcomeVisible = await welcomePage.emailInput.isDisplayed().catch(() => true);
        if (!isWelcomeVisible) {
            console.log('✓ User is already logged in');
            return true;
        }
        
        return false;
    } catch {
        console.log('User is not logged in');
        return false;
    }
}

/**
 * Performs the complete login flow with OTP verification
 * @param {string} email - Email address to login with (defaults to AIRTABLE_EMAIL)
 * @returns {Promise<void>}
 */
async function loginWithOTP(email = AIRTABLE_EMAIL) {
    console.log(`🔐 Starting login flow for: ${email}`);
    
    // Check if already logged in
    if (await isLoggedIn()) {
        console.log('✓ Already logged in, skipping login flow');
        return;
    }
    
    // Check if we're on the welcome page
    const isWelcomeVisible = await welcomePage.welcomeTitle.isDisplayed().catch(() => false);
    if (!isWelcomeVisible) {
        throw new Error('Not on welcome page and not logged in. Cannot proceed with login flow.');
    }
    
    // Clear any previous input
    await welcomePage.clearText(welcomePage.emailInput).catch(() => {});
    
    // Enter email
    console.log(`⌨️  Entering email: ${email}`);
    await welcomePage.typeText(welcomePage.emailInput, email);
    
    // Verify the email was entered correctly
    const enteredValue = await welcomePage.emailInput.getAttribute('value');
    if (enteredValue !== email) {
        throw new Error(`Email entry failed. Expected: ${email}, Got: ${enteredValue}`);
    }
    
    // Record timestamp before requesting OTP
    const beforeOTPRequest = new Date();
    console.log(`🕐 Timestamp BEFORE OTP request: ${beforeOTPRequest.toISOString()}`);
    
    // Click continue to trigger OTP request
    await welcomePage.click(welcomePage.continueButton);
    const afterOTPRequest = new Date();
    console.log(`🕐 Timestamp AFTER OTP request: ${afterOTPRequest.toISOString()}`);
    
    // Wait for navigation to verify screen
    await verifyPage.verifyTitle.waitForDisplayed({ timeout: 10000 });
    console.log('✓ Navigated to verification screen');
    
    // Wait for OTP to arrive via Airtable
    console.log('⏳ Waiting for OTP to arrive via Airtable...');
    let result;
    try {
        result = await global.getOTPFromAirtable(
            email,
            beforeOTPRequest,
            OTP_TIMEOUT_MS,
            POLL_INTERVAL_MS
        );
        
        const otpRetrievedTime = new Date();
        console.log(`✅ Retrieved OTP: ${result.otp} at ${otpRetrievedTime.toISOString()}`);
        console.log(`📧 Email subject: ${result.record.fields.Subject}`);
        console.log(`📧 Email created at: ${result.record.fields['Created At']}`);
        console.log(`⏱️  Time from request to retrieval: ${(otpRetrievedTime - afterOTPRequest) / 1000}s`);
        
        // Verify we got a valid 6-digit OTP
        if (!/^\d{6}$/.test(result.otp)) {
            throw new Error(`Invalid OTP format: ${result.otp}`);
        }
        console.log('✓ OTP verification completed successfully');
    } catch (error) {
        console.error('❌ OTP retrieval or verification failed:', error.message);
        throw error;
    }
    
    // Enter OTP into the verification screen
    console.log(`⌨️  Entering OTP into verification screen...`);
    const beforeSubmit = new Date();
    console.log(`🚀 Starting OTP entry at: ${beforeSubmit.toISOString()}`);
    await verifyPage.enterOTP(result.otp);
    
    // Wait for auto-submission and navigation to home page
    console.log(`⏳ Waiting for auto-submission to complete...`);
    await homePage.filterAll.waitForDisplayed({ timeout: 30000 });
    
    console.log('✅ Login completed successfully');
}

/**
 * Ensures the user is logged in before running tests
 * Call this in beforeEach or before hooks
 * @param {string} email - Email address to login with (defaults to AIRTABLE_EMAIL)
 * @returns {Promise<void>}
 */
async function ensureLoggedIn(email = AIRTABLE_EMAIL) {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        await loginWithOTP(email);
    }
}

module.exports = {
    isLoggedIn,
    loginWithOTP,
    ensureLoggedIn,
    AIRTABLE_EMAIL
};
