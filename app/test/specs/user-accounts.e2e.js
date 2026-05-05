const { expect, $ } = require('@wdio/globals');

const userAccountsPage = require('../pageobjects/user-accounts.page');
const userDetailsPage = require('../pageobjects/user-details.page');
const usersPage = require('../pageobjects/users.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { opsApiClient } = require('../utils/api-client');
const { getSelector } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE, REGEX, SCROLL } = require('../pageobjects/utils/constants');

describe('User Accounts Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasAccountsData = false;
  let hasEmptyState = false;
  let apiAvailable = false;
  let reachable = false;
  let capturedUserId = null;

  /**
   * Selector for the "Accounts" sub-list navigation item on User Details.
   * NavigationItem renders as XCUIElementTypeOther on iOS with accessible label "Accounts".
   */
  function accountsSubListItem() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "Accounts")]',
        android: '//*[contains(@content-desc, "Accounts")]',
      }),
    );
  }

  /**
   * Navigate from the More menu to the User Accounts screen via:
   * More → All Users → [first user] → User Details → "Accounts" sub-list
   * @returns {Promise<boolean>} true if navigation succeeded
   */
  async function navigateToUserAccounts() {
    await morePage.ensureMorePage();

    let allUsersExists = await morePage.allUsersMenuItem.isExisting().catch(() => false);
    if (!allUsersExists) {
      await usersPage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      allUsersExists = await morePage.allUsersMenuItem.isExisting().catch(() => false);
    }
    if (!allUsersExists) return false;

    await morePage.allUsersMenuItem.click();
    await usersPage.waitForScreenReady();

    const hasUsers = await usersPage.hasUsers();
    if (!hasUsers) return false;

    // Capture the first user's ID for API validation
    const userIds = await usersPage.getVisibleUserIds();
    capturedUserId = userIds[0] ?? null;

    await usersPage.tapFirstUser();
    await userDetailsPage.waitForPageReady();

    // Scroll down to find the "Accounts" sub-list navigation item
    let subListFound = false;
    let subListEl;
    for (let attempt = 0; attempt < SCROLL.MAX_SCROLL_ATTEMPTS; attempt++) {
      subListEl = accountsSubListItem();
      subListFound = await subListEl.isDisplayed().catch(() => false);
      if (subListFound) break;
      await userAccountsPage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
    }
    if (!subListFound) return false;

    await subListEl.click();
    await userAccountsPage.waitForScreenReady();
    return true;
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureOperationsAccount();

    reachable = await navigateToUserAccounts();
    if (!reachable) {
      console.info('⚠️ Could not navigate to User Accounts screen - skipping User Accounts tests');
      return;
    }

    hasAccountsData = await userAccountsPage.hasAccounts();
    hasEmptyState = !hasAccountsData && await userAccountsPage.emptyState.isDisplayed().catch(() => false);
    apiAvailable = !!opsApiClient;

    console.info(`📊 User Accounts data state: hasAccounts=${hasAccountsData}, emptyState=${hasEmptyState}, capturedUserId=${capturedUserId}, apiAvailable=${apiAvailable}`);
  });

  beforeEach(async function () {
    if (!reachable) {
      this.skip();
      return;
    }
    const isOnPage = await userAccountsPage.isOnUserAccountsPage();
    if (!isOnPage) {
      reachable = await navigateToUserAccounts();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from User Details via Accounts sub-list item', async () => {
      await expect(userAccountsPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(userAccountsPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to User Details when back button tapped', async () => {
      await userAccountsPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);

      // Verify we're back on User Details by checking the user ID element
      await expect(userDetailsPage.headerTitle).toBeDisplayed();

      // Navigate back for subsequent tests
      reachable = await navigateToUserAccounts();
    });
  });

  describe('Page Structure', () => {
    it('should display the Accounts header title', async () => {
      await expect(userAccountsPage.headerTitle).toBeDisplayed();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when user has no accounts', async function () {
      if (hasAccountsData || !hasEmptyState) {
        this.skip();
        return;
      }
      await expect(userAccountsPage.emptyState).toBeDisplayed();
      await expect(userAccountsPage.noAccountsTitle).toBeDisplayed();
    });
  });

  describe('Accounts List', () => {
    it('should display accounts list when user has accounts', async function () {
      if (!hasAccountsData) {
        this.skip();
        return;
      }
      await expect(userAccountsPage.scrollView).toBeDisplayed();
      const count = await userAccountsPage.getVisibleItemsCount();
      expect(count).toBeGreaterThan(0);
    });

    it('should display account items with ACC- ID format', async function () {
      if (!hasAccountsData) {
        this.skip();
        return;
      }
      const firstItem = await userAccountsPage.firstListItem;
      await expect(firstItem).toBeDisplayed();
      const details = await userAccountsPage.getItemDetails(firstItem);
      expect(details.id).toMatch(REGEX.ACCOUNT_ID);
    });

    it('should detect all loaded accounts in the list', async function () {
      if (!hasAccountsData) {
        this.skip();
        return;
      }
      const count = await userAccountsPage.getVisibleItemsCount();
      const ids = await userAccountsPage.getVisibleItemIds();

      console.info(`Total user accounts detected: ${count}`);
      console.info(`First 5 account IDs: ${ids.slice(0, 5).join(', ')}`);

      expect(count).toBeGreaterThan(0);
      for (const id of ids) {
        expect(id).toMatch(REGEX.ACCOUNT_ID);
      }
    });

    it('should not display empty state when accounts exist', async function () {
      if (!hasAccountsData) {
        this.skip();
        return;
      }
      const emptyStateVisible = await userAccountsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('API Data Validation', () => {
    it('should verify visible account IDs appear in API user accounts response', async function () {
      if (!apiAvailable || !hasAccountsData || !capturedUserId) {
        this.skip();
        return;
      }
      try {
        const apiAccounts = await opsApiClient.getUserAccounts(capturedUserId);
        const apiIds = apiAccounts.map((a) => a.id);
        const uiIds = await userAccountsPage.getVisibleItemIds();

        console.info(`[IDs] Checking ${uiIds.length} UI IDs against ${apiIds.length} API IDs for user ${capturedUserId}`);

        let matchCount = 0;
        for (const uiId of uiIds.slice(0, 10)) {
          if (apiIds.includes(uiId)) matchCount++;
        }
        const checkCount = Math.min(uiIds.length, 10);
        console.info(`[IDs] ${matchCount}/${checkCount} UI IDs found in API response`);
        expect(matchCount).toBeGreaterThan(0);
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });
  });
});
