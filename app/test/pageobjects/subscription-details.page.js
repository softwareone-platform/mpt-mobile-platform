const { $ } = require('@wdio/globals');
const DetailsPage = require('./base/details.page');
const { getSelector, selectors } = require('./utils/selectors');
const { TIMEOUT } = require('./utils/constants');

/**
 * Subscription Details Page - displays detailed information for a single subscription
 * Accessed by tapping a subscription item from the Subscriptions list page
 * Extends DetailsPage for common detail page functionality
 */


class SubscriptionDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'SUB-';
  }

  get pageName() {
    return 'Subscription';
  }

  /**
   * @alias for itemIdText
   */
  get subscriptionIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible subscription details as an object (uses base helpers)
   * @param {object} [options] - Options
   * @param {boolean} [options.autoRenew] - Whether the subscription auto-renews (determines "Renewal date" vs "Expiration" label)
   * @returns {Promise<Object>} Subscription details object
   */
  async getAllSubscriptionDetails({ autoRenew } = {}) {
    await this.scrollToTop();
    const renewalLabel = autoRenew === false ? 'Expiration' : 'Renewal date';
    return {
      subscriptionId: await this.getItemId(),
      status: await this.getStatus(),
      product: await this.getCompositeFieldValueByLabel('Product', true),
      agreement: await this.getCompositeFieldValueByLabel('Agreement', true),
      client: await this.getCompositeFieldValueByLabel('Client', false),
      terms: await this.getSimpleFieldValue('Terms', true),
      renewalDate: await this.getSimpleFieldValue(renewalLabel, true),
      billingModel: await this.getSimpleFieldValue('Billing model', true),
      quantity: await this.getSimpleFieldValue('Quantity', true),
      averageYield: await this.getSimpleFieldValue('Average yield', false),
      defaultYield: await this.getSimpleFieldValue('Default yield', false),
    };
  }
}

module.exports = new SubscriptionDetailsPage();
