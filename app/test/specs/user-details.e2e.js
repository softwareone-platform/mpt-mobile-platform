const { expect } = require('@wdio/globals');

const morePage = require('../pageobjects/more.page');
const userDetailsPage = require('../pageobjects/user-details.page');
const usersPage = require('../pageobjects/users.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

describe('User Details Page', () => {
  let hasUsersData = false;
  let apiAvailable = false;
  let testUserId = null;
  let apiUserData = null;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Users page via More menu (same as users.e2e.js)
    await usersPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    await morePage.usersMenuItem.click();
    await usersPage.waitForScreenReady();

    hasUsersData = await usersPage.hasUsers();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasUsersData) {
      const userIds = await usersPage.getVisibleUserIds();
      testUserId = userIds[0];

      // Pre-fetch API data for validation tests
      if (apiAvailable && testUserId) {
        try {
          apiUserData = await apiClient.getUserInformation(testUserId);
          console.info(`📊 Pre-fetched API data for user: ${testUserId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 User Details test setup: hasUsers=${hasUsersData}, apiAvailable=${apiAvailable}, testUserId=${testUserId}`,
    );

    // Navigate to user details page once at the start
    if (hasUsersData && testUserId) {
      await usersPage.tapUser(testUserId);
      await userDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the User header title', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      await expect(userDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the User ID', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      await expect(userDetailsPage.userIdText).toBeDisplayed();
      const userId = await userDetailsPage.getItemId();
      expect(userId).toMatch(REGEX.USER_ID_FLEX);
    });

    it('should display the status field', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const status = await userDetailsPage.statusText;
      expect(status).toBeTruthy();
    });

    it('should display the Email field', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const email = await userDetailsPage.getSimpleFieldValue('Email', true);
      expect(email).toBeTruthy();
    });

    it('should display the Single Sign On field', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const sso = await userDetailsPage.getSimpleFieldValue('Single sign on', true);
      expect(sso).toBeTruthy();
    });

    it('should display the First Name field', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const firstName = await userDetailsPage.getSimpleFieldValue('First name', true);
      expect(firstName).toBeTruthy();
    });

    it('should display the Last Name field', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const lastName = await userDetailsPage.getSimpleFieldValue('Last name', true);
      expect(lastName).toBeTruthy();
    });

    it('should display the Phone Number field', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const phone = await userDetailsPage.getSimpleFieldValue('Phone number', true);
      expect(phone).toBeTruthy();
    });
  });

  describe('API Data Validation', () => {
    it('should match User ID with API response', async function () {
      if (!hasUsersData || !apiAvailable || !apiUserData) {
        this.skip();
        return;
      }
      const uiUserId = await userDetailsPage.getItemId();
      const apiUserId = apiUserData.id || apiUserData.userId;
      console.info(`[User ID] UI: ${uiUserId} | API: ${apiUserId}`);
      expect(uiUserId).toBe(apiUserId);
    });

    it('should match status with API response', async function () {
      if (!hasUsersData || !apiAvailable || !apiUserData) {
        this.skip();
        return;
      }
      const uiStatus = await userDetailsPage.getStatus();
      const apiStatus = apiUserData.status;
      console.info(`[Status] UI: ${uiStatus} | API: ${apiStatus}`);
      expect(uiStatus).toBe(apiStatus);
    });

    it('should match email with API response', async function () {
      if (!hasUsersData || !apiAvailable || !apiUserData) {
        this.skip();
        return;
      }
      const uiEmail = await userDetailsPage.getSimpleFieldValue('Email', true);
      const apiEmail = apiUserData.email;
      console.info(`[Email] UI: ${uiEmail} | API: ${apiEmail}`);
      expect(uiEmail).toBe(apiEmail);
    });

    it('should match first name with API response', async function () {
      if (!hasUsersData || !apiAvailable || !apiUserData) {
        this.skip();
        return;
      }
      const uiFirstName = await userDetailsPage.getSimpleFieldValue('First name', true);
      const apiFirstName = apiUserData.firstName;
      console.info(`[First Name] UI: ${uiFirstName} | API: ${apiFirstName}`);
      expect(uiFirstName).toBe(apiFirstName);
    });

    it('should match last name with API response', async function () {
      if (!hasUsersData || !apiAvailable || !apiUserData) {
        this.skip();
        return;
      }
      const uiLastName = await userDetailsPage.getSimpleFieldValue('Last name', true);
      const apiLastName = apiUserData.lastName;
      console.info(`[Last Name] UI: ${uiLastName} | API: ${apiLastName}`);
      expect(uiLastName).toBe(apiLastName);
    });

    it('should log all user details for comparison', async function () {
      if (!hasUsersData || !apiAvailable || !apiUserData) {
        this.skip();
        return;
      }
      const uiDetails = await userDetailsPage.getAllUserDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 User Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(
        `User ID:   UI="${uiDetails.userId}" | API="${apiUserData.id || apiUserData.userId}"`,
      );
      console.info(`Status:    UI="${uiDetails.status}" | API="${apiUserData.status}"`);
      console.info(`Email:     UI="${uiDetails.email}" | API="${apiUserData.email}"`);
      console.info(`FirstName: UI="${uiDetails.firstName}" | API="${apiUserData.firstName}"`);
      console.info(`LastName:  UI="${uiDetails.lastName}" | API="${apiUserData.lastName}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.userId).toBe(apiUserData.id || apiUserData.userId);
    });
  });
});
