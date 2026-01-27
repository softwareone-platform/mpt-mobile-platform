const dotenv = require('dotenv');
const path = require('path');

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
  AUTH0_CLIENT_ID: getEnv('AUTH0_CLIENT_ID'),
};
