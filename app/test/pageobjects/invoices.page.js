const { getSelector, selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Invoices Page - extends ListPage for common list functionality
 * Provides invoice-specific methods and aliases
 * 
 * Variant: Minimal (Title is Invoice ID, no picture, no subtitle)
 * ID Format: INV-XXXX-XXXX-XXXX-XXXX (4 groups)
 * Status Values: Issued, Overdue, Paid
 * 
 * Note: Invoices use a minimal list config (no image, no subtitle)
 * The title IS the ID, so accessibility label format is: "INV-XXXX-XXXX-XXXX-XXXX, Status"
 */
class InvoicesPage extends ListPage {
  // ========== Abstract Property Implementations ========== 

  get itemPrefix() {
    return 'INV-';
  }

  get pageName() {
    return 'Invoices';
  }

  get loadingIndicatorId() {
    return 'invoices-loading-indicator';
  }

  get emptyStateId() {
    return 'invoices-empty-state';
  }

  get errorStateId() {
    return 'invoices-error-state';
  }

  // ========== Empty State Elements (page-specific) ========== 

  get noInvoicesTitle() {
    return $(selectors.byText('No invoices'));
  }

  get noInvoicesDescription() {
    return $(selectors.byText('No invoices found.'));
  }

  // ========== ID Pattern Override ==========
  // Invoices use 4-group IDs: INV-XXXX-XXXX-XXXX-XXXX
  // The title IS the ID (no separate name field)

  /**
   * Get all visible list items
   * Override for INV- 4-group format
   * @returns {Promise<ElementArray>} Array of list item elements
   */
  get listItems() {
    return $$(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${this.itemPrefix}") and contains(@name, ",")]`,
        android: `//*[contains(@content-desc, "${this.itemPrefix}") and contains(@content-desc, ",")]`,
      }),
    );
  }

  /**
   * Get item details from an item's accessibility label
   * Override for INV- minimal variant: "INV-XXXX-XXXX-XXXX-XXXX, Status" (title IS the ID)
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{invoiceId: string, id: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));
    // INV- uses 4-group format: INV-XXXX-XXXX-XXXX-XXXX
    const idMatch = label.match(/(INV-\d{4}-\d{4}-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';
    // Extract status (everything after the last comma)
    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';
    // Note: Invoices don't have a separate name - the ID IS the title
    return { invoiceId: id, id, status, label };
  }

  // ========== Backward-Compatible Aliases ==========

  /** @alias for scrollView */
  get invoicesScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get invoiceItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstInvoiceItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} invoiceId - Invoice ID (e.g., 'INV-9994-9916-5145-1234')
   */
  getInvoiceById(invoiceId) {
    return this.getItemById(invoiceId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Invoice status (Issued, Overdue, Paid)
   */
  getInvoicesByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnInvoicesPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasInvoices() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleInvoicesCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} invoiceId - Invoice ID to tap
   */
  async tapInvoice(invoiceId) {
    return this.tapItem(invoiceId);
  }

  /** @alias for tapFirstItem */
  async tapFirstInvoice() {
    return this.tapFirstItem();
  }

  /**
   * Get invoice details from an invoice element
   * @alias for getItemDetails with invoice-specific naming
   * @param {WebdriverIO.Element} invoiceElement - Invoice list item element
   * @returns {Promise<{invoiceId: string, id: string, status: string, label: string}>}
   */
  async getInvoiceDetails(invoiceElement) {
    return this.getItemDetails(invoiceElement);
  }

  /**
   * Get all visible invoice IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleInvoiceIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible invoices with their statuses
   * @returns {Promise<Array<{invoiceId: string, id: string, status: string, label: string}>>}
   */
  async getVisibleInvoicesWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new InvoicesPage();
