const { $ } = require('@wdio/globals');
const DetailsPage = require('./base/details.page');

/**
 * Statement Details Page - displays detailed information for a single statement
 * Accessed by tapping a statement item from the Statements list page
 * Extends DetailsPage for common detail page functionality
 *
 * Uses CommonBillingDetailsSection for shared billing fields (Client, Buyer,
 * Licensee, Vendor, Product, Agreement, Seller) plus statement-specific fields.
 */
class StatementDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'SOM-';
  }

  get pageName() {
    return 'Statement';
  }

  /**
   * @alias for itemIdText
   */
  get statementIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible statement details as an object (uses base helpers)
   * Includes CommonBillingDetailsSection fields + statement-specific fields
   * @returns {Promise<Object>} Statement details object
   */
  async getAllStatementDetails() {
    await this.scrollToTop();
    return {
      statementId: await this.getItemId(),
      status: await this.getStatus(),
      client: await this.getCompositeFieldValueByLabel('Client', true).catch(() => ''),
      buyer: await this.getCompositeFieldValueByLabel('Buyer', true).catch(() => ''),
      licensee: await this.getCompositeFieldValueByLabel('Licensee', true).catch(() => ''),
      vendor: await this.getCompositeFieldValueByLabel('Vendor', true).catch(() => ''),
      product: await this.getCompositeFieldValueByLabel('Product', true).catch(() => ''),
      agreement: await this.getCompositeFieldValueByLabel('Agreement', true).catch(() => ''),
      seller: await this.getCompositeFieldValueByLabel('Seller', true).catch(() => ''),
      owner: await this.getCompositeFieldValueByLabel('Owner', true).catch(() => ''),
      source: await this.getSimpleFieldValue('Source', true).catch(() => ''),
      statementType: await this.getSimpleFieldValue('Statement type', true),
      pp: await this.getSimpleFieldValue('∑ PP', true).catch(() => ''),
      yield: await this.getSimpleFieldValue('Yield', true).catch(() => ''),
      sp: await this.getSimpleFieldValue('∑ SP', true),
    };
  }
}

module.exports = new StatementDetailsPage();
