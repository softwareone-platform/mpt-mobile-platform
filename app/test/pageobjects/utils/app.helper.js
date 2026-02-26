/**
 * App lifecycle helper for managing app state during tests
 * Provides methods to terminate and restart the app
 */

const { PAUSE, TIMEOUT } = require('./constants');

const APP_ID = 'com.softwareone.marketplaceMobile';

/**
 * Terminates the app
 * @returns {Promise<void>}
 */
async function terminateApp() {
  const start = new Date();
  console.info(`🔄 [${start.toISOString()}] Terminating app...`);
  await driver.terminateApp(APP_ID);
  const afterTerminate = new Date();
  console.info(`   ✅ [${afterTerminate.toISOString()}] terminateApp() call completed (${afterTerminate - start}ms)`);
  console.info(`   ⏳ Starting ${PAUSE.APP_TERMINATE}ms pause...`);
  await browser.pause(PAUSE.APP_TERMINATE);
  const afterPause = new Date();
  console.info(`   ✅ [${afterPause.toISOString()}] Pause completed. Total terminateApp time: ${afterPause - start}ms`);
}

/**
 * Activates/launches the app
 * @returns {Promise<void>}
 */
async function activateApp() {
  const start = new Date();
  console.info(`🔄 [${start.toISOString()}] Activating app...`);
  await driver.activateApp(APP_ID);
  const afterActivate = new Date();
  console.info(`   ✅ [${afterActivate.toISOString()}] activateApp() call completed (${afterActivate - start}ms)`);
  console.info(`   ⏳ Starting ${PAUSE.APP_ACTIVATE}ms pause...`);
  await browser.pause(PAUSE.APP_ACTIVATE);
  const afterPause = new Date();
  console.info(`   ✅ [${afterPause.toISOString()}] Pause completed. Total activateApp time: ${afterPause - start}ms`);
}

/**
 * Waits for the app to be fully loaded by checking for known UI elements
 * @param {number} timeout - Maximum time to wait in ms
 * @param {'either'|'home'|'welcome'} expectedState - Expected app state
 * @returns {Promise<'home'|'welcome'|'unknown'>}
 */
async function waitForAppReady(timeout = TIMEOUT.SCREEN_READY, expectedState = 'either') {
  const waitStart = new Date();
  console.info(
    `⏳ [${waitStart.toISOString()}] waitForAppReady() started (timeout: ${timeout}ms, expectedState: ${expectedState})`,
  );
  
  const startTime = Date.now();
  const pollInterval = PAUSE.POLL_INTERVAL;
  let iteration = 0;
  
  while (Date.now() - startTime < timeout) {
    iteration++;
    const iterStart = new Date();
    try {
      // Check for either home page (logged in) or welcome page (logged out)
      const homeVisible = await $('//*[contains(@name, "Spotlight") or contains(@text, "Spotlight")]')
        .isDisplayed()
        .catch(() => false);
      
      if (homeVisible && (expectedState === 'either' || expectedState === 'home')) {
        const found = new Date();
        console.info(`✅ [${found.toISOString()}] App ready - home page detected after ${iteration} iterations (${found - waitStart}ms)`);
        return 'home';
      }
      
      const welcomeVisible = await $('//*[@name="Welcome" or @text="Welcome"]')
        .isDisplayed()
        .catch(() => false);
      
      if (welcomeVisible && (expectedState === 'either' || expectedState === 'welcome')) {
        const found = new Date();
        console.info(`✅ [${found.toISOString()}] App ready - welcome page detected after ${iteration} iterations (${found - waitStart}ms)`);
        return 'welcome';
      }
      
      const iterEnd = new Date();
      console.info(`   ⏳ [${iterEnd.toISOString()}] waitForAppReady iteration ${iteration}: neither home nor welcome visible (check took ${iterEnd - iterStart}ms)`);
      await browser.pause(pollInterval);
    } catch (e) {
      console.info(`   ⚠️ waitForAppReady iteration ${iteration} error: ${e.message}`);
      await browser.pause(pollInterval);
    }
  }
  
  const timedOut = new Date();
  console.warn(`⚠️ [${timedOut.toISOString()}] App ready check timed out after ${timedOut - waitStart}ms, proceeding anyway`);
  return 'unknown';
}

/**
 * Restarts the app by terminating and then activating it
 * Waits for the app to be fully loaded before returning
 * @param {{ timeout?: number, expectedState?: 'either'|'home'|'welcome', settleBeforeTerminateMs?: number }} options
 * @returns {Promise<'home'|'welcome'|'unknown'>}
 */
async function restartApp(options = {}) {
  const {
    timeout = TIMEOUT.SCREEN_READY,
    expectedState = 'either',
    settleBeforeTerminateMs = 0,
  } = options;
  const restartStart = new Date();
  console.info(
    `🔄 [${restartStart.toISOString()}] restartApp() started (timeout: ${timeout}ms, expectedState: ${expectedState}, settleBeforeTerminateMs: ${settleBeforeTerminateMs})`,
  );
  if (settleBeforeTerminateMs > 0) {
    console.info(`⏳ Waiting ${settleBeforeTerminateMs}ms before terminate to allow state persistence...`);
    await browser.pause(settleBeforeTerminateMs);
  }
  await terminateApp();
  const afterTerminate = new Date();
  console.info(`   📍 [${afterTerminate.toISOString()}] After terminateApp: ${afterTerminate - restartStart}ms elapsed`);
  await activateApp();
  const afterActivate = new Date();
  console.info(`   📍 [${afterActivate.toISOString()}] After activateApp: ${afterActivate - restartStart}ms elapsed`);
  const detectedState = await waitForAppReady(timeout, expectedState);
  const restartEnd = new Date();
  console.info(
    `✅ [${restartEnd.toISOString()}] restartApp() completed. Total time: ${restartEnd - restartStart}ms. Detected state: ${detectedState}`,
  );
  return detectedState;
}

module.exports = {
  APP_ID,
  terminateApp,
  activateApp,
  waitForAppReady,
  restartApp,
};
