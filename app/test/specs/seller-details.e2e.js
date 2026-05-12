const { expect } = require('@wdio/globals');

const sellerDetailsPage = require('../pageobjects/seller-details.page');
const sellersPage = require('../pageobjects/sellers.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');

describe('Seller Details Page', () => {
  let api;
  let hasSellersData = false;
  let apiAvailable = false;
  let testSellerId = null;
  let apiSellerData = null;
  let sellersMenuAvailable = false;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    await sellersPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);

    sellersMenuAvailable = await morePage.sellersMenuItem.isExisting().catch(() => false);
    if (!sellersMenuAvailable) {
      console.info('⚠️ Sellers menu item not available for this user - skipping Seller Details tests');
      return;
    }

    await morePage.sellersMenuItem.click();
    await sellersPage.waitForScreenReady();

    hasSellersData = await sellersPage.hasSellers();
    apiAvailable = !!api;

    if (hasSellersData) {
      const sellerIds = await sellersPage.getVisibleSellerIds();
      testSellerId = sellerIds[0];

      if (apiAvailable && testSellerId) {
        try {
          apiSellerData = await api.getSellerById(testSellerId);
          console.info(`📊 Pre-fetched API data for seller: ${testSellerId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Seller Details test setup: hasSellers=${hasSellersData}, apiAvailable=${apiAvailable}, testSellerId=${testSellerId}`,
    );

    if (hasSellersData && testSellerId) {
      await sellersPage.tapSeller(testSellerId);
      await sellerDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    if (!sellersMenuAvailable || !hasSellersData) {
      this.skip();
      return;
    }
    const isOnPage = await sellerDetailsPage.isOnDetailsPage();
    if (!isOnPage) {
      await navigation.ensureHomePage({ resetFilters: false });
      await sellersPage.footer.moreTab.click();
      await browser.pause(PAUSE.NAVIGATION);
      await morePage.sellersMenuItem.click();
      await sellersPage.waitForScreenReady();
      await sellersPage.tapSeller(testSellerId);
      await sellerDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Sellers header title', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }
      await expect(sellerDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Seller ID', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }
      await expect(sellerDetailsPage.sellerIdText).toBeDisplayed();
      const sellerId = await sellerDetailsPage.getItemId();
      expect(sellerId).toMatch(REGEX.SELLER_ID);
    });

    it('should display the status field', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }
      const status = await sellerDetailsPage.getStatus();
      expect(status).toBeTruthy();
    });

    it('should display at least one address field', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }
      const addressLine1 = await sellerDetailsPage.getSimpleFieldValue('Address line 1', true).catch(() => '');
      const city = await sellerDetailsPage.getSimpleFieldValue('City', true).catch(() => '');
      const country = await sellerDetailsPage.getSimpleFieldValue('Country', true).catch(() => '');
      const hasAddressData = addressLine1 || city || country;
      expect(hasAddressData).toBeTruthy();
    });

    it('should display an avatar in the header', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }
      await expect(sellerDetailsPage.headerAvatarWrapper).toBeDisplayed();
    });
  });

  describe('API Data Validation', () => {
    it('should match Seller ID with API response', async function () {
      if (!hasSellersData || !apiAvailable || !apiSellerData) {
        this.skip();
        return;
      }
      const uiSellerId = await sellerDetailsPage.getItemId();
      expect(uiSellerId).toBe(apiSellerData.id);
    });

    it('should match status with API response', async function () {
      if (!hasSellersData || !apiAvailable || !apiSellerData) {
        this.skip();
        return;
      }
      const uiStatus = await sellerDetailsPage.getStatus();
      expect(uiStatus).toBe(apiSellerData.status);
    });

    it('should log all seller details for comparison', async function () {
      if (!hasSellersData || !apiAvailable || !apiSellerData) {
        this.skip();
        return;
      }
      const uiDetails = await sellerDetailsPage.getAllSellerDetails();
      const apiAddress = apiSellerData.address || {};
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Seller Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Seller ID:      UI="${uiDetails.sellerId}" | API="${apiSellerData.id}"`);
      console.info(`Status:         UI="${uiDetails.status}" | API="${apiSellerData.status}"`);
      console.info(`Address line 1: UI="${uiDetails.addressLine1}" | API="${apiAddress.addressLine1}"`);
      console.info(`Address line 2: UI="${uiDetails.addressLine2}" | API="${apiAddress.addressLine2}"`);
      console.info(`City:           UI="${uiDetails.city}" | API="${apiAddress.city}"`);
      console.info(`State:          UI="${uiDetails.state}" | API="${apiAddress.state}"`);
      console.info(`ZIP:            UI="${uiDetails.zip}" | API="${apiAddress.postCode}"`);
      console.info(`Country:        UI="${uiDetails.country}" | API="${apiAddress.country}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  });
});
