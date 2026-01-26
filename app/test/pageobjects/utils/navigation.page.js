const footerPage = require('../base/footer.page');
const headingPage = require('../base/heading.page');
const homePage = require('../spotlights.page');

const { isLoggedIn } = require('./auth.helper');

/**
 * Check if we're on the home/spotlight page (either with data or empty state)
 * @returns {Promise<boolean>}
 */
async function isOnHomePage() {
  // Check for filter chips (data state) OR empty state container
  const hasFilters = await homePage.filterAll.isDisplayed().catch(() => false);
  const hasEmptyState = await homePage.emptyState.isDisplayed().catch(() => false);
  const hasSpotlightHeader = await homePage.spotlightHeader.isDisplayed().catch(() => false);
  
  return hasFilters || hasEmptyState || hasSpotlightHeader;
}

/**
 * Ensures the app is on the home (Spotlights) page
 * @param {Object} options - Configuration options
 * @param {boolean} [options.resetFilters=true] - Whether to reset filter scroll position to default.
 *                                                 Set to false for tests that don't need filter positioning
 *                                                 (e.g., Orders, Subscriptions, Profile tests)
 */
async function ensureHomePage(options = {}) {
  const { resetFilters = true } = options;

  // First check if we're logged in at all
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    throw new Error('User is not logged in. Please ensure authentication before navigating.');
  }

  // Check if already on home page (spotlight filter OR empty state visible)
  const isHomeVisible = await isOnHomePage();
  if (isHomeVisible) {
    // Only reset filters if requested and filters exist
    if (resetFilters) {
      await homePage.resetFilterScrollPosition().catch(() => {});
      await browser.pause(300);
    }
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
    // Reset filter scroll position so filterAll is visible (only if requested and filters exist)
    if (resetFilters) {
      await homePage.resetFilterScrollPosition().catch(() => {});
      await browser.pause(300);
    }
  }

  // Final check - wait for home page indicators (filters OR empty state OR header)
  // Try filters first (most common), then fall back to header/empty state
  const hasFilters = await homePage.filterAll.isDisplayed().catch(() => false);
  if (!hasFilters) {
    // No filters - check for empty state or spotlight header instead
    const hasEmptyOrHeader = await isOnHomePage();
    if (!hasEmptyOrHeader) {
      throw new Error('Failed to navigate to home page - neither filters nor empty state visible');
    }
  }
}

module.exports = { ensureHomePage, isOnHomePage };
