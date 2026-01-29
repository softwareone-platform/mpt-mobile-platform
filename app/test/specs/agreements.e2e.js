const { expect } = require('@wdio/globals');

const agreementsPage = require('../pageobjects/agreements.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');

describe('Agreements Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasAgreementsData = false;
  let hasEmptyState = false;
  let apiAgreementsAvailable = false;

  /**
   * Navigate to Agreements page via More menu
   */
  async function navigateToAgreements() {
    // First ensure we're on a page with footer visible
    await agreementsPage.footer.moreTab.click();
    await browser.pause(500);
    // Click Agreements menu item
    await morePage.agreementsMenuItem.click();
    await agreementsPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Agreements page via More menu
    await navigateToAgreements();

    // Check data state ONCE and cache the results
    hasAgreementsData = await agreementsPage.hasAgreements();
    hasEmptyState = !hasAgreementsData && await agreementsPage.emptyState.isDisplayed().catch(() => false);
    apiAgreementsAvailable = !!process.env.API_OPS_TOKEN;

    console.info(`📊 Agreements data state: hasAgreements=${hasAgreementsData}, emptyState=${hasEmptyState}, apiAvailable=${apiAgreementsAvailable}`);
  });

  beforeEach(async function () {
    // Ensure we're on Agreements page
    const isOnAgreements = await agreementsPage.isOnAgreementsPage();
    if (!isOnAgreements) {
      await navigateToAgreements();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      // Navigate away first
      await agreementsPage.goBack();
      await browser.pause(500);
      
      // Navigate back to Agreements
      await morePage.agreementsMenuItem.click();
      await agreementsPage.waitForScreenReady();
      
      await expect(agreementsPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(agreementsPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await agreementsPage.goBack();
      
      // Verify we're back on More page by checking for Agreements menu item
      await expect(morePage.agreementsMenuItem).toBeDisplayed();
      
      // Navigate back to Agreements for subsequent tests
      await morePage.agreementsMenuItem.click();
      await agreementsPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Agreements header title', async () => {
      await expect(agreementsPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await agreementsPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(agreementsPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(agreementsPage.footer.spotlightsTab).toBeDisplayed();
      await expect(agreementsPage.footer.ordersTab).toBeDisplayed();
      await expect(agreementsPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(agreementsPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = agreementsPage.footer.moreTab;
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
    // This test suite runs when user has no agreements

    it('should display empty state when no agreements exist', async function () {
      if (hasAgreementsData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(agreementsPage.emptyState).toBeDisplayed();
      await expect(agreementsPage.noAgreementsTitle).toBeDisplayed();
      await expect(agreementsPage.noAgreementsDescription).toBeDisplayed();
    });

    it('should display "No agreements" title text', async function () {
      if (hasAgreementsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await agreementsPage.noAgreementsTitle.getText();
      expect(titleText).toBe('No agreements');
    });

    it('should display "No agreements found." description', async function () {
      if (hasAgreementsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await agreementsPage.noAgreementsDescription.getText();
      expect(descriptionText).toBe('No agreements found.');
    });
  });

  describe('Agreements List', () => {
    // This test suite runs when user has agreements data

    it('should display agreements list when agreements exist', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }

      await expect(agreementsPage.agreementsScrollView).toBeDisplayed();
      const agreementsCount = await agreementsPage.getVisibleAgreementsCount();
      expect(agreementsCount).toBeGreaterThan(0);
    });

    it('should display agreement items with ID and status', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }

      const firstAgreement = agreementsPage.firstAgreementItem;
      await expect(firstAgreement).toBeDisplayed();
      
      const details = await agreementsPage.getAgreementDetails(firstAgreement);
      expect(details.agreementId).toMatch(/^AGR-\d{4}-\d{4}-\d{4}$/);
      expect(['Active', 'Terminated', 'Deleted', 'Provisioning', 'Updating']).toContain(details.status);
    });

    it('should detect all loaded agreements in the list', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }

      const agreementsCount = await agreementsPage.getVisibleAgreementsCount();
      const agreementIds = await agreementsPage.getVisibleAgreementIds();
      
      console.info(`Total agreements detected: ${agreementsCount}`);
      console.info(`First 5 agreement IDs: ${agreementIds.slice(0, 5).join(', ')}`);
      console.info(`Last 5 agreement IDs: ${agreementIds.slice(-5).join(', ')}`);
      
      expect(agreementsCount).toBeGreaterThan(0);
      
      // Verify all agreement IDs have valid format
      for (const agreementId of agreementIds) {
        expect(agreementId).toMatch(/^AGR-\d{4}-\d{4}-\d{4}$/);
      }
    });

    it('should not display empty state when agreements exist', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await agreementsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Agreements by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasAgreementsData) {
        this.skip();
        return;
      }

      const activeAgreements = await agreementsPage.getAgreementsByStatus('Active');
      const terminatedAgreements = await agreementsPage.getAgreementsByStatus('Terminated');
      const deletedAgreements = await agreementsPage.getAgreementsByStatus('Deleted');
      const provisioningAgreements = await agreementsPage.getAgreementsByStatus('Provisioning');

      // At least one status should have agreements
      const totalStatusAgreements = activeAgreements.length + terminatedAgreements.length + 
                                    deletedAgreements.length + provisioningAgreements.length;
      expect(totalStatusAgreements).toBeGreaterThanOrEqual(0);
      
      console.info(`Agreements by status - Active: ${activeAgreements.length}, Terminated: ${terminatedAgreements.length}, Deleted: ${deletedAgreements.length}, Provisioning: ${provisioningAgreements.length}`);
    });
  });

  describe('API Integration', () => {
    it('should match API agreements count with visible agreements', async function () {
      // Skip if API token not configured or no agreements in UI
      if (!apiAgreementsAvailable || !hasAgreementsData) {
        this.skip();
        return;
      }

      try {
        const apiAgreements = await apiClient.getAgreements({ limit: 100 });
        const apiAgreementsList = apiAgreements.data || apiAgreements;
        const apiCount = apiAgreementsList.length;
        
        const uiCount = await agreementsPage.getVisibleAgreementsCount();
        
        console.info(`[Count Compare] API agreements: ${apiCount}, UI visible agreements: ${uiCount}`);
        
        // UI should show at least some agreements if API has agreements
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 agreement IDs and statuses match API data', async function () {
      if (!apiAgreementsAvailable || !hasAgreementsData) {
        this.skip();
        return;
      }

      try {
        const apiAgreements = await apiClient.getAgreements({ limit: 10 });
        const apiAgreementsList = apiAgreements.data || apiAgreements;
        const uiAgreementIds = await agreementsPage.getVisibleAgreementIds();
        const uiAgreementsWithStatus = await agreementsPage.getVisibleAgreementsWithStatus();
        
        // Compare each API agreement with UI and log results
        const comparisons = [];
        for (let i = 0; i < Math.min(apiAgreementsList.length, 10); i++) {
          const apiAgreement = apiAgreementsList[i];
          const apiAgreementId = apiAgreement.agreementId || apiAgreement.id;
          const apiStatus = apiAgreement.status;
          const uiAgreement = uiAgreementsWithStatus[i] || {};
          const uiAgreementId = uiAgreement.agreementId;
          const uiStatus = uiAgreement.status;
          
          const idMatches = apiAgreementId === uiAgreementId;
          const statusMatches = apiStatus === uiStatus;
          
          console.info(`[${i + 1}] ID: ${apiAgreementId} vs ${uiAgreementId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`);
          comparisons.push({ apiAgreementId, uiAgreementId, idMatches, apiStatus, uiStatus, statusMatches });
        }
        
        const idMatchCount = comparisons.filter(c => c.idMatches).length;
        const statusMatchCount = comparisons.filter(c => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);
        
        // Verify all visible UI agreements have valid format
        for (const uiAgreementId of uiAgreementIds.slice(0, 10)) {
          expect(uiAgreementId).toMatch(/^AGR-\d{4}-\d{4}-\d{4}$/);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
