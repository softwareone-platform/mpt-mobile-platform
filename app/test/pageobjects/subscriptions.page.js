const { $, $$ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const { getSelector, selectors } = require('./utils/selectors');

class SubscriptionsPage extends BasePage {
  constructor() {
    super();
    this.header = headingPage;
    this.footer = footerPage;
  }

  // ========== Loading States ==========

  get loadingIndicator() {
    return $(selectors.byAccessibilityId('subscriptions-loading-indicator'));
  }

  get emptyState() {
    return $(selectors.byAccessibilityId('subscriptions-empty-state'));
  }

  get errorState() {
    return $(selectors.byAccessibilityId('subscriptions-error-state'));
  }

  // ========== Header Elements ==========

  get headerTitle() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Subscriptions" and contains(@traits, "Header")]',
        android: '//android.view.View[@text="Subscriptions" and @heading="true"]',
      }),
    );
  }

  get accountButton() {
    return $(
      getSelector({
        ios: '~nav-account-button',
        android: '//*[@resource-id="nav-account-button"]',
      }),
    );
  }

  // ========== Empty State Elements ==========

  get noSubscriptionsTitle() {
    return $(selectors.byText('No subscriptions'));
  }

  get noSubscriptionsDescription() {
    return $(selectors.byText('No subscriptions found.'));
  }

  // ========== Subscriptions List Elements ==========

  get subscriptionsScrollView() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeScrollView',
        android: '//android.widget.ScrollView',
      }),
    );
  }

  /**
   * Get all visible subscription items
   * @returns {Promise<ElementArray>} Array of subscription item elements
   */
  get subscriptionItems() {
    return $$(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "SUB-") and contains(@name, ",")]',
        android: '//*[contains(@content-desc, "SUB-") and contains(@content-desc, ",")]',
      }),
    );
  }

  /**
   * Get subscription item by subscription ID
   * @param {string} subscriptionId - Subscription ID (e.g., 'SUB-2539-6731-4903')
   * @returns {WebdriverIO.Element}
   */
  getSubscriptionById(subscriptionId) {
    return $(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${subscriptionId}")]`,
        android: `//*[contains(@content-desc, "${subscriptionId}")]`,
      }),
    );
  }

  /**
   * Get subscription items by status
   * @param {string} status - Subscription status (Active, Terminated, Updating, Terminating)
   * @returns {Promise<ElementArray>}
   */
  getSubscriptionsByStatus(status) {
    return $$(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "SUB-") and contains(@name, ", ${status}")]`,
        android: `//*[contains(@content-desc, "SUB-") and contains(@content-desc, ", ${status}")]`,
      }),
    );
  }

  /**
   * Get the first subscription item in the list
   * @returns {WebdriverIO.Element}
   */
  get firstSubscriptionItem() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeOther[contains(@name, "SUB-") and contains(@name, ",")])[1]',
        android: '(//*[contains(@content-desc, "SUB-") and contains(@content-desc, ",")])[1]',
      }),
    );
  }

  // ========== Helper Methods ==========

  /**
   * Wait for the subscriptions screen to be ready (either shows data, empty state, or error)
   * @param {number} timeout - Maximum wait time in milliseconds
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
   * Check if currently on the Subscriptions page
   * @returns {Promise<boolean>}
   */
  async isOnSubscriptionsPage() {
    try {
      return await this.headerTitle.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Ensures the app is on the Subscriptions page, navigating there if needed
   */
  async ensureSubscriptionsPage() {
    const isOnSubscriptions = await this.isOnSubscriptionsPage();
    if (isOnSubscriptions) {
      return;
    }

    // Try to navigate back until footer is visible
    const maxBackAttempts = 5;
    for (let i = 0; i < maxBackAttempts; i++) {
      const isFooterVisible = await this.footer.subscriptionsTab.isDisplayed().catch(() => false);
      if (isFooterVisible) {
        break;
      }
      await browser.back();
      await browser.pause(500);
    }

    // Click Subscriptions tab from footer
    await this.footer.subscriptionsTab.click();
    await this.waitForScreenReady();
  }

  /**
   * Check if the subscriptions page has any subscriptions (not showing empty state)
   * @returns {Promise<boolean>} True if subscriptions exist, false if empty state is shown
   */
  async hasSubscriptions() {
    try {
      const subscriptions = await this.subscriptionItems;
      return subscriptions.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get count of visible subscriptions
   * @returns {Promise<number>}
   */
  async getVisibleSubscriptionsCount() {
    const subscriptions = await this.subscriptionItems;
    return subscriptions.length;
  }

  /**
   * Get subscription details from a subscription item's accessibility label
   * @param {WebdriverIO.Element} subscriptionElement - Subscription item element
   * @returns {Promise<{name: string, subscriptionId: string, status: string}>}
   */
  async getSubscriptionDetails(subscriptionElement) {
    const label = await subscriptionElement.getAttribute('name') || await subscriptionElement.getAttribute('content-desc');
    // Format: "Name, SUB-XXXX-XXXX-XXXX, Status"
    const match = label.match(/^(.+),\s*(SUB-\d{4}-\d{4}-\d{4}),\s*(\w+)$/);
    if (match) {
      return {
        name: match[1].trim(),
        subscriptionId: match[2],
        status: match[3],
      };
    }
    return { name: label, subscriptionId: '', status: '' };
  }

  /**
   * Tap on a specific subscription by ID
   * @param {string} subscriptionId - Subscription ID to tap
   */
  async tapSubscription(subscriptionId) {
    const subscription = this.getSubscriptionById(subscriptionId);
    await subscription.waitForDisplayed({ timeout: 10000 });
    await subscription.click();
  }

  /**
   * Tap on the first subscription in the list
   */
  async tapFirstSubscription() {
    await this.firstSubscriptionItem.waitForDisplayed({ timeout: 10000 });
    await this.firstSubscriptionItem.click();
  }

  /**
   * Get all visible subscription IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleSubscriptionIds() {
    const subscriptions = await this.subscriptionItems;
    const subscriptionIds = [];
    for (const subscription of subscriptions) {
      const details = await this.getSubscriptionDetails(subscription);
      subscriptionIds.push(details.subscriptionId);
    }
    return subscriptionIds;
  }

  /**
   * Get all visible subscriptions with their statuses
   * @returns {Promise<Array<{name: string, subscriptionId: string, status: string}>>}
   */
  async getVisibleSubscriptionsWithStatus() {
    const subscriptions = await this.subscriptionItems;
    const subscriptionDetails = [];
    for (const subscription of subscriptions) {
      const details = await this.getSubscriptionDetails(subscription);
      subscriptionDetails.push(details);
    }
    return subscriptionDetails;
  }

  /**
   * Scroll down in the subscriptions list
   * @param {number} percent - Scroll percentage (0.0 to 1.0, default 0.5)
   */
  async scrollDown(percent = 0.5) {
    if (this.isAndroid()) {
      await browser.execute('mobile: swipeGesture', {
        left: 100,
        top: 300,
        width: 880,
        height: 800,
        direction: 'up',
        percent: percent,
      });
    } else {
      await browser.execute('mobile: swipe', {
        direction: 'up',
        velocity: 800,
      });
    }
  }
}

module.exports = new SubscriptionsPage();
