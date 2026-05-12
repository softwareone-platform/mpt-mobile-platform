const DetailsPage = require('./base/details.page');

/**
 * Seller Details Page - displays detailed information for a single seller
 * Accessed by tapping a seller item from the Sellers list page
 * Extends DetailsPage for common detail page functionality
 *
 * Fields shown (from SellerDetailsContent.tsx):
 *   - Address (AddressCard with simple fields: Address line 1, Address line 2,
 *     City, State, ZIP/Postal code, Country)
 */
class SellerDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'SEL-';
  }

  get pageName() {
    return 'Seller';
  }

  /**
   * @alias for itemIdText
   */
  get sellerIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible seller details as an object (uses base helpers)
   * @returns {Promise<Object>} Seller details object
   */
  async getAllSellerDetails() {
    await this.scrollToTop();
    return {
      sellerId: await this.getItemId(),
      status: await this.getStatus(),
      addressLine1: await this.getSimpleFieldValue('Address line 1', true).catch(() => ''),
      addressLine2: await this.getSimpleFieldValue('Address line 2', true).catch(() => ''),
      city: await this.getSimpleFieldValue('City', true).catch(() => ''),
      state: await this.getSimpleFieldValue('State', true).catch(() => ''),
      zip: await this.getSimpleFieldValue('ZIP/Postal code', true).catch(() => ''),
      country: await this.getSimpleFieldValue('Country', true).catch(() => ''),
    };
  }
}

module.exports = new SellerDetailsPage();
