const { $, $$ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const { getSelector, selectors } = require('./utils/selectors');

class OrdersPage extends BasePage {
  constructor() {
    super();
    this.header = headingPage;
    this.footer = footerPage;
  }

  // ========== Loading States ==========

  get loadingIndicator() {
    return $(selectors.byAccessibilityId('orders-loading-indicator'));
  }

  get emptyState() {
    return $(selectors.byAccessibilityId('orders-empty-state'));
  }

  get errorState() {
    return $(selectors.byAccessibilityId('orders-error-state'));
  }

  // ========== Header Elements ==========

  get headerTitle() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Orders" and contains(@traits, "Header")]',
        // Use heading attribute to distinguish page header from footer tab text
        android: '//android.view.View[@text="Orders" and @heading="true"]',
      }),
    );
  }

  get accountButton() {
    return $(selectors.byAccessibilityId('nav-account-button'));
  }

  // ========== Empty State Elements ==========

  get noOrdersTitle() {
    return $(selectors.byText('No orders'));
  }

  get noOrdersDescription() {
    return $(selectors.byText('No orders found.'));
  }

  // ========== Orders List Elements ==========

  get ordersScrollView() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeScrollView',
        android: '//android.widget.ScrollView',
      }),
    );
  }

  /**
   * Get all visible order items
   * @returns {Promise<ElementArray>} Array of order item elements
   */
  get orderItems() {
    return $$(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "ORD-") and contains(@name, ",")]',
        android: '//*[contains(@content-desc, "ORD-") and contains(@content-desc, ",")]',
      }),
    );
  }

  /**
   * Get order item by order ID
   * @param {string} orderId - Order ID (e.g., 'ORD-3760-9768-9099')
   * @returns {WebdriverIO.Element}
   */
  getOrderById(orderId) {
    return $(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${orderId}")]`,
        android: `//*[contains(@content-desc, "${orderId}")]`,
      }),
    );
  }

  /**
   * Get order items by status
   * @param {string} status - Order status (Draft, Quoted, Completed, Deleted, Failed)
   * @returns {Promise<ElementArray>}
   */
  getOrdersByStatus(status) {
    return $$(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "ORD-") and contains(@name, ", ${status}")]`,
        android: `//*[contains(@content-desc, "ORD-") and contains(@content-desc, ", ${status}")]`,
      }),
    );
  }

  /**
   * Get the first order item in the list
   * @returns {WebdriverIO.Element}
   */
  get firstOrderItem() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeOther[contains(@name, "ORD-") and contains(@name, ",")])[1]',
        android: '(//*[contains(@content-desc, "ORD-") and contains(@content-desc, ",")])[1]',
      }),
    );
  }

  // ========== Helper Methods ==========

  /**
   * Wait for the orders screen to be ready (either shows data, empty state, or error)
   * @param {number} timeout - Maximum wait time in milliseconds
   */
  async waitForScreenReady(timeout = 30000) {
    // First wait for loading to potentially appear and disappear
    const loadingVisible = await this.loadingIndicator.isDisplayed().catch(() => false);
    if (loadingVisible) {
      await this.loadingIndicator.waitForDisplayed({ timeout, reverse: true }).catch(() => {});
    }
    // Screen is ready when either empty state or content is shown
    await browser.pause(500);
  }

  /**
   * Check if currently on the Orders page
   * @returns {Promise<boolean>}
   */
  async isOnOrdersPage() {
    try {
      return await this.headerTitle.isDisplayed();
    } catch {
      return false;
    }
  }

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
    const maxBackAttempts = 5;
    for (let i = 0; i < maxBackAttempts; i++) {
      const isFooterVisible = await this.footer.ordersTab.isDisplayed().catch(() => false);
      if (isFooterVisible) {
        break;
      }

      // Try pressing back button if available
      await browser.back();
      await browser.pause(500);
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
    } catch {
      return false;
    }
  }

  /**
   * Check if orders are displayed
   * @returns {Promise<boolean>}
   */
  async hasOrders() {
    try {
      const orders = await this.orderItems;
      return orders.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get count of visible orders
   * @returns {Promise<number>}
   */
  async getVisibleOrdersCount() {
    const orders = await this.orderItems;
    return orders.length;
  }

  /**
   * Get order details from an order item's accessibility label
   * @param {WebdriverIO.Element} orderElement - Order item element
   * @returns {Promise<{orderId: string, status: string}>}
   */
  async getOrderDetails(orderElement) {
    const label = await orderElement.getAttribute('name') || await orderElement.getAttribute('content-desc');
    const [orderId, status] = label.split(', ');
    return { orderId: orderId.trim(), status: status.trim() };
  }

  /**
   * Tap on a specific order by ID
   * @param {string} orderId - Order ID to tap
   */
  async tapOrder(orderId) {
    const order = this.getOrderById(orderId);
    await order.waitForDisplayed({ timeout: 10000 });
    await order.click();
  }

  /**
   * Tap on the first order in the list
   */
  async tapFirstOrder() {
    await this.firstOrderItem.waitForDisplayed({ timeout: 10000 });
    await this.firstOrderItem.click();
  }

  /**
   * Scroll down in the orders list (swipe up to reveal content below)
   * @param {number} percent - Scroll percentage (0.0 to 1.0, default 0.5)
   */
  async scrollDown(percent = 0.5) {
    if (this.isAndroid()) {
      // Android: Use mobile: swipeGesture - swipe UP to scroll content DOWN
      await browser.execute('mobile: swipeGesture', {
        left: 100,
        top: 300,
        width: 880,
        height: 800,
        direction: 'up',
        percent: percent,
      });
    } else {
      // iOS: Use mobile: swipe - swipe UP to scroll content DOWN
      await browser.execute('mobile: swipe', {
        direction: 'up',
        velocity: 800,
      });
    }
  }

  /**
   * Scroll to the bottom of the orders list to trigger pagination
   * Note: On iOS, all rendered elements are accessible without scrolling.
   * This method is primarily useful for visual verification or Android testing.
   * @param {number} maxScrolls - Maximum scroll attempts to reach bottom
   * @returns {Promise<{initialCount: number, finalCount: number, newOrdersLoaded: boolean}>}
   */
  async scrollToBottomAndWaitForMore(maxScrolls = 10) {
    const initialCount = await this.getVisibleOrdersCount();
    let previousCount = initialCount;
    let scrollAttempts = 0;
    let noChangeCount = 0;
    
    // Keep scrolling until we stop seeing new orders (reached bottom)
    while (scrollAttempts < maxScrolls && noChangeCount < 3) {
      await this.scrollDown(0.75);
      await browser.pause(800);
      
      const currentCount = await this.getVisibleOrdersCount();
      
      if (currentCount === previousCount) {
        noChangeCount++;
      } else {
        noChangeCount = 0;
      }
      
      previousCount = currentCount;
      scrollAttempts++;
    }
    
    const finalCount = await this.getVisibleOrdersCount();
    
    return {
      initialCount,
      finalCount,
      newOrdersLoaded: finalCount > initialCount,
    };
  }

  /**
   * Scroll to find an order by ID
   * @param {string} orderId - Order ID to find
   * @param {number} maxScrolls - Maximum scroll attempts
   * @returns {Promise<boolean>} - True if found
   */
  async scrollToOrder(orderId, maxScrolls = 10) {
    for (let i = 0; i < maxScrolls; i++) {
      const order = this.getOrderById(orderId);
      const isDisplayed = await order.isDisplayed().catch(() => false);
      if (isDisplayed) {
        return true;
      }
      await this.scrollDown();
      await browser.pause(500);
    }
    return false;
  }

  /**
   * Get all visible order IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleOrderIds() {
    const orders = await this.orderItems;
    const orderIds = [];
    for (const order of orders) {
      const details = await this.getOrderDetails(order);
      orderIds.push(details.orderId);
    }
    return orderIds;
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
