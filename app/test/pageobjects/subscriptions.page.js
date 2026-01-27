const { selectors } = require('./utils/selectors');
const { PAUSE, RETRY } = require('./utils/constants');

const ListPage = require('./base/list.page');

/**
 * Subscriptions Page - extends ListPage for common list functionality
 * Provides subscription-specific methods and backward-compatible aliases
 */
class SubscriptionsPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'SUB-';
  }

  get pageName() {
    return 'Subscriptions';
  }

  get loadingIndicatorId() {
    return 'subscriptions-loading-indicator';
  }

  get emptyStateId() {
    return 'subscriptions-empty-state';
  }

  get errorStateId() {
    return 'subscriptions-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noSubscriptionsTitle() {
    return $(selectors.byText('No subscriptions'));
  }

  get noSubscriptionsDescription() {
    return $(selectors.byText('No subscriptions found.'));
  }

  // ========== Backward-Compatible Aliases ==========

  /** @alias for scrollView */
  get subscriptionsScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get subscriptionItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstSubscriptionItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} subscriptionId - Subscription ID (e.g., 'SUB-2539-6731-4903')
   */
  getSubscriptionById(subscriptionId) {
    return this.getItemById(subscriptionId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Subscription status (Active, Terminated, Updating, Terminating)
   */
  getSubscriptionsByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnSubscriptionsPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasSubscriptions() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleSubscriptionsCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} subscriptionId - Subscription ID to tap
   */
  async tapSubscription(subscriptionId) {
    return this.tapItem(subscriptionId);
  }

  /** @alias for tapFirstItem */
  async tapFirstSubscription() {
    return this.tapFirstItem();
  }

  /** @alias for getVisibleItemIds */
  async getVisibleSubscriptionIds() {
    return this.getVisibleItemIds();
  }

  // ========== Subscriptions-Specific Methods ==========

  /**
   * Ensures the app is on the Subscriptions page, navigating there if needed
   */
  async ensureSubscriptionsPage() {
    const isOnSubscriptions = await this.isOnSubscriptionsPage();
    if (isOnSubscriptions) {
      return;
    }

    // Try to navigate back until footer is visible
    for (let i = 0; i < RETRY.MAX_BACK_ATTEMPTS; i++) {
      const isFooterVisible = await this.footer.subscriptionsTab.isDisplayed().catch(() => false);
      if (isFooterVisible) {
        break;
      }
      await browser.back();
      await browser.pause(PAUSE.NAVIGATION);
    }

    // Click Subscriptions tab from footer
    await this.footer.subscriptionsTab.click();
    await this.waitForScreenReady();
  }

  /**
   * Get subscription details from a subscription item's accessibility label
   * Overrides base class for subscription-specific parsing
   * @param {WebdriverIO.Element} subscriptionElement - Subscription item element
   * @returns {Promise<{name: string, subscriptionId: string, status: string}>}
   */
  async getSubscriptionDetails(subscriptionElement) {
    const label =
      (await subscriptionElement.getAttribute('name')) ||
      (await subscriptionElement.getAttribute('content-desc'));
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
}

module.exports = new SubscriptionsPage();
