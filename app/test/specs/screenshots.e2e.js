const screenshotsPage = require('../pageobjects/screenshots.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { PAUSE, TIMEOUT } = require('../pageobjects/utils/constants');

const journey = screenshotsPage.journey;

describe('App Store Screenshots', () => {
  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    screenshotsPage.ensureOutputDir();
  });

  journey.steps.forEach((step) => {
    it(`captures ${step.screenshot}: ${step.description}`, async () => {
      await screenshotsPage.navigateToPage(step.page);

      for (const action of step.actions || []) {
        await screenshotsPage.executeAction(action);
      }

      await browser.pause(PAUSE.ANIMATION_SETTLE);
      await screenshotsPage.captureScreenshot(step.screenshot);
    });
  });
});
