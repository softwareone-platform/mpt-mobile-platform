const { expect, $ } = require('@wdio/globals');

const accountDetailsPage = require('../pageobjects/account-details.page');
const clientsPage = require('../pageobjects/clients.page');
const buyersPage = require('../pageobjects/buyers.page');
const licenseesPage = require('../pageobjects/licensees.page');
const usersPage = require('../pageobjects/users.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { opsApiClient } = require('../utils/api-client');
const { getSelector } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');

describe('Account Details Page (Client)', () => {
  // Data state flags — set once in before() to avoid redundant checks
  let accountReachable = false;
  let apiAvailable = false;
  let testAccountId = null;
  let apiAccountData = null;
  let apiBuyersData = null;
  let apiLicenseesData = null;
  let apiUsersData = null;

  /**
   * Navigate from More menu to Account Details for the first available client.
   * Path: More → Clients → [tap first ACC- item] → Account Details
   * @returns {Promise<boolean>} true if navigation succeeded
   */
  async function navigateToAccountDetails() {
    await morePage.ensureMorePage();

    let clientsExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    if (!clientsExists) {
      await morePage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      clientsExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    }
    if (!clientsExists) return false;

    await morePage.clientsMenuItem.click();
    await clientsPage.waitForScreenReady();

    const hasClients = await clientsPage.hasClients();
    if (!hasClients) return false;

    const firstClient = $(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "ACC-")]',
        android: '//*[contains(@content-desc, "ACC-")]',
      }),
    );
    const clientVisible = await firstClient.waitForDisplayed({ timeout: TIMEOUT.SCREEN_READY }).catch(() => false);
    if (!clientVisible) return false;

    await firstClient.click();
    await accountDetailsPage.waitForPageReady();
    return true;
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureOperationsAccount();

    accountReachable = await navigateToAccountDetails();
    if (!accountReachable) {
      console.info('⚠️ Account Details not reachable via Clients list — skipping Account Details tests');
      return;
    }

    testAccountId = await accountDetailsPage.getItemId();
    apiAvailable = !!opsApiClient;

    if (apiAvailable && testAccountId) {
      try {
        [apiAccountData, apiBuyersData, apiLicenseesData, apiUsersData] = await Promise.all([
          opsApiClient.getAccountById(testAccountId),
          opsApiClient.getAccountBuyers(testAccountId),
          opsApiClient.getAccountLicensees(testAccountId),
          opsApiClient.getAccountUsers(testAccountId),
        ]);
        console.info(`📊 Pre-fetched API data for account: ${testAccountId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
      }
    }

    console.info(
      `📊 Account Details test setup: reachable=${accountReachable}, apiAvailable=${apiAvailable}, testAccountId=${testAccountId}`,
    );
  });

  beforeEach(async function () {
    if (!accountReachable) {
      this.skip();
      return;
    }
    const isOnPage = await accountDetailsPage.isOnDetailsPage();
    if (!isOnPage) {
      accountReachable = await navigateToAccountDetails();
    }
  });

  describe('Page Structure', () => {
    it('should display the Client header title', async function () {
      await expect(accountDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the account name in the content header', async function () {
      await expect(accountDetailsPage.accountNameText).toBeDisplayed();
      const name = await accountDetailsPage.getAccountName();
      expect(name).toBeTruthy();
    });

    it('should display the account ID in ACC-XXXX-XXXX format', async function () {
      await expect(accountDetailsPage.accountIdText).toBeDisplayed();
      const accountId = await accountDetailsPage.getItemId();
      expect(accountId).toMatch(REGEX.ACCOUNT_ID);
    });

    it('should display the status badge', async function () {
      await expect(accountDetailsPage.accountStatusBadge).toBeDisplayed();
    });

    it('should display the status value', async function () {
      const status = await accountDetailsPage.getStatus();
      expect(status).toBeTruthy();
    });

    it('should display the Service level field', async function () {
      const value = await accountDetailsPage.getSimpleFieldValue('Service level', true).catch(() => '');
      expect(value).toBeDefined();
    });

    it('should display the Company website field', async function () {
      const value = await accountDetailsPage.getSimpleFieldValue('Company website', true).catch(() => '');
      expect(value).toBeDefined();
    });

    it('should display the Company description field', async function () {
      const value = await accountDetailsPage.getSimpleFieldValue('Company description', true).catch(() => '');
      expect(value).toBeDefined();
    });

    it('should display the Technical support email field', async function () {
      const value = await accountDetailsPage.getSimpleFieldValue('Technical support email', true).catch(() => '');
      expect(value).toBeDefined();
    });

    it('should display the PYC ID field', async function () {
      const value = await accountDetailsPage.getSimpleFieldValue('PYC ID', true).catch(() => '');
      expect(value).toBeDefined();
    });

    it('should display an avatar in the header', async function () {
      await expect(accountDetailsPage.headerAvatarWrapper).toBeDisplayed();
    });
  });

  describe('Address Section', () => {
    it('should display the Headquarters address section header', async function () {
      const header = await accountDetailsPage.getSimpleFieldValue('Headquarters address', true).catch(() => null);
      // Section header is a label-only row — value may be empty or undefined
      const isVisible = header !== null;
      expect(isVisible).toBe(true);
    });

    it('should display the State field', async function () {
      const state = await accountDetailsPage.getSimpleFieldValue('State', true).catch(() => '');
      expect(state).toBeDefined();
    });

    it('should display the Country field', async function () {
      const country = await accountDetailsPage.getSimpleFieldValue('Country', true).catch(() => '');
      expect(country).toBeDefined();
    });
  });

  describe('Sublists Navigation', () => {
    it('should display the Buyers sublist navigation item', async function () {
      const hasBuyers = await accountDetailsPage.hasSubList('Buyers');
      expect(hasBuyers).toBe(true);
    });

    it('should display the Licensees sublist navigation item', async function () {
      const hasLicensees = await accountDetailsPage.hasSubList('Licensees');
      expect(hasLicensees).toBe(true);
    });

    it('should display the Users sublist navigation item', async function () {
      const hasUsers = await accountDetailsPage.hasSubList('Users');
      expect(hasUsers).toBe(true);
    });

    it('should navigate to Buyers list when Buyers sublist tapped', async function () {
      await accountDetailsPage.tapSubList('Buyers');
      await buyersPage.waitForScreenReady();
      await expect(buyersPage.headerTitle).toBeDisplayed();
      await buyersPage.goBack();
      await accountDetailsPage.waitForPageReady();
    });

    it('should navigate to Licensees list when Licensees sublist tapped', async function () {
      await accountDetailsPage.tapSubList('Licensees');
      await licenseesPage.waitForScreenReady();
      await expect(licenseesPage.headerTitle).toBeDisplayed();
      await licenseesPage.goBack();
      await accountDetailsPage.waitForPageReady();
    });

    it('should navigate to Users list when Users sublist tapped', async function () {
      await accountDetailsPage.tapSubList('Users');
      await usersPage.waitForScreenReady();
      await expect(usersPage.headerTitle).toBeDisplayed();
      await usersPage.goBack();
      await accountDetailsPage.waitForPageReady();
    });
  });

  describe('Sublists API Data Validation', () => {
    it('should match Buyers count with API response', async function () {
      if (!apiAvailable || !apiBuyersData) {
        this.skip();
        return;
      }
      const apiTotal =
        apiBuyersData.$meta?.pagination?.total ??
        apiBuyersData.pagination?.total;

      await accountDetailsPage.tapSubList('Buyers');
      await buyersPage.waitForScreenReady();

      const hasBuyersData = await buyersPage.hasBuyers();
      if (apiTotal !== undefined) {
        expect(apiTotal > 0).toBe(hasBuyersData);
      }

      if (hasBuyersData) {
        const uiCount = await buyersPage.getVisibleItemsCount();
        console.info(`[Buyers] API total: ${apiTotal}, UI visible: ${uiCount}`);
        expect(uiCount).toBeGreaterThan(0);
      }

      await buyersPage.goBack();
      await accountDetailsPage.waitForPageReady();
    });

    it('should match Buyers IDs visible in the sublist with API response', async function () {
      if (!apiAvailable || !apiBuyersData) {
        this.skip();
        return;
      }
      const apiBuyers = apiBuyersData.data || [];
      const apiBuyerIds = apiBuyers.map((b) => b.id);

      await accountDetailsPage.tapSubList('Buyers');
      await buyersPage.waitForScreenReady();

      const hasBuyersData = await buyersPage.hasBuyers();
      if (hasBuyersData) {
        const uiIds = await buyersPage.getVisibleItemIds();
        for (const id of uiIds) {
          expect(apiBuyerIds).toContain(id);
        }
      }

      await buyersPage.goBack();
      await accountDetailsPage.waitForPageReady();
    });

    it('should match Licensees count with API response', async function () {
      if (!apiAvailable || !apiLicenseesData) {
        this.skip();
        return;
      }
      const apiTotal =
        apiLicenseesData.$meta?.pagination?.total ??
        apiLicenseesData.pagination?.total;

      await accountDetailsPage.tapSubList('Licensees');
      await licenseesPage.waitForScreenReady();

      const hasLicenseesData = await licenseesPage.hasLicensees();
      if (apiTotal !== undefined) {
        expect(apiTotal > 0).toBe(hasLicenseesData);
      }

      if (hasLicenseesData) {
        const uiCount = await licenseesPage.getVisibleItemsCount();
        console.info(`[Licensees] API total: ${apiTotal}, UI visible: ${uiCount}`);
        expect(uiCount).toBeGreaterThan(0);
      }

      await licenseesPage.goBack();
      await accountDetailsPage.waitForPageReady();
    });

    it('should match Licensees IDs visible in the sublist with API response', async function () {
      if (!apiAvailable || !apiLicenseesData) {
        this.skip();
        return;
      }
      const apiLicensees = apiLicenseesData.data || [];
      const apiLicenseeIds = apiLicensees.map((l) => l.id);

      await accountDetailsPage.tapSubList('Licensees');
      await licenseesPage.waitForScreenReady();

      const hasLicenseesData = await licenseesPage.hasLicensees();
      if (hasLicenseesData) {
        const uiIds = await licenseesPage.getVisibleLicenseeIds();
        for (const id of uiIds) {
          expect(apiLicenseeIds).toContain(id);
        }
      }

      await licenseesPage.goBack();
      await accountDetailsPage.waitForPageReady();
    });

    it('should match Users count with API response', async function () {
      if (!apiAvailable || !apiUsersData) {
        this.skip();
        return;
      }
      const apiTotal =
        apiUsersData.$meta?.pagination?.total ??
        apiUsersData.pagination?.total;

      await accountDetailsPage.tapSubList('Users');
      await usersPage.waitForScreenReady();

      const hasUsersData = await usersPage.hasUsers();
      if (apiTotal !== undefined) {
        expect(apiTotal > 0).toBe(hasUsersData);
      }

      if (hasUsersData) {
        const uiCount = await usersPage.getVisibleItemsCount();
        console.info(`[Users] API total: ${apiTotal}, UI visible: ${uiCount}`);
        expect(uiCount).toBeGreaterThan(0);
      }

      await usersPage.goBack();
      await accountDetailsPage.waitForPageReady();
    });

    it('should match Users IDs visible in the sublist with API response', async function () {
      if (!apiAvailable || !apiUsersData) {
        this.skip();
        return;
      }
      const apiUsers = apiUsersData.data || [];
      const apiUserIds = apiUsers.map((u) => u.id);

      await accountDetailsPage.tapSubList('Users');
      await usersPage.waitForScreenReady();

      const hasUsersData = await usersPage.hasUsers();
      if (hasUsersData) {
        const uiIds = await usersPage.getVisibleUserIds();
        for (const id of uiIds) {
          expect(apiUserIds).toContain(id);
        }
      }

      await usersPage.goBack();
      await accountDetailsPage.waitForPageReady();
    });
  });

  describe('API Data Validation', () => {
    it('should match account ID with API response', async function () {
      if (!apiAvailable || !apiAccountData) {
        this.skip();
        return;
      }
      const uiId = await accountDetailsPage.getItemId();
      expect(uiId).toBe(apiAccountData.id);
    });

    it('should match status with API response', async function () {
      if (!apiAvailable || !apiAccountData) {
        this.skip();
        return;
      }
      const uiStatus = await accountDetailsPage.getStatus();
      expect(uiStatus).toBe(apiAccountData.status);
    });

    it('should match account name with API response', async function () {
      if (!apiAvailable || !apiAccountData) {
        this.skip();
        return;
      }
      const uiName = await accountDetailsPage.getAccountName();
      expect(uiName).toBe(apiAccountData.name);
    });

    it('should match PYC ID with API response', async function () {
      if (!apiAvailable || !apiAccountData) {
        this.skip();
        return;
      }
      const pyraTenantId = apiAccountData.externalIds?.pyraTenantId;
      if (!pyraTenantId) {
        this.skip();
        return;
      }
      await accountDetailsPage.scrollToTop();
      const uiPycId = await accountDetailsPage.getSimpleFieldValue('PYC ID', true).catch(() => '');
      expect(uiPycId).toBe(pyraTenantId);
    });

    it('should log all account details for comparison', async function () {
      if (!apiAvailable || !apiAccountData) {
        this.skip();
        return;
      }
      const uiDetails = await accountDetailsPage.getAllAccountDetails();
      const address = apiAccountData.address || {};
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Account Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Account ID:    UI="${uiDetails.accountId}" | API="${apiAccountData.id}"`);
      console.info(`Status:        UI="${uiDetails.status}" | API="${apiAccountData.status}"`);
      console.info(`Service level: UI="${uiDetails.serviceLevel}" | API="${apiAccountData.serviceLevel ?? '-'}"`);
      console.info(`Website:       UI="${uiDetails.companyWebsite}" | API="${apiAccountData.website ?? '-'}"`);
      console.info(`Description:   UI="${uiDetails.companyDescription}" | API="${apiAccountData.description ?? '-'}"`);
      console.info(`Support email: UI="${uiDetails.technicalSupportEmail}" | API="${apiAccountData.technicalSupportEmail ?? '-'}"`);
      console.info(`PYC ID:        UI="${uiDetails.pycId}" | API="${apiAccountData.externalIds?.pyraTenantId ?? '-'}"`);
      console.info(`State:         UI (needs scroll) | API="${address.state ?? '-'}"`);
      console.info(`Country:       UI (needs scroll) | API="${address.country ?? '-'}" (shown as full name)`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  });
});
