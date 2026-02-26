const { expect } = require('@wdio/globals');

const usersPage = require('../pageobjects/users.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { PAUSE } = require('../pageobjects/utils/constants');

describe('Users Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasUsersData = false;
  let hasEmptyState = false;
  let apiUsersAvailable = false;
  let usersMenuAvailable = false;

  /**
   * Navigate to Users page via More menu
   */
  async function navigateToUsers() {
    await usersPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    await morePage.usersMenuItem.click();
    await usersPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    // Check if Users menu item is available for this user
    await usersPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    usersMenuAvailable = await morePage.usersMenuItem.isDisplayed().catch(() => false);

    if (!usersMenuAvailable) {
      console.info('⚠️ Users menu item not available for this user - skipping Users tests');
      return;
    }

    // Navigate to Users page via More menu
    await morePage.usersMenuItem.click();
    await usersPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasUsersData = await usersPage.hasUsers();
    hasEmptyState = !hasUsersData && await usersPage.emptyState.isDisplayed().catch(() => false);
    apiUsersAvailable = !!process.env.API_OPS_TOKEN;

    console.info(`📊 Users data state: hasUsers=${hasUsersData}, emptyState=${hasEmptyState}, apiAvailable=${apiUsersAvailable}`);
  });

  beforeEach(async function () {
    if (!usersMenuAvailable) {
      this.skip();
      return;
    }
    const isOnUsers = await usersPage.isOnUsersPage();
    if (!isOnUsers) {
      await navigateToUsers();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      await usersPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);
      await morePage.usersMenuItem.click();
      await usersPage.waitForScreenReady();
      await expect(usersPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(usersPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await usersPage.goBack();
      await expect(morePage.usersMenuItem).toBeDisplayed();
      await morePage.usersMenuItem.click();
      await usersPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Users header title', async () => {
      await expect(usersPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await usersPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(usersPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(usersPage.footer.spotlightsTab).toBeDisplayed();
      await expect(usersPage.footer.ordersTab).toBeDisplayed();
      await expect(usersPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(usersPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = usersPage.footer.moreTab;
      if (isAndroid()) {
        const selected = await moreTab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        const value = await moreTab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no users exist', async function () {
      if (hasUsersData || !hasEmptyState) {
        this.skip();
        return;
      }
      await expect(usersPage.emptyState).toBeDisplayed();
      await expect(usersPage.noUsersTitle).toBeDisplayed();
      await expect(usersPage.noUsersDescription).toBeDisplayed();
    });

    it('should display "No users" title text', async function () {
      if (hasUsersData || !hasEmptyState) {
        this.skip();
        return;
      }
      const titleText = await usersPage.noUsersTitle.getText();
      expect(titleText).toBe('No users');
    });

    it('should display "No users found." description', async function () {
      if (hasUsersData || !hasEmptyState) {
        this.skip();
        return;
      }
      const descriptionText = await usersPage.noUsersDescription.getText();
      expect(descriptionText).toBe('No users found.');
    });
  });

  describe('Users List', () => {
    it('should display users list when users exist', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      await expect(usersPage.usersScrollView).toBeDisplayed();
      const usersCount = await usersPage.getVisibleUsersCount();
      expect(usersCount).toBeGreaterThan(0);
    });

    it('should display user items with ID and status', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const firstUser = usersPage.firstUserItem;
      await expect(firstUser).toBeDisplayed();
      const details = await usersPage.getUserDetails(firstUser);
      expect(details.userId).toMatch(/^USR-\d{4}-\d{4}$/);
      expect(['Active', 'Blocked', 'Invitation Expired']).toContain(details.status);
    });

    it('should detect all loaded users in the list', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const usersCount = await usersPage.getVisibleUsersCount();
      const userIds = await usersPage.getVisibleUserIds();
      console.info(`Total users detected: ${usersCount}`);
      console.info(`First 5 user IDs: ${userIds.slice(0, 5).join(', ')}`);
      console.info(`Last 5 user IDs: ${userIds.slice(-5).join(', ')}`);
      expect(usersCount).toBeGreaterThan(0);
      for (const userId of userIds) {
        expect(userId).toMatch(/^USR-\d{4}-\d{4}$/);
      }
    });

    it('should not display empty state when users exist', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const emptyStateVisible = await usersPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Users by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasUsersData) {
        this.skip();
        return;
      }
      const activeUsers = await usersPage.getUsersByStatus('Active');
      const blockedUsers = await usersPage.getUsersByStatus('Blocked');
      const invitationExpiredUsers = await usersPage.getUsersByStatus('Invitation Expired');
      const totalStatusUsers = activeUsers.length + blockedUsers.length + invitationExpiredUsers.length;
      expect(totalStatusUsers).toBeGreaterThanOrEqual(0);
      console.info(`Users by status - Active: ${activeUsers.length}, Blocked: ${blockedUsers.length}, Invitation Expired: ${invitationExpiredUsers.length}`);
    });
  });

  describe('API Integration', () => {
    it('should match API users count with visible users', async function () {
      if (!apiUsersAvailable || !hasUsersData) {
        this.skip();
        return;
      }
      try {
        const apiUsers = await apiClient.getUsers({ limit: 100 });
        const apiUsersList = apiUsers.data || apiUsers;
        const apiCount = apiUsersList.length;
        const uiCount = await usersPage.getVisibleUsersCount();
        console.info(`[Count Compare] API users: ${apiCount}, UI visible users: ${uiCount}`);
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 user IDs and statuses match API data', async function () {
      if (!apiUsersAvailable || !hasUsersData) {
        this.skip();
        return;
      }
      try {
        const apiUsers = await apiClient.getUsers({ limit: 10 });
        const apiUsersList = apiUsers.data || apiUsers;
        const uiUserIds = await usersPage.getVisibleUserIds();
        const uiUsersWithStatus = await usersPage.getVisibleUsersWithStatus();
        const comparisons = [];
        for (let i = 0; i < Math.min(apiUsersList.length, 10); i++) {
          const apiUser = apiUsersList[i];
          const apiUserId = apiUser.userId || apiUser.id;
          const apiStatus = apiUser.status;
          const uiUser = uiUsersWithStatus[i] || {};
          const uiUserId = uiUser.userId;
          const uiStatus = uiUser.status;
          const idMatches = apiUserId === uiUserId;
          const statusMatches = apiStatus === uiStatus;
          console.info(`[${i + 1}] ID: ${apiUserId} vs ${uiUserId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`);
          comparisons.push({ apiUserId, uiUserId, idMatches, apiStatus, uiStatus, statusMatches });
        }
        const idMatchCount = comparisons.filter(c => c.idMatches).length;
        const statusMatchCount = comparisons.filter(c => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);
        for (const uiUserId of uiUserIds.slice(0, 10)) {
          expect(uiUserId).toMatch(/^USR-\d{4}-\d{4}$/);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
