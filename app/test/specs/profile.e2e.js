const { expect } = require('@wdio/globals');

const headingPage = require('../pageobjects/base/heading.page');
const profilePage = require('../pageobjects/profile.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { TIMEOUT } = require('../pageobjects/utils/constants');

describe('Profile Page', () => {
  let userId;
  let userInfo;
  let userAccounts;
  // Data state flags - set once in before() to avoid redundant checks
  let hasAccountsData = false;
  let hasEmptyState = false;

  before(async function () {
    // Set timeout for login flow
    this.timeout(150000);
    await ensureLoggedIn();

    // Navigate to Profile page
    await navigation.ensureHomePage({ resetFilters: false });
    await headingPage.navAccountButton.click();
    await profilePage.profileHeaderTitle.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });

    // Check data state ONCE and cache the results
    hasAccountsData = await profilePage.hasAccounts();
    hasEmptyState = !hasAccountsData && await profilePage.noAccountsTitle.isDisplayed().catch(() => false);

    console.info(`📊 Profile accounts data state: hasAccounts=${hasAccountsData}, emptyState=${hasEmptyState}`);

    // Get user ID from Profile page as soon as it loads
    userId = await profilePage.getCurrentUserId();
    console.info(`📋 Current user ID: ${userId}`);

    // Fetch user information from API
    try {
      userInfo = await apiClient.getUserInformation(userId);
      userAccounts = userInfo.data || userInfo.accounts || userInfo;
      if (Array.isArray(userAccounts)) {
        console.info(`📊 Loaded ${userAccounts.length} accounts from API for user ${userId}`);
      } else {
        userAccounts = [];
      }
    } catch (error) {
      console.warn(`⚠️ Could not fetch user information from API: ${error.message}`);
      userInfo = null;
      userAccounts = [];
    }
  });

  describe('Header Section', () => {
    it('should display Profile page header', async () => {
      await expect(profilePage.profileHeaderTitle).toBeDisplayed();
    });

    it('should display back button', async () => {
      await expect(profilePage.goBackButton).toBeDisplayed();
    });
  });

  describe('Your Profile Section', () => {
    it('should display YOUR PROFILE section label', async () => {
      await expect(profilePage.yourProfileLabel).toBeDisplayed();
    });

    it('should display current user card', async () => {
      await expect(profilePage.currentUserCard).toBeDisplayed();
    });

    it('should display current user name', async () => {
      await expect(profilePage.currentUserName).toBeDisplayed();
      const userName = await profilePage.getCurrentUserName();
      expect(userName.length).toBeGreaterThan(0);
    });

    it('should display current user ID in USR-XXXX-XXXX format', async () => {
      await expect(profilePage.currentUserId).toBeDisplayed();
      expect(userId).toMatch(/^USR-\d{4}-\d{4}$/);
    });
  });

  describe('Switch Account Section', () => {
    it('should display SWITCH ACCOUNT section label', async () => {
      await expect(profilePage.switchAccountLabel).toBeDisplayed();
    });

    it('should display at least one account item', async function () {
      if (!hasAccountsData) {
        this.skip();
        return;
      }
      await expect(profilePage.firstAccountItem).toBeDisplayed();
    });
  });

  describe('Empty State (No Accounts)', () => {
    // This test suite runs when user has no accounts to switch to

    it('should display empty state when no accounts exist', async function () {
      if (hasAccountsData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(profilePage.noAccountsTitle).toBeDisplayed();
      await expect(profilePage.noAccountsDescription).toBeDisplayed();
    });

    it('should display "No accounts" title text', async function () {
      if (hasAccountsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await profilePage.noAccountsTitle.getText();
      expect(titleText).toBe('No accounts');
    });

    it('should display "You don\'t have access to any accounts." description', async function () {
      if (hasAccountsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await profilePage.noAccountsDescription.getText();
      expect(descriptionText).toBe("You don't have access to any accounts.");
    });
  });

  describe('API Data Consistency', () => {
    it('should display account count matching API response', async function () {
      // Skip if no accounts in UI or API call failed or no accounts returned
      if (!hasAccountsData || !userAccounts || userAccounts.length === 0) {
        console.warn('⚠️ Skipping account count validation - no accounts available');
        this.skip();
        return;
      }

      // Get account count from UI
      const uiAccountCount = await profilePage.getAccountCount();
      console.info(`📊 UI shows ${uiAccountCount} accounts, API returned ${userAccounts.length}`);

      // Validate account count matches
      expect(uiAccountCount).toBe(userAccounts.length);
    });

    it('should display all accounts from API response', async function () {
      // Skip if no accounts in UI or API call failed or no accounts returned
      if (!hasAccountsData || !userAccounts || userAccounts.length === 0) {
        console.warn('⚠️ Skipping account validation - no accounts available');
        this.skip();
        return;
      }

      // Validate each account from API is displayed in UI
      for (const account of userAccounts) {
        const accountId = account.id || account.accountId;
        if (accountId) {
          const accountElement = profilePage.getAccountItemById(accountId);
          const isDisplayed = await accountElement.isDisplayed().catch(() => false);
          console.info(`📋 Account ${accountId}: ${isDisplayed ? '✓ displayed' : '✗ not found'}`);
          expect(isDisplayed).toBe(true);
        }
      }
    });

    it('should display correct account names from API', async function () {
      // Skip if no accounts in UI or API call failed or no accounts returned
      if (!hasAccountsData || !userAccounts || userAccounts.length === 0) {
        console.warn('⚠️ Skipping account name validation - no accounts available');
        this.skip();
        return;
      }

      // Validate account names match between UI and API
      for (let i = 0; i < userAccounts.length; i++) {
        const account = userAccounts[i];
        const apiAccountName = account.name || account.accountName;
        
        if (apiAccountName) {
          const uiAccountName = await profilePage.getAccountNameAtIndex(i + 1);
          console.info(`📋 Account ${i + 1} name - UI: "${uiAccountName}" | API: "${apiAccountName}"`);
          expect(uiAccountName).toBe(apiAccountName);
        }
      }
    });
  });
});
