const { expect } = require('@wdio/globals');

const buyersPage = require('../pageobjects/buyers.page');
const buyerDetailsPage = require('../pageobjects/buyer-details.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

// E2E tests for Buyer Details Page, modeled after user-details/agreement-details e2e.js

describe('Buyer Details Page', () => {
  let hasBuyersData = false;
  let apiAvailable = false;
  let testBuyerId = null;
  let apiBuyerData = null;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Buyers page via More menu
    await buyersPage.footer.moreTab.click();
    await browser.pause(500);
    await morePage.buyersMenuItem.click();
    await buyersPage.waitForScreenReady();

    hasBuyersData = await buyersPage.hasBuyers();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasBuyersData) {
      const buyerIds = await buyersPage.getVisibleBuyerIds();
      testBuyerId = buyerIds[0];

      // Pre-fetch API data for validation tests
      if (apiAvailable && testBuyerId) {
        try {
          apiBuyerData = await apiClient.getBuyerById(testBuyerId);
          console.info(`📊 Pre-fetched API data for buyer: ${testBuyerId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(`📊 Buyer Details test setup: hasBuyers=${hasBuyersData}, apiAvailable=${apiAvailable}, testBuyerId=${testBuyerId}`);

    // Navigate to buyer details page once at the start
    if (hasBuyersData && testBuyerId) {
      await buyersPage.tapBuyer(testBuyerId);
      await buyerDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Buyer header title', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }
      await expect(buyerDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Buyer name', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }
      const name = await buyerDetailsPage.getSimpleFieldValue('Websparks Pte Ltd', true);
      expect(name).toBeTruthy();
    });

    it('should display the Buyer ID', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }
      await expect(buyerDetailsPage.buyerIdText).toBeDisplayed();
      const buyerId = await buyerDetailsPage.getItemId();
      expect(buyerId).toMatch(/^BUY-(\d{4}-?)+\d{4}$/);
    });

    it('should display the status field', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }
      const status = await buyerDetailsPage.statusText;
      expect(status).toBeTruthy();
    });

    it('should display the SCU identifier', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }
      const scu = await buyerDetailsPage.getSimpleFieldValue('SCU identifier', true);
      expect(scu).toBeTruthy();
    });

    it('should display the Tax number', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }
      const tax = await buyerDetailsPage.getSimpleFieldValue('Tax number', true);
      expect(tax).toBeDefined();
    });

    it('should display the Address fields', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }
      const address1 = await buyerDetailsPage.getSimpleFieldValue('Address line 1', true);
      expect(address1).toBeTruthy();
      const address2 = await buyerDetailsPage.getSimpleFieldValue('Address line 2', true);
      expect(address2).toBeDefined();
      const city = await buyerDetailsPage.getSimpleFieldValue('City', true);
      expect(city).toBeTruthy();
      const state = await buyerDetailsPage.getSimpleFieldValue('State', true);
      expect(state).toBeTruthy();
      const zip = await buyerDetailsPage.getSimpleFieldValue('ZIP/Postal code', true);
      expect(zip).toBeDefined();
      const country = await buyerDetailsPage.getSimpleFieldValue('Country', true);
      expect(country).toBeDefined();
    });
  });

  describe('API Data Validation', () => {
    it('should match Buyer ID with API response', async function () {
      if (!hasBuyersData || !apiAvailable || !apiBuyerData) {
        this.skip();
        return;
      }
      const uiBuyerId = await buyerDetailsPage.getItemId();
      const apiBuyerId = apiBuyerData.id;
      expect(uiBuyerId).toBe(apiBuyerId);
    });

    it('should match status with API response', async function () {
      if (!hasBuyersData || !apiAvailable || !apiBuyerData) {
        this.skip();
        return;
      }
      const uiStatus = await buyerDetailsPage.getStatus();
      const apiStatus = apiBuyerData.status;
      expect(uiStatus).toBe(apiStatus);
    });

    it('should match name with API response', async function () {
      if (!hasBuyersData || !apiAvailable || !apiBuyerData) {
        this.skip();
        return;
      }
      // TODO: label needs to be dynamic!!!
      const uiName = await buyerDetailsPage.getSimpleFieldValue('Websparks Pte Ltd', true);
      // API name may have extra spaces, trim for comparison
      const apiName = (apiBuyerData.name || '').trim();
      expect(uiName).toBe(apiName);
    });

    it('should match SCU identifier with API response', async function () {
      if (!hasBuyersData || !apiAvailable || !apiBuyerData) {
        this.skip();
        return;
      }
      const uiScu = await buyerDetailsPage.getSimpleFieldValue('SCU identifier', true);
      const apiScu = apiBuyerData.externalIds?.erpCustomer;
      expect(uiScu).toBe(apiScu);
    });

    it('should match address fields with API response', async function () {
      if (!hasBuyersData || !apiAvailable || !apiBuyerData) {
        this.skip();
        return;
      }
      const address = apiBuyerData.address || {};
      const uiAddress1 = await buyerDetailsPage.getSimpleFieldValue('Address line 1', true);
      expect(uiAddress1).toBe(address.addressLine1 || '-');
      const uiCity = await buyerDetailsPage.getSimpleFieldValue('City', true);
      expect(uiCity).toBe(address.city || '-');
      const uiState = await buyerDetailsPage.getSimpleFieldValue('State', true);
      expect(uiState).toBe(address.state || '-');
      const uiZip = await buyerDetailsPage.getSimpleFieldValue('ZIP/Postal code', true);
      expect(uiZip).toBe(address.postCode || '-');
      // Country is shown as name, not code
      const uiCountry = await buyerDetailsPage.getSimpleFieldValue('Country', true);
      // For SG, expect 'Singapore'
      if (address.country === 'SG') {
        expect(uiCountry).toMatch(/Singapore/i);
      }
    });

    it('should log all buyer details for comparison', async function () {
      if (!hasBuyersData || !apiAvailable || !apiBuyerData) {
        this.skip();
        return;
      }
      const uiDetails = await buyerDetailsPage.getAllBuyerDetails();
      const address = apiBuyerData.address || {};
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Buyer Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Buyer ID:   UI="${uiDetails.buyerId}" | API="${apiBuyerData.id}"`);
      console.info(`Status:     UI="${uiDetails.status}" | API="${apiBuyerData.status}"`);
      console.info(`Name:       UI="${uiDetails.name}" | API="${(apiBuyerData.name || '').trim()}"`);
      console.info(`SCU:        UI="${uiDetails.scuIdentifier}" | API="${apiBuyerData.externalIds?.erpCustomer}"`);
      console.info(`Address1:   UI="${uiDetails.addressLine1}" | API="${address.addressLine1 || '-'}"`);
      console.info(`City:       UI="${uiDetails.city}" | API="${address.city || '-'}"`);
      console.info(`State:      UI="${uiDetails.state}" | API="${address.state || '-'}"`);
      console.info(`ZIP:        UI="${uiDetails.zip}" | API="${address.postCode || '-'}"`);
      console.info(`Country:    UI="${uiDetails.country}" | API="${address.country || '-'}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.buyerId).toBe(apiBuyerData.id);
    });
  });
});
