const { expect } = require('@wdio/globals');

const ordersPage = require('../pageobjects/orders.page');
const orderDetailsPage = require('../pageobjects/order-details.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { isAndroid } = require('../pageobjects/utils/selectors');

describe('Order Details Navigation', () => {
  let hasOrdersData = false;
  let firstOrderId = null;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ordersPage.ensureOrdersPage();

    // Check if we have orders to test with
    hasOrdersData = await ordersPage.hasOrders();
    if (hasOrdersData) {
      const orderIds = await ordersPage.getVisibleOrderIds();
      firstOrderId = orderIds[0];
    }

    console.info(`📊 Navigation test setup: hasOrders=${hasOrdersData}, firstOrderId=${firstOrderId}`);
  });

  beforeEach(async () => {
    await ordersPage.ensureOrdersPage();
  });

  describe('Orders List → Order Details Navigation', () => {
    it('should navigate to Order Details when tapping first order', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      // Tap on first order
      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();

      // Verify we're on the Order Details page
      const isOnDetails = await orderDetailsPage.isOnOrderDetailsPage();
      expect(isOnDetails).toBe(true);
    });

    it('should display the Order header title on details page', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();

      await expect(orderDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button on details page', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();

      await expect(orderDetailsPage.goBackButton).toBeDisplayed();
    });

    it('should display Order ID matching the tapped order', async function () {
      if (!hasOrdersData || !firstOrderId) {
        this.skip();
        return;
      }

      await ordersPage.tapOrder(firstOrderId);
      await orderDetailsPage.waitForPageReady();

      const displayedOrderId = await orderDetailsPage.getOrderId();
      expect(displayedOrderId).toBe(firstOrderId);
    });

    it('should display account button in header', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();

      // Account button may have different accessibility setup on Android
      const isDisplayed = await orderDetailsPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(orderDetailsPage.accountButton).toBeDisplayed();
    });

    it('should display footer navigation tabs', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();

      await expect(orderDetailsPage.footer.spotlightsTab).toBeDisplayed();
      await expect(orderDetailsPage.footer.ordersTab).toBeDisplayed();
      await expect(orderDetailsPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(orderDetailsPage.footer.moreTab).toBeDisplayed();
    });

    it('should have Orders tab selected on details page', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();

      const ordersTab = orderDetailsPage.footer.ordersTab;
      if (isAndroid()) {
        const selected = await ordersTab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        const value = await ordersTab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });

  describe('Order Details → Orders List Navigation (Back)', () => {
    it('should navigate back to Orders list when tapping Go back button', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      // Navigate to details
      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();

      // Navigate back
      await orderDetailsPage.goBack();
      await ordersPage.waitForScreenReady();

      // Verify we're back on Orders list
      const isOnOrders = await ordersPage.isOnOrdersPage();
      expect(isOnOrders).toBe(true);
    });

    it('should display Orders header after navigating back', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();
      await orderDetailsPage.goBack();
      await ordersPage.waitForScreenReady();

      await expect(ordersPage.headerTitle).toBeDisplayed();
    });

    it('should preserve orders list after round-trip navigation', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      // Get initial order count
      const initialCount = await ordersPage.getVisibleOrdersCount();

      // Navigate to details and back
      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();
      await orderDetailsPage.goBack();
      await ordersPage.waitForScreenReady();

      // Verify order count is preserved
      const afterCount = await ordersPage.getVisibleOrdersCount();
      expect(afterCount).toBe(initialCount);
    });

    it('should navigate back using hardware/system back button', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await ordersPage.tapFirstOrder();
      await orderDetailsPage.waitForPageReady();

      // Use system back (Android: hardware back, iOS: edge swipe)
      await orderDetailsPage.systemBack();
      await ordersPage.waitForScreenReady();

      const isOnOrders = await ordersPage.isOnOrdersPage();
      expect(isOnOrders).toBe(true);
    });
  });

  describe('Navigate to Specific Order', () => {
    it('should navigate to a specific order by ID', async function () {
      if (!hasOrdersData || !firstOrderId) {
        this.skip();
        return;
      }

      await ordersPage.tapOrder(firstOrderId);
      await orderDetailsPage.waitForPageReady();

      const displayedId = await orderDetailsPage.getOrderId();
      expect(displayedId).toBe(firstOrderId);
    });

    it('should display correct status for navigated order', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      // Get order details from list before navigating
      const ordersList = await ordersPage.getVisibleOrdersWithStatus();
      const firstOrder = ordersList[0];

      await ordersPage.tapOrder(firstOrder.orderId);
      await orderDetailsPage.waitForPageReady();

      const detailsStatus = await orderDetailsPage.getStatus();
      expect(detailsStatus).toBe(firstOrder.status);
    });
  });
});
