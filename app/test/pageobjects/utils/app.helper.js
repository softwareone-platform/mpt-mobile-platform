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
 * Waits for the app to be fully loaded by checking for known UI elements
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<void>}
 */
async function waitForAppReady(timeout = 30000) {
  console.log('⏳ Waiting for app to be fully loaded...');
  
  const startTime = Date.now();
  const pollInterval = 1000;
  
  while (Date.now() - startTime < timeout) {
    try {
      // Check for either home page (logged in) or welcome page (logged out)
      const homeVisible = await $('//*[contains(@name, "Spotlight") or contains(@text, "Spotlight")]')
        .isDisplayed()
        .catch(() => false);
      
      if (homeVisible) {
        console.log('✅ App ready - home page detected');
        return;
      }
      
      const welcomeVisible = await $('//*[@name="Welcome" or @text="Welcome"]')
        .isDisplayed()
        .catch(() => false);
      
      if (welcomeVisible) {
        console.log('✅ App ready - welcome page detected');
        return;
      }
      
      await browser.pause(pollInterval);
    } catch {
      await browser.pause(pollInterval);
    }
  }
  
  console.warn('⚠️ App ready check timed out, proceeding anyway');
}

/**
 * Restarts the app by terminating and then activating it
 * Waits for the app to be fully loaded before returning
 * @returns {Promise<void>}
 */
async function restartApp() {
  console.log('🔄 Restarting app...');
  await terminateApp();
  await activateApp();
  await waitForAppReady();
  console.log('✅ App restarted successfully');
}

module.exports = {
  APP_ID,
  terminateApp,
  activateApp,
  waitForAppReady,
  restartApp,
};
