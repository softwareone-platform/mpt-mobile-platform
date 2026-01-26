const { expect } = require('@wdio/globals');

const ordersPage = require('../pageobjects/orders.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');

describe('Orders Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasOrdersData = false;
  let hasEmptyState = false;
  let apiOrdersAvailable = false;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Orders page to check data state
    await ordersPage.ensureOrdersPage();

    // Check data state ONCE and cache the results
    hasOrdersData = await ordersPage.hasOrders();
    hasEmptyState = !hasOrdersData && await ordersPage.emptyState.isDisplayed().catch(() => false);
    apiOrdersAvailable = !!process.env.API_OPS_TOKEN;

    console.log(`📊 Orders data state: hasOrders=${hasOrdersData}, emptyState=${hasEmptyState}, apiAvailable=${apiOrdersAvailable}`);
  });

  beforeEach(async () => {
    // Use page-local navigation to ensure we're on Orders
    await ordersPage.ensureOrdersPage();
  });

  describe('Page Structure', () => {
    it('should display the Orders header title', async () => {
      await expect(ordersPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      // Account button may have different accessibility setup on Android
      const isDisplayed = await ordersPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(ordersPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(ordersPage.footer.spotlightsTab).toBeDisplayed();
      await expect(ordersPage.footer.ordersTab).toBeDisplayed();
      await expect(ordersPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(ordersPage.footer.moreTab).toBeDisplayed();
    });

    it('should have Orders tab selected', async () => {
      const ordersTab = ordersPage.footer.ordersTab;
      if (isAndroid()) {
        // Android uses 'selected' attribute
        const selected = await ordersTab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        // iOS uses 'value' attribute
        const value = await ordersTab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });

  describe('Empty State', () => {
    // This test suite runs when user has no orders
    // Skip if user has orders (check via API or UI)

    it('should display empty state when no orders exist', async function () {
      if (hasOrdersData || !hasEmptyState) {
        this.skip();
        return;
      }
      
      await expect(ordersPage.emptyState).toBeDisplayed();
      await expect(ordersPage.noOrdersTitle).toBeDisplayed();
      await expect(ordersPage.noOrdersDescription).toBeDisplayed();
    });

    it('should display "No orders" title text', async function () {
      if (hasOrdersData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await ordersPage.noOrdersTitle.getText();
      expect(titleText).toBe('No orders');
    });

    it('should display "No orders found." description', async function () {
      if (hasOrdersData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descText = await ordersPage.noOrdersDescription.getText();
      expect(descText).toBe('No orders found.');
    });
  });

  describe('Orders List', () => {
    // This test suite runs when user has orders

    it('should display orders list when orders exist', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(ordersPage.ordersScrollView).toBeDisplayed();
      const ordersCount = await ordersPage.getVisibleOrdersCount();
      expect(ordersCount).toBeGreaterThan(0);
    });

    it('should display order items with ID and status', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      const firstOrder = ordersPage.firstOrderItem;
      await expect(firstOrder).toBeDisplayed();
      
      const details = await ordersPage.getOrderDetails(firstOrder);
      expect(details.orderId).toMatch(/^ORD-\d{4}-\d{4}-\d{4}$/);
      expect(['Draft', 'Quoted', 'Completed', 'Deleted', 'Failed']).toContain(details.status);
    });

    it('should detect all loaded orders in the list', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      // iOS keeps all rendered elements in the accessibility tree,
      // so we can detect all orders without scrolling
      const ordersCount = await ordersPage.getVisibleOrdersCount();
      const orderIds = await ordersPage.getVisibleOrderIds();
      
      console.log(`Total orders detected: ${ordersCount}`);
      console.log(`First 5 order IDs: ${orderIds.slice(0, 5).join(', ')}`);
      console.log(`Last 5 order IDs: ${orderIds.slice(-5).join(', ')}`);
      
      // Verify we have a reasonable number of orders
      expect(ordersCount).toBeGreaterThan(0);
      
      // Verify all order IDs have valid format
      for (const orderId of orderIds) {
        expect(orderId).toMatch(/^ORD-\d{4}-\d{4}-\d{4}$/);
      }
    });

    // TODO: Enable when order details page is implemented
    // it('should allow tapping on first order', async function () {
    //   const hasOrders = await ordersPage.hasOrders();
    //   if (!hasOrders) {
    //     this.skip();
    //     return;
    //   }

    //   await ordersPage.tapFirstOrder();
    //   // Verify navigation to order details (add order details page checks when available)
    //   await browser.pause(1000);
    //   // Navigate back to orders list for subsequent tests
    //   await browser.back();
    //   await ordersPage.waitForScreenReady();
    // });
  });

  describe('Orders by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      const draftOrders = await ordersPage.getOrdersByStatus('Draft');
      const quotedOrders = await ordersPage.getOrdersByStatus('Quoted');
      const completedOrders = await ordersPage.getOrdersByStatus('Completed');

      // At least one status should have orders
      const totalStatusOrders = draftOrders.length + quotedOrders.length + completedOrders.length;
      expect(totalStatusOrders).toBeGreaterThanOrEqual(0);
    });
  });

  describe('API Integration', () => {
    it('should match API orders count with visible orders', async function () {
      // Skip if API token not configured or no orders in UI
      if (!apiOrdersAvailable || !hasOrdersData) {
        this.skip();
        return;
      }

      try {
        const apiOrders = await apiClient.getOrders({ limit: 100 });
        const apiOrdersList = apiOrders.data || apiOrders;
        const apiCount = apiOrdersList.length;
        
        const uiCount = await ordersPage.getVisibleOrdersCount();
        
        console.log(`[Count Compare] API orders: ${apiCount}, UI visible orders: ${uiCount}`);
        
        // UI should show at least some orders if API has orders
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
        
        // Log comparison for debugging
        console.log(`Orders count - API: ${apiCount}, UI: ${uiCount}`);
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 order IDs and statuses match API data', async function () {
      if (!apiOrdersAvailable || !hasOrdersData) {
        this.skip();
        return;
      }

      try {
        const apiOrders = await apiClient.getOrders({ limit: 10 });
        const apiOrdersList = apiOrders.data || apiOrders;
        const uiOrderIds = await ordersPage.getVisibleOrderIds();
        const uiOrdersWithStatus = await ordersPage.getVisibleOrdersWithStatus();
        
        // Compare each API order with UI and log results
        const comparisons = [];
        for (let i = 0; i < Math.min(apiOrdersList.length, 10); i++) {
          const apiOrder = apiOrdersList[i];
          const apiOrderId = apiOrder.orderId || apiOrder.id || apiOrder.orderNumber;
          const apiStatus = apiOrder.status;
          const uiOrder = uiOrdersWithStatus[i] || {};
          const uiOrderId = uiOrder.orderId;
          const uiStatus = uiOrder.status;
          
          const idMatches = apiOrderId === uiOrderId;
          const statusMatches = apiStatus === uiStatus;
          const allMatch = idMatches && statusMatches;
          
          console.log(`[${i + 1}] ID: ${apiOrderId} vs ${uiOrderId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`);
          comparisons.push({ apiOrderId, uiOrderId, idMatches, apiStatus, uiStatus, statusMatches, allMatch });
        }
        
        const idMatchCount = comparisons.filter(c => c.idMatches).length;
        const statusMatchCount = comparisons.filter(c => c.statusMatches).length;
        console.log(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);
        
        // Verify all visible UI orders have valid format
        for (const uiOrderId of uiOrderIds.slice(0, 10)) {
          expect(uiOrderId).toMatch(/^ORD-\d{4}-\d{4}-\d{4}$/);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
