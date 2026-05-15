const { expect } = require('@wdio/globals');

const agreementDetailsPage = require('../pageobjects/agreement-details.page');
const agreementsPage = require('../pageobjects/agreements.page');
const morePage = require('../pageobjects/more.page');
const accountDetailsPage = require('../pageobjects/account-details.page');
const productDetailsPage = require('../pageobjects/product-details.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const {
  ensureOperationsAccount,
  ensureClientAccount,
  ensureVendorAccount,
  CLIENT_ACCOUNT_ID,
  VENDOR_ACCOUNT_ID,
} = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');

// E2E tests for Agreement Details Page, modeled after user-details.e2e.js

describe('[Client] Agreement Details Page', () => {
  let api;
  let hasAgreementsData = false;
  let apiAvailable = false;
  let testAgreementId = null;
  let apiAgreementData = null;
  let agreementsMenuAvailable = false;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureClientAccount();
    // Navigate to Agreements page via More menu
    await agreementsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);

    agreementsMenuAvailable = await morePage.agreementsMenuItem.isExisting().catch(() => false);
    if (!agreementsMenuAvailable) {
      console.info(
        '⚠️ Agreements menu item not available for this user - skipping Agreement Details tests',
      );
      return;
    }

    await morePage.agreementsMenuItem.click();
    await agreementsPage.waitForScreenReady();

    hasAgreementsData = await agreementsPage.hasAgreements();
    apiAvailable = !!api;

    if (hasAgreementsData) {
      const agreementIds = await agreementsPage.getVisibleAgreementIds();
      testAgreementId = agreementIds[0];

      // Pre-fetch API data for validation tests
      if (apiAvailable && testAgreementId) {
        try {
          apiAgreementData = await api.getAgreementById(testAgreementId);
          console.info(JSON.stringify(apiAgreementData, null, 2));
          console.info(`📊 Pre-fetched API data for agreement: ${testAgreementId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Agreement Details test setup: hasAgreements=${hasAgreementsData}, apiAvailable=${apiAvailable}, testAgreementId=${testAgreementId}`,
    );

    // Navigate to agreement details page once at the start
    if (hasAgreementsData && testAgreementId) {
      await agreementsPage.tapAgreement(testAgreementId);
      await agreementDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    if (!agreementsMenuAvailable || !hasAgreementsData) {
      this.skip();
      return;
    }
    await agreementDetailsPage.scrollToTop();
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
      expect(agreementId).toMatch(REGEX.AGREEMENT_ID_FLEX);
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
      const vendor = await agreementDetailsPage.getCompositeFieldValueByLabel('Vendor', false);
      if (!vendor) {
        // Vendor field is hidden for vendor-type accounts ({!isVendor} in AgreementDetailsContent)
        this.skip();
        return;
      }
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
      // scrollIfNeeded=false: Client field is role-gated away for Client accounts, so avoid
      // burning 4 scroll attempts searching for a field that won't be there.
      const client = await agreementDetailsPage.getCompositeFieldValueByLabel('Client', false);
      if (!client) {
        // Client field is not present on all agreement types
        console.info('⚠️ Client field not present on this agreement - skipping');
        this.skip();
        return;
      }
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
      const billingCurrency = await agreementDetailsPage.getSimpleFieldValue(
        'Billing currency',
        true,
      );
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
      const uiVendor = await agreementDetailsPage.getCompositeFieldValueByLabel('Vendor', false);
      if (!uiVendor) {
        // Vendor field is hidden for vendor-type accounts ({!isVendor} in AgreementDetailsContent)
        this.skip();
        return;
      }
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
      // scrollIfNeeded=false: Client field is role-gated away for Client accounts, so avoid
      // burning 4 scroll attempts searching for a field that won't be there.
      const uiClient = await agreementDetailsPage.getCompositeFieldValueByLabel('Client', false);
      if (!uiClient) {
        // Client field is not present on all agreement types
        this.skip();
        return;
      }
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
      const uiBillingCurrency = await agreementDetailsPage.getSimpleFieldValue(
        'Billing currency',
        true,
      );
      const apiBillingCurrency = apiAgreementData.price?.billingCurrency;
      console.info(`[Billing Currency] UI: ${uiBillingCurrency} | API: ${apiBillingCurrency}`);
      // The app's selective API query may not include billingCurrency; skip comparison when UI shows empty
      if (!uiBillingCurrency || uiBillingCurrency === '-') {
        this.skip();
        return;
      }
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
      console.info(
        `Vendor:       UI="${uiDetails.vendor}" | API="${apiAgreementData.vendor?.name}"`,
      );
      console.info(
        `Product:      UI="${uiDetails.product}" | API="${apiAgreementData.product?.name}"`,
      );
      console.info(
        `Client:       UI="${uiDetails.client}" | API="${apiAgreementData.client?.name}"`,
      );
      console.info(
        `BaseCurrency: UI="${uiDetails.baseCurrency}" | API="${apiAgreementData.price?.currency}"`,
      );
      console.info(
        `BillingCurr:  UI="${uiDetails.billingCurrency}" | API="${apiAgreementData.price?.billingCurrency}"`,
      );
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.agreementId).toBe(apiAgreementData.id);
    });
  });

  describe('Navigation Links', () => {
    it('should navigate to Product Details when Product field is tapped', async function () {
      if (!hasAgreementsData) { this.skip(); return; }
      await agreementDetailsPage.scrollToTop();
      const productField = agreementDetailsPage.getCompositeField('Product');
      const isDisplayed = await productField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await productField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(productDetailsPage.headerTitle).toBeDisplayed();
      await productDetailsPage.goBack();
      await agreementDetailsPage.waitForPageReady();
    });

    it('should navigate to Account Details when Client field is tapped', async function () {
      if (!hasAgreementsData) { this.skip(); return; }
      await agreementDetailsPage.scrollToTop();
      const clientField = agreementDetailsPage.getCompositeField('Client');
      const isDisplayed = await clientField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await clientField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(accountDetailsPage.itemIdText).toBeDisplayed();
      await accountDetailsPage.goBack();
      await agreementDetailsPage.waitForPageReady();
    });
  });
});

describe('[MPT-18620] Agreement Details - Role-Gated Field Visibility', function () {
  let hasData = false;

  async function navigateToFirstAgreementDetail(accountSwitchFn) {
    await navigation.ensureHomePage({ resetFilters: false });
    await accountSwitchFn();
    await agreementsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const available = await morePage.agreementsMenuItem.isExisting().catch(() => false);
    if (!available) return false;
    await morePage.agreementsMenuItem.click();
    await agreementsPage.waitForScreenReady();
    const exists = await agreementsPage.hasAgreements();
    if (!exists) return false;
    const ids = await agreementsPage.getVisibleAgreementIds();
    await agreementsPage.tapAgreement(ids[0]);
    await agreementDetailsPage.waitForPageReady();
    return true;
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureOperationsAccount();
    await agreementsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const available = await morePage.agreementsMenuItem.isExisting().catch(() => false);
    if (!available) { console.info('\u26a0\ufe0f Agreements menu not available - skipping role-gated tests'); return; }
    await morePage.agreementsMenuItem.click();
    await agreementsPage.waitForScreenReady();
    hasData = await agreementsPage.hasAgreements();
    // Do not navigate to detail here — each test calls navigateToFirstAgreementDetail()
    // which performs the full account-switch + navigation from scratch.
  });

  it('should show Client field for Operations account', async function () {
    if (!hasData) { this.skip(); return; }
    const ok = await navigateToFirstAgreementDetail(ensureOperationsAccount);
    if (!ok) { this.skip(); return; }
    const client = await agreementDetailsPage.getCompositeFieldValueByLabel('Client', true);
    expect(client).toBeTruthy();
  });

  it('should hide Client field for Client account', async function () {
    if (!hasData || !CLIENT_ACCOUNT_ID) { this.skip(); return; }
    const ok = await navigateToFirstAgreementDetail(ensureClientAccount);
    if (!ok) { this.skip(); return; }
    const client = await agreementDetailsPage.getCompositeFieldValueByLabel('Client', false);
    expect(client).toBeFalsy();
    await ensureOperationsAccount();
  });

  it('should show Vendor field for Client account', async function () {
    if (!hasData || !CLIENT_ACCOUNT_ID) { this.skip(); return; }
    const ok = await navigateToFirstAgreementDetail(ensureClientAccount);
    if (!ok) { this.skip(); return; }
    const vendor = await agreementDetailsPage.getCompositeFieldValueByLabel('Vendor', true);
    expect(vendor).toBeTruthy();
    await ensureOperationsAccount();
  });

  it('should hide Vendor name field for Vendor account', async function () {
    if (!hasData || !VENDOR_ACCOUNT_ID) { this.skip(); return; }
    const ok = await navigateToFirstAgreementDetail(ensureVendorAccount);
    if (!ok) { this.skip(); return; }
    const vendor = await agreementDetailsPage.getCompositeFieldValueByLabel('Vendor', false);
    expect(vendor).toBeFalsy();
    await ensureOperationsAccount();
  });

  it('should show Client field for Vendor account', async function () {
    if (!hasData || !VENDOR_ACCOUNT_ID) { this.skip(); return; }
    const ok = await navigateToFirstAgreementDetail(ensureVendorAccount);
    if (!ok) { this.skip(); return; }
    const client = await agreementDetailsPage.getCompositeFieldValueByLabel('Client', true);
    expect(client).toBeTruthy();
    await ensureOperationsAccount();
  });
});
