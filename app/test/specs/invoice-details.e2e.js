const { expect } = require('@wdio/globals');

const invoicesPage = require('../pageobjects/invoices.page');
const invoiceDetailsPage = require('../pageobjects/invoice-details.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

// E2E tests for Invoice Details Page, modeled after agreement-details.e2e.js
// API call: apiClient.getInvoiceById(invoiceId)

describe('Invoice Details Page', () => {
  let hasInvoicesData = false;
  let apiAvailable = false;
  let testInvoiceId = null;
  let apiInvoiceData = null;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Invoices page via More menu
    await invoicesPage.footer.moreTab.click();
    await browser.pause(500);
    await morePage.invoicesMenuItem.click();
    await invoicesPage.waitForScreenReady();

    hasInvoicesData = await invoicesPage.hasInvoices();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasInvoicesData) {
      const invoiceIds = await invoicesPage.getVisibleInvoiceIds();
      testInvoiceId = invoiceIds[0];

      // Pre-fetch API data for validation tests
      if (apiAvailable && testInvoiceId) {
        try {
          apiInvoiceData = await apiClient.getInvoiceById(testInvoiceId);
          console.info(`📊 Pre-fetched API data for invoice: ${testInvoiceId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(`📊 Invoice Details test setup: hasInvoices=${hasInvoicesData}, apiAvailable=${apiAvailable}, testInvoiceId=${testInvoiceId}`);
    console.log(JSON.stringify(apiInvoiceData, null, 2));
    console.log(testInvoiceId);

    // Navigate to invoice details page once at the start
    if (hasInvoicesData && testInvoiceId) {
      await invoicesPage.tapInvoice(testInvoiceId);
      await invoiceDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    await invoiceDetailsPage.scrollToTop(1);
  });

  describe('Page Structure', () => {
    it('should display the Invoice header title', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      await expect(invoiceDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Invoice ID', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      await expect(invoiceDetailsPage.invoiceIdText).toBeDisplayed();
      const invoiceId = await invoiceDetailsPage.getItemId();
      expect(invoiceId).toMatch(/^INV-(\d{4}-)+\d{4}$/);
    });

    it('should display the status field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      // Use robust status getter for standalone status fields
      const statusElem = await invoiceDetailsPage.getStatusByName(apiInvoiceData.status);
      await expect(statusElem).toBeDisplayed();
      const status = await statusElem.getText();
      expect(status).toBeTruthy();
    });

    it('should display the Client field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const client = await invoiceDetailsPage.getSimpleFieldValue('Client', false);
      expect(client).toBeTruthy();
    });

    it('should display the Buyer field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const buyer = await invoiceDetailsPage.getCompositeFieldValueByLabel('Buyer', false);
      expect(buyer).toBeTruthy();
    });

    it('should display the Licensee field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const licensee = await invoiceDetailsPage.getSimpleFieldValue('Licensee', false);
      expect(licensee).toBeTruthy();
    });

    it('should display the Vendor field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const vendor = await invoiceDetailsPage.getSimpleFieldValue('Vendor', false);
      expect(vendor).toBeTruthy();
    });

    it('should display the Product field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const product = await invoiceDetailsPage.getSimpleFieldValue('Product', false);
      expect(product).toBeTruthy();
    });

    it('should display the Agreement field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const agreement = await invoiceDetailsPage.getSimpleFieldValue('Agreement', false);
      expect(agreement).toBeTruthy();
    });

    it('should display the Seller field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const seller = await invoiceDetailsPage.getCompositeFieldValueByLabel('Seller', false);
      expect(seller).toBeTruthy();
    });

    it('should display the Currency field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const currency = await invoiceDetailsPage.getSimpleFieldValue('Currency', true);
      expect(currency).toBeTruthy();
    });
  });

  describe('API Data Validation', () => {
    it('should match Invoice ID with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiInvoiceId = await invoiceDetailsPage.getItemId();
      const apiInvoiceId = apiInvoiceData.id;
      expect(uiInvoiceId).toBe(apiInvoiceId);
    });

    it('should match status with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiStatus = await (invoiceDetailsPage.getStatusByName(apiInvoiceData.status)).getText();
      const apiStatus = apiInvoiceData.status;
      expect(uiStatus).toBe(apiStatus);
    });

    it('should match client with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiClient = await invoiceDetailsPage.getSimpleFieldValue('Client', false);
      const apiClientName = apiInvoiceData.client?.name || global.constants.dashForEmpty;
      expect(uiClient).toBe(apiClientName);
    });

    it('should match buyer with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiBuyer = await invoiceDetailsPage.getCompositeFieldValueByLabel('Buyer', false);
      const apiBuyerName = apiInvoiceData.buyer?.name || global.constants.dashForEmpty;
      expect(uiBuyer).toBe(apiBuyerName);
    });

    it('should match licensee with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiLicensee = await invoiceDetailsPage.getSimpleFieldValue('Licensee', false);
      const apiLicenseeName = apiInvoiceData.licensee?.name || global.constants.dashForEmpty;
      expect(uiLicensee).toBe(apiLicenseeName);
    });

    it('should match vendor with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiVendor = await invoiceDetailsPage.getSimpleFieldValue('Vendor', false);
      const apiVendorName = apiInvoiceData.vendor?.name || global.constants.dashForEmpty;
      expect(uiVendor).toBe(apiVendorName);
    });

    it('should match product with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiProduct = await invoiceDetailsPage.getSimpleFieldValue('Product', false);
      const apiProductName = apiInvoiceData.product?.name || global.constants.dashForEmpty;
      expect(uiProduct).toBe(apiProductName);
    });

    it('should match agreement with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiAgreement = await invoiceDetailsPage.getSimpleFieldValue('Agreement', false);
      const apiAgreementName = apiInvoiceData.agreement?.name || global.constants.dashForEmpty;
      expect(uiAgreement).toBe(apiAgreementName);
    });

    it('should match seller with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiSeller = await invoiceDetailsPage.getCompositeFieldValueByLabel('Seller', false);
      const apiSellerName = apiInvoiceData.seller?.name || global.constants.dashForEmpty;
      expect(uiSeller).toBe(apiSellerName);
    });

    it('should match currency with API response', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiCurrency = await invoiceDetailsPage.getSimpleFieldValue('Currency', true);
      const apiCurrency = apiInvoiceData.currency;
      console.log(`[Currency] UI: ${uiCurrency} | API: ${apiCurrency}`);
      expect(uiCurrency).toBe(apiCurrency);
    });

    it('should log all invoice details for comparison', async function () {
      if (!hasInvoicesData || !apiAvailable || !apiInvoiceData) {
        this.skip();
        return;
      }
      const uiDetails = await invoiceDetailsPage.getAllInvoiceDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Invoice Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Invoice ID: UI="${uiDetails.invoiceId}" | API="${apiInvoiceData.id}"`);
      console.info(`Status:     UI="${uiDetails.status}" | API="${apiInvoiceData.status}"`);
      console.info(`Client:     UI="${uiDetails.client}" | API="${apiInvoiceData.client?.name || global.constants.dashForEmpty}"`);
      console.info(`Buyer:      UI="${uiDetails.buyer}" | API="${apiInvoiceData.buyer?.name || global.constants.dashForEmpty}"`);
      console.info(`Licensee:   UI="${uiDetails.licensee}" | API="${apiInvoiceData.licensee?.name || global.constants.dashForEmpty}"`);
      console.info(`Vendor:     UI="${uiDetails.vendor}" | API="${apiInvoiceData.vendor?.name || global.constants.dashForEmpty}"`);
      console.info(`Product:    UI="${uiDetails.product}" | API="${apiInvoiceData.product?.name || global.constants.dashForEmpty}"`);
      console.info(`Agreement:  UI="${uiDetails.agreement}" | API="${apiInvoiceData.agreement?.name}"`);
      console.info(`Seller:     UI="${uiDetails.seller}" | API="${apiInvoiceData.seller?.name}"`);
      console.info(`Currency:   UI="${uiDetails.currency}" | API="${apiInvoiceData.currency}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.invoiceId).toBe(apiInvoiceData.id);
    });
  });
});
