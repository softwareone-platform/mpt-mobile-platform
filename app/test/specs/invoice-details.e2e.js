const { expect } = require('@wdio/globals');

const invoiceDetailsPage = require('../pageobjects/invoice-details.page');
const invoicesPage = require('../pageobjects/invoices.page');
const morePage = require('../pageobjects/more.page');
const accountDetailsPage = require('../pageobjects/account-details.page');
const buyerDetailsPage = require('../pageobjects/buyer-details.page');
const licenseeDetailsPage = require('../pageobjects/licensee-details.page');
const productDetailsPage = require('../pageobjects/product-details.page');
const agreementDetailsPage = require('../pageobjects/agreement-details.page');
const sellerDetailsPage = require('../pageobjects/seller-details.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureClientAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');

// E2E tests for Invoice Details Page, modeled after agreement-details.e2e.js
// API call: apiClient.getInvoiceById(invoiceId)

describe('Invoice Details Page', () => {
  let api;
  let hasInvoicesData = false;
  let apiAvailable = false;
  let testInvoiceId = null;
  let apiInvoiceData = null;
  let invoicesMenuAvailable = false;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureClientAccount();
    // Navigate to Invoices page via More menu
    await invoicesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);

    invoicesMenuAvailable = await morePage.invoicesMenuItem.isExisting().catch(() => false);
    if (!invoicesMenuAvailable) {
      console.info(
        '⚠️ Invoices menu item not available for this user - skipping Invoice Details tests',
      );
      return;
    }

    await morePage.invoicesMenuItem.click();
    await invoicesPage.waitForScreenReady();

    hasInvoicesData = await invoicesPage.hasInvoices();
    apiAvailable = !!api;

    if (hasInvoicesData) {
      const invoiceIds = await invoicesPage.getVisibleInvoiceIds();
      testInvoiceId = invoiceIds[0];

      // Pre-fetch API data for validation tests
      if (apiAvailable && testInvoiceId) {
        try {
          apiInvoiceData = await api.getInvoiceById(testInvoiceId);
          console.info(`📊 Pre-fetched API data for invoice: ${testInvoiceId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Invoice Details test setup: hasInvoices=${hasInvoicesData}, apiAvailable=${apiAvailable}, testInvoiceId=${testInvoiceId}`,
    );

    // Navigate to invoice details page once at the start
    if (hasInvoicesData && testInvoiceId) {
      await invoicesPage.tapInvoice(testInvoiceId);
      await invoiceDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    if (!invoicesMenuAvailable || !hasInvoicesData) {
      this.skip();
      return;
    }
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
      expect(invoiceId).toMatch(REGEX.INVOICE_ID);
    });

    it('should display the status field', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const status = await invoiceDetailsPage.getStatus();
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

    it('should NOT display an avatar in the header', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      const avatarExists = await invoiceDetailsPage.headerAvatarWrapper.isExisting().catch(() => false);
      expect(avatarExists).toBe(false);
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
      const uiStatus = await invoiceDetailsPage.getStatusByName(apiInvoiceData.status).getText();
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
      console.info(`[Currency] UI: ${uiCurrency} | API: ${apiCurrency}`);
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
      console.info(
        `Client:     UI="${uiDetails.client}" | API="${apiInvoiceData.client?.name || global.constants.dashForEmpty}"`,
      );
      console.info(
        `Buyer:      UI="${uiDetails.buyer}" | API="${apiInvoiceData.buyer?.name || global.constants.dashForEmpty}"`,
      );
      console.info(
        `Licensee:   UI="${uiDetails.licensee}" | API="${apiInvoiceData.licensee?.name || global.constants.dashForEmpty}"`,
      );
      console.info(
        `Vendor:     UI="${uiDetails.vendor}" | API="${apiInvoiceData.vendor?.name || global.constants.dashForEmpty}"`,
      );
      console.info(
        `Product:    UI="${uiDetails.product}" | API="${apiInvoiceData.product?.name || global.constants.dashForEmpty}"`,
      );
      console.info(
        `Agreement:  UI="${uiDetails.agreement}" | API="${apiInvoiceData.agreement?.name}"`,
      );
      console.info(`Seller:     UI="${uiDetails.seller}" | API="${apiInvoiceData.seller?.name}"`);
      console.info(`Currency:   UI="${uiDetails.currency}" | API="${apiInvoiceData.currency}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.invoiceId).toBe(apiInvoiceData.id);
    });
  });

  describe('Navigation Links', () => {
    it('should navigate to Account Details when Client field is tapped', async function () {
      if (!hasInvoicesData) { this.skip(); return; }
      await invoiceDetailsPage.scrollToTop(3);
      const clientField = invoiceDetailsPage.getCompositeField('Client');
      const isDisplayed = await clientField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await clientField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(accountDetailsPage.itemIdText).toBeDisplayed();
      await accountDetailsPage.goBack();
      await invoiceDetailsPage.waitForPageReady();
    });

    it('should navigate to Buyer Details when Buyer field is tapped', async function () {
      if (!hasInvoicesData) { this.skip(); return; }
      await invoiceDetailsPage.scrollToTop(3);
      const buyerField = invoiceDetailsPage.getCompositeField('Buyer');
      const isDisplayed = await buyerField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await buyerField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(buyerDetailsPage.headerTitle).toBeDisplayed();
      await buyerDetailsPage.goBack();
      await invoiceDetailsPage.waitForPageReady();
    });

    it('should navigate to Licensee Details when Licensee field is tapped', async function () {
      if (!hasInvoicesData) { this.skip(); return; }
      await invoiceDetailsPage.scrollToTop(3);
      const licenseeField = invoiceDetailsPage.getCompositeField('Licensee');
      const isDisplayed = await licenseeField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await licenseeField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(licenseeDetailsPage.headerTitle).toBeDisplayed();
      await licenseeDetailsPage.goBack();
      await invoiceDetailsPage.waitForPageReady();
    });

    it('should navigate to Product Details when Product field is tapped', async function () {
      if (!hasInvoicesData) { this.skip(); return; }
      await invoiceDetailsPage.scrollToTop(3);
      const productField = invoiceDetailsPage.getCompositeField('Product');
      const isDisplayed = await productField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await productField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(productDetailsPage.headerTitle).toBeDisplayed();
      await productDetailsPage.goBack();
      await invoiceDetailsPage.waitForPageReady();
    });

    it('should navigate to Agreement Details when Agreement field is tapped', async function () {
      if (!hasInvoicesData) { this.skip(); return; }
      await invoiceDetailsPage.scrollToTop(3);
      const agreementField = invoiceDetailsPage.getCompositeField('Agreement');
      const isDisplayed = await agreementField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await agreementField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(agreementDetailsPage.headerTitle).toBeDisplayed();
      await agreementDetailsPage.goBack();
      await invoiceDetailsPage.waitForPageReady();
    });

    it('should navigate to Seller Details when Seller field is tapped', async function () {
      if (!hasInvoicesData) { this.skip(); return; }
      await invoiceDetailsPage.scrollToTop(3);
      const sellerField = invoiceDetailsPage.getCompositeField('Seller');
      const isDisplayed = await sellerField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await sellerField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(sellerDetailsPage.headerTitle).toBeDisplayed();
      await sellerDetailsPage.goBack();
      await invoiceDetailsPage.waitForPageReady();
    });

    it('should navigate to Seller Details when Owner field is tapped', async function () {
      if (!hasInvoicesData) { this.skip(); return; }
      await invoiceDetailsPage.scrollToTop(3);
      const ownerField = invoiceDetailsPage.getCompositeField('Owner');
      const isDisplayed = await ownerField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await ownerField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(sellerDetailsPage.headerTitle).toBeDisplayed();
      await sellerDetailsPage.goBack();
      await invoiceDetailsPage.waitForPageReady();
    });
  });
});
