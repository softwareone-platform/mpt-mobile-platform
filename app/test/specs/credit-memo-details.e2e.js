const { expect } = require('@wdio/globals');

const creditMemosPage = require('../pageobjects/credit-memos.page');
const creditMemoDetailsPage = require('../pageobjects/credit-memo-details.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

// E2E tests for Credit Memo Details Page, modeled after agreement-details.e2e.js
// API call: apiClient.getCreditMemoById(creditMemoId)

describe('Credit Memo Details Page', () => {
  let hasCreditMemosData = false;
  let apiAvailable = false;
  let testCreditMemoId = null;
  let apiCreditMemoData = null;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Credit Memos page via More menu
    await creditMemosPage.footer.moreTab.click();
    await browser.pause(500);
    await morePage.creditMemosMenuItem.click();
    await creditMemosPage.waitForScreenReady();

    hasCreditMemosData = await creditMemosPage.hasCreditMemos();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasCreditMemosData) {
      const creditMemoIds = await creditMemosPage.getVisibleCreditMemoIds();
      testCreditMemoId = creditMemoIds[0];

      // Pre-fetch API data for validation tests
      if (apiAvailable && testCreditMemoId) {
        try {
          apiCreditMemoData = await apiClient.getCreditMemoById(testCreditMemoId); // <-- API call
          console.info(`📊 Pre-fetched API data for credit memo: ${testCreditMemoId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(`📊 Credit Memo Details test setup: hasCreditMemos=${hasCreditMemosData}, apiAvailable=${apiAvailable}, testCreditMemoId=${testCreditMemoId}`);

    // Navigate to credit memo details page once at the start
    if (hasCreditMemosData && testCreditMemoId) {
      await creditMemosPage.tapCreditMemo(testCreditMemoId);
      await creditMemoDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    await creditMemoDetailsPage.scrollToTop(1);
  });

  describe('Page Structure', () => {
    it('should display the Credit Memo header title', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      await expect(creditMemoDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Credit Memo ID', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      await expect(creditMemoDetailsPage.creditMemoIdText).toBeDisplayed();
      const creditMemoId = await creditMemoDetailsPage.getItemId();
      expect(creditMemoId).toMatch(/^CRD-(\d{4}-)+\d{4}$/);
    });

    it('should display the status field', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      const status = await creditMemoDetailsPage.getSimpleFieldValue('Issued', true);
      expect(status).toBeTruthy();
    });

    it('should display the Client field', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      const client = await creditMemoDetailsPage.getSimpleFieldValue('Client', true);
      expect(client).toBeTruthy();
    });

    it('should display the Buyer field', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      const buyer = await creditMemoDetailsPage.getCompositeFieldValueByLabel('Buyer', true);
      expect(buyer).toBeTruthy();
    });

    it('should display the Licensee field', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      const licensee = await creditMemoDetailsPage.getSimpleFieldValue('Licensee', true);
      expect(licensee).toBeTruthy();
    });

    it('should display the Vendor field', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      const vendor = await creditMemoDetailsPage.getSimpleFieldValue('Vendor', true);
      expect(vendor).toBeTruthy();
    });

    it('should display the Product field', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      const product = await creditMemoDetailsPage.getSimpleFieldValue('Product', true);
      expect(product).toBeTruthy();
    });

    it('should display the Agreement field', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      const agreement = await creditMemoDetailsPage.getSimpleFieldValue('Agreement', true);
      expect(agreement).toBeTruthy();
    });

    it('should display the Seller field', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      const seller = await creditMemoDetailsPage.getCompositeFieldValueByLabel('Seller', true);
      expect(seller).toBeTruthy();
    });

    it('should display the Currency field', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }
      const currency = await creditMemoDetailsPage.getSimpleFieldValue('Currency', true);
      expect(currency).toBeTruthy();
    });
  });

  describe('API Data Validation', () => {
    it('should match Credit Memo ID with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiCreditMemoId = await creditMemoDetailsPage.getItemId();
      const apiCreditMemoId = apiCreditMemoData.id;
      expect(uiCreditMemoId).toBe(apiCreditMemoId);
    });

    it('should match status with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiStatus = await creditMemoDetailsPage.getSimpleFieldValue('Issued', true);
      const apiStatus = apiCreditMemoData.status;
      expect(uiStatus).toBe(apiStatus);
    });

    it('should match client with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiClient = await creditMemoDetailsPage.getSimpleFieldValue('Client', true);
      const apiClientName = apiCreditMemoData.client?.name;
      expect(uiClient).toBe(apiClientName);
    });

    it('should match buyer with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiBuyer = await creditMemoDetailsPage.getCompositeFieldValueByLabel('Buyer', true);
      const apiBuyerName = apiCreditMemoData.buyer?.name;
      expect(uiBuyer).toBe(apiBuyerName);
    });

    it('should match licensee with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiLicensee = await creditMemoDetailsPage.getSimpleFieldValue('Licensee', true);
      const apiLicenseeName = apiCreditMemoData.licensee?.name;
      expect(uiLicensee).toBe(apiLicenseeName);
    });

    it('should match vendor with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiVendor = await creditMemoDetailsPage.getSimpleFieldValue('Vendor', true);
      const apiVendorName = apiCreditMemoData.vendor?.name;
      expect(uiVendor).toBe(apiVendorName);
    });

    it('should match product with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiProduct = await creditMemoDetailsPage.getSimpleFieldValue('Product', true);
      const apiProductName = apiCreditMemoData.product?.name;
      expect(uiProduct).toBe(apiProductName);
    });

    it('should match agreement with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiAgreement = await creditMemoDetailsPage.getSimpleFieldValue('Agreement', true);
      const apiAgreementName = apiCreditMemoData.agreement?.name;
      expect(uiAgreement).toBe(apiAgreementName);
    });

    it('should match seller with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiSeller = await creditMemoDetailsPage.getCompositeFieldValueByLabel('Seller', true);
      const apiSellerName = apiCreditMemoData.seller?.name;
      expect(uiSeller).toBe(apiSellerName);
    });

    it('should match currency with API response', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiCurrency = await creditMemoDetailsPage.getSimpleFieldValue('Currency', true);
      const apiCurrency = apiCreditMemoData.currency;
      expect(uiCurrency).toBe(apiCurrency);
    });

    it('should log all credit memo details for comparison', async function () {
      if (!hasCreditMemosData || !apiAvailable || !apiCreditMemoData) {
        this.skip();
        return;
      }
      const uiDetails = await creditMemoDetailsPage.getAllCreditMemoDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Credit Memo Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Credit Memo ID: UI="${uiDetails.creditMemoId}" | API="${apiCreditMemoData.id}"`);
      console.info(`Status:         UI="${uiDetails.status}" | API="${apiCreditMemoData.status}"`);
      console.info(`Client:         UI="${uiDetails.client}" | API="${apiCreditMemoData.client?.name}"`);
      console.info(`Buyer:          UI="${uiDetails.buyer}" | API="${apiCreditMemoData.buyer?.name}"`);
      console.info(`Licensee:       UI="${uiDetails.licensee}" | API="${apiCreditMemoData.licensee?.name}"`);
      console.info(`Vendor:         UI="${uiDetails.vendor}" | API="${apiCreditMemoData.vendor?.name}"`);
      console.info(`Product:        UI="${uiDetails.product}" | API="${apiCreditMemoData.product?.name}"`);
      console.info(`Agreement:      UI="${uiDetails.agreement}" | API="${apiCreditMemoData.agreement?.name}"`);
      console.info(`Seller:         UI="${uiDetails.seller}" | API="${apiCreditMemoData.seller?.name}"`);
      console.info(`Currency:       UI="${uiDetails.currency}" | API="${apiCreditMemoData.currency}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.creditMemoId).toBe(apiCreditMemoData.id);
    });
  });
});
