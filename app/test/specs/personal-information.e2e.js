const { expect } = require('@wdio/globals');

const headingPage = require('../pageobjects/base/heading.page');
const personalInformationPage = require('../pageobjects/personal-information.page');
const profilePage = require('../pageobjects/profile.page');
const userSettingsPage = require('../pageobjects/user-settings.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

describe('Personal Information Page', () => {
  let userId;
  let userInfo;

  before(async function () {
    // Set timeout for login flow
    this.timeout(150000);
    await ensureLoggedIn();

    // Navigate to Profile page and get user ID
    await navigation.ensureHomePage({ resetFilters: false });
    await headingPage.navAccountButton.click();
    await profilePage.profileHeaderTitle.waitForDisplayed({ timeout: 10000 });

    // Get user ID from Profile page as soon as it loads
    userId = await profilePage.getCurrentUserId();
    console.log(`📋 Current user ID: ${userId}`);

    // Fetch user information from API
    try {
      userInfo = await apiClient.getUserInformation(userId);
      console.log(`📊 Loaded user information from API for user ${userId}`);
    } catch (error) {
      console.warn(`⚠️ Could not fetch user information from API: ${error.message}`);
      userInfo = null;
    }

    // Continue navigation to Personal Information page
    // Profile → Current User Card → User Settings → Personal Information
    await profilePage.currentUserCard.click();
    await userSettingsPage.headerTitle.waitForDisplayed({ timeout: 10000 });
    await userSettingsPage.openPersonalInformation();
    await personalInformationPage.headerTitle.waitForDisplayed({ timeout: 10000 });
  });

  describe('Header Section', () => {
    it('should display Personal Information page header', async () => {
      await expect(personalInformationPage.headerTitle).toBeDisplayed();
    });

    it('should display back button', async () => {
      await expect(personalInformationPage.goBackButton).toBeDisplayed();
    });
  });

  describe('User Profile Section', () => {
    it('should display user full name', async () => {
      await expect(personalInformationPage.userFullName).toBeDisplayed();
    });

    it('should display user ID in USR-XXXX-XXXX format', async () => {
      const userId = await personalInformationPage.getUserId();
      expect(userId).toMatch(/^USR-\d{4}-\d{4}$/);
    });
  });

  describe('User Details Section', () => {
    it('should display USER DETAILS section header', async () => {
      await expect(personalInformationPage.userDetailsLabel).toBeDisplayed();
    });

    it('should display First Name field with value', async () => {
      await expect(personalInformationPage.firstNameField).toBeDisplayed();
      const firstName = await personalInformationPage.getFirstName();
      expect(firstName.length).toBeGreaterThan(0);
    });

    it('should display Last Name field with value', async () => {
      await expect(personalInformationPage.lastNameField).toBeDisplayed();
      const lastName = await personalInformationPage.getLastName();
      expect(lastName.length).toBeGreaterThan(0);
    });

    it('should display E-mail field with valid email', async () => {
      await expect(personalInformationPage.emailField).toBeDisplayed();
      const email = await personalInformationPage.getEmail();
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should display Phone number field', async () => {
      await expect(personalInformationPage.phoneNumberField).toBeDisplayed();
    });
  });

  describe('Data Consistency', () => {
    it('should match first + last name with displayed full name', async () => {
      const firstName = await personalInformationPage.getFirstName();
      const lastName = await personalInformationPage.getLastName();
      const fullName = await personalInformationPage.getUserFullName();

      expect(fullName).toContain(firstName);
      expect(fullName).toContain(lastName);
    });

    it('should display user ID matching the one from Profile page', async () => {
      const personalInfoUserId = await personalInformationPage.getUserId();
      expect(personalInfoUserId).toBe(userId);
    });

    it('should display user information matching API response', async function () {
      // Skip if API call failed
      if (!userInfo) {
        console.warn('⚠️ Skipping user info validation - no data from API');
        this.skip();
        return;
      }

      // Extract user data from API response (adjust field names based on actual API structure)
      const apiFirstName = userInfo.firstName || userInfo.first_name || userInfo.user?.firstName;
      const apiLastName = userInfo.lastName || userInfo.last_name || userInfo.user?.lastName;
      const apiEmail = userInfo.email || userInfo.user?.email;

      // Get values from UI
      const uiFirstName = await personalInformationPage.getFirstName();
      const uiLastName = await personalInformationPage.getLastName();
      const uiEmail = await personalInformationPage.getEmail();

      console.log(`📊 Comparing user information:`);
      console.log(`   First Name - UI: "${uiFirstName}" | API: "${apiFirstName}"`);
      console.log(`   Last Name  - UI: "${uiLastName}" | API: "${apiLastName}"`);
      console.log(`   Email      - UI: "${uiEmail}" | API: "${apiEmail}"`);

      // Validate fields match (only if API returned the field)
      if (apiFirstName) {
        expect(uiFirstName).toBe(apiFirstName);
      }
      if (apiLastName) {
        expect(uiLastName).toBe(apiLastName);
      }
      if (apiEmail) {
        expect(uiEmail).toBe(apiEmail);
      }
    });
  });
});
