const { $ } = require('@wdio/globals');

const DetailsPage = require('./base/details.page');
const { getSelector, selectors } = require('./utils/selectors');
const { TIMEOUT } = require('./utils/constants');

/**
 * Order Details Page - displays detailed information for a single order
 * Accessed by tapping an order item from the Orders list page
 * Extends DetailsPage for common detail page functionality
 */


class OrderDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'ORD-';
  }

  get pageName() {
    return 'Order';
  }

  /**
   * @alias for itemIdText
   */
  get orderIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible order details as an object (uses base helpers)
   * @returns {Promise<Object>} Order details object
   */
  async getAllOrderDetails() {
    console.log('Getting all order details... (scrolling to top first)');
    await this.scrollToTop();
    return {
      orderId: await this.getItemId(),
      status: await this.getStatus(),
      type: await this.getSimpleFieldValue('Type', false),
      agreement: await this.getCompositeFieldValueByLabel('Agreement', false),
      product: await this.getCompositeFieldValueByLabel('Product', false),
      vendor: await this.getCompositeFieldValueByLabel('Vendor', false),
      client: await this.getCompositeFieldValueByLabel('Client', false),
      resaleLicensee: await this.getSimpleFieldValue('Resale licensee', false),
      averageYield: await this.getSimpleFieldValue('Average yield', true),
      defaultYield: await this.getSimpleFieldValue('Default yield', true),
      currency: await this.getSimpleFieldValue('Currency', true),
      assignee: await this.getCompositeFieldValueByLabel('Assignee', true),
    };
  }
}

module.exports = new OrderDetailsPage();
