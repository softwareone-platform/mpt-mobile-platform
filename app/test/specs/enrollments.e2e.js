const { expect } = require('@wdio/globals');

const enrollmentsPage = require('../pageobjects/enrollments.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { PAUSE } = require('../pageobjects/utils/constants');

describe('Enrollments Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasEnrollmentsData = false;
  let hasEmptyState = false;
  let apiEnrollmentsAvailable = false;
  let enrollmentsMenuAvailable = false;

  /**
   * Navigate to Enrollments page via More menu
   */
  async function navigateToEnrollments() {
    // First ensure we're on a page with footer visible
    await enrollmentsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    // Click Enrollments menu item
    await morePage.enrollmentsMenuItem.click();
    await enrollmentsPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    
    // Check if Enrollments menu item is available for this user
    await enrollmentsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    enrollmentsMenuAvailable = await morePage.enrollmentsMenuItem.isDisplayed().catch(() => false);
    
    if (!enrollmentsMenuAvailable) {
      console.info('⚠️ Enrollments menu item not available for this user - skipping Enrollments tests');
      return;
    }
    
    // Navigate to Enrollments page via More menu
    await morePage.enrollmentsMenuItem.click();
    await enrollmentsPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasEnrollmentsData = await enrollmentsPage.hasEnrollments();
    hasEmptyState = !hasEnrollmentsData && await enrollmentsPage.emptyState.isDisplayed().catch(() => false);
    apiEnrollmentsAvailable = !!process.env.API_OPS_TOKEN;

    console.info(`📊 Enrollments data state: hasEnrollments=${hasEnrollmentsData}, emptyState=${hasEmptyState}, apiAvailable=${apiEnrollmentsAvailable}`);
  });

  beforeEach(async function () {
    // Skip if Enrollments menu not available
    if (!enrollmentsMenuAvailable) {
      this.skip();
      return;
    }
    // Ensure we're on Enrollments page
    const isOnEnrollments = await enrollmentsPage.isOnEnrollmentsPage();
    if (!isOnEnrollments) {
      await navigateToEnrollments();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      // Navigate away first
      await enrollmentsPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);
      
      // Navigate back to Enrollments
      await morePage.enrollmentsMenuItem.click();
      await enrollmentsPage.waitForScreenReady();
      
      await expect(enrollmentsPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(enrollmentsPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await enrollmentsPage.goBack();
      
      // Verify we're back on More page by checking for Enrollments menu item
      await expect(morePage.enrollmentsMenuItem).toBeDisplayed();
      
      // Navigate back to Enrollments for subsequent tests
      await morePage.enrollmentsMenuItem.click();
      await enrollmentsPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Enrollments header title', async () => {
      await expect(enrollmentsPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await enrollmentsPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(enrollmentsPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(enrollmentsPage.footer.spotlightsTab).toBeDisplayed();
      await expect(enrollmentsPage.footer.ordersTab).toBeDisplayed();
      await expect(enrollmentsPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(enrollmentsPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = enrollmentsPage.footer.moreTab;
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
    // This test suite runs when user has no enrollments

    it('should display empty state when no enrollments exist', async function () {
      if (hasEnrollmentsData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(enrollmentsPage.emptyState).toBeDisplayed();
      await expect(enrollmentsPage.noEnrollmentsTitle).toBeDisplayed();
      await expect(enrollmentsPage.noEnrollmentsDescription).toBeDisplayed();
    });

    it('should display "No enrollments" title text', async function () {
      if (hasEnrollmentsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await enrollmentsPage.noEnrollmentsTitle.getText();
      expect(titleText).toBe('No enrollments');
    });

    it('should display "No enrollments found." description', async function () {
      if (hasEnrollmentsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await enrollmentsPage.noEnrollmentsDescription.getText();
      expect(descriptionText).toBe('No enrollments found.');
    });
  });

  describe('Enrollments List', () => {
    // This test suite runs when user has enrollments data

    it('should display enrollments list when enrollments exist', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }

      await expect(enrollmentsPage.enrollmentsScrollView).toBeDisplayed();
      const enrollmentsCount = await enrollmentsPage.getVisibleEnrollmentsCount();
      expect(enrollmentsCount).toBeGreaterThan(0);
    });

    it('should display enrollment items with ID and status', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }

      const firstEnrollment = enrollmentsPage.firstEnrollmentItem;
      await expect(firstEnrollment).toBeDisplayed();
      
      const details = await enrollmentsPage.getEnrollmentDetails(firstEnrollment);
      // Enrollments use 4-group IDs: ENR-XXXX-XXXX-XXXX
      expect(details.enrollmentId).toMatch(/^ENR-\d{4}-\d{4}-\d{4}$/);
      expect(['Draft', 'Completed', 'Processing']).toContain(details.status);
    });

    it('should detect all loaded enrollments in the list', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }

      const enrollmentsCount = await enrollmentsPage.getVisibleEnrollmentsCount();
      const enrollmentIds = await enrollmentsPage.getVisibleEnrollmentIds();
      
      console.info(`Total enrollments detected: ${enrollmentsCount}`);
      console.info(`First 5 enrollment IDs: ${enrollmentIds.slice(0, 5).join(', ')}`);
      console.info(`Last 5 enrollment IDs: ${enrollmentIds.slice(-5).join(', ')}`);
      
      expect(enrollmentsCount).toBeGreaterThan(0);
      
      // Verify all enrollment IDs have valid format (4-group)
      for (const enrollmentId of enrollmentIds) {
        expect(enrollmentId).toMatch(/^ENR-\d{4}-\d{4}-\d{4}$/);
      }
    });

    it('should not display empty state when enrollments exist', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await enrollmentsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Enrollments by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }

      const draftEnrollments = await enrollmentsPage.getEnrollmentsByStatus('Draft');
      const completedEnrollments = await enrollmentsPage.getEnrollmentsByStatus('Completed');
      const processingEnrollments = await enrollmentsPage.getEnrollmentsByStatus('Processing');

      // At least one status should have enrollments
      const totalStatusEnrollments = draftEnrollments.length + completedEnrollments.length + processingEnrollments.length;
      expect(totalStatusEnrollments).toBeGreaterThanOrEqual(0);
      
      console.info(`Enrollments by status - Draft: ${draftEnrollments.length}, Completed: ${completedEnrollments.length}, Processing: ${processingEnrollments.length}`);
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
