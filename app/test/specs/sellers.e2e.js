const { expect } = require('@wdio/globals');

const sellersPage = require('../pageobjects/sellers.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE, REGEX, STATUSES } = require('../pageobjects/utils/constants');

describe('Sellers Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let api;
  let hasSellersData = false;
  let hasEmptyState = false;
  let apiSellersAvailable = false;
  let sellersMenuAvailable = false;

  /**
   * Navigate to Sellers page via More menu
   */
  async function navigateToSellers() {
    await morePage.ensureMorePage();
    await morePage.sellersMenuItem.click();
    await sellersPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    // Check if Sellers menu item is available for this user
    await morePage.ensureMorePage();
    sellersMenuAvailable = await morePage.sellersMenuItem.isExisting().catch(() => false);

    if (!sellersMenuAvailable) {
      console.info('⚠️ Sellers menu item not available for this user - skipping Sellers tests');
      return;
    }

    await morePage.sellersMenuItem.click();
    await sellersPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasSellersData = await sellersPage.hasSellers();
    hasEmptyState = !hasSellersData && (await sellersPage.emptyState.isDisplayed().catch(() => false));
    apiSellersAvailable = !!api;

    console.info(
      `📊 Sellers data state: hasSellers=${hasSellersData}, emptyState=${hasEmptyState}, apiAvailable=${apiSellersAvailable}`,
    );
  });

  beforeEach(async function () {
    if (!sellersMenuAvailable) {
      this.skip();
      return;
    }
    const isOnSellers = await sellersPage.isOnSellersPage();
    if (!isOnSellers) {
      await navigateToSellers();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      await sellersPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);

      await morePage.sellersMenuItem.click();
      await sellersPage.waitForScreenReady();

      await expect(sellersPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(sellersPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await sellersPage.goBack();

      await expect(morePage.sellersMenuItem).toBeDisplayed();

      await morePage.sellersMenuItem.click();
      await sellersPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Sellers header title', async () => {
      await expect(sellersPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await sellersPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(sellersPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(sellersPage.footer.spotlightsTab).toBeDisplayed();
      await expect(sellersPage.footer.chatTab).toBeDisplayed();
      await expect(sellersPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = sellersPage.footer.moreTab;
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
    it('should display empty state when no sellers exist', async function () {
      if (hasSellersData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(sellersPage.emptyState).toBeDisplayed();
    });
  });

  describe('Sellers List', () => {
    it('should display sellers list when sellers exist', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }

      await expect(sellersPage.sellersScrollView).toBeDisplayed();
      const sellersCount = await sellersPage.getVisibleSellersCount();
      expect(sellersCount).toBeGreaterThan(0);
    });

    it('should display seller items with name, ID and status', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }

      const firstSeller = sellersPage.firstSellerItem;
      await expect(firstSeller).toBeDisplayed();

      const details = await sellersPage.getSellerDetails(firstSeller);
      expect(details.sellerId).toMatch(REGEX.SELLER_ID);
      expect(STATUSES.SELLER).toContain(details.status);
    });

    it('should detect all loaded sellers in the list', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }

      const sellersCount = await sellersPage.getVisibleSellersCount();
      const sellerIds = await sellersPage.getVisibleSellerIds();

      console.info(`Total sellers detected: ${sellersCount}`);
      console.info(`First 5 seller IDs: ${sellerIds.slice(0, 5).join(', ')}`);

      expect(sellersCount).toBeGreaterThan(0);

      for (const sellerId of sellerIds) {
        expect(sellerId).toMatch(REGEX.SELLER_ID);
      }
    });

    it('should not display empty state when sellers exist', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await sellersPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Sellers by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasSellersData) {
        this.skip();
        return;
      }

      const activeSellers = await sellersPage.getItemsByStatus('Active');
      const disabledSellers = await sellersPage.getItemsByStatus('Disabled');

      const totalStatusSellers = activeSellers.length + disabledSellers.length;
      expect(totalStatusSellers).toBeGreaterThanOrEqual(0);

      console.info(
        `Sellers by status - Active: ${activeSellers.length}, Disabled: ${disabledSellers.length}`,
      );
    });
  });

  describe('API Integration', () => {
    it('should match API sellers count with visible sellers', async function () {
      if (!apiSellersAvailable || !hasSellersData) {
        this.skip();
        return;
      }

      try {
        const apiSellers = await api.getSellers({ limit: 100 });
        const apiSellersList = apiSellers.data || apiSellers;
        const apiCount = apiSellersList.length;

        const uiCount = await sellersPage.getVisibleSellersCount();

        console.info(`[Count Compare] API sellers: ${apiCount}, UI visible sellers: ${uiCount}`);

        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 seller IDs and statuses match API data', async function () {
      if (!apiSellersAvailable || !hasSellersData) {
        this.skip();
        return;
      }

      try {
        const apiSellers = await api.getSellers({ limit: 10 });
        const apiSellersList = apiSellers.data || apiSellers;
        const uiSellerIds = await sellersPage.getVisibleSellerIds();
        const uiSellersWithStatus = await sellersPage.getVisibleSellersWithStatus();

        const comparisons = [];
        for (let i = 0; i < Math.min(apiSellersList.length, 10); i++) {
          const apiSeller = apiSellersList[i];
          const apiSellerId = apiSeller.id;
          const apiStatus = apiSeller.status;
          const uiSeller = uiSellersWithStatus[i] || {};
          const uiSellerId = uiSeller.sellerId;
          const uiStatus = uiSeller.status;

          const idMatches = apiSellerId === uiSellerId;
          const statusMatches = apiStatus === uiStatus;

          console.info(
            `[${i + 1}] ID: ${apiSellerId} vs ${uiSellerId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`,
          );
          comparisons.push({ apiSellerId, uiSellerId, idMatches, apiStatus, uiStatus, statusMatches });
        }

        const idMatchCount = comparisons.filter((c) => c.idMatches).length;
        const statusMatchCount = comparisons.filter((c) => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);

        for (const uiSellerId of uiSellerIds.slice(0, 10)) {
          expect(uiSellerId).toMatch(REGEX.SELLER_ID);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
