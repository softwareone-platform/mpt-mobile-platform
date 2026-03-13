const {
  TIMEOUT,
  PAUSE,
  SCROLL,
  GESTURE,
  RETRY,
  REGEX,
  DEFAULTS,
  LIMITS,
  PLATFORM,
} = require('../pageobjects/utils/constants');

/**
 * Global constants fixture for Mocha tests
 * Exposes shared test constants under global.constants
 */

/**
 * Setup global constants fixture before all tests
 */
exports.mochaGlobalSetup = async function () {
  console.info('🔧 Setting up constants global fixture...');

  global.constants = {
    ...(global.constants || {}),
    TIMEOUT,
    PAUSE,
    SCROLL,
    GESTURE,
    RETRY,
    REGEX,
    DEFAULTS,
    LIMITS,
    PLATFORM,
    dashForEmpty: DEFAULTS.DASH_FOR_EMPTY,
  };

  console.info('✅ Constants global fixture ready');
};
