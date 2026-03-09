const { waitForOTP } = require('../pageobjects/utils/airtable.service');
const { TIMEOUT, PAUSE } = require('../pageobjects/utils/constants');

/**
 * Global OTP fixture for Mocha tests
 * Provides reusable OTP retrieval functionality using Airtable
 */

/**
 * Retrieves OTP from Airtable for a given email address
 * @param {string} email - The email address to retrieve OTP for
 * @param {Date} afterTime - Only consider records created after this time
 * @param {number} timeoutMs - Maximum time to wait in milliseconds (default: 60000)
 * @param {number} pollIntervalMs - Time between polls in milliseconds (default: 5000)
 * @returns {Promise<{otp: string, record: object}>} - OTP and record data
 */
async function getOTPFromAirtable(
  email,
  afterTime,
  timeoutMs = TIMEOUT.OTP_WAIT_MAX,
  pollIntervalMs = PAUSE.OTP_POLL_INTERVAL,
) {
  console.info(`\n=== OTP Fixture: Getting OTP for ${email} ===`);

  try {
    const result = await waitForOTP(email, timeoutMs, pollIntervalMs, afterTime);
    console.info(`✅ OTP Fixture: Successfully retrieved OTP: ${result.otp}`);
    return result;
  } catch (error) {
    console.error(`❌ OTP Fixture: Failed to retrieve OTP for ${email}:`, error.message);
    throw error;
  }
}

/**
 * Setup global fixture before all tests
 */
exports.mochaGlobalSetup = async function () {
  console.info('🔧 Setting up OTP global fixture...');

  // Make the OTP function available globally
  global.getOTPFromAirtable = getOTPFromAirtable;

  // Verify Airtable configuration
  const requiredEnvVars = [
    'AIRTABLE_API_TOKEN',
    'AIRTABLE_BASE_ID',
    'AIRTABLE_TABLE_NAME',
    'AIRTABLE_FROM_EMAIL',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing Airtable environment variables: ${missingVars.join(', ')}`);
    console.warn('OTP functionality may not work properly');
  } else {
    console.info('✅ Airtable configuration verified');
  }

  console.info('🎯 OTP global fixture ready');
};

/**
 * Cleanup global fixture after all tests
 */
exports.mochaGlobalTeardown = async function () {
  console.info('🧹 Cleaning up OTP global fixture...');

  // Remove global function
  delete global.getOTPFromAirtable;

  console.info('✅ OTP global fixture cleaned up');
};
