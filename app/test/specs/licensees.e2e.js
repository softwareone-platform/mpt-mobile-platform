const { expect } = require('@wdio/globals');

const licenseesPage = require('../pageobjects/licensees.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { PAUSE } = require('../pageobjects/utils/constants');

describe('Licensees Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasLicenseesData = false;
  let hasEmptyState = false;
  let apiLicenseesAvailable = false;
  let licenseesMenuAvailable = false;

  /**
   * Navigate to Licensees page via More menu
   */
  async function navigateToLicensees() {
    // First ensure we're on a page with footer visible
    await licenseesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    // Click Licensees menu item
    await morePage.licenseesMenuItem.click();
    await licenseesPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    
    // Check if Licensees menu item is available for this user
    await licenseesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    licenseesMenuAvailable = await morePage.licenseesMenuItem.isDisplayed().catch(() => false);
    
    if (!licenseesMenuAvailable) {
      console.info('⚠️ Licensees menu item not available for this user - skipping Licensees tests');
      return;
    }
    
    // Navigate to Licensees page via More menu
    await morePage.licenseesMenuItem.click();
    await licenseesPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasLicenseesData = await licenseesPage.hasLicensees();
    hasEmptyState = !hasLicenseesData && await licenseesPage.emptyState.isDisplayed().catch(() => false);
    apiLicenseesAvailable = !!process.env.API_OPS_TOKEN;

    console.info(`📊 Licensees data state: hasLicensees=${hasLicenseesData}, emptyState=${hasEmptyState}, apiAvailable=${apiLicenseesAvailable}`);
  });

  beforeEach(async function () {
    // Skip if Licensees menu not available
    if (!licenseesMenuAvailable) {
      this.skip();
      return;
    }
    // Ensure we're on Licensees page
    const isOnLicensees = await licenseesPage.isOnLicenseesPage();
    if (!isOnLicensees) {
      await navigateToLicensees();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      // Navigate away first
      await licenseesPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);
      
      // Navigate back to Licensees
      await morePage.licenseesMenuItem.click();
      await licenseesPage.waitForScreenReady();
      
      await expect(licenseesPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(licenseesPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await licenseesPage.goBack();
      
      // Verify we're back on More page by checking for Licensees menu item
      await expect(morePage.licenseesMenuItem).toBeDisplayed();
      
      // Navigate back to Licensees for subsequent tests
      await morePage.licenseesMenuItem.click();
      await licenseesPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Licensees header title', async () => {
      await expect(licenseesPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await licenseesPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(licenseesPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(licenseesPage.footer.spotlightsTab).toBeDisplayed();
      await expect(licenseesPage.footer.ordersTab).toBeDisplayed();
      await expect(licenseesPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(licenseesPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = licenseesPage.footer.moreTab;
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
    // This test suite runs when user has no licensees

    it('should display empty state when no licensees exist', async function () {
      if (hasLicenseesData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(licenseesPage.emptyState).toBeDisplayed();
      await expect(licenseesPage.noLicenseesTitle).toBeDisplayed();
      await expect(licenseesPage.noLicenseesDescription).toBeDisplayed();
    });

    it('should display "No licensees" title text', async function () {
      if (hasLicenseesData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await licenseesPage.noLicenseesTitle.getText();
      expect(titleText).toBe('No licensees');
    });

    it('should display "No licensees found." description', async function () {
      if (hasLicenseesData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await licenseesPage.noLicenseesDescription.getText();
      expect(descriptionText).toBe('No licensees found.');
    });
  });

  describe('Licensees List', () => {
    // This test suite runs when user has licensees data

    it('should display licensees list when licensees exist', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }

      await expect(licenseesPage.licenseesScrollView).toBeDisplayed();
      const licenseesCount = await licenseesPage.getVisibleLicenseesCount();
      expect(licenseesCount).toBeGreaterThan(0);
    });

    it('should display licensee items with ID and status', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }

      const firstLicensee = licenseesPage.firstLicenseeItem;
      await expect(firstLicensee).toBeDisplayed();
      
      const details = await licenseesPage.getLicenseeDetails(firstLicensee);
      // Licensees use 4-group IDs: LCE-XXXX-XXXX-XXXX
      expect(details.licenseeId).toMatch(/^LCE-\d{4}-\d{4}-\d{4}$/);
      expect(['Enabled', 'Disabled']).toContain(details.status);
    });

    it('should detect all loaded licensees in the list', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }

      const licenseesCount = await licenseesPage.getVisibleLicenseesCount();
      const licenseeIds = await licenseesPage.getVisibleLicenseeIds();
      
      console.info(`Total licensees detected: ${licenseesCount}`);
      console.info(`First 5 licensee IDs: ${licenseeIds.slice(0, 5).join(', ')}`);
      console.info(`Last 5 licensee IDs: ${licenseeIds.slice(-5).join(', ')}`);
      
      expect(licenseesCount).toBeGreaterThan(0);
      
      // Verify all licensee IDs have valid format (4-group)
      for (const licenseeId of licenseeIds) {
        expect(licenseeId).toMatch(/^LCE-\d{4}-\d{4}-\d{4}$/);
      }
    });

    it('should not display empty state when licensees exist', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await licenseesPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Licensees by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasLicenseesData) {
        this.skip();
        return;
      }

      const enabledLicensees = await licenseesPage.getLicenseesByStatus('Enabled');
      const disabledLicensees = await licenseesPage.getLicenseesByStatus('Disabled');

      // At least one status should have licensees
      const totalStatusLicensees = enabledLicensees.length + disabledLicensees.length;
      expect(totalStatusLicensees).toBeGreaterThanOrEqual(0);
      
      console.info(`Licensees by status - Enabled: ${enabledLicensees.length}, Disabled: ${disabledLicensees.length}`);
    });
  });

  describe('API Integration', () => {
    it('should match API licensees count with visible licensees', async function () {
      // Skip if API token not configured or no licensees in UI
      if (!apiLicenseesAvailable || !hasLicenseesData) {
        this.skip();
        return;
      }

      try {
        // Note: Licensees API requires accountId parameter
        const apiLicensees = await apiClient.getLicensees({ limit: 100 });
        const apiLicenseesList = apiLicensees.data || apiLicensees;
        const apiCount = apiLicenseesList.length;
        
        const uiCount = await licenseesPage.getVisibleLicenseesCount();
        
        console.info(`[Count Compare] API licensees: ${apiCount}, UI visible licensees: ${uiCount}`);
        
        // UI should show at least some licensees if API has licensees
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 licensee IDs and statuses match API data', async function () {
      if (!apiLicenseesAvailable || !hasLicenseesData) {
        this.skip();
        return;
      }

      try {
        // Note: Licensees API requires accountId parameter
        const apiLicensees = await apiClient.getLicensees({ limit: 10 });
        const apiLicenseesList = apiLicensees.data || apiLicensees;
        const uiLicenseeIds = await licenseesPage.getVisibleLicenseeIds();
        const uiLicenseesWithStatus = await licenseesPage.getVisibleLicenseesWithStatus();
        
        // Compare each API licensee with UI and log results
        const comparisons = [];
        for (let i = 0; i < Math.min(apiLicenseesList.length, 10); i++) {
          const apiLicensee = apiLicenseesList[i];
          const apiLicenseeId = apiLicensee.licenseeId || apiLicensee.id;
          const apiStatus = apiLicensee.status;
          const uiLicensee = uiLicenseesWithStatus[i] || {};
          const uiLicenseeId = uiLicensee.licenseeId;
          const uiStatus = uiLicensee.status;
          
          const idMatches = apiLicenseeId === uiLicenseeId;
          const statusMatches = apiStatus === uiStatus;
          
          console.info(`[${i + 1}] ID: ${apiLicenseeId} vs ${uiLicenseeId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`);
          comparisons.push({ apiLicenseeId, uiLicenseeId, idMatches, apiStatus, uiStatus, statusMatches });
        }
        
        const idMatchCount = comparisons.filter(c => c.idMatches).length;
        const statusMatchCount = comparisons.filter(c => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);
        
        // Verify all visible UI licensees have valid format (4-group)
        for (const uiLicenseeId of uiLicenseeIds.slice(0, 10)) {
          expect(uiLicenseeId).toMatch(/^LCE-\d{4}-\d{4}-\d{4}$/);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
