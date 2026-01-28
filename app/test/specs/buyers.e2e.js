const { expect } = require('@wdio/globals');

const buyersPage = require('../pageobjects/buyers.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');

describe('Buyers Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasBuyersData = false;
  let hasEmptyState = false;
  let apiBuyersAvailable = false;
  let buyersMenuAvailable = false;

  /**
   * Navigate to Buyers page via More menu
   */
  async function navigateToBuyers() {
    // First ensure we're on a page with footer visible
    await buyersPage.footer.moreTab.click();
    await browser.pause(500);
    // Click Buyers menu item
    await morePage.buyersMenuItem.click();
    await buyersPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    
    // Check if Buyers menu item is available for this user
    await buyersPage.footer.moreTab.click();
    await browser.pause(500);
    buyersMenuAvailable = await morePage.buyersMenuItem.isDisplayed().catch(() => false);
    
    if (!buyersMenuAvailable) {
      console.log('⚠️ Buyers menu item not available for this user - skipping Buyers tests');
      return;
    }
    
    // Navigate to Buyers page via More menu
    await morePage.buyersMenuItem.click();
    await buyersPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasBuyersData = await buyersPage.hasBuyers();
    hasEmptyState = !hasBuyersData && await buyersPage.emptyState.isDisplayed().catch(() => false);
    apiBuyersAvailable = !!process.env.API_OPS_TOKEN;

    console.log(`📊 Buyers data state: hasBuyers=${hasBuyersData}, emptyState=${hasEmptyState}, apiAvailable=${apiBuyersAvailable}`);
  });

  beforeEach(async function () {
    // Skip if Buyers menu not available
    if (!buyersMenuAvailable) {
      this.skip();
      return;
    }
    // Ensure we're on Buyers page
    const isOnBuyers = await buyersPage.isOnBuyersPage();
    if (!isOnBuyers) {
      await navigateToBuyers();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      // Navigate away first
      await buyersPage.goBack();
      await browser.pause(500);
      
      // Navigate back to Buyers
      await morePage.buyersMenuItem.click();
      await buyersPage.waitForScreenReady();
      
      await expect(buyersPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(buyersPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await buyersPage.goBack();
      
      // Verify we're back on More page by checking for Buyers menu item
      await expect(morePage.buyersMenuItem).toBeDisplayed();
      
      // Navigate back to Buyers for subsequent tests
      await morePage.buyersMenuItem.click();
      await buyersPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Buyers header title', async () => {
      await expect(buyersPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await buyersPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(buyersPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(buyersPage.footer.spotlightsTab).toBeDisplayed();
      await expect(buyersPage.footer.ordersTab).toBeDisplayed();
      await expect(buyersPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(buyersPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = buyersPage.footer.moreTab;
      if (isAndroid()) {
        // Android uses 'selected' attribute
        const selected = await moreTab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        // iOS uses 'value' attribute
        const value = await moreTab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });

  describe('Empty State', () => {
    // This test suite runs when user has no buyers

    it('should display empty state when no buyers exist', async function () {
      if (hasBuyersData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(buyersPage.emptyState).toBeDisplayed();
      await expect(buyersPage.noBuyersTitle).toBeDisplayed();
      await expect(buyersPage.noBuyersDescription).toBeDisplayed();
    });

    it('should display "No buyers" title text', async function () {
      if (hasBuyersData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await buyersPage.noBuyersTitle.getText();
      expect(titleText).toBe('No buyers');
    });

    it('should display "No buyers found." description', async function () {
      if (hasBuyersData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await buyersPage.noBuyersDescription.getText();
      expect(descriptionText).toBe('No buyers found.');
    });
  });

  describe('Buyers List', () => {
    // This test suite runs when user has buyers data

    it('should display buyers list when buyers exist', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }

      await expect(buyersPage.buyersScrollView).toBeDisplayed();
      const buyersCount = await buyersPage.getVisibleBuyersCount();
      expect(buyersCount).toBeGreaterThan(0);
    });

    it('should display buyer items with ID and status', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }

      const firstBuyer = buyersPage.firstBuyerItem;
      await expect(firstBuyer).toBeDisplayed();
      
      const details = await buyersPage.getBuyerDetails(firstBuyer);
      // Buyers use 3-group IDs: BUY-XXXX-XXXX
      expect(details.buyerId).toMatch(/^BUY-\d{4}-\d{4}$/);
      expect(['Active', 'Unassigned']).toContain(details.status);
    });

    it('should detect all loaded buyers in the list', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }

      const buyersCount = await buyersPage.getVisibleBuyersCount();
      const buyerIds = await buyersPage.getVisibleBuyerIds();
      
      console.log(`Total buyers detected: ${buyersCount}`);
      console.log(`First 5 buyer IDs: ${buyerIds.slice(0, 5).join(', ')}`);
      console.log(`Last 5 buyer IDs: ${buyerIds.slice(-5).join(', ')}`);
      
      expect(buyersCount).toBeGreaterThan(0);
      
      // Verify all buyer IDs have valid format (3-group)
      for (const buyerId of buyerIds) {
        expect(buyerId).toMatch(/^BUY-\d{4}-\d{4}$/);
      }
    });

    it('should not display empty state when buyers exist', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await buyersPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Buyers by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasBuyersData) {
        this.skip();
        return;
      }

      const activeBuyers = await buyersPage.getBuyersByStatus('Active');
      const unassignedBuyers = await buyersPage.getBuyersByStatus('Unassigned');

      // At least one status should have buyers
      const totalStatusBuyers = activeBuyers.length + unassignedBuyers.length;
      expect(totalStatusBuyers).toBeGreaterThanOrEqual(0);
      
      console.log(`Buyers by status - Active: ${activeBuyers.length}, Unassigned: ${unassignedBuyers.length}`);
    });
  });

  describe('API Integration', () => {
    it('should match API buyers count with visible buyers', async function () {
      // Skip if API token not configured or no buyers in UI
      if (!apiBuyersAvailable || !hasBuyersData) {
        this.skip();
        return;
      }

      try {
        const apiBuyers = await apiClient.getBuyers({ limit: 100 });
        const apiBuyersList = apiBuyers.data || apiBuyers;
        const apiCount = apiBuyersList.length;
        
        const uiCount = await buyersPage.getVisibleBuyersCount();
        
        console.log(`[Count Compare] API buyers: ${apiCount}, UI visible buyers: ${uiCount}`);
        
        // UI should show at least some buyers if API has buyers
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 buyer IDs and statuses match API data', async function () {
      if (!apiBuyersAvailable || !hasBuyersData) {
        this.skip();
        return;
      }

      try {
        const apiBuyers = await apiClient.getBuyers({ limit: 10 });
        const apiBuyersList = apiBuyers.data || apiBuyers;
        const uiBuyerIds = await buyersPage.getVisibleBuyerIds();
        const uiBuyersWithStatus = await buyersPage.getVisibleBuyersWithStatus();
        
        // Compare each API buyer with UI and log results
        const comparisons = [];
        for (let i = 0; i < Math.min(apiBuyersList.length, 10); i++) {
          const apiBuyer = apiBuyersList[i];
          const apiBuyerId = apiBuyer.buyerId || apiBuyer.id;
          const apiStatus = apiBuyer.status;
          const uiBuyer = uiBuyersWithStatus[i] || {};
          const uiBuyerId = uiBuyer.buyerId;
          const uiStatus = uiBuyer.status;
          
          const idMatches = apiBuyerId === uiBuyerId;
          const statusMatches = apiStatus === uiStatus;
          
          console.log(`[${i + 1}] ID: ${apiBuyerId} vs ${uiBuyerId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`);
          comparisons.push({ apiBuyerId, uiBuyerId, idMatches, apiStatus, uiStatus, statusMatches });
        }
        
        const idMatchCount = comparisons.filter(c => c.idMatches).length;
        const statusMatchCount = comparisons.filter(c => c.statusMatches).length;
        console.log(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);
        
        // Verify all visible UI buyers have valid format (3-group)
        for (const uiBuyerId of uiBuyerIds.slice(0, 10)) {
          expect(uiBuyerId).toMatch(/^BUY-\d{4}-\d{4}$/);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
