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
   * @returns {Promise<Object>} Subscription details object
   */
  async getAllSubscriptionDetails() {
    await this.scrollToTop();
    return {
      subscriptionId: await this.getItemId(),
      status: await this.getStatus(),
      product: await this.getCompositeFieldValueByLabel('Product', true),
      agreement: await this.getCompositeFieldValueByLabel('Agreement', true),
      client: await this.getCompositeFieldValueByLabel('Client', true),
      terms: await this.getSimpleFieldValue('Terms', true),
      renewalDate: await this.getSimpleFieldValue('Renewal date', true),
      billingModel: await this.getSimpleFieldValue('Billing model', true),
      quantity: await this.getSimpleFieldValue('Quantity', true),
      averageYield: await this.getSimpleFieldValue('Average yield', true),
      defaultYield: await this.getSimpleFieldValue('Default yield', true),
    };
  }
}

module.exports = new SubscriptionDetailsPage();
