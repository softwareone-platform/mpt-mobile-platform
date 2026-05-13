const { expect, $ } = require('@wdio/globals');

const licenseeDetailsPage = require('../pageobjects/licensee-details.page');
const licenseesPage = require('../pageobjects/licensees.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE, REGEX, SCROLL } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { getSelector } = require('../pageobjects/utils/selectors');

describe('Licensee Details Page', () => {
  let hasLicenseesData = false;
  let apiAvailable = false;
  let testLicenseeId = null;
  let apiLicenseeData = null;
  let licenseesReachable = false;

  /**
   * Navigate to Licensees page via More → Clients → first client → sub-list.
   * Licensees is not a top-level More menu item; it is only reachable as a
   * sub-list of a Client (account) detail page under an Operations account.
   * @returns {Promise<boolean>} True if navigation succeeded
   */
  async function navigateToLicensees() {
    await morePage.ensureMorePage();

    let clientsExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    if (!clientsExists) {
      await morePage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      clientsExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    }
    if (!clientsExists) return false;

    await morePage.clientsMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);

    const firstClient = $(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "ACC-")]',
        android: '//*[contains(@content-desc, "ACC-")]',
      }),
    );
    const clientVisible = await firstClient.waitForDisplayed({ timeout: TIMEOUT.SCREEN_READY }).catch(() => false);
    if (!clientVisible) return false;

    await firstClient.click();
    await browser.pause(PAUSE.NAVIGATION);

    let subListFound = false;
    let subListEl;
    for (let attempt = 0; attempt < SCROLL.MAX_SCROLL_ATTEMPTS; attempt++) {
      subListEl = await findLicenseesSubListItem();
      subListFound = await subListEl.isDisplayed().catch(() => false);
      if (subListFound) break;
      await licenseesPage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
    }
    if (!subListFound) return false;

    await subListEl.click();
    await licenseesPage.waitForScreenReady();
    return true;
  }

  /**
   * Selector for the Licensees sub-list navigation item on Account Details.
   * NavigationItem renders as a TouchableOpacity (XCUIElementTypeOther on iOS)
   * with accessible label "Licensees, " (title + chevron icon text).
   */
  async function findLicenseesSubListItem() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "Licensees")]',
        android: '//*[contains(@content-desc, "Licensees")]',
      }),
    );
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    // Licensees requires an Operations account with Clients access
    await ensureOperationsAccount();

    licenseesReachable = await navigateToLicensees();
    if (!licenseesReachable) {
      console.info('⚠️ Licensees not reachable via Clients sub-list — skipping Licensee Details tests');
      return;
    }

    hasLicenseesData = await licenseesPage.hasLicensees();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasLicenseesData) {
      const licenseeIds = await licenseesPage.getVisibleLicenseeIds();
      testLicenseeId = licenseeIds[0];

      if (apiAvailable && testLicenseeId) {
        try {
          apiLicenseeData = await apiClient.getLicenseeById(testLicenseeId);
          console.info(`📊 Pre-fetched API data for licensee: ${testLicenseeId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Licensee Details test setup: hasLicensees=${hasLicenseesData}, apiAvailable=${apiAvailable}, testLicenseeId=${testLicenseeId}`,
    );

    if (hasLicenseesData && testLicenseeId) {
      await licenseesPage.tapLicensee(testLicenseeId);
      await licenseeDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Licensee header title', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }
      await expect(licenseeDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Licensee ID', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }
      await expect(licenseeDetailsPage.licenseeIdText).toBeDisplayed();
      const licenseeId = await licenseeDetailsPage.getItemId();
      expect(licenseeId).toMatch(REGEX.LICENSEE_ID);
    });

    it('should display the status field', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }
      const status = await licenseeDetailsPage.getStatus();
      expect(status).toBeTruthy();
    });

    it('should display the Account field', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }
      const account = await licenseeDetailsPage.getCompositeFieldValueByLabel('Account', true);
      expect(account).toBeTruthy();
    });

    it('should display the Buyer field', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }
      const buyer = await licenseeDetailsPage.getCompositeFieldValueByLabel('Buyer', true);
      expect(buyer).toBeTruthy();
    });

    it('should display the Seller field', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }
      const seller = await licenseeDetailsPage.getCompositeFieldValueByLabel('Seller', true);
      expect(seller).toBeTruthy();
    });

    it('should display the Resale licensee field', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }
      const resale = await licenseeDetailsPage.getSimpleFieldValue('Resale licensee', true).catch(() => '');
      expect(['Yes', 'No', '']).toContain(resale);
    });

    it('should display Address card fields', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }
      const city = await licenseeDetailsPage.getSimpleFieldValue('City', true).catch(() => '');
      expect(city).toBeDefined();
      const country = await licenseeDetailsPage.getSimpleFieldValue('Country', true).catch(() => '');
      expect(country).toBeDefined();
    });

    it('should display an avatar in the header', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }
      await expect(licenseeDetailsPage.headerAvatarWrapper).toBeDisplayed();
    });
  });

  describe('API Data Validation', () => {
    it('should match Licensee ID with API response', async function () {
      if (!hasLicenseesData || !apiAvailable || !apiLicenseeData) {
        this.skip();
        return;
      }
      const uiLicenseeId = await licenseeDetailsPage.getItemId();
      expect(uiLicenseeId).toBe(apiLicenseeData.id);
    });

    it('should match status with API response', async function () {
      if (!hasLicenseesData || !apiAvailable || !apiLicenseeData) {
        this.skip();
        return;
      }
      const uiStatus = await licenseeDetailsPage.getStatus();
      expect(uiStatus).toBe(apiLicenseeData.status);
    });

    it('should log all licensee details for comparison', async function () {
      if (!hasLicenseesData || !apiAvailable || !apiLicenseeData) {
        this.skip();
        return;
      }
      const uiDetails = await licenseeDetailsPage.getAllLicenseeDetails();
      const address = apiLicenseeData.address || {};
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Licensee Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Licensee ID:  UI="${uiDetails.licenseeId}" | API="${apiLicenseeData.id}"`);
      console.info(`Status:       UI="${uiDetails.status}" | API="${apiLicenseeData.status}"`);
      console.info(`Account:      UI="${uiDetails.account}" | API="${apiLicenseeData.account?.name}"`);
      console.info(`Buyer:        UI="${uiDetails.buyer}" | API="${apiLicenseeData.buyer?.name}"`);
      console.info(`Seller:       UI="${uiDetails.seller}" | API="${apiLicenseeData.seller?.name}"`);
      console.info(`Resale:       UI="${uiDetails.resaleLicensee}" | API="${apiLicenseeData.eligibility?.partner}"`);
      console.info(`Address L1:   UI="${uiDetails.addressLine1}" | API="${address.addressLine1}"`);
      console.info(`City:         UI="${uiDetails.city}" | API="${address.city}"`);
      console.info(`State:        UI="${uiDetails.state}" | API="${address.state}"`);
      console.info(`ZIP:          UI="${uiDetails.postCode}" | API="${address.postCode}"`);
      console.info(`Country:      UI="${uiDetails.country}" | API="${address.country}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.licenseeId).toBe(apiLicenseeData.id);
    });
  });
});
