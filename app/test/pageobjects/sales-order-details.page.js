const DetailsPage = require('./base/details.page');

/**
 * Sales Order Details Page - displays detailed information for a single sales order
 * Accessed by tapping a sales order item from the Sales Orders list page
 * Extends DetailsPage for common detail page functionality
 *
 * Fields shown (from SalesOrderDetailsContent.tsx):
 *   - Client (composite, DetailsListItem, Operations only) → accountDetails
 *   - Buyer (composite, DetailsListItem) → buyerDetails
 *   - Seller (composite, DetailsListItem) → sellerDetails
 *   - Vendor(s) (composite, DetailsListItem, not linked)
 *   - Product(s) (composite, DetailsListItem, not linked)
 *   - Source (simple, ListItemWithLabelAndText, Operations only)
 *   - Sales quote (composite, DetailsListItem, not linked)
 *   - Operations external ID (simple, ListItemWithLabelAndText)
 *   - ∑ PP (simple, ListItemWithLabelAndText, Operations only)
 *   - ∑ SP (simple, ListItemWithLabelAndText)
 *   - ∑ GT (simple, ListItemWithLabelAndText)
 *   - Yield (simple, ListItemWithLabelAndText, Operations only)
 *
 * Header testIDs:
 *   title: 'sales-order-details-header-title'
 *   status: 'sales-order-details-header-status'
 */
class SalesOrderDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'SOR-';
  }

  get pageName() {
    return 'Sales Order';
  }

  /**
   * @alias for itemIdText
   */
  get salesOrderIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible sales order details as an object (uses base helpers)
   * @returns {Promise<Object>} Sales order details object
   */
  async getAllSalesOrderDetails() {
    await this.scrollToTop();
    return {
      salesOrderId: await this.getItemId(),
      status: await this.getStatus(),
      buyer: await this.getCompositeFieldValueByLabel('Buyer', true).catch(() => ''),
      seller: await this.getCompositeFieldValueByLabel('Seller', true).catch(() => ''),
      salesQuote: await this.getCompositeFieldValueByLabel('Sales quote', true).catch(() => ''),
      opsExternalId: await this.getSimpleFieldValue('Operations external ID', true).catch(() => ''),
      sp: await this.getSimpleFieldValue('∑ SP', true).catch(() => ''),
      gt: await this.getSimpleFieldValue('∑ GT', true).catch(() => ''),
    };
  }
}

module.exports = new SalesOrderDetailsPage();
