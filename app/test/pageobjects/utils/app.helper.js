/**
 * App lifecycle helper for managing app state during tests
 * Provides methods to terminate and restart the app
 */

const APP_ID = 'com.softwareone.marketplaceMobile';

/**
 * Terminates the app
 * @returns {Promise<void>}
 */
async function terminateApp() {
  console.log('🔄 Terminating app...');
  await driver.terminateApp(APP_ID);
  await browser.pause(2000);
}

/**
 * Activates/launches the app
 * @returns {Promise<void>}
 */
async function activateApp() {
  console.log('🔄 Activating app...');
  await driver.activateApp(APP_ID);
  await browser.pause(3000);
}

/**
 * Restarts the app by terminating and then activating it
 * @returns {Promise<void>}
 */
async function restartApp() {
  console.log('🔄 Restarting app...');
  await terminateApp();
  await activateApp();
  console.log('✅ App restarted successfully');
}

module.exports = {
  APP_ID,
  terminateApp,
  activateApp,
  restartApp,
};
