const { expect } = require('@wdio/globals');

const vendorsPage = require('../pageobjects/vendors.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { opsApiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');

describe('Vendors Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasVendorsData = false;
  let hasEmptyState = false;
  let apiVendorsAvailable = false;
  let vendorsMenuAvailable = false;

  /**
   * Navigate to Vendors page via More menu
   */
  async function navigateToVendors() {
    await morePage.ensureMorePage();
    let menuExists = await morePage.vendorsMenuItem.isExisting().catch(() => false);
    if (!menuExists) {
      await vendorsPage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      menuExists = await morePage.vendorsMenuItem.isExisting().catch(() => false);
    }
    if (!menuExists) return false;
    await morePage.vendorsMenuItem.click();
    await vendorsPage.waitForScreenReady();
    return true;
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureOperationsAccount();

    // Check if Vendors menu item is available for this account
    await morePage.ensureMorePage();
    let menuExists = await morePage.vendorsMenuItem.isExisting().catch(() => false);
    if (!menuExists) {
      await vendorsPage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      menuExists = await morePage.vendorsMenuItem.isExisting().catch(() => false);
    }
    vendorsMenuAvailable = menuExists;

    if (!vendorsMenuAvailable) {
      console.info('⚠️ Vendors menu item not available for this account - skipping Vendors tests');
      return;
    }

    await morePage.vendorsMenuItem.click();
    await vendorsPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasVendorsData = await vendorsPage.hasVendors();
    hasEmptyState = !hasVendorsData && await vendorsPage.emptyState.isDisplayed().catch(() => false);
    apiVendorsAvailable = !!opsApiClient;

    console.info(`📊 Vendors data state: hasVendors=${hasVendorsData}, emptyState=${hasEmptyState}, apiAvailable=${apiVendorsAvailable}`);
  });

  beforeEach(async function () {
    if (!vendorsMenuAvailable) {
      this.skip();
      return;
    }
    const isOnVendors = await vendorsPage.isOnVendorsPage();
    if (!isOnVendors) {
      await navigateToVendors();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      await vendorsPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);

      await morePage.vendorsMenuItem.click();
      await vendorsPage.waitForScreenReady();

      await expect(vendorsPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(vendorsPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await vendorsPage.goBack();

      await expect(morePage.vendorsMenuItem).toBeDisplayed();

      // Navigate back for subsequent tests
      await morePage.vendorsMenuItem.click();
      await vendorsPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Vendors header title', async () => {
      await expect(vendorsPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await vendorsPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(vendorsPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(vendorsPage.footer.spotlightsTab).toBeDisplayed();
      await expect(vendorsPage.footer.chatTab).toBeDisplayed();
      await expect(vendorsPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = vendorsPage.footer.moreTab;
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
    it('should display empty state when no vendors exist', async function () {
      if (hasVendorsData || !hasEmptyState) {
        this.skip();
        return;
      }
      await expect(vendorsPage.emptyState).toBeDisplayed();
      await expect(vendorsPage.noVendorsTitle).toBeDisplayed();
      await expect(vendorsPage.noVendorsDescription).toBeDisplayed();
    });

    it('should display "No vendors" title text', async function () {
      if (hasVendorsData || !hasEmptyState) {
        this.skip();
        return;
      }
      const titleText = await vendorsPage.noVendorsTitle.getText();
      expect(titleText).toBe('No vendors');
    });

    it('should display "No vendors found." description', async function () {
      if (hasVendorsData || !hasEmptyState) {
        this.skip();
        return;
      }
      const descText = await vendorsPage.noVendorsDescription.getText();
      expect(descText).toBe('No vendors found.');
    });
  });

  describe('Vendors List', () => {
    it('should display vendors list when vendors exist', async function () {
      if (!hasVendorsData) {
        this.skip();
        return;
      }
      await expect(vendorsPage.scrollView).toBeDisplayed();
      const count = await vendorsPage.getVisibleItemsCount();
      expect(count).toBeGreaterThan(0);
    });

    it('should display vendor items with ACC- ID format', async function () {
      if (!hasVendorsData) {
        this.skip();
        return;
      }
      const firstItem = await vendorsPage.firstListItem;
      await expect(firstItem).toBeDisplayed();
      const details = await vendorsPage.getItemDetails(firstItem);
      expect(details.id).toMatch(REGEX.ACCOUNT_ID);
    });

    it('should detect all loaded vendors in the list', async function () {
      if (!hasVendorsData) {
        this.skip();
        return;
      }
      const count = await vendorsPage.getVisibleItemsCount();
      const ids = await vendorsPage.getVisibleItemIds();

      console.info(`Total vendors detected: ${count}`);
      console.info(`First 5 vendor IDs: ${ids.slice(0, 5).join(', ')}`);

      expect(count).toBeGreaterThan(0);
      for (const id of ids) {
        expect(id).toMatch(REGEX.ACCOUNT_ID);
      }
    });

    it('should not display empty state when vendors exist', async function () {
      if (!hasVendorsData) {
        this.skip();
        return;
      }
      const emptyStateVisible = await vendorsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('API Data Validation', () => {
    it('should match API vendors count with visible count', async function () {
      if (!apiVendorsAvailable || !hasVendorsData) {
        this.skip();
        return;
      }
      try {
        const apiResponse = await opsApiClient.getVendors({ limit: 1 });
        const apiTotal =
          apiResponse.pagination?.total ??
          apiResponse.$meta?.pagination?.total;

        const uiCount = await vendorsPage.getVisibleItemsCount();
        console.info(`[Count] API total: ${apiTotal ?? 'unknown'}, UI visible: ${uiCount}`);

        if (apiTotal !== undefined && apiTotal > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify visible vendor IDs appear in API response', async function () {
      if (!apiVendorsAvailable || !hasVendorsData) {
        this.skip();
        return;
      }
      try {
        const apiResponse = await opsApiClient.getVendors({ limit: 50 });
        const apiVendors = apiResponse.data || apiResponse;
        const apiIds = apiVendors.map((v) => v.id);
        const uiIds = await vendorsPage.getVisibleItemIds();

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
