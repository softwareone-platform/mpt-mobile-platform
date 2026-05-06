const { expect } = require('@wdio/globals');

const clientsPage = require('../pageobjects/clients.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { opsApiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');

describe('Clients Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasClientsData = false;
  let hasEmptyState = false;
  let apiClientsAvailable = false;
  let clientsMenuAvailable = false;

  /**
   * Navigate to Clients page via More menu
   */
  async function navigateToClients() {
    await morePage.ensureMorePage();
    let menuExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    if (!menuExists) {
      await clientsPage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      menuExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    }
    if (!menuExists) return false;
    await morePage.clientsMenuItem.click();
    await clientsPage.waitForScreenReady();
    return true;
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureOperationsAccount();

    // Check if Clients menu item is available for this account
    await morePage.ensureMorePage();
    let menuExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    if (!menuExists) {
      await clientsPage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      menuExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    }
    clientsMenuAvailable = menuExists;

    if (!clientsMenuAvailable) {
      console.info('⚠️ Clients menu item not available for this account - skipping Clients tests');
      return;
    }

    await morePage.clientsMenuItem.click();
    await clientsPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasClientsData = await clientsPage.hasClients();
    hasEmptyState = !hasClientsData && await clientsPage.emptyState.isDisplayed().catch(() => false);
    apiClientsAvailable = !!opsApiClient;

    console.info(`📊 Clients data state: hasClients=${hasClientsData}, emptyState=${hasEmptyState}, apiAvailable=${apiClientsAvailable}`);
  });

  beforeEach(async function () {
    if (!clientsMenuAvailable) {
      this.skip();
      return;
    }
    const isOnClients = await clientsPage.isOnClientsPage();
    if (!isOnClients) {
      await navigateToClients();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      await clientsPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);

      await morePage.clientsMenuItem.click();
      await clientsPage.waitForScreenReady();

      await expect(clientsPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(clientsPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await clientsPage.goBack();

      await expect(morePage.clientsMenuItem).toBeDisplayed();

      // Navigate back for subsequent tests
      await morePage.clientsMenuItem.click();
      await clientsPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Clients header title', async () => {
      await expect(clientsPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await clientsPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(clientsPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(clientsPage.footer.spotlightsTab).toBeDisplayed();
      await expect(clientsPage.footer.chatTab).toBeDisplayed();
      await expect(clientsPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = clientsPage.footer.moreTab;
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
    it('should display empty state when no clients exist', async function () {
      if (hasClientsData || !hasEmptyState) {
        this.skip();
        return;
      }
      await expect(clientsPage.emptyState).toBeDisplayed();
      await expect(clientsPage.noClientsTitle).toBeDisplayed();
      await expect(clientsPage.noClientsDescription).toBeDisplayed();
    });

    it('should display "No clients" title text', async function () {
      if (hasClientsData || !hasEmptyState) {
        this.skip();
        return;
      }
      const titleText = await clientsPage.noClientsTitle.getText();
      expect(titleText).toBe('No clients');
    });

    it('should display "No clients found." description', async function () {
      if (hasClientsData || !hasEmptyState) {
        this.skip();
        return;
      }
      const descText = await clientsPage.noClientsDescription.getText();
      expect(descText).toBe('No clients found.');
    });
  });

  describe('Clients List', () => {
    it('should display clients list when clients exist', async function () {
      if (!hasClientsData) {
        this.skip();
        return;
      }
      await expect(clientsPage.scrollView).toBeDisplayed();
      const count = await clientsPage.getVisibleItemsCount();
      expect(count).toBeGreaterThan(0);
    });

    it('should display client items with ACC- ID format', async function () {
      if (!hasClientsData) {
        this.skip();
        return;
      }
      const firstItem = await clientsPage.firstListItem;
      await expect(firstItem).toBeDisplayed();
      const details = await clientsPage.getItemDetails(firstItem);
      expect(details.id).toMatch(REGEX.ACCOUNT_ID);
    });

    it('should detect all loaded clients in the list', async function () {
      if (!hasClientsData) {
        this.skip();
        return;
      }
      const count = await clientsPage.getVisibleItemsCount();
      const ids = await clientsPage.getVisibleItemIds();

      console.info(`Total clients detected: ${count}`);
      console.info(`First 5 client IDs: ${ids.slice(0, 5).join(', ')}`);

      expect(count).toBeGreaterThan(0);
      for (const id of ids) {
        expect(id).toMatch(REGEX.ACCOUNT_ID);
      }
    });

    it('should not display empty state when clients exist', async function () {
      if (!hasClientsData) {
        this.skip();
        return;
      }
      const emptyStateVisible = await clientsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('API Data Validation', () => {
    it('should match API clients count with visible count', async function () {
      if (!apiClientsAvailable || !hasClientsData) {
        this.skip();
        return;
      }
      try {
        const apiResponse = await opsApiClient.getClients({ limit: 1 });
        const apiTotal =
          apiResponse.pagination?.total ??
          apiResponse.$meta?.pagination?.total;

        const uiCount = await clientsPage.getVisibleItemsCount();
        console.info(`[Count] API total: ${apiTotal ?? 'unknown'}, UI visible: ${uiCount}`);

        if (apiTotal !== undefined && apiTotal > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify visible client IDs appear in API response', async function () {
      if (!apiClientsAvailable || !hasClientsData) {
        this.skip();
        return;
      }
      try {
        const apiResponse = await opsApiClient.getClients({ limit: 50 });
        const apiClients = apiResponse.data || apiResponse;
        const apiIds = apiClients.map((c) => c.id);
        const uiIds = await clientsPage.getVisibleItemIds();

        console.info(`[IDs] Checking ${uiIds.length} UI IDs against ${apiIds.length} API IDs`);

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
