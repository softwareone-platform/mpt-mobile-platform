const { expect } = require('@wdio/globals');

const { isAndroid } = require('../pageobjects/utils/selectors');

/**
 * Shared test suite for common page structure tests
 * Reusable across multiple page test files
 *
 * Usage:
 *   const { describePageStructure } = require('../utils/shared-tests');
 *   describePageStructure(myPage, { selectedTab: 'more' });
 */

/**
 * Creates a describe block for common page structure tests
 * @param {Object} page - Page object with headerTitle, accountButton, and footer properties
 * @param {Object} options - Configuration options
 * @param {string} options.selectedTab - Which footer tab should be selected ('spotlights' | 'chat' | 'subscriptions' | 'more')
 */
function testPageStructure(page, options = {}) {
  const { selectedTab = 'more' } = options;

  describe('Page Structure', () => {
    it('should display the header title', async () => {
      await expect(page.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await page.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(page.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(page.footer.spotlightsTab).toBeDisplayed();
      await expect(page.footer.chatTab).toBeDisplayed();
      await expect(page.footer.subscriptionsTab).toBeDisplayed();
      await expect(page.footer.moreTab).toBeDisplayed();
    });

    it(`should have ${selectedTab} tab selected`, async () => {
      const tabMap = {
        spotlights: page.footer.spotlightsTab,
        chat: page.footer.chatTab,
        subscriptions: page.footer.subscriptionsTab,
        more: page.footer.moreTab,
      };
      const tab = tabMap[selectedTab];

      if (isAndroid()) {
        const selected = await tab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        const value = await tab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });
}

module.exports = {
  testPageStructure,
};
