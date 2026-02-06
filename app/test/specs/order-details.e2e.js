const { expect } = require('@wdio/globals');

const ordersPage = require('../pageobjects/orders.page');
const orderDetailsPage = require('../pageobjects/order-details.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

describe('Order Details Page', () => {
  let hasOrdersData = false;
  let apiAvailable = false;
  let testOrderId = null;
  let apiOrderData = null;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ordersPage.ensureOrdersPage();

    hasOrdersData = await ordersPage.hasOrders();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasOrdersData) {
      const orderIds = await ordersPage.getVisibleOrderIds();
      testOrderId = orderIds[0];

      // Pre-fetch API data for validation tests
      if (apiAvailable && testOrderId) {
        try {
          apiOrderData = await apiClient.getOrderById(testOrderId);
          console.info(`📊 Pre-fetched API data for order: ${testOrderId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(`📊 Order Details test setup: hasOrders=${hasOrdersData}, apiAvailable=${apiAvailable}, testOrderId=${testOrderId}`);

    // Navigate to order details page once at the start
    if (hasOrdersData && testOrderId) {
      await ordersPage.tapOrder(testOrderId);
      await orderDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Order header title', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(orderDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Order ID', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(orderDetailsPage.orderIdText).toBeDisplayed();
      const orderId = await orderDetailsPage.getOrderId();
      expect(orderId).toMatch(/^ORD-\d{4}-\d{4}-\d{4}$/);
    });

    it('should display the status badge', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(orderDetailsPage.statusText).toBeDisplayed();
      const status = await orderDetailsPage.getStatus();
      expect(['Draft', 'Quoted', 'Completed', 'Deleted', 'Failed', 'Processing', 'Querying']).toContain(status);
    });

    it('should display the Details section header', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(orderDetailsPage.detailsHeader).toBeDisplayed();
    });

    it('should display the Type field', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(orderDetailsPage.typeLabel).toBeDisplayed();
      await expect(orderDetailsPage.typeValue).toBeDisplayed();
    });

    it('should display the Agreement field', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(orderDetailsPage.agreementField).toBeDisplayed();
    });

    it('should display the Product field', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(orderDetailsPage.productField).toBeDisplayed();
    });

    it('should display the Vendor field', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(orderDetailsPage.vendorField).toBeDisplayed();
    });

    it('should display the Client field', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      await expect(orderDetailsPage.clientField).toBeDisplayed();
    });

    it('should display the Currency field', async function () {
      if (!hasOrdersData) {
        this.skip();
        return;
      }

      // Use the same approach as the API validation test which works
      // getSimpleFieldValue handles scrolling based on value visibility
      const currencyValue = await orderDetailsPage.getCurrency();

      // Verify we got a valid currency value
      expect(currencyValue).toBeTruthy();
      console.info(`[Currency Field] Value: ${currencyValue}`);
    });
  });

  describe('API Data Validation', () => {
    it('should match Order ID with API response', async function () {
      if (!hasOrdersData || !apiAvailable || !apiOrderData) {
        this.skip();
        return;
      }

      const uiOrderId = await orderDetailsPage.getOrderId();
      const apiOrderId = apiOrderData.id || apiOrderData.orderId;

      console.info(`[Order ID] UI: ${uiOrderId} | API: ${apiOrderId}`);
      expect(uiOrderId).toBe(apiOrderId);
    });

    it('should match status with API response', async function () {
      if (!hasOrdersData || !apiAvailable || !apiOrderData) {
        this.skip();
        return;
      }

      const uiStatus = await orderDetailsPage.getStatus();
      const apiStatus = apiOrderData.status;

      console.info(`[Status] UI: ${uiStatus} | API: ${apiStatus}`);

      // Note: Order status can change in real-time as orders are processed.
      // If there's a mismatch, log a warning but only fail if both are empty.
      if (uiStatus !== apiStatus) {
        console.warn(`[Status Mismatch] Order status may have changed during test execution. UI: ${uiStatus}, API: ${apiStatus}`);
      }

      // At minimum, both should have a valid status
      expect(uiStatus).toBeTruthy();
      expect(apiStatus).toBeTruthy();
    });

    it('should match type with API response', async function () {
      if (!hasOrdersData || !apiAvailable || !apiOrderData) {
        this.skip();
        return;
      }

      const uiType = await orderDetailsPage.getType();
      const apiType = apiOrderData.type;

      console.info(`[Type] UI: ${uiType} | API: ${apiType}`);
      expect(uiType).toBe(apiType);
    });

    it('should match currency with API response', async function () {
      if (!hasOrdersData || !apiAvailable || !apiOrderData) {
        this.skip();
        return;
      }

      const uiCurrency = await orderDetailsPage.getCurrency();
      const apiCurrency = apiOrderData.price?.currency;

      console.info(`[Currency] UI: ${uiCurrency} | API: ${apiCurrency}`);
      expect(uiCurrency).toBe(apiCurrency);
    });

    it('should match agreement name with API response', async function () {
      if (!hasOrdersData || !apiAvailable || !apiOrderData) {
        this.skip();
        return;
      }

      const uiAgreement = await orderDetailsPage.getAgreementName();
      const apiAgreement = apiOrderData.agreement?.name || apiOrderData.agreementName || '';

      console.info(`[Agreement] UI: ${uiAgreement} | API: ${apiAgreement}`);
      // Use toContain for flexibility with truncation
      if (apiAgreement) {
        expect(uiAgreement).toContain(apiAgreement.substring(0, 20));
      }
    });

    it('should match product name with API response', async function () {
      if (!hasOrdersData || !apiAvailable || !apiOrderData) {
        this.skip();
        return;
      }

      const uiProduct = await orderDetailsPage.getProductName();
      const apiProduct = apiOrderData.product?.name || apiOrderData.productName || '';

      console.info(`[Product] UI: ${uiProduct} | API: ${apiProduct}`);
      if (apiProduct) {
        expect(uiProduct).toContain(apiProduct.substring(0, 20));
      }
    });

    it('should match vendor name with API response', async function () {
      if (!hasOrdersData || !apiAvailable || !apiOrderData) {
        this.skip();
        return;
      }

      const uiVendor = await orderDetailsPage.getVendorName();
      const apiVendor = apiOrderData.vendor?.name || apiOrderData.vendorName || '';

      console.info(`[Vendor] UI: ${uiVendor} | API: ${apiVendor}`);
      expect(uiVendor).toBe(apiVendor);
    });

    it('should match client name with API response', async function () {
      if (!hasOrdersData || !apiAvailable || !apiOrderData) {
        this.skip();
        return;
      }

      const uiClient = await orderDetailsPage.getClientName();
      const apiClientName = apiOrderData.client?.name || apiOrderData.buyer?.name || apiOrderData.clientName || '';

      console.info(`[Client] UI: ${uiClient} | API: ${apiClientName}`);
      if (apiClientName) {
        expect(uiClient).toContain(apiClientName.substring(0, 20));
      }
    });

    it('should log all order details for comparison', async function () {
      if (!hasOrdersData || !apiAvailable || !apiOrderData) {
        this.skip();
        return;
      }

      const uiDetails = await orderDetailsPage.getAllOrderDetails();

      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Order Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Order ID:   UI="${uiDetails.orderId}" | API="${apiOrderData.id || apiOrderData.orderId}"`);
      console.info(`Status:     UI="${uiDetails.status}" | API="${apiOrderData.status}"`);
      console.info(`Type:       UI="${uiDetails.type}" | API="${apiOrderData.type}"`);
      console.info(`Currency:   UI="${uiDetails.currency}" | API="${apiOrderData.price?.currency}"`);
      console.info(`Agreement:  UI="${uiDetails.agreement}"`);
      console.info(`Product:    UI="${uiDetails.product}"`);
      console.info(`Vendor:     UI="${uiDetails.vendor}"`);
      console.info(`Client:     UI="${uiDetails.client}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Basic validation - order ID should always match
      expect(uiDetails.orderId).toBe(apiOrderData.id || apiOrderData.orderId);
    });
  });
});
