const DetailsPage = require('./base/details.page');

/**
 * Sales Quote Details Page - displays detailed information for a single sales quote
 * Accessed by tapping a sales quote item from the Sales Quotes list page
 * Extends DetailsPage for common detail page functionality
 *
 * Fields shown (from SalesQuoteDetailsContent.tsx):
 *   - Client (composite, DetailsListItem, Operations only) → accountDetails
 *   - Buyer (composite, DetailsListItem) → buyerDetails
 *   - Seller (composite, DetailsListItem) → sellerDetails
 *   - Vendor(s) (composite, DetailsListItem, not linked)
 *   - Product(s) (composite, DetailsListItem, not linked)
 *   - Source (simple, ListItemWithLabelAndText, Operations only)
 *   - Operations external ID (simple, ListItemWithLabelAndText)
 *   - ∑ PP (simple, ListItemWithLabelAndText, Operations only)
 *   - ∑ SP (simple, ListItemWithLabelAndText)
 *   - ∑ GT (simple, ListItemWithLabelAndText)
 *   - Expiry date (simple, ListItemWithLabelAndText)
 *   - Yield (simple, ListItemWithLabelAndText, Operations only)
 *   - Sales order(s) (composite, DetailsListItem) → salesOrderDetails (if single)
 *
 * Header testIDs:
 *   title: 'sales-quote-details-header-title'
 *   status: 'sales-quote-details-header-status'
 */
class SalesQuoteDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'SQT-';
  }

  get pageName() {
    return 'Sales Quote';
  }

  /** @alias for itemIdText */
  get salesQuoteIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible sales quote details as an object (uses base helpers)
   * @returns {Promise<Object>} Sales quote details object
   */
  async getAllSalesQuoteDetails() {
    await this.scrollToTop();
    return {
      salesQuoteId: await this.getItemId(),
      status: await this.getStatus(),
      buyer: await this.getCompositeFieldValueByLabel('Buyer', true).catch(() => ''),
      seller: await this.getCompositeFieldValueByLabel('Seller', true).catch(() => ''),
      opsExternalId: await this.getSimpleFieldValue('Operations external ID', true).catch(() => ''),
      sp: await this.getSimpleFieldValue('∑ SP', true).catch(() => ''),
      gt: await this.getSimpleFieldValue('∑ GT', true).catch(() => ''),
      expiryDate: await this.getSimpleFieldValue('Expiry date', true).catch(() => ''),
    };
  }
}

module.exports = new SalesQuoteDetailsPage();
