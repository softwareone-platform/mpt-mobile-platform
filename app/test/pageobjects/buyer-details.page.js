const { $ } = require('@wdio/globals');
const DetailsPage = require('./base/details.page');

/**
 * Buyer Details Page - displays detailed information for a single buyer
 * Accessed by tapping a buyer item from the Buyers list page
 * Extends DetailsPage for common detail page functionality
 */
class BuyerDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'BUY-';
  }

  get pageName() {
    return 'Buyer';
  }

  /**
   * @alias for itemIdText
   */
  get buyerIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible buyer details as an object (uses base helpers)
   * @returns {Promise<Object>} Buyer details object
   */
  async getAllBuyerDetails() {
    await this.scrollToTop();
    return {
      buyerName: await this.getSimpleFieldValue('Websparks Pte Ltd', true), // Company name label
      buyerId: await this.getItemId(),
      status: await this.getSimpleFieldValue('Active', true),
      client: await this.getCompositeFieldValueByLabel('Client', true),
      scuIdentifier: await this.getSimpleFieldValue('SCU identifier', true),
      taxNumber: await this.getSimpleFieldValue('Tax number', true),
      address: await this.getSimpleFieldValue('Address', true),
      addressLine1: await this.getSimpleFieldValue('Address line 1', true),
      addressLine2: await this.getSimpleFieldValue('Address line 2', true),
      city: await this.getSimpleFieldValue('City', true),
      state: await this.getSimpleFieldValue('State', true),
      zip: await this.getSimpleFieldValue('ZIP/Postal code', true),
      country: await this.getSimpleFieldValue('Country', true),
    };
  }
}

module.exports = new BuyerDetailsPage();
