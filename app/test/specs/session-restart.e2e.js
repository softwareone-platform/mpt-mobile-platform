const { expect } = require('@wdio/globals');

const homePage = require('../pageobjects/spotlights.page');
const { restartApp, waitForAppReady } = require('../pageobjects/utils/app.helper');
const { AIRTABLE_EMAIL, ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { TIMEOUT, PAUSE } = require('../pageobjects/utils/constants');

describe('Session persistence (experimental)', () => {
  before(async function () {
    this.timeout(TIMEOUT.AUTH_FLOW_WAIT);
    await ensureLoggedIn();
  });

  it('should keep user logged in after app restart', async () => {
    const restartTestStart = new Date();
    console.info(`🔄 [${restartTestStart.toISOString()}] Starting app restart test`);

    // DIAGNOSTIC: Verify auth is healthy in memory before the destructive restart.
    // Background/foreground keeps the process alive — if this finds welcome, auth never worked.
    console.info('🔍 [DIAGNOSTIC] Background/foreground check (process stays alive)...');
    await driver.background(3);
    const bgFgState = await waitForAppReady(TIMEOUT.SCREEN_READY, 'either');
    console.info(`🔍 [DIAGNOSTIC] After background/foreground: detected state = ${bgFgState}`);
    if (bgFgState !== 'home') {
      throw new Error(
        `Auth state lost during background/foreground (process alive). State: ${bgFgState}. ` +
        'This means auth tokens were never properly set in memory, not a persistence issue.',
      );
    }

    // DIAGNOSTIC: Query app state to confirm app is active before restart
    try {
      const appState = await driver.execute('mobile: queryAppState', { bundleId: 'com.softwareone.marketplaceMobile' });
      console.info(`🔍 [DIAGNOSTIC] App state before restart: ${appState} (4=foreground, 3=background, 1=not running)`);
    } catch (e) {
      console.info(`🔍 [DIAGNOSTIC] Could not query app state: ${e.message}`);
    }

    // Restart the app (terminate process + cold launch)
    const beforeRestart = new Date();
    console.info(`🔄 [${beforeRestart.toISOString()}] Calling restartApp()...`);
    const detectedState = await restartApp({
      timeout: TIMEOUT.AUTH_FLOW_WAIT,
      expectedState: 'either',
      settleBeforeTerminateMs: PAUSE.AUTH_FLOW_POLL,
    });
    const afterRestart = new Date();
    console.info(`✅ [${afterRestart.toISOString()}] restartApp() completed in ${(afterRestart - beforeRestart) / 1000}s, detected state: ${detectedState}`);

    // Fail fast with clear message if session was lost
    if (detectedState === 'welcome') {
      throw new Error(
        'Session was not preserved after app restart (cold launch): app landed on welcome/login screen instead of home. ' +
        'Background/foreground check passed (auth WAS in memory), so this is a credential STORAGE issue — ' +
        'expo-secure-store (Keychain) writes likely fail silently on CI Release builds. ' +
        `Settle time before terminate was ${PAUSE.AUTH_FLOW_POLL}ms.`,
      );
    }
    if (detectedState === 'unknown') {
      throw new Error(
        'App did not reach a known state after restart (neither home nor welcome detected within timeout).',
      );
    }

    // Verify user is still logged in by checking for home page elements
    const beforeCheck = new Date();
    console.info(`⏳ [${beforeCheck.toISOString()}] Waiting for home page after restart (timeout: 30s)...`);
    await homePage.header.logoTitle.waitForDisplayed({ timeout: TIMEOUT.SCREEN_READY });
    const afterCheck = new Date();
    console.info(`✅ [${afterCheck.toISOString()}] Home page found after ${(afterCheck - beforeCheck) / 1000}s`);
    await expect(homePage.header.logoTitle).toBeDisplayed();
    console.info('✅ User is still logged in after app restart');
  });
});
