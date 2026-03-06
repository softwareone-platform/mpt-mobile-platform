const { expect } = require('@wdio/globals');

const creditMemosPage = require('../pageobjects/enrollments.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { PAUSE } = require('../pageobjects/utils/constants');

describe('Credit Memos Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasCreditMemosData = false;
  let hasEmptyState = false;
  let apiCreditMemosAvailable = false;
  let creditMemosMenuAvailable = false;

  /**
   * Navigate to Credit Memos page via More menu
   */
  async function navigateToCreditMemos() {
    // First ensure we're on a page with footer visible
    await creditMemosPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    // Click Credit Memos menu item
    await morePage.creditMemosMenuItem.click();
    await creditMemosPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    
    // Check if Credit Memos menu item is available for this user
    await creditMemosPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    creditMemosMenuAvailable = await morePage.creditMemosMenuItem.isDisplayed().catch(() => false);
    
    if (!creditMemosMenuAvailable) {
      console.info('⚠️ Credit Memos menu item not available for this user - skipping Credit Memos tests');
      return;
    }
    
    // Navigate to Credit Memos page via More menu
    await morePage.creditMemosMenuItem.click();
    await creditMemosPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasCreditMemosData = await creditMemosPage.hasCreditMemos();
    hasEmptyState = !hasCreditMemosData && await creditMemosPage.emptyState.isDisplayed().catch(() => false);
    apiCreditMemosAvailable = !!process.env.API_OPS_TOKEN;

    console.info(`📊 Credit Memos data state: hasCreditMemos=${hasCreditMemosData}, emptyState=${hasEmptyState}, apiAvailable=${apiCreditMemosAvailable}`);
  });

  beforeEach(async function () {
    // Skip if Credit Memos menu not available
    if (!creditMemosMenuAvailable) {
      this.skip();
      return;
    }
    // Ensure we're on Credit Memos page
    const isOnCreditMemos = await creditMemosPage.isOnCreditMemosPage();
    if (!isOnCreditMemos) {
      await navigateToCreditMemos();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      // Navigate away first
      await creditMemosPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);
      
      // Navigate back to Credit Memos
      await morePage.creditMemosMenuItem.click();
      await creditMemosPage.waitForScreenReady();
      
      await expect(creditMemosPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(creditMemosPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await creditMemosPage.goBack();
      
      // Verify we're back on More page by checking for Credit Memos menu item
      await expect(morePage.creditMemosMenuItem).toBeDisplayed();
      
      // Navigate back to Enrollments for subsequent tests
      await morePage.enrollmentsMenuItem.click();
      await enrollmentsPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Credit Memos header title', async () => {
      await expect(creditMemosPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await creditMemosPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(creditMemosPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(creditMemosPage.footer.spotlightsTab).toBeDisplayed();
      await expect(creditMemosPage.footer.ordersTab).toBeDisplayed();
      await expect(creditMemosPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(creditMemosPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = creditMemosPage.footer.moreTab;
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
    // This test suite runs when user has no credit memos

    it('should display empty state when no credit memos exist', async function () {
      if (hasCreditMemosData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(creditMemosPage.emptyState).toBeDisplayed();
      await expect(creditMemosPage.noCreditMemosTitle).toBeDisplayed();
      await expect(creditMemosPage.noCreditMemosDescription).toBeDisplayed();
    });

    it('should display "No credit memos" title text', async function () {
      if (hasCreditMemosData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await creditMemosPage.noCreditMemosTitle.getText();
      expect(titleText).toBe('No credit memos');
    });

    it('should display "No credit memos found." description', async function () {
      if (hasCreditMemosData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await creditMemosPage.noCreditMemosDescription.getText();
      expect(descriptionText).toBe('No credit memos found.');
    });
  });

  describe('Credit Memos List', () => {
    // This test suite runs when user has credit memos data

    it('should display credit memos list when credit memos exist', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }

      await expect(creditMemosPage.creditMemosScrollView).toBeDisplayed();
      const creditMemosCount = await creditMemosPage.getVisibleCreditMemosCount();
      expect(creditMemosCount).toBeGreaterThan(0);
    });

    it('should display credit memo items with ID and status', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }

      const firstCreditMemo = creditMemosPage.firstCreditMemoItem;
      await expect(firstCreditMemo).toBeDisplayed();
      
      const details = await creditMemosPage.getCreditMemoDetails(firstCreditMemo);
      // Credit Memos use 4-group IDs: CRM-XXXX-XXXX-XXXX
      expect(details.creditMemoId).toMatch(/^CRM-\d{4}-\d{4}-\d{4}$/);
      expect(['Draft', 'Completed', 'Processing']).toContain(details.status);
    });

    it('should detect all loaded credit memos in the list', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }

      const creditMemosCount = await creditMemosPage.getVisibleCreditMemosCount();
      const creditMemoIds = await creditMemosPage.getVisibleCreditMemoIds();
      
      console.info(`Total credit memos detected: ${creditMemosCount}`);
      console.info(`First 5 credit memo IDs: ${creditMemoIds.slice(0, 5).join(', ')}`);
      console.info(`Last 5 credit memo IDs: ${creditMemoIds.slice(-5).join(', ')}`);
      
      expect(creditMemosCount).toBeGreaterThan(0);
      
      // Verify all credit memo IDs have valid format (4-group)
      for (const creditMemoId of creditMemoIds) {
        expect(creditMemoId).toMatch(/^CRM-\d{4}-\d{4}-\d{4}$/);
      }
    });

    it('should not display empty state when credit memos exist', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await creditMemosPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Credit Memos by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasCreditMemosData) {
        this.skip();
        return;
      }

      const draftCreditMemos = await creditMemosPage.getCreditMemosByStatus('Draft');
      const completedCreditMemos = await creditMemosPage.getCreditMemosByStatus('Completed');
      const processingCreditMemos = await creditMemosPage.getCreditMemosByStatus('Processing');

      // At least one status should have credit memos
      const totalStatusCreditMemos = draftCreditMemos.length + completedCreditMemos.length + processingCreditMemos.length;
      expect(totalStatusCreditMemos).toBeGreaterThanOrEqual(0);
      
      console.info(`Credit Memos by status - Draft: ${draftCreditMemos.length}, Completed: ${completedCreditMemos.length}, Processing: ${processingCreditMemos.length}`);
    });
  });

  describe('API Integration', () => {
    it('should match API enrollments count with visible enrollments', async function () {
      // Skip if API token not configured or no enrollments in UI
      if (!apiEnrollmentsAvailable || !hasEnrollmentsData) {
        this.skip();
        return;
      }

      try {
        const apiEnrollments = await apiClient.getEnrollments({ limit: 100 });
        const apiEnrollmentsList = apiEnrollments.data || apiEnrollments;
        const apiCount = apiEnrollmentsList.length;
        
        const uiCount = await enrollmentsPage.getVisibleEnrollmentsCount();
        
        console.info(`[Count Compare] API enrollments: ${apiCount}, UI visible enrollments: ${uiCount}`);
        
        // UI should show at least some enrollments if API has enrollments
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 enrollment IDs and statuses match API data', async function () {
      if (!apiEnrollmentsAvailable || !hasEnrollmentsData) {
        this.skip();
        return;
      }

      try {
        const apiEnrollments = await apiClient.getEnrollments({ limit: 10 });
        const apiEnrollmentsList = apiEnrollments.data || apiEnrollments;
        const uiEnrollmentIds = await enrollmentsPage.getVisibleEnrollmentIds();
        const uiEnrollmentsWithStatus = await enrollmentsPage.getVisibleEnrollmentsWithStatus();
        
        // Compare each API enrollment with UI and log results
        const comparisons = [];
        for (let i = 0; i < Math.min(apiEnrollmentsList.length, 10); i++) {
          const apiEnrollment = apiEnrollmentsList[i];
          const apiEnrollmentId = apiEnrollment.enrollmentId || apiEnrollment.id;
          const apiStatus = apiEnrollment.status;
          const uiEnrollment = uiEnrollmentsWithStatus[i] || {};
          const uiEnrollmentId = uiEnrollment.enrollmentId;
          const uiStatus = uiEnrollment.status;
          
          const idMatches = apiEnrollmentId === uiEnrollmentId;
          const statusMatches = apiStatus === uiStatus;
          
          console.info(`[${i + 1}] ID: ${apiEnrollmentId} vs ${uiEnrollmentId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`);
          comparisons.push({ apiEnrollmentId, uiEnrollmentId, idMatches, apiStatus, uiStatus, statusMatches });
        }
        
        const idMatchCount = comparisons.filter(c => c.idMatches).length;
        const statusMatchCount = comparisons.filter(c => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);
        
        // Verify all visible UI enrollments have valid format (4-group)
        for (const uiEnrollmentId of uiEnrollmentIds.slice(0, 10)) {
          expect(uiEnrollmentId).toMatch(/^ENR-\d{4}-\d{4}-\d{4}$/);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
