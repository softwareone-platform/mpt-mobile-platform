const footerPage = require('../base/footer.page');
const headingPage = require('../base/heading.page');
const homePage = require('../spotlights.page');

const { isLoggedIn } = require('./auth.helper');

async function ensureHomePage() {
  // First check if we're logged in at all
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    throw new Error('User is not logged in. Please ensure authentication before navigating.');
  }

  // Check if already on home page (spotlight filter visible)
  const isHomeVisible = await homePage.filterAll.isDisplayed().catch(() => false);
  if (isHomeVisible) {
    return;
  }

  // Navigate back to a page with footer visible
  const maxBackAttempts = 5;
  for (let i = 0; i < maxBackAttempts; i++) {
    const isFooterVisible = await footerPage.spotlightsTab
      .isDisplayed()
      .catch(() => false);

    if (isFooterVisible) {
      break;
    }

    const backButtonExists = await headingPage.backButton
      .isDisplayed()
      .catch(() => false);

    if (backButtonExists) {
      await headingPage.backButton.click();
      await browser.pause(500);
    } else {
      break;
    }
  }

  // Click spotlights tab to go to home page
  const isFooterVisible = await footerPage.spotlightsTab
    .isDisplayed()
    .catch(() => false);

  if (isFooterVisible) {
    await footerPage.clickSpotlightsTab();
    await browser.pause(1000);
    // Reset filter scroll position so filterAll is visible
    await homePage.resetFilterScrollPosition().catch(() => {});
    await browser.pause(300);
  }

  // Final check - wait for filterAll to be displayed
  await homePage.filterAll.waitForDisplayed({ timeout: 10000 });
}

module.exports = { ensureHomePage };
