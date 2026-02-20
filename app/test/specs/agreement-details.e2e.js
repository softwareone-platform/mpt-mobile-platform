const { expect } = require('@wdio/globals');

const agreementsPage = require('../pageobjects/agreements.page');
const agreementDetailsPage = require('../pageobjects/agreement-details.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const subscriptionDetailsPage = require('../pageobjects/subscription-details.page');

// E2E tests for Agreement Details Page, modeled after user-details.e2e.js

describe('Agreement Details Page', () => {
  let hasAgreementsData = false;
  let apiAvailable = false;
  let testAgreementId = null;
  let apiAgreementData = null;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Agreements page via More menu
    await agreementsPage.footer.moreTab.click();
    await browser.pause(500);
    await morePage.agreementsMenuItem.click();
    await agreementsPage.waitForScreenReady();

    hasAgreementsData = await agreementsPage.hasAgreements();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasAgreementsData) {
      const agreementIds = await agreementsPage.getVisibleAgreementIds();
      testAgreementId = agreementIds[0];

      // Pre-fetch API data for validation tests
      if (apiAvailable && testAgreementId) {
        try {
          apiAgreementData = await apiClient.getAgreementById(testAgreementId);
          console.log(JSON.stringify(apiAgreementData, null, 2));
          console.info(`📊 Pre-fetched API data for agreement: ${testAgreementId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(`📊 Agreement Details test setup: hasAgreements=${hasAgreementsData}, apiAvailable=${apiAvailable}, testAgreementId=${testAgreementId}`);

    // Navigate to agreement details page once at the start
    if (hasAgreementsData && testAgreementId) {
      await agreementsPage.tapAgreement(testAgreementId);
      await agreementDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    await agreementDetailsPage.scrollToTop(1);
  });

  describe('Page Structure', () => {
    it('should display the Agreement header title', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }
      await expect(agreementDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Agreement ID', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }
      await expect(agreementDetailsPage.agreementIdText).toBeDisplayed();
      const agreementId = await agreementDetailsPage.getItemId();
      expect(agreementId).toMatch(/^AGR-(\d{4}-)+\d{4}$/);
    });

    it('should display the status field', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }
      const status = await agreementDetailsPage.statusText;
      expect(status).toBeTruthy();
    });

    it('should display the Vendor field', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }
      const vendor = await agreementDetailsPage.getCompositeFieldValueByLabel('Vendor', true);
      expect(vendor).toBeTruthy();
    });

    it('should display the Product field', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }
      const product = await agreementDetailsPage.getCompositeFieldValueByLabel('Product', true);
      expect(product).toBeTruthy();
    });

    it('should display the Client field', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }
      const client = await agreementDetailsPage.getCompositeFieldValueByLabel('Client', true);
      expect(client).toBeTruthy();
    });

    it('should display the Base Currency field', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }
      const baseCurrency = await agreementDetailsPage.getSimpleFieldValue('Base currency', true);
      expect(baseCurrency).toBeTruthy();
    });

    it('should display the Billing Currency field', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }
      const billingCurrency = await agreementDetailsPage.getSimpleFieldValue('Billing currency', true);
      expect(billingCurrency).toBeTruthy();
    });
  });

  describe('API Data Validation', () => {
    it('should match Agreement ID with API response', async function () {
      if (!hasAgreementsData || !apiAvailable || !apiAgreementData) {
        this.skip();
        return;
      }
      const uiAgreementId = await agreementDetailsPage.getItemId();
      const apiAgreementId = apiAgreementData.id;
      console.info(`[Agreement ID] UI: ${uiAgreementId} | API: ${apiAgreementId}`);
      expect(uiAgreementId).toBe(apiAgreementId);
    });

    it('should match status with API response', async function () {
      if (!hasAgreementsData || !apiAvailable || !apiAgreementData) {
        this.skip();
        return;
      }
      const uiStatus = await agreementDetailsPage.getStatus();
      const apiStatus = apiAgreementData.status;
      console.info(`[Status] UI: ${uiStatus} | API: ${apiStatus}`);
      expect(uiStatus).toBe(apiStatus);
    });

    it('should match vendor with API response', async function () {
      if (!hasAgreementsData || !apiAvailable || !apiAgreementData) {
        this.skip();
        return;
      }
      const uiVendor = await agreementDetailsPage.getCompositeFieldValueByLabel('Vendor', true);
      const apiVendor = apiAgreementData.vendor?.name;
      console.info(`[Vendor] UI: ${uiVendor} | API: ${apiVendor}`);
      expect(uiVendor).toBe(apiVendor);
    });

    it('should match product with API response', async function () {
      if (!hasAgreementsData || !apiAvailable || !apiAgreementData) {
        this.skip();
        return;
      }
      const uiProduct = await agreementDetailsPage.getCompositeFieldValueByLabel('Product', true);
      const apiProduct = apiAgreementData.product?.name;
      console.info(`[Product] UI: ${uiProduct} | API: ${apiProduct}`);
      expect(uiProduct).toBe(apiProduct);
    });

    it('should match client with API response', async function () {
      if (!hasAgreementsData || !apiAvailable || !apiAgreementData) {
        this.skip();
        return;
      }
      const uiClient = await agreementDetailsPage.getCompositeFieldValueByLabel('Client', true);
      const apiClientName = apiAgreementData.client?.name;
      console.info(`[Client] UI: ${uiClient} | API: ${apiClientName}`);
      expect(uiClient).toBe(apiClientName);
    });

    it('should match base currency with API response', async function () {
      if (!hasAgreementsData || !apiAvailable || !apiAgreementData) {
        this.skip();
        return;
      }
      const uiBaseCurrency = await agreementDetailsPage.getSimpleFieldValue('Base currency', true);
      const apiBaseCurrency = apiAgreementData.price?.currency;
      console.info(`[Base Currency] UI: ${uiBaseCurrency} | API: ${apiBaseCurrency}`);
      expect(uiBaseCurrency).toBe(apiBaseCurrency);
    });

    it('should match billing currency with API response', async function () {
      if (!hasAgreementsData || !apiAvailable || !apiAgreementData) {
        this.skip();
        return;
      }
      const uiBillingCurrency = await agreementDetailsPage.getSimpleFieldValue('Billing currency', true);
      const apiBillingCurrency = apiAgreementData.price?.billingCurrency;
      console.info(`[Billing Currency] UI: ${uiBillingCurrency} | API: ${apiBillingCurrency}`);
      expect(uiBillingCurrency).toBe(apiBillingCurrency);
    });

    it('should log all agreement details for comparison', async function () {
      if (!hasAgreementsData || !apiAvailable || !apiAgreementData) {
        this.skip();
        return;
      }
      const uiDetails = await agreementDetailsPage.getAllAgreementDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Agreement Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Agreement ID: UI="${uiDetails.agreementId}" | API="${apiAgreementData.id}"`);
      console.info(`Status:       UI="${uiDetails.status}" | API="${apiAgreementData.status}"`);
      console.info(`Vendor:       UI="${uiDetails.vendor}" | API="${apiAgreementData.vendor?.name}"`);
      console.info(`Product:      UI="${uiDetails.product}" | API="${apiAgreementData.product?.name}"`);
      console.info(`Client:       UI="${uiDetails.client}" | API="${apiAgreementData.client?.name}"`);
      console.info(`BaseCurrency: UI="${uiDetails.baseCurrency}" | API="${apiAgreementData.price?.currency}"`);
      console.info(`BillingCurr:  UI="${uiDetails.billingCurrency}" | API="${apiAgreementData.price?.billingCurrency}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.agreementId).toBe(apiAgreementData.id);
    });
  });
});
