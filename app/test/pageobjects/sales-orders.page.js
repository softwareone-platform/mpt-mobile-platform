const ListPage = require('./base/list.page');

/**
 * Sales Orders Page - extends ListPage for common list functionality
 * Provides sales-order-specific methods and backward-compatible aliases
 *
 * Variant: ID as title + externalIds.operations as subtitle + Status badge (no image, no name)
 * List config: listItemConfigNoImageWithExternalIds
 * ID Format: SOR-XXXX-XXXX-XXXX (3 groups)
 * Status Values: Draft, Processing, Ready, Completed, Cancelled
 *
 * Accessibility label format: "SOR-XXXX-XXXX-XXXX, EXT-ID, Status"
 * (externalIds.operations may be empty/null, in which case format is "SOR-XXXX-XXXX-XXXX, Status")
 */
class SalesOrdersPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'SOR-';
  }

  get pageName() {
    return 'Sales Orders';
  }

  get loadingIndicatorId() {
    return 'sales-orders-loading-indicator';
  }

  get emptyStateId() {
    return 'sales-orders-empty-state';
  }

  get errorStateId() {
    return 'sales-orders-error-state';
  }

  // ========== ID Parsing Override ==========
  // Sales Orders use 3-group IDs: SOR-XXXX-XXXX-XXXX
  // Label format: "SOR-XXXX-XXXX-XXXX, EXT-ID, Status"
  // or "SOR-XXXX-XXXX-XXXX, Status" when externalIds.operations is absent

  /**
   * Get item details from a sales order item's accessibility label
   * Override for SLO- 3-group format: "SLO-XXXX-XXXX-XXXX[, EXT-ID], Status"
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{salesOrderId: string, id: string, externalId: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));

    const idMatch = label.match(/(SOR-\d{4}-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    // Status is the last comma-separated segment
    const statusMatch = label.match(/,\s*([^,]+)$/);
    const status = statusMatch ? statusMatch[1].trim() : '';

    // External ID is the segment between the SOR id and the status (if present)
    const externalIdMatch = label.match(/SOR-\d{4}-\d{4}-\d{4},\s*(.+),\s*[^,]+$/);
    const externalId = externalIdMatch ? externalIdMatch[1].trim() : '';

    return { salesOrderId: id, id, externalId, status, label };
  }

  // ========== Backward-Compatible Aliases ==========

  /** @alias for scrollView */
  get salesOrdersScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get salesOrderItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstSalesOrderItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} salesOrderId - Sales Order ID (e.g., 'SLO-1234-5678-9012')
   */
  getSalesOrderById(salesOrderId) {
    return this.getItemById(salesOrderId);
  }

  /** @alias for isOnPage */
  async isOnSalesOrdersPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasSalesOrders() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleSalesOrdersCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} salesOrderId - Sales Order ID to tap
   */
  async tapSalesOrder(salesOrderId) {
    return this.tapItem(salesOrderId);
  }

  /** @alias for tapFirstItem */
  async tapFirstSalesOrder() {
    return this.tapFirstItem();
  }

  /**
   * Get sales order details from a sales order element
   * @alias for getItemDetails with sales-order-specific naming
   * @param {WebdriverIO.Element} salesOrderElement - Sales order list item element
   * @returns {Promise<{salesOrderId: string, id: string, externalId: string, status: string, label: string}>}
   */
  async getSalesOrderDetails(salesOrderElement) {
    return this.getItemDetails(salesOrderElement);
  }

  /**
   * Get all visible sales order IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleSalesOrderIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible sales orders with their statuses
   * @returns {Promise<Array<{salesOrderId: string, id: string, externalId: string, status: string, label: string}>>}
   */
  async getVisibleSalesOrdersWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new SalesOrdersPage();
