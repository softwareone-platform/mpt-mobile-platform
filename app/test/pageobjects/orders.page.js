const { selectors } = require('./utils/selectors');
const { PAUSE, RETRY } = require('./utils/constants');

const ListPage = require('./base/list.page');

/**
 * Orders Page - extends ListPage for common list functionality
 * Provides order-specific methods and backward-compatible aliases
 */
class OrdersPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'ORD-';
  }

  get pageName() {
    return 'Orders';
  }

  get loadingIndicatorId() {
    return 'orders-loading-indicator';
  }

  get emptyStateId() {
    return 'orders-empty-state';
  }

  get errorStateId() {
    return 'orders-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noOrdersTitle() {
    return $(selectors.byText('No orders'));
  }

  get noOrdersDescription() {
    return $(selectors.byText('No orders found.'));
  }

  // ========== Backward-Compatible Aliases ==========

  /** @alias for scrollView */
  get ordersScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get orderItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstOrderItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} orderId - Order ID (e.g., 'ORD-3760-9768-9099')
   */
  getOrderById(orderId) {
    return this.getItemById(orderId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Order status (Draft, Quoted, Completed, Deleted, Failed)
   */
  getOrdersByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnOrdersPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasOrders() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleOrdersCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} orderId - Order ID to tap
   */
  async tapOrder(orderId) {
    return this.tapItem(orderId);
  }

  /** @alias for tapFirstItem */
  async tapFirstOrder() {
    return this.tapFirstItem();
  }

  /** @alias for getVisibleItemIds */
  async getVisibleOrderIds() {
    return this.getVisibleItemIds();
  }

  /**
   * @alias for scrollToItem
   * @param {string} orderId - Order ID to find
   * @param {number} maxScrolls - Maximum scroll attempts
   */
  async scrollToOrder(orderId, maxScrolls) {
    return this.scrollToItem(orderId, maxScrolls);
  }

  // ========== Orders-Specific Methods ==========

  /**
   * Ensures the app is on the Orders page, navigating there if needed
   * Uses the footer navigation to get to Orders from any page with visible footer
   */
  async ensureOrdersPage() {
    // Check if already on Orders page
    const isOnOrders = await this.isOnOrdersPage();
    if (isOnOrders) {
      return;
    }

    // Try to navigate back until footer is visible
    for (let i = 0; i < RETRY.MAX_BACK_ATTEMPTS; i++) {
      const isFooterVisible = await this.footer.ordersTab.isDisplayed().catch(() => false);
      if (isFooterVisible) {
        break;
      }

      // Try pressing back button if available
      await browser.back();
      await browser.pause(PAUSE.NAVIGATION);
    }

    // Click Orders tab from footer
    await this.footer.clickOrdersTab();
    await this.waitForScreenReady();
  }

  /**
   * Check if the orders list is empty
   * @returns {Promise<boolean>}
   */
  async isOrdersListEmpty() {
    try {
      const emptyStateVisible = await this.emptyState.isDisplayed();
      return emptyStateVisible;
    } catch (error) {
      console.debug(`Error checking orders empty state: ${error.message}`);
      return false;
    }
  }

  /**
   * Get order details from an order item's accessibility label
   * Overrides base class for order-specific parsing
   * @param {WebdriverIO.Element} orderElement - Order item element
   * @returns {Promise<{orderId: string, status: string}>}
   */
  async getOrderDetails(orderElement) {
    const label =
      (await orderElement.getAttribute('name')) || (await orderElement.getAttribute('content-desc'));
    const [orderId, status] = label.split(', ');
    return { orderId: orderId.trim(), status: status.trim() };
  }

  /**
   * Get all visible orders with their statuses
   * @returns {Promise<Array<{orderId: string, status: string}>>}
   */
  async getVisibleOrdersWithStatus() {
    const orders = await this.orderItems;
    const orderDetails = [];
    for (const order of orders) {
      const details = await this.getOrderDetails(order);
      orderDetails.push(details);
    }
    return orderDetails;
  }
}

module.exports = new OrdersPage();
