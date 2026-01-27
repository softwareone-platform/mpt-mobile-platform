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
  const start = new Date();
  console.log(`🔄 [${start.toISOString()}] Terminating app...`);
  await driver.terminateApp(APP_ID);
  const afterTerminate = new Date();
  console.log(`   ✅ [${afterTerminate.toISOString()}] terminateApp() call completed (${afterTerminate - start}ms)`);
  console.log(`   ⏳ Starting 2000ms pause...`);
  await browser.pause(2000);
  const afterPause = new Date();
  console.log(`   ✅ [${afterPause.toISOString()}] Pause completed. Total terminateApp time: ${afterPause - start}ms`);
}

/**
 * Activates/launches the app
 * @returns {Promise<void>}
 */
async function activateApp() {
  const start = new Date();
  console.log(`🔄 [${start.toISOString()}] Activating app...`);
  await driver.activateApp(APP_ID);
  const afterActivate = new Date();
  console.log(`   ✅ [${afterActivate.toISOString()}] activateApp() call completed (${afterActivate - start}ms)`);
  console.log(`   ⏳ Starting 3000ms pause...`);
  await browser.pause(3000);
  const afterPause = new Date();
  console.log(`   ✅ [${afterPause.toISOString()}] Pause completed. Total activateApp time: ${afterPause - start}ms`);
}

/**
 * Waits for the app to be fully loaded by checking for known UI elements
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<void>}
 */
async function waitForAppReady(timeout = 30000) {
  const waitStart = new Date();
  console.log(`⏳ [${waitStart.toISOString()}] waitForAppReady() started (timeout: ${timeout}ms)`);
  
  const startTime = Date.now();
  const pollInterval = 1000;
  let iteration = 0;
  
  while (Date.now() - startTime < timeout) {
    iteration++;
    const iterStart = new Date();
    try {
      // Check for either home page (logged in) or welcome page (logged out)
      const homeVisible = await $('//*[contains(@name, "Spotlight") or contains(@text, "Spotlight")]')
        .isDisplayed()
        .catch(() => false);
      
      if (homeVisible) {
        const found = new Date();
        console.log(`✅ [${found.toISOString()}] App ready - home page detected after ${iteration} iterations (${found - waitStart}ms)`);
        return;
      }
      
      const welcomeVisible = await $('//*[@name="Welcome" or @text="Welcome"]')
        .isDisplayed()
        .catch(() => false);
      
      if (welcomeVisible) {
        const found = new Date();
        console.log(`✅ [${found.toISOString()}] App ready - welcome page detected after ${iteration} iterations (${found - waitStart}ms)`);
        return;
      }
      
      const iterEnd = new Date();
      console.log(`   ⏳ [${iterEnd.toISOString()}] waitForAppReady iteration ${iteration}: neither home nor welcome visible (check took ${iterEnd - iterStart}ms)`);
      await browser.pause(pollInterval);
    } catch (e) {
      console.log(`   ⚠️ waitForAppReady iteration ${iteration} error: ${e.message}`);
      await browser.pause(pollInterval);
    }
  }
  
  const timedOut = new Date();
  console.warn(`⚠️ [${timedOut.toISOString()}] App ready check timed out after ${timedOut - waitStart}ms, proceeding anyway`);
}

/**
 * Restarts the app by terminating and then activating it
 * Waits for the app to be fully loaded before returning
 * @returns {Promise<void>}
 */
async function restartApp() {
  const restartStart = new Date();
  console.log(`🔄 [${restartStart.toISOString()}] restartApp() started`);
  await terminateApp();
  const afterTerminate = new Date();
  console.log(`   📍 [${afterTerminate.toISOString()}] After terminateApp: ${afterTerminate - restartStart}ms elapsed`);
  await activateApp();
  const afterActivate = new Date();
  console.log(`   📍 [${afterActivate.toISOString()}] After activateApp: ${afterActivate - restartStart}ms elapsed`);
  await waitForAppReady();
  const restartEnd = new Date();
  console.log(`✅ [${restartEnd.toISOString()}] restartApp() completed. Total time: ${restartEnd - restartStart}ms`);
}

module.exports = {
  APP_ID,
  terminateApp,
  activateApp,
  waitForAppReady,
  restartApp,
};
