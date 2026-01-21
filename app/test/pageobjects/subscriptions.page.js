const { $ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const { selectors } = require('./utils/selectors');

class SubscriptionsPage extends BasePage {
  constructor() {
    super();
    this.header = headingPage;
    this.footer = footerPage;
  }

  get loadingIndicator() {
    return $(selectors.byAccessibilityId('subscriptions-loading-indicator'));
  }

  get emptyState() {
    return $(selectors.byAccessibilityId('subscriptions-empty-state'));
  }

  get errorState() {
    return $(selectors.byAccessibilityId('subscriptions-error-state'));
  }

  /**
   * Wait for the subscriptions screen to be ready (either shows data, empty state, or error)
   */
  async waitForScreenReady(timeout = 30000) {
    // First wait for loading to potentially appear and disappear
    const loadingVisible = await this.loadingIndicator.isDisplayed().catch(() => false);
    if (loadingVisible) {
      await this.loadingIndicator.waitForDisplayed({ timeout, reverse: true }).catch(() => {});
    }
    // Screen is ready when either empty state or content is shown
    await browser.pause(500);
  }
}

module.exports = new SubscriptionsPage();
