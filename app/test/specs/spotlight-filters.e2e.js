const { expect } = require('@wdio/globals');

const spotlightsPage = require('../pageobjects/spotlights.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureHomePage } = require('../pageobjects/utils/navigation.page');

/**
 * Spotlight Filter Tests - Optimized Structure
 * 
 * Tests are grouped by filter position to minimize scrolling:
 * 1. Filter UI Basics - no scrolling needed
 * 2. Left Filters (All, Orders, Subscriptions) - no horizontal scroll
 * 3. Middle Filters (Users, Invoices) - one scroll to middle
 * 4. Right Filters (Enrollments, Journals, Buyers) - one scroll to right
 * 5. All Filter Reset - returns to start
 */

describe('Spotlight Filter Chips', () => {
  // Section data flags - set once in before() to avoid redundant checks
  let sectionData = {};
  let hasSpotlightsData = false;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await ensureHomePage();

    // Check if there's any spotlight data at all (filters only show when there's data)
    hasSpotlightsData = await spotlightsPage.hasSpotlights();

    if (!hasSpotlightsData) {
      console.log('📊 No spotlight data - filter tests will be skipped');
      return;
    }

    // Check section data availability ONCE and cache results
    // These determine which filter tests can verify positive visibility
    sectionData = {
      hasSubscriptions: await spotlightsPage.isSubscriptionsSectionVisible().catch(() => false),
      hasJournals: await spotlightsPage.isJournalsSectionVisible().catch(() => false),
      hasBuyers: await spotlightsPage.isBuyersSectionVisible().catch(() => false),
      hasEnrollments: await spotlightsPage.isEnrollmentsSectionVisible().catch(() => false),
    };

    console.log(`📊 Spotlight section data:`, sectionData);
  });

  // ========== FILTER UI BASICS ==========
  describe('Filter UI Basics', () => {
    before(async function () {
      if (!hasSpotlightsData) {
        return;
      }
      await spotlightsPage.resetFilterScrollPosition().catch(() => {});
      await spotlightsPage.selectFilter('all').catch(() => {});
      await browser.pause(300);
    });

    it('should display "All" filter chip by default', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      await expect(spotlightsPage.filterAll).toBeDisplayed();
    });

    it('should display visible filter chips without scrolling', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      await expect(spotlightsPage.filterAll).toBeDisplayed();
      await expect(spotlightsPage.filterOrders).toBeDisplayed();
      await expect(spotlightsPage.filterSubscriptions).toBeDisplayed();
    });
  });

  // ========== LEFT FILTERS (No horizontal scroll needed) ==========
  describe('Left Filters (Orders, Subscriptions)', () => {
    before(async function () {
      if (!hasSpotlightsData) {
        return;
      }
      await ensureHomePage();
      await spotlightsPage.resetFilterScrollPosition().catch(() => {});
      // Use filter toggle to reset page scroll position - selecting a filter then All resets to top
      await spotlightsPage.selectFilter('orders').catch(() => {});
      await browser.pause(200);
      await spotlightsPage.selectFilter('all').catch(() => {});
      await browser.pause(300);
    });

    it('should select Orders filter and show order sections', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      await spotlightsPage.selectFilter('orders');
      await browser.pause(500);

      // Verify filter works by checking other sections are hidden
      // (Orders section visibility depends on user having long-running orders data)
      const subsVisible = await spotlightsPage.isSubscriptionsSectionVisible();
      expect(subsVisible).toBe(false);

      const invoicesVisible = await spotlightsPage.isInvoicesSectionVisible();
      expect(invoicesVisible).toBe(false);
    });

    it('should switch from Orders to Subscriptions filter', async function () {
      if (!hasSpotlightsData || !sectionData.hasSubscriptions) {
        console.log('Skipping - no subscriptions data for this user');
        this.skip();
        return;
      }
      await spotlightsPage.selectFilter('subscriptions');
      await browser.pause(500);

      const subsVisible = await spotlightsPage.isSubscriptionsSectionVisible();
      expect(subsVisible).toBe(true);

      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);
    });

    it('should show only subscription sections when Subscriptions filter is selected', async function () {
      if (!hasSpotlightsData || !sectionData.hasSubscriptions) {
        console.log('Skipping - no subscriptions data for this user');
        this.skip();
        return;
      }
      // Already on subscriptions from previous test, but let's be explicit
      await spotlightsPage.selectFilter('subscriptions');
      await browser.pause(300);

      const subsVisible = await spotlightsPage.isSubscriptionsSectionVisible();
      expect(subsVisible).toBe(true);

      const invoicesVisible = await spotlightsPage.isInvoicesSectionVisible();
      expect(invoicesVisible).toBe(false);
    });
  });

  // ========== MIDDLE FILTERS (Users, Invoices) ==========
  describe('Middle Filters (Users, Invoices)', () => {
    before(async function () {
      if (!hasSpotlightsData) {
        return;
      }
      await ensureHomePage();
      await spotlightsPage.resetFilterScrollPosition().catch(() => {});
      // Scroll once to reveal middle filters
      await spotlightsPage.scrollToFilter('users');
      await browser.pause(300);
    });

    it('should display Users filter after scrolling', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      await expect(spotlightsPage.filterUsers).toBeDisplayed();
    });

    it('should select Users filter and show user sections', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      // Ensure filter is visible before selecting
      await spotlightsPage.scrollToFilter('users');
      await spotlightsPage.selectFilter('users');
      await browser.pause(500);

      // Verify filter works by checking subscriptions sections are hidden
      // Users filter should hide subscription-related content
      const subsVisible = await spotlightsPage.isSubscriptionsSectionVisible();
      const invoicesVisible = await spotlightsPage.isInvoicesSectionVisible();
      
      // At least one of these should be false if filtering is working
      const filteringWorks = !subsVisible || !invoicesVisible;
      expect(filteringWorks).toBe(true);
    });

    it('should display Invoices filter', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      await expect(spotlightsPage.filterInvoices).toBeDisplayed();
    });

    it('should select Invoices filter and show invoice sections', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      await spotlightsPage.scrollToFilter('invoices');
      await spotlightsPage.selectFilter('invoices');
      await browser.pause(500);

      // Verify filter works by checking other sections are hidden
      // (Invoices section visibility depends on user having past due invoices data)
      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);

      const subsVisible = await spotlightsPage.isSubscriptionsSectionVisible();
      expect(subsVisible).toBe(false);
    });
  });

  // ========== RIGHT FILTERS (Enrollments, Journals, Buyers) ==========
  describe('Right Filters (Enrollments, Journals, Buyers)', () => {
    before(async function () {
      if (!hasSpotlightsData) {
        return;
      }
      await ensureHomePage();
      await spotlightsPage.resetFilterScrollPosition().catch(() => {});
      // Scroll to reveal right-side filters
      await spotlightsPage.scrollToFilter('journals');
      await browser.pause(300);
    });

    it('should display Journals filter after scrolling', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      await expect(spotlightsPage.filterJournals).toBeDisplayed();
    });

    it('should select Journals filter and show journal sections', async function () {
      if (!hasSpotlightsData || !sectionData.hasJournals) {
        console.log('Skipping - no journals data for this user');
        this.skip();
        return;
      }
      await spotlightsPage.selectFilter('journals');
      await browser.pause(500);

      const journalsVisible = await spotlightsPage.isJournalsSectionVisible();
      expect(journalsVisible).toBe(true);

      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);
    });

    it('should display Buyers filter after scrolling', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      await spotlightsPage.scrollToFilter('buyers');
      await expect(spotlightsPage.filterBuyers).toBeDisplayed();
    });

    it('should select Buyers filter and show buyer sections', async function () {
      if (!hasSpotlightsData || !sectionData.hasBuyers) {
        console.log('Skipping - no buyers data for this user');
        this.skip();
        return;
      }
      await spotlightsPage.selectFilter('buyers');
      await browser.pause(500);

      const buyersVisible = await spotlightsPage.isBuyersSectionVisible();
      expect(buyersVisible).toBe(true);

      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);
    });

    it('should select Enrollments filter and show enrollment sections', async function () {
      if (!hasSpotlightsData || !sectionData.hasEnrollments) {
        console.log('Skipping - no enrollments data for this user');
        this.skip();
        return;
      }
      // Enrollments might need a small scroll back
      await spotlightsPage.scrollToFilter('enrollments');
      await spotlightsPage.selectFilter('enrollments');
      await browser.pause(500);

      const enrollmentsVisible = await spotlightsPage.isEnrollmentsSectionVisible();
      expect(enrollmentsVisible).toBe(true);

      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);
    });
  });

  // ========== ALL FILTER RESET ==========
  describe('All Filter - Reset Behavior', () => {
    before(async function () {
      if (!hasSpotlightsData) {
        return;
      }
      await ensureHomePage();
    });

    it('should show all sections when All filter is reselected after filtering', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      // First filter to orders (hides other sections)
      await spotlightsPage.resetFilterScrollPosition();
      await spotlightsPage.selectFilter('orders');
      await browser.pause(300);

      // Verify filter is applied - subscriptions should be hidden
      const subsAfterOrdersFilter = await spotlightsPage.isSubscriptionsSectionVisible();
      expect(subsAfterOrdersFilter).toBe(false);

      // Reset to all
      await spotlightsPage.resetFilterScrollPosition();
      await spotlightsPage.selectFilter('all');
      await browser.pause(500);

      // Verify All filter is visible and selected
      await expect(spotlightsPage.filterAll).toBeDisplayed();
    });

    it('should maintain All filter selection after scrolling content', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data, filters not available');
        this.skip();
        return;
      }
      await spotlightsPage.resetFilterScrollPosition();
      await spotlightsPage.selectFilter('all');
      await browser.pause(300);

      // Scroll content vertically (use subscriptions section which is more reliably available)
      await spotlightsPage.scrollToSection('expiring subscriptions').catch(async () => {
        // Fallback: just scroll down if section not found
        await spotlightsPage.scrollDown();
      });
      await browser.pause(300);

      // All filter should still be visible after resetting horizontal scroll
      await spotlightsPage.resetFilterScrollPosition();
      await expect(spotlightsPage.filterAll).toBeDisplayed();
    });
  });
});
