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

  get noSubscriptionsTitle() {
    return $(selectors.byText('No subscriptions'));
  }

  get noSubscriptionsDescription() {
    return $(selectors.byText('No subscriptions found.'));
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

  /**
   * Check if the subscriptions page has any subscriptions (not showing empty state)
   * @returns {Promise<boolean>} True if subscriptions exist, false if empty state is shown
   */
  async hasSubscriptions() {
    try {
      const emptyStateVisible = await this.emptyState.isDisplayed();
      return !emptyStateVisible;
    } catch {
      // If emptyState selector throws, assume subscriptions exist
      return true;
    }
  }
}

module.exports = new SubscriptionsPage();
