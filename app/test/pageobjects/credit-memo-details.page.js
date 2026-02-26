const { $ } = require('@wdio/globals');
const DetailsPage = require('./base/details.page');

/**
 * Credit Memo Details Page - displays detailed information for a single credit memo
 * Accessed by tapping a credit memo item from the Credit Memos list page
 * Extends DetailsPage for common detail page functionality
 */
class CreditMemoDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'CRD-';
  }

  get pageName() {
    return 'Credit Memo';
  }

  /**
   * @alias for itemIdText
   */
  get creditMemoIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible credit memo details as an object (uses base helpers)
   * @returns {Promise<Object>} Credit memo details object
   */
  async getAllCreditMemoDetails() {
    await this.scrollToTop();
    return {
      creditMemoId: await this.getItemId(),
      status: await this.getSimpleFieldValue('Issued', true),
      client: await this.getSimpleFieldValue('Client', true),
      buyer: await this.getCompositeFieldValueByLabel('Buyer', true),
      licensee: await this.getSimpleFieldValue('Licensee', true),
      vendor: await this.getSimpleFieldValue('Vendor', true),
      product: await this.getSimpleFieldValue('Product', true),
      agreement: await this.getSimpleFieldValue('Agreement', true),
      seller: await this.getCompositeFieldValueByLabel('Seller', true),
      currency: await this.getSimpleFieldValue('Currency', true),
      documentId: await this.getSimpleFieldValue('Document ID', true),
      sumSp: await this.getSimpleFieldValue('∑ SP', true),
      sumGt: await this.getSimpleFieldValue('∑ GT', true),
    };
  }
}

module.exports = new CreditMemoDetailsPage();
