const path = require('path');

const dotenv = require('dotenv');

// Load .env file from app directory
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

/**
 * Get an environment variable with optional default value
 * @param {string} key - Environment variable name
 * @param {string} [defaultValue] - Default value if not set
 * @returns {string|undefined}
 */
function getEnv(key, defaultValue) {
  return process.env[key] || defaultValue;
}

/**
 * Get a required environment variable (throws if not set)
 * @param {string} key - Environment variable name
 * @returns {string}
 * @throws {Error} If the environment variable is not set
 */
function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable "${key}" is not set. Check your .env file.`);
  }
  return value;
}

module.exports = {
  getEnv,
  requireEnv,
  // Re-export common env vars for convenience
  // Note: These are evaluated at require() time, so dotenv must be loaded first
  API_BASE_URL: getEnv('API_BASE_URL'),
  API_OPS_TOKEN: getEnv('API_OPS_TOKEN'),
  API_CLIENT_TOKEN: getEnv('API_CLIENT_TOKEN'),
  API_VENDOR_TOKEN: getEnv('API_VENDOR_TOKEN'),
  AUTH0_CLIENT_ID: getEnv('AUTH0_CLIENT_ID'),
  // ACC- ID of the Operations test account for the current environment.
  // Used by account.helper.js to detect and switch to the Operations account,
  // which is required for navigating to sub-lists like Licensees.
  // Falls back to the known test-environment value if not explicitly set.
  OPS_ACCOUNT_ID: getEnv('OPS_ACCOUNT_ID', 'ACC-4850-1126'),
  // ACC- ID of the Client/Buyer test account for the current environment.
  // Used by account.helper.js to detect and switch to the Client account.
  CLIENT_ACCOUNT_ID: getEnv('CLIENT_ACCOUNT_ID'),
  // Short label for the current test environment (e.g. 'test', 'portal', 'qa').
  // Override via TEST_ENV env var; falls back to the first meaningful hostname segment
  // derived from API_BASE_URL (e.g. 'https://api.portal.s1.team' → 'portal').
  TEST_ENV_LABEL: (() => {
    const override = process.env.TEST_ENV;
    if (override) return override;
    try {
      const hostname = new URL(process.env.API_BASE_URL || '').hostname;
      const parts = hostname.split('.');
      return (parts[0] === 'api' ? parts[1] : parts[0]) || 'unknown';
    } catch {
      return 'unknown';
    }
  })(),
};
