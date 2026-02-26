const { $ } = require('@wdio/globals');
const DetailsPage = require('./base/details.page');

/**
 * Invoice Details Page - displays detailed information for a single invoice
 * Accessed by tapping an invoice item from the Invoices list page
 * Extends DetailsPage for common detail page functionality
 */
class InvoiceDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'INV-';
  }

  get pageName() {
    return 'Invoice';
  }

  /**
   * @alias for itemIdText
   */
  get invoiceIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible invoice details as an object (uses base helpers)
   * @returns {Promise<Object>} Invoice details object
   */
  async getAllInvoiceDetails() {
    await this.scrollToTop();
    return {
      invoiceId: await this.getItemId(),
      status: await this.getSimpleFieldValue('Paid', true),
      client: await this.getSimpleFieldValue('Client', true),
      buyer: await this.getCompositeFieldValueByLabel('Buyer', true),
      licensee: await this.getSimpleFieldValue('Licensee', true),
      vendor: await this.getSimpleFieldValue('Vendor', true),
      product: await this.getSimpleFieldValue('Product', true),
      agreement: await this.getSimpleFieldValue('Agreement', true),
      seller: await this.getCompositeFieldValueByLabel('Seller', true),
      currency: await this.getSimpleFieldValue('Currency', true),
      source: await this.getSimpleFieldValue('Source', true),
      documentId: await this.getSimpleFieldValue('Document ID', true),
      statement: await this.getSimpleFieldValue('Statement', true),
      sumSp: await this.getSimpleFieldValue('∑ SP', true),
      sumGt: await this.getSimpleFieldValue('∑ GT', true),
      salesOrderId: await this.getSimpleFieldValue('Sales order ID', true),
      dueDate: await this.getSimpleFieldValue('Due date', true),
    };
  }
}

module.exports = new InvoiceDetailsPage();
