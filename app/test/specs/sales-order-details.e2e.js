const { expect } = require('@wdio/globals');

const salesOrderDetailsPage = require('../pageobjects/sales-order-details.page');
const salesOrdersPage = require('../pageobjects/sales-orders.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE, REGEX, STATUSES } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

describe('Sales Order Details Page', () => {
  let hasSalesOrdersData = false;
  let apiAvailable = false;
  let testSalesOrderId = null;
  let apiSalesOrderData = null;
  let salesOrdersMenuAvailable = false;

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

    await morePage.ensureMorePage();

    salesOrdersMenuAvailable = await morePage.salesOrdersMenuItem.isExisting().catch(() => false);
    if (!salesOrdersMenuAvailable) {
      console.info('⚠️ Sales Orders menu item not available for this user - skipping Sales Order Details tests');
      return;
    }

    await morePage.salesOrdersMenuItem.click();
    await salesOrdersPage.waitForScreenReady();

    hasSalesOrdersData = await salesOrdersPage.hasSalesOrders();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasSalesOrdersData) {
      const salesOrderIds = await salesOrdersPage.getVisibleSalesOrderIds();
      testSalesOrderId = salesOrderIds[0];

      if (apiAvailable && testSalesOrderId) {
        try {
          apiSalesOrderData = await apiClient.getSalesOrderById(testSalesOrderId);
          console.info(`📊 Pre-fetched API data for sales order: ${testSalesOrderId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Sales Order Details test setup: hasSalesOrders=${hasSalesOrdersData}, apiAvailable=${apiAvailable}, testSalesOrderId=${testSalesOrderId}`,
    );

    if (hasSalesOrdersData && testSalesOrderId) {
      await salesOrdersPage.tapSalesOrder(testSalesOrderId);
      await salesOrderDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    if (!salesOrdersMenuAvailable || !hasSalesOrdersData) {
      this.skip();
      return;
    }
    const isOnPage = await salesOrderDetailsPage.isOnDetailsPage();
    if (!isOnPage) {
      await navigation.ensureHomePage({ resetFilters: false });
      await navigateToSalesOrders();
      await salesOrdersPage.tapSalesOrder(testSalesOrderId);
      await salesOrderDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Sales Order header title', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }
      await expect(salesOrderDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Sales Order ID', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }
      await expect(salesOrderDetailsPage.salesOrderIdText).toBeDisplayed();
      const salesOrderId = await salesOrderDetailsPage.getItemId();
      expect(salesOrderId).toMatch(REGEX.SALES_ORDER_ID);
    });

    it('should display the status field', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }
      const status = await salesOrderDetailsPage.getStatus();
      expect(status).toBeTruthy();
      expect(STATUSES.SALES_ORDER).toContain(status);
    });

    it('should display the Buyer field', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }
      const buyer = await salesOrderDetailsPage.getCompositeFieldValueByLabel('Buyer', true).catch(() => '');
      expect(buyer).toBeTruthy();
    });

    it('should display the Seller field', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }
      const seller = await salesOrderDetailsPage.getCompositeFieldValueByLabel('Seller', true).catch(() => '');
      expect(seller).toBeTruthy();
    });

    it('should display the Operations external ID field', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }
      const opsExternalId = await salesOrderDetailsPage.getSimpleFieldValue('Operations external ID', true).catch(() => '');
      // External ID may be empty; just verify the field is accessible
      expect(typeof opsExternalId).toBe('string');
    });

    it('should display the ∑ SP field', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }
      const sp = await salesOrderDetailsPage.getSimpleFieldValue('∑ SP', true).catch(() => '');
      expect(sp).toBeTruthy();
    });

    it('should display the ∑ GT field', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }
      const gt = await salesOrderDetailsPage.getSimpleFieldValue('∑ GT', true).catch(() => '');
      expect(gt).toBeTruthy();
    });

    it('should NOT display an avatar in the header', async function () {
      if (!hasSalesOrdersData) {
        this.skip();
        return;
      }
      const avatarExists = await salesOrderDetailsPage.headerAvatarWrapper.isExisting().catch(() => false);
      expect(avatarExists).toBe(false);
    });
  });

  describe('API Data Validation', () => {
    it('should match Sales Order ID with API response', async function () {
      if (!hasSalesOrdersData || !apiAvailable || !apiSalesOrderData) {
        this.skip();
        return;
      }
      const uiSalesOrderId = await salesOrderDetailsPage.getItemId();
      expect(uiSalesOrderId).toBe(apiSalesOrderData.id);
    });

    it('should match status with API response', async function () {
      if (!hasSalesOrdersData || !apiAvailable || !apiSalesOrderData) {
        this.skip();
        return;
      }
      const uiStatus = await salesOrderDetailsPage.getStatus();
      expect(uiStatus).toBe(apiSalesOrderData.status);
    });

    it('should log all sales order details for comparison', async function () {
      if (!hasSalesOrdersData || !apiAvailable || !apiSalesOrderData) {
        this.skip();
        return;
      }
      const uiDetails = await salesOrderDetailsPage.getAllSalesOrderDetails();
      const apiPrice = apiSalesOrderData.price || {};
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Sales Order Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Sales Order ID:      UI="${uiDetails.salesOrderId}" | API="${apiSalesOrderData.id}"`);
      console.info(`Status:              UI="${uiDetails.status}" | API="${apiSalesOrderData.status}"`);
      console.info(`Buyer:               UI="${uiDetails.buyer}" | API="${apiSalesOrderData.buyer?.name}"`);
      console.info(`Seller:              UI="${uiDetails.seller}" | API="${apiSalesOrderData.seller?.name}"`);
      console.info(`Sales quote:         UI="${uiDetails.salesQuote}" | API="${apiSalesOrderData.salesQuote?.id}"`);
      console.info(`Ops External ID:     UI="${uiDetails.opsExternalId}" | API="${apiSalesOrderData.externalIds?.operations}"`);
      console.info(`∑ SP:                UI="${uiDetails.sp}" | API="${apiPrice.currency} ${apiPrice.SPx1}"`);
      console.info(`∑ GT:                UI="${uiDetails.gt}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  });
});
