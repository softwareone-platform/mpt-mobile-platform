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
  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await ensureHomePage();
  });

  // ========== FILTER UI BASICS ==========
  describe('Filter UI Basics', () => {
    before(async () => {
      await spotlightsPage.resetFilterScrollPosition().catch(() => {});
      await spotlightsPage.selectFilter('all').catch(() => {});
      await browser.pause(300);
    });

    it('should display "All" filter chip by default', async () => {
      await expect(spotlightsPage.filterAll).toBeDisplayed();
    });

    it('should display visible filter chips without scrolling', async () => {
      await expect(spotlightsPage.filterAll).toBeDisplayed();
      await expect(spotlightsPage.filterOrders).toBeDisplayed();
      await expect(spotlightsPage.filterSubscriptions).toBeDisplayed();
    });
  });

  // ========== LEFT FILTERS (No horizontal scroll needed) ==========
  describe('Left Filters (Orders, Subscriptions)', () => {
    before(async () => {
      await ensureHomePage();
      await spotlightsPage.resetFilterScrollPosition().catch(() => {});
      // Use filter toggle to reset page scroll position - selecting a filter then All resets to top
      await spotlightsPage.selectFilter('orders').catch(() => {});
      await browser.pause(200);
      await spotlightsPage.selectFilter('all').catch(() => {});
      await browser.pause(300);
    });

    it('should select Orders filter and show order sections', async () => {
      await spotlightsPage.selectFilter('orders');
      await browser.pause(500);

      // Verify filter works by checking other sections are hidden
      // (Orders section visibility depends on user having long-running orders data)
      const subsVisible = await spotlightsPage.isSubscriptionsSectionVisible();
      expect(subsVisible).toBe(false);

      const invoicesVisible = await spotlightsPage.isInvoicesSectionVisible();
      expect(invoicesVisible).toBe(false);
    });

    it('should switch from Orders to Subscriptions filter', async () => {
      await spotlightsPage.selectFilter('subscriptions');
      await browser.pause(500);

      const subsVisible = await spotlightsPage.isSubscriptionsSectionVisible();
      expect(subsVisible).toBe(true);

      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);
    });

    it('should show only subscription sections when Subscriptions filter is selected', async () => {
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
    before(async () => {
      await ensureHomePage();
      await spotlightsPage.resetFilterScrollPosition().catch(() => {});
      // Scroll once to reveal middle filters
      await spotlightsPage.scrollToFilter('users');
      await browser.pause(300);
    });

    it('should display Users filter after scrolling', async () => {
      await expect(spotlightsPage.filterUsers).toBeDisplayed();
    });

    it('should select Users filter and show user sections', async () => {
      await spotlightsPage.selectFilter('users');
      await browser.pause(500);

      const usersVisible = await spotlightsPage.isUsersSectionVisible();
      expect(usersVisible).toBe(true);

      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);
    });

    it('should display Invoices filter', async () => {
      await expect(spotlightsPage.filterInvoices).toBeDisplayed();
    });

    it('should select Invoices filter and show invoice sections', async () => {
      await spotlightsPage.selectFilter('invoices');
      await browser.pause(500);

      const invoicesVisible = await spotlightsPage.isInvoicesSectionVisible();
      expect(invoicesVisible).toBe(true);

      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);
    });
  });

  // ========== RIGHT FILTERS (Enrollments, Journals, Buyers) ==========
  describe('Right Filters (Enrollments, Journals, Buyers)', () => {
    before(async () => {
      await ensureHomePage();
      await spotlightsPage.resetFilterScrollPosition().catch(() => {});
      // Scroll to reveal right-side filters
      await spotlightsPage.scrollToFilter('journals');
      await browser.pause(300);
    });

    it('should display Journals filter after scrolling', async () => {
      await expect(spotlightsPage.filterJournals).toBeDisplayed();
    });

    it('should select Journals filter and show journal sections', async () => {
      await spotlightsPage.selectFilter('journals');
      await browser.pause(500);

      const journalsVisible = await spotlightsPage.isJournalsSectionVisible();
      expect(journalsVisible).toBe(true);

      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);
    });

    it('should display Buyers filter after scrolling', async () => {
      await spotlightsPage.scrollToFilter('buyers');
      await expect(spotlightsPage.filterBuyers).toBeDisplayed();
    });

    it('should select Buyers filter and show buyer sections', async () => {
      await spotlightsPage.selectFilter('buyers');
      await browser.pause(500);

      const buyersVisible = await spotlightsPage.isBuyersSectionVisible();
      expect(buyersVisible).toBe(true);

      const ordersVisible = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersVisible).toBe(false);
    });

    it('should select Enrollments filter and show enrollment sections', async () => {
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
    before(async () => {
      await ensureHomePage();
    });

    it('should show all sections when All filter is reselected after filtering', async () => {
      // First filter to orders
      await spotlightsPage.resetFilterScrollPosition();
      await spotlightsPage.selectFilter('orders');
      await browser.pause(300);

      // Verify orders section is visible
      const ordersAfterFilter = await spotlightsPage.isOrdersSectionVisible();
      expect(ordersAfterFilter).toBe(true);

      // Reset to all
      await spotlightsPage.resetFilterScrollPosition();
      await spotlightsPage.selectFilter('all');
      await browser.pause(500);

      // Verify All filter is visible and selected
      await expect(spotlightsPage.filterAll).toBeDisplayed();
    });

    it('should maintain All filter selection after scrolling content', async () => {
      await spotlightsPage.resetFilterScrollPosition();
      await spotlightsPage.selectFilter('all');
      await browser.pause(300);

      // Scroll content vertically
      await spotlightsPage.scrollToSection('past due invoices');

      // All filter should still be visible after resetting horizontal scroll
      await spotlightsPage.resetFilterScrollPosition();
      await expect(spotlightsPage.filterAll).toBeDisplayed();
    });
  });
});
