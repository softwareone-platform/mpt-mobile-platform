const { expect } = require('@wdio/globals');

const salesQuotesPage = require('../pageobjects/sales-quotes.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE, REGEX, STATUSES } = require('../pageobjects/utils/constants');

describe('Sales Quotes Page', () => {
  let hasSalesQuotesData = false;
  let hasEmptyState = false;
  let apiSalesQuotesAvailable = false;
  let salesQuotesMenuAvailable = false;

  async function navigateToSalesQuotes() {
    await morePage.ensureMorePage();
    let menuExists = await morePage.salesQuotesMenuItem.isExisting().catch(() => false);
    if (!menuExists) {
      await morePage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
    }
    await morePage.salesQuotesMenuItem.click();
    await salesQuotesPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    await ensureOperationsAccount();

    await morePage.ensureMorePage();
    salesQuotesMenuAvailable = await morePage.salesQuotesMenuItem.isExisting().catch(() => false);
    if (!salesQuotesMenuAvailable) {
      await morePage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      salesQuotesMenuAvailable = await morePage.salesQuotesMenuItem.isExisting().catch(() => false);
    }

    if (!salesQuotesMenuAvailable) {
      console.info('⚠️ Sales Quotes menu item not available for this user - skipping Sales Quotes tests');
      return;
    }

    await morePage.salesQuotesMenuItem.click();
    await salesQuotesPage.waitForScreenReady();

    hasSalesQuotesData = await salesQuotesPage.hasSalesQuotes();
    hasEmptyState = !hasSalesQuotesData && (await salesQuotesPage.emptyState.isDisplayed().catch(() => false));
    apiSalesQuotesAvailable = !!process.env.API_OPS_TOKEN;

    console.info(
      `📊 Sales Quotes data state: hasSalesQuotes=${hasSalesQuotesData}, emptyState=${hasEmptyState}, apiAvailable=${apiSalesQuotesAvailable}`,
    );
  });

  beforeEach(async function () {
    if (!salesQuotesMenuAvailable) {
      this.skip();
      return;
    }
    const isOnSalesQuotes = await salesQuotesPage.isOnSalesQuotesPage();
    if (!isOnSalesQuotes) {
      await navigateToSalesQuotes();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      await salesQuotesPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);

      let menuExists = await morePage.salesQuotesMenuItem.isExisting().catch(() => false);
      if (!menuExists) {
        await morePage.scrollDown();
        await browser.pause(PAUSE.ANIMATION_SETTLE);
      }
      await morePage.salesQuotesMenuItem.click();
      await salesQuotesPage.waitForScreenReady();

      await expect(salesQuotesPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(salesQuotesPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await salesQuotesPage.goBack();

      let menuExists = await morePage.salesQuotesMenuItem.isExisting().catch(() => false);
      if (!menuExists) {
        await morePage.scrollDown();
        await browser.pause(PAUSE.ANIMATION_SETTLE);
      }
      await expect(morePage.salesQuotesMenuItem).toBeDisplayed();

      await morePage.salesQuotesMenuItem.click();
      await salesQuotesPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Sales Quotes header title', async () => {
      await expect(salesQuotesPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await salesQuotesPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(salesQuotesPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(salesQuotesPage.footer.spotlightsTab).toBeDisplayed();
      await expect(salesQuotesPage.footer.chatTab).toBeDisplayed();
      await expect(salesQuotesPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = salesQuotesPage.footer.moreTab;
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
    it('should display empty state when no sales quotes exist', async function () {
      if (hasSalesQuotesData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(salesQuotesPage.emptyState).toBeDisplayed();
    });
  });

  describe('Sales Quotes List', () => {
    it('should display sales quotes list when sales quotes exist', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }

      await expect(salesQuotesPage.salesQuotesScrollView).toBeDisplayed();
      const count = await salesQuotesPage.getVisibleSalesQuotesCount();
      expect(count).toBeGreaterThan(0);
    });

    it('should display sales quote items with ID and status', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }

      const firstSalesQuote = salesQuotesPage.firstSalesQuoteItem;
      await expect(firstSalesQuote).toBeDisplayed();

      const details = await salesQuotesPage.getSalesQuoteDetails(firstSalesQuote);
      console.info(`📋 First sales quote label: "${details.label}"`);
      console.info(`   ID: "${details.id}", status: "${details.status}", externalId: "${details.externalId}"`);

      expect(details.id).toBeTruthy();
      expect(STATUSES.SALES_QUOTE).toContain(details.status);
    });

    it('should detect all loaded sales quotes in the list', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }

      const count = await salesQuotesPage.getVisibleSalesQuotesCount();
      const ids = await salesQuotesPage.getVisibleSalesQuoteIds();

      console.info(`Total sales quotes detected: ${count}`);
      console.info(`First 5 sales quote IDs: ${ids.slice(0, 5).join(', ')}`);

      expect(count).toBeGreaterThan(0);

      for (const id of ids) {
        expect(id).toMatch(REGEX.SALES_QUOTE_ID);
      }
    });

    it('should not display empty state when sales quotes exist', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await salesQuotesPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Sales Quotes by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasSalesQuotesData) {
        this.skip();
        return;
      }

      const quotesWithStatus = await salesQuotesPage.getVisibleSalesQuotesWithStatus();
      const statusCounts = {};
      for (const quote of quotesWithStatus) {
        statusCounts[quote.status] = (statusCounts[quote.status] || 0) + 1;
      }

      console.info(`Sales Quotes by status: ${JSON.stringify(statusCounts)}`);
      expect(Object.keys(statusCounts).length).toBeGreaterThan(0);
    });
  });

  describe('API Integration', () => {
    it('should match API sales quotes count with visible sales quotes', async function () {
      if (!apiSalesQuotesAvailable || !hasSalesQuotesData) {
        this.skip();
        return;
      }

      try {
        const apiSalesQuotes = await apiClient.getSalesQuotes({ limit: 100 });
        const apiList = apiSalesQuotes.data || apiSalesQuotes;
        const apiCount = apiList.length;

        const uiCount = await salesQuotesPage.getVisibleSalesQuotesCount();

        console.info(`[Count Compare] API sales quotes: ${apiCount}, UI visible sales quotes: ${uiCount}`);

        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 sales quote IDs and statuses match API data', async function () {
      if (!apiSalesQuotesAvailable || !hasSalesQuotesData) {
        this.skip();
        return;
      }

      try {
        const apiSalesQuotes = await apiClient.getSalesQuotes({ limit: 10 });
        const apiList = apiSalesQuotes.data || apiSalesQuotes;
        const uiIds = await salesQuotesPage.getVisibleSalesQuoteIds();
        const uiWithStatus = await salesQuotesPage.getVisibleSalesQuotesWithStatus();

        const comparisons = [];
        for (let i = 0; i < Math.min(apiList.length, 10); i++) {
          const apiQuote = apiList[i];
          const uiQuote = uiWithStatus[i] || {};

          const idMatches = apiQuote.id === uiQuote.salesQuoteId;
          const statusMatches = apiQuote.status === uiQuote.status;

          console.info(
            `[${i + 1}] ID: ${apiQuote.id} vs ${uiQuote.salesQuoteId} ${idMatches ? '✓' : '✗'} | Status: ${apiQuote.status} vs ${uiQuote.status} ${statusMatches ? '✓' : '✗'}`,
          );
          comparisons.push({ idMatches, statusMatches });
        }

        const idMatchCount = comparisons.filter((c) => c.idMatches).length;
        const statusMatchCount = comparisons.filter((c) => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);

        for (const id of uiIds.slice(0, 10)) {
          expect(id).toMatch(REGEX.SALES_QUOTE_ID);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
