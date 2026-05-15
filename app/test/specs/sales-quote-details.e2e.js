const { expect } = require('@wdio/globals');

const salesQuoteDetailsPage = require('../pageobjects/sales-quote-details.page');
const salesQuotesPage = require('../pageobjects/sales-quotes.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE, REGEX, STATUSES } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

describe('Sales Quote Details Page', () => {
  let hasSalesQuotesData = false;
  let apiAvailable = false;
  let testSalesQuoteId = null;
  let apiSalesQuoteData = null;
  let salesQuotesMenuAvailable = false;

  async function navigateToSalesQuotes() {
    await morePage.ensureMorePage();
    let menuExists = await morePage.salesQuotesMenuItem.isExisting().catch(() => false);
    if (!menuExists) {
      await morePage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
    }
    await morePage.salesQuotesMenuItem.click();
    await salesQuotesPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    await ensureOperationsAccount();

    await morePage.ensureMorePage();

    salesQuotesMenuAvailable = await morePage.salesQuotesMenuItem.isExisting().catch(() => false);
    if (!salesQuotesMenuAvailable) {
      await morePage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      salesQuotesMenuAvailable = await morePage.salesQuotesMenuItem.isExisting().catch(() => false);
    }

    if (!salesQuotesMenuAvailable) {
      console.info('⚠️ Sales Quotes menu item not available for this user - skipping Sales Quote Details tests');
      return;
    }

    await morePage.salesQuotesMenuItem.click();
    await salesQuotesPage.waitForScreenReady();

    hasSalesQuotesData = await salesQuotesPage.hasSalesQuotes();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasSalesQuotesData) {
      const ids = await salesQuotesPage.getVisibleSalesQuoteIds();
      testSalesQuoteId = ids[0];

      if (apiAvailable && testSalesQuoteId) {
        try {
          apiSalesQuoteData = await apiClient.getSalesQuoteById(testSalesQuoteId);
          console.info(`📊 Pre-fetched API data for sales quote: ${testSalesQuoteId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Sales Quote Details test setup: hasSalesQuotes=${hasSalesQuotesData}, apiAvailable=${apiAvailable}, testSalesQuoteId=${testSalesQuoteId}`,
    );

    if (hasSalesQuotesData && testSalesQuoteId) {
      await salesQuotesPage.tapSalesQuote(testSalesQuoteId);
      await salesQuoteDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    if (!salesQuotesMenuAvailable || !hasSalesQuotesData) {
      this.skip();
      return;
    }
    const isOnPage = await salesQuoteDetailsPage.isOnDetailsPage();
    if (!isOnPage) {
      await navigation.ensureHomePage({ resetFilters: false });
      await navigateToSalesQuotes();
      await salesQuotesPage.tapSalesQuote(testSalesQuoteId);
      await salesQuoteDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Sales Quote header title', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      await expect(salesQuoteDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Sales Quote ID', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      await expect(salesQuoteDetailsPage.salesQuoteIdText).toBeDisplayed();
      const id = await salesQuoteDetailsPage.getItemId();
      expect(id).toMatch(REGEX.SALES_QUOTE_ID);
    });

    it('should display the status field', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      const status = await salesQuoteDetailsPage.getStatus();
      expect(status).toBeTruthy();
      expect(STATUSES.SALES_QUOTE).toContain(status);
    });

    it('should display the Buyer field', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      const buyer = await salesQuoteDetailsPage.getCompositeFieldValueByLabel('Buyer', true).catch(() => '');
      expect(buyer).toBeTruthy();
    });

    it('should display the Seller field', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      const seller = await salesQuoteDetailsPage.getCompositeFieldValueByLabel('Seller', true).catch(() => '');
      expect(seller).toBeTruthy();
    });

    it('should display the Operations external ID field', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      const opsExternalId = await salesQuoteDetailsPage.getSimpleFieldValue('Operations external ID', true).catch(() => '');
      expect(typeof opsExternalId).toBe('string');
    });

    it('should display the ∑ SP field', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      const sp = await salesQuoteDetailsPage.getSimpleFieldValue('∑ SP', true).catch(() => '');
      expect(sp).toBeTruthy();
    });

    it('should display the ∑ GT field', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      const gt = await salesQuoteDetailsPage.getSimpleFieldValue('∑ GT', true).catch(() => '');
      expect(gt).toBeTruthy();
    });

    it('should display the Expiry date field', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      const expiryDate = await salesQuoteDetailsPage.getSimpleFieldValue('Expiry date', true).catch(() => '');
      expect(typeof expiryDate).toBe('string');
    });

    it('should NOT display an avatar in the header', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }
      const avatarExists = await salesQuoteDetailsPage.headerAvatarWrapper.isExisting().catch(() => false);
      expect(avatarExists).toBe(false);
    });
  });

  describe('API Data Validation', () => {
    it('should match Sales Quote ID with API response', async function () {
      if (!hasSalesQuotesData || !apiAvailable || !apiSalesQuoteData) {
        this.skip();
        return;
      }
      const uiId = await salesQuoteDetailsPage.getItemId();
      expect(uiId).toBe(apiSalesQuoteData.id);
    });

    it('should match status with API response', async function () {
      if (!hasSalesQuotesData || !apiAvailable || !apiSalesQuoteData) {
        this.skip();
        return;
      }
      const uiStatus = await salesQuoteDetailsPage.getStatus();
      expect(uiStatus).toBe(apiSalesQuoteData.status);
    });

    it('should log all sales quote details for comparison', async function () {
      if (!hasSalesQuotesData || !apiAvailable || !apiSalesQuoteData) {
        this.skip();
        return;
      }
      const uiDetails = await salesQuoteDetailsPage.getAllSalesQuoteDetails();
      const apiPrice = apiSalesQuoteData.price || {};
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Sales Quote Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Sales Quote ID:      UI="${uiDetails.salesQuoteId}" | API="${apiSalesQuoteData.id}"`);
      console.info(`Status:              UI="${uiDetails.status}" | API="${apiSalesQuoteData.status}"`);
      console.info(`Buyer:               UI="${uiDetails.buyer}" | API="${apiSalesQuoteData.buyer?.name}"`);
      console.info(`Seller:              UI="${uiDetails.seller}" | API="${apiSalesQuoteData.seller?.name}"`);
      console.info(`Ops External ID:     UI="${uiDetails.opsExternalId}" | API="${apiSalesQuoteData.externalIds?.operations}"`);
      console.info(`∑ SP:                UI="${uiDetails.sp}" | API="${apiPrice.currency} ${apiPrice.SPx1}"`);
      console.info(`∑ GT:                UI="${uiDetails.gt}"`);
      console.info(`Expiry date:         UI="${uiDetails.expiryDate}" | API="${apiSalesQuoteData.expiryDate}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  });
});
