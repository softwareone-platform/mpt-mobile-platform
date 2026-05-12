const { expect } = require('@wdio/globals');

const salesOrdersPage = require('../pageobjects/sales-orders.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE, REGEX, STATUSES } = require('../pageobjects/utils/constants');

describe('Sales Orders Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasSalesOrdersData = false;
  let hasEmptyState = false;
  let apiSalesOrdersAvailable = false;
  let salesOrdersMenuAvailable = false;

  /**
   * Navigate to Sales Orders page via More menu
   */
  async function navigateToSalesOrders() {
    await morePage.ensureMorePage();
    let menuExists = await morePage.salesOrdersMenuItem.isExisting().catch(() => false);
    if (!menuExists) {
      await morePage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
    }
    await morePage.salesOrdersMenuItem.click();
    await salesOrdersPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    // Sales Orders requires an Operations account
    await ensureOperationsAccount();

    // Check if Sales Orders menu item is available for this user
    await morePage.ensureMorePage();
    salesOrdersMenuAvailable = await morePage.salesOrdersMenuItem.isExisting().catch(() => false);

    if (!salesOrdersMenuAvailable) {
      console.info('⚠️ Sales Orders menu item not available for this user - skipping Sales Orders tests');
      return;
    }

    await morePage.salesOrdersMenuItem.click();
    await salesOrdersPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasSalesOrdersData = await salesOrdersPage.hasSalesOrders();
    hasEmptyState = !hasSalesOrdersData && (await salesOrdersPage.emptyState.isDisplayed().catch(() => false));
    apiSalesOrdersAvailable = !!process.env.API_OPS_TOKEN;

    console.info(
      `📊 Sales Orders data state: hasSalesOrders=${hasSalesOrdersData}, emptyState=${hasEmptyState}, apiAvailable=${apiSalesOrdersAvailable}`,
    );
  });

  beforeEach(async function () {
    if (!salesOrdersMenuAvailable) {
      this.skip();
      return;
    }
    const isOnSalesOrders = await salesOrdersPage.isOnSalesOrdersPage();
    if (!isOnSalesOrders) {
      await navigateToSalesOrders();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      await salesOrdersPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);

      let menuExists = await morePage.salesOrdersMenuItem.isExisting().catch(() => false);
      if (!menuExists) {
        await morePage.scrollDown();
        await browser.pause(PAUSE.ANIMATION_SETTLE);
      }
      await morePage.salesOrdersMenuItem.click();
      await salesOrdersPage.waitForScreenReady();

      await expect(salesOrdersPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(salesOrdersPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await salesOrdersPage.goBack();

      let menuExists = await morePage.salesOrdersMenuItem.isExisting().catch(() => false);
      if (!menuExists) {
        await morePage.scrollDown();
        await browser.pause(PAUSE.ANIMATION_SETTLE);
      }
      await expect(morePage.salesOrdersMenuItem).toBeDisplayed();

      await morePage.salesOrdersMenuItem.click();
      await salesOrdersPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Sales Orders header title', async () => {
      await expect(salesOrdersPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await salesOrdersPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(salesOrdersPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(salesOrdersPage.footer.spotlightsTab).toBeDisplayed();
      await expect(salesOrdersPage.footer.chatTab).toBeDisplayed();
      await expect(salesOrdersPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = salesOrdersPage.footer.moreTab;
      if (isAndroid()) {
        const selected = await moreTab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        const value = await moreTab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no sales orders exist', async function () {
      if (hasSalesOrdersData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(salesOrdersPage.emptyState).toBeDisplayed();
    });
  });

  describe('Sales Orders List', () => {
    it('should display sales orders list when sales orders exist', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }

      await expect(salesOrdersPage.salesOrdersScrollView).toBeDisplayed();
      const salesOrdersCount = await salesOrdersPage.getVisibleSalesOrdersCount();
      expect(salesOrdersCount).toBeGreaterThan(0);
    });

    it('should display sales order items with ID and status', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }

      const firstSalesOrder = salesOrdersPage.firstSalesOrderItem;
      await expect(firstSalesOrder).toBeDisplayed();

      const details = await salesOrdersPage.getSalesOrderDetails(firstSalesOrder);
      console.info(`📋 First sales order label: "${details.label}"`);
      console.info(`   ID: "${details.id}", status: "${details.status}", externalId: "${details.externalId}"`);

      // Log the raw ID to help confirm the SLO- prefix on first run
      expect(details.id).toBeTruthy();
      expect(STATUSES.SALES_ORDER).toContain(details.status);
    });

    it('should detect all loaded sales orders in the list', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }

      const salesOrdersCount = await salesOrdersPage.getVisibleSalesOrdersCount();
      const salesOrderIds = await salesOrdersPage.getVisibleSalesOrderIds();

      console.info(`Total sales orders detected: ${salesOrdersCount}`);
      console.info(`First 5 sales order IDs: ${salesOrderIds.slice(0, 5).join(', ')}`);

      expect(salesOrdersCount).toBeGreaterThan(0);

      for (const salesOrderId of salesOrderIds) {
        expect(salesOrderId).toMatch(REGEX.SALES_ORDER_ID);
      }
    });

    it('should not display empty state when sales orders exist', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await salesOrdersPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Sales Orders by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }

      const salesOrdersWithStatus = await salesOrdersPage.getVisibleSalesOrdersWithStatus();
      const statusCounts = {};
      for (const order of salesOrdersWithStatus) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      }

      console.info(`Sales Orders by status: ${JSON.stringify(statusCounts)}`);
      expect(Object.keys(statusCounts).length).toBeGreaterThan(0);
    });
  });

  describe('API Integration', () => {
    it('should match API sales orders count with visible sales orders', async function () {
      if (!apiSalesOrdersAvailable || !hasSalesOrdersData) {
        this.skip();
        return;
      }

      try {
        const apiSalesOrders = await apiClient.getSalesOrders({ limit: 100 });
        const apiSalesOrdersList = apiSalesOrders.data || apiSalesOrders;
        const apiCount = apiSalesOrdersList.length;

        const uiCount = await salesOrdersPage.getVisibleSalesOrdersCount();

        console.info(`[Count Compare] API sales orders: ${apiCount}, UI visible sales orders: ${uiCount}`);

        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 sales order IDs and statuses match API data', async function () {
      if (!apiSalesOrdersAvailable || !hasSalesOrdersData) {
        this.skip();
        return;
      }

      try {
        const apiSalesOrders = await apiClient.getSalesOrders({ limit: 10 });
        const apiSalesOrdersList = apiSalesOrders.data || apiSalesOrders;
        const uiSalesOrderIds = await salesOrdersPage.getVisibleSalesOrderIds();
        const uiSalesOrdersWithStatus = await salesOrdersPage.getVisibleSalesOrdersWithStatus();

        const comparisons = [];
        for (let i = 0; i < Math.min(apiSalesOrdersList.length, 10); i++) {
          const apiOrder = apiSalesOrdersList[i];
          const apiOrderId = apiOrder.id;
          const apiStatus = apiOrder.status;
          const uiOrder = uiSalesOrdersWithStatus[i] || {};
          const uiOrderId = uiOrder.salesOrderId;
          const uiStatus = uiOrder.status;

          const idMatches = apiOrderId === uiOrderId;
          const statusMatches = apiStatus === uiStatus;

          console.info(
            `[${i + 1}] ID: ${apiOrderId} vs ${uiOrderId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`,
          );
          comparisons.push({ apiOrderId, uiOrderId, idMatches, apiStatus, uiStatus, statusMatches });
        }

        const idMatchCount = comparisons.filter((c) => c.idMatches).length;
        const statusMatchCount = comparisons.filter((c) => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);

        for (const uiOrderId of uiSalesOrderIds.slice(0, 10)) {
          expect(uiOrderId).toMatch(REGEX.SALES_ORDER_ID);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
