const DetailsPage = require('./base/details.page');

/**
 * Licensee Details Page - displays detailed information for a single licensee
 * Accessed by tapping a licensee item from the Licensees list page
 * Extends DetailsPage for common detail page functionality
 */
class LicenseeDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'LCE-';
  }

  get pageName() {
    return 'Licensee';
  }

  /**
   * @alias for itemIdText
   */
  get licenseeIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible licensee details as an object (uses base helpers)
   * @returns {Promise<Object>} Licensee details object
   */
  async getAllLicenseeDetails() {
    await this.scrollToTop();
    return {
      licenseeId: await this.getItemId(),
      status: await this.getStatus(),
      account: await this.getCompositeFieldValueByLabel('Account', true).catch(() => ''),
      buyer: await this.getCompositeFieldValueByLabel('Buyer', true).catch(() => ''),
      seller: await this.getCompositeFieldValueByLabel('Seller', true).catch(() => ''),
      resaleLicensee: await this.getSimpleFieldValue('Resale licensee', true).catch(() => ''),
      addressLine1: await this.getSimpleFieldValue('Address line 1', true).catch(() => ''),
      addressLine2: await this.getSimpleFieldValue('Address line 2', true).catch(() => ''),
      city: await this.getSimpleFieldValue('City', true).catch(() => ''),
      state: await this.getSimpleFieldValue('State', true).catch(() => ''),
      postCode: await this.getSimpleFieldValue('ZIP/Postal code', true).catch(() => ''),
      country: await this.getSimpleFieldValue('Country', true).catch(() => ''),
    };
  }
}

module.exports = new LicenseeDetailsPage();
