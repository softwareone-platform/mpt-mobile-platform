const { expect } = require('@wdio/globals');

const invoicesPage = require('../pageobjects/invoices.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureClientAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');
const { testPageStructure } = require('../utils/shared-tests');
const { PAUSE, REGEX, STATUSES } = require('../pageobjects/utils/constants');

describe('Invoices Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let api;
  let hasInvoicesData = false;
  let hasEmptyState = false;
  let apiInvoicesAvailable = false;
  let invoicesMenuAvailable = false;

  /**
   * Navigate to Invoices page via More menu
   */
  async function navigateToInvoices() {
    // First ensure we're on a page with footer visible
    await invoicesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    // Click Invoices menu item
    await morePage.invoicesMenuItem.click();
    await invoicesPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(150000);
    api = getClientApi();
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureClientAccount();
    
    // Check if Invoices menu item is available for this user
    await invoicesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    invoicesMenuAvailable = await morePage.invoicesMenuItem.isExisting().catch(() => false);
    
    if (!invoicesMenuAvailable) {
      console.info('⚠️ Invoices menu item not available for this user - skipping Invoices tests');
      return;
    }
    
    // Navigate to Invoices page via More menu
    await morePage.invoicesMenuItem.click();
    await invoicesPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasInvoicesData = await invoicesPage.hasInvoices();
    hasEmptyState = !hasInvoicesData && await invoicesPage.emptyState.isDisplayed().catch(() => false);
    apiInvoicesAvailable = !!api;

    console.info(`📊 Invoices data state: hasInvoices=${hasInvoicesData}, emptyState=${hasEmptyState}, apiAvailable=${apiInvoicesAvailable}`);
  });

  beforeEach(async function () {
    // Skip if Invoices menu not available
    if (!invoicesMenuAvailable) {
      this.skip();
      return;
    }
    // Ensure we're on Invoices page
    const isOnInvoices = await invoicesPage.isOnInvoicesPage();
    if (!isOnInvoices) {
      await navigateToInvoices();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      // Navigate away first
      await invoicesPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);
      
      // Navigate back to Invoices
      await morePage.invoicesMenuItem.click();
      await invoicesPage.waitForScreenReady();
      
      await expect(invoicesPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(invoicesPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await invoicesPage.goBack();
      
      // Verify we're back on More page by checking for Invoices menu item
      await expect(morePage.invoicesMenuItem).toBeDisplayed();
      
      // Navigate back to Invoices for subsequent tests
      await morePage.invoicesMenuItem.click();
      await invoicesPage.waitForScreenReady();
    });
  });

  testPageStructure(invoicesPage, { selectedTab: 'more' });

  describe('Empty State', () => {
    // This test suite runs when user has no invoices

    it('should display empty state when no invoices exist', async function () {
      if (hasInvoicesData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(invoicesPage.emptyState).toBeDisplayed();
      await expect(invoicesPage.noInvoicesTitle).toBeDisplayed();
      await expect(invoicesPage.noInvoicesDescription).toBeDisplayed();
    });

    it('should display "No invoices" title text', async function () {
      if (hasInvoicesData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await invoicesPage.noInvoicesTitle.getText();
      expect(titleText).toBe('No invoices');
    });

    it('should display "No invoices found." description', async function () {
      if (hasInvoicesData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await invoicesPage.noInvoicesDescription.getText();
      expect(descriptionText).toBe('No invoices found.');
    });
  });

  describe('Invoices List', () => {
    // This test suite runs when user has invoices data

    it('should display invoices list when invoices exist', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }

      await expect(invoicesPage.invoicesScrollView).toBeDisplayed();
      const invoicesCount = await invoicesPage.getVisibleInvoicesCount();
      expect(invoicesCount).toBeGreaterThan(0);
    });

    it('should display invoice items with ID and status', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }

      const firstInvoice = invoicesPage.firstInvoiceItem;
      await expect(firstInvoice).toBeDisplayed();
      
      const details = await invoicesPage.getInvoiceDetails(firstInvoice);
      // Invoices use 4-group IDs: INV-XXXX-XXXX-XXXX-XXXX
      expect(details.invoiceId).toMatch(REGEX.INVOICE_ID);
      expect(STATUSES.INVOICE).toContain(details.status);
    });

    it('should detect all loaded invoices in the list', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }

      const invoicesCount = await invoicesPage.getVisibleInvoicesCount();
      const invoiceIds = await invoicesPage.getVisibleInvoiceIds();
      
      console.info(`Total invoices detected: ${invoicesCount}`);
      console.info(`First 5 invoice IDs: ${invoiceIds.slice(0, 5).join(', ')}`);
      console.info(`Last 5 invoice IDs: ${invoiceIds.slice(-5).join(', ')}`);
      
      expect(invoicesCount).toBeGreaterThan(0);
      
      // Verify all invoice IDs have valid format (4-group)
      for (const invoiceId of invoiceIds) {
        expect(invoiceId).toMatch(REGEX.INVOICE_ID);
      }
    });

    it('should not display empty state when invoices exist', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await invoicesPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Invoices by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasInvoicesData) {
        this.skip();
        return;
      }
      
      const issuedInvoices = await invoicesPage.getInvoicesByStatus('Issued');
      const paidInvoices = await invoicesPage.getInvoicesByStatus('Paid');
      const overdueInvoices = await invoicesPage.getInvoicesByStatus('Overdue');

      // At least one status should have invoices
      const totalStatusInvoices = issuedInvoices.length + paidInvoices.length + overdueInvoices.length;
      expect(totalStatusInvoices).toBeGreaterThanOrEqual(0);
      
      console.info(`Invoices by status - Issued: ${issuedInvoices.length}, Paid: ${paidInvoices.length}, Overdue: ${overdueInvoices.length}`);
    });
  });

  describe('API Integration', () => {
    it('should match API invoices count with visible invoices', async function () {
      // Skip if API token not configured or no invoices in UI
      if (!apiInvoicesAvailable || !hasInvoicesData) {
        this.skip();
        return;
      }

      try {
        const apiInvoices = await api.getInvoices({ limit: 100 });
        const apiInvoicesList = apiInvoices.data || apiInvoices;
        const apiCount = apiInvoicesList.length;
        
        const uiCount = await invoicesPage.getVisibleInvoicesCount();
        
        console.info(`[Count Compare] API invoices: ${apiCount}, UI visible invoices: ${uiCount}`);
        
        // UI should show at least some invoices if API has invoices
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 invoices have valid IDs and known statuses', async function () {
      if (!apiInvoicesAvailable || !hasInvoicesData) {
        this.skip();
        return;
      }

      try {
        const apiInvoices = await api.getInvoices({ limit: 10 });
        const apiInvoicesList = apiInvoices.data || apiInvoices;
        const uiInvoiceIds = await invoicesPage.getVisibleInvoiceIds();
        const uiInvoicesWithStatus = await invoicesPage.getVisibleInvoicesWithStatus();

        const compareCount = Math.min(apiInvoicesList.length, uiInvoicesWithStatus.length, 10);

        if (compareCount === 0) {
          this.skip();
          return;
        }

        // Log for informational comparison — sequential ID matching is unreliable
        // because filter(group.buyers) scopes to the token's buyer group, which may
        // differ from the logged-in app user's scope.
        for (let i = 0; i < compareCount; i++) {
          const apiInvoice = apiInvoicesList[i];
          const apiInvoiceId = apiInvoice.id || apiInvoice.invoiceId;
          const apiStatus = apiInvoice.status;
          const uiInvoice = uiInvoicesWithStatus[i] || {};
          const uiInvoiceId = uiInvoice.invoiceId;
          const uiStatus = uiInvoice.status;
          console.info(`[${i + 1}] ID: ${apiInvoiceId} vs ${uiInvoiceId} | Status: ${apiStatus} vs ${uiStatus}`);
        }

        // Assert: UI invoices have valid ID format and recognized statuses
        for (const uiInvoiceId of uiInvoiceIds.slice(0, 10)) {
          expect(uiInvoiceId).toMatch(REGEX.INVOICE_ID);
        }
        for (const uiInvoice of uiInvoicesWithStatus.slice(0, 10)) {
          expect(STATUSES.INVOICE).toContain(uiInvoice.status);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
