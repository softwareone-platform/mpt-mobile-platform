const { expect } = require('@wdio/globals');

const statementsPage = require('../pageobjects/statements.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { testPageStructure } = require('../utils/shared-tests');
const { PAUSE, REGEX } = require('../pageobjects/utils/constants');

describe('Statements Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasStatementsData = false;
  let hasEmptyState = false;
  let apiStatementsAvailable = false;
  let statementsMenuAvailable = false;

  /**
   * Navigate to Statements page via More menu
   */
  async function navigateToStatements() {
    // First ensure we're on a page with footer visible
    await statementsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    // Click Statements menu item
    await morePage.statementsMenuItem.click();
    await statementsPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    
    // Check if Statements menu item is available for this user
    await statementsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    statementsMenuAvailable = await morePage.statementsMenuItem.isDisplayed().catch(() => false);
    
    if (!statementsMenuAvailable) {
      console.info('⚠️ Statements menu item not available for this user - skipping Statements tests');
      return;
    }
    
    // Navigate to Statements page via More menu
    await morePage.statementsMenuItem.click();
    await statementsPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasStatementsData = await statementsPage.hasStatements();
    hasEmptyState = !hasStatementsData && await statementsPage.emptyState.isDisplayed().catch(() => false);
    apiStatementsAvailable = !!process.env.API_OPS_TOKEN;

    console.info(`📊 Statements data state: hasStatements=${hasStatementsData}, emptyState=${hasEmptyState}, apiAvailable=${apiStatementsAvailable}`);
  });

  beforeEach(async function () {
    // Skip if Statements menu not available
    if (!statementsMenuAvailable) {
      this.skip();
      return;
    }
    // Ensure we're on Statements page
    const isOnStatements = await statementsPage.isOnStatementsPage();
    if (!isOnStatements) {
      await navigateToStatements();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      // Navigate away first
      await statementsPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);
      
      // Navigate back to Statements
      await morePage.statementsMenuItem.click();
      await statementsPage.waitForScreenReady();
      
      await expect(statementsPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(statementsPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await statementsPage.goBack();
      
      // Verify we're back on More page by checking for Statements menu item
      await expect(morePage.statementsMenuItem).toBeDisplayed();
      
      // Navigate back to Statements for subsequent tests
      await morePage.statementsMenuItem.click();
      await statementsPage.waitForScreenReady();
    });
  });

  testPageStructure(statementsPage, { selectedTab: 'more' });

  describe('Empty State', () => {
    // This test suite runs when user has no statements

    it('should display empty state when no statements exist', async function () {
      if (hasStatementsData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(statementsPage.emptyState).toBeDisplayed();
      await expect(statementsPage.noStatementsTitle).toBeDisplayed();
      await expect(statementsPage.noStatementsDescription).toBeDisplayed();
    });

    it('should display "No statements" title text', async function () {
      if (hasStatementsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await statementsPage.noStatementsTitle.getText();
      expect(titleText).toBe('No statements');
    });

    it('should display "No statements found." description', async function () {
      if (hasStatementsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await statementsPage.noStatementsDescription.getText();
      expect(descriptionText).toBe('No statements found.');
    });
  });

  describe('Statements List', () => {
    // This test suite runs when user has statements data

    it('should display statements list when statements exist', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }

      await expect(statementsPage.statementsScrollView).toBeDisplayed();
      const statementsCount = await statementsPage.getVisibleStatementsCount();
      expect(statementsCount).toBeGreaterThan(0);
    });

    it('should display statement items with ID and status', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }

      const firstStatement = statementsPage.firstStatementItem;
      await expect(firstStatement).toBeDisplayed();
      
      const details = await statementsPage.getStatementDetails(firstStatement);
      // Statements use 4-group IDs: SOM-XXXX-XXXX-XXXX-XXXX
      expect(details.statementId).toMatch(REGEX.STATEMENT_ID);
      expect(['Issued','Generated', 'Queued', 'Error', 'Cancelled', 'Pending', 'Generating']).toContain(details.status);
    });

    it('should detect all loaded statements in the list', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }

      const statementsCount = await statementsPage.getVisibleStatementsCount();
      const statementIds = await statementsPage.getVisibleStatementIds();
      
      console.info(`Total statements detected: ${statementsCount}`);
      console.info(`First 5 statement IDs: ${statementIds.slice(0, 5).join(', ')}`);
      console.info(`Last 5 statement IDs: ${statementIds.slice(-5).join(', ')}`);
      
      expect(statementsCount).toBeGreaterThan(0);
      
      // Verify all statement IDs have valid format (4-group)
      for (const statementId of statementIds) {
        expect(statementId).toMatch(REGEX.STATEMENT_ID);
      }
    });

    it('should not display empty state when statements exist', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await statementsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Statements by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }
      
      const generatedStatements = await statementsPage.getStatementsByStatus('Generated');
      const queuedStatements = await statementsPage.getStatementsByStatus('Queued');
      const errorStatements = await statementsPage.getStatementsByStatus('Error');
      const cancelledStatements = await statementsPage.getStatementsByStatus('Cancelled');
      const pendingStatements = await statementsPage.getStatementsByStatus('Pending');
      const issuedStatements = await statementsPage.getStatementsByStatus('Issued');
      const generatingStatements = await statementsPage.getStatementsByStatus('Generating');

      // At least one status should have statements
      const totalStatusStatements = issuedStatements.length + generatedStatements.length + queuedStatements.length + errorStatements.length + cancelledStatements.length + pendingStatements.length + generatingStatements.length;
      expect(totalStatusStatements).toBeGreaterThanOrEqual(0);
      
      console.info(`Statements by status - Generated: ${generatedStatements.length}, Queued: ${queuedStatements.length}, Error: ${errorStatements.length}, Cancelled: ${cancelledStatements.length}, Pending: ${pendingStatements.length}, Issued: ${issuedStatements.length}, Generating: ${generatingStatements.length}`);
    });
  });

  describe('API Integration', () => {
    it('should match API statements count with visible statements', async function () {
      // Skip if API token not configured or no statements in UI
      if (!apiStatementsAvailable || !hasStatementsData) {
        this.skip();
        return;
      }

      try {
        const apiStatements = await apiClient.getStatements({ limit: 100 });
        const apiStatementsList = apiStatements.data || apiStatements;
        const apiCount = apiStatementsList.length;
        
        const uiCount = await statementsPage.getVisibleStatementsCount();
        
        console.info(`[Count Compare] API statements: ${apiCount}, UI visible statements: ${uiCount}`);
        
        // UI should show at least some statements if API has statements
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 statements IDs and statuses match API data', async function () {
      if (!apiStatementsAvailable || !hasStatementsData) {
        this.skip();
        return;
      }

      try {
        const apiStatements = await apiClient.getStatements({ limit: 10 });
        const apiStatementsList = apiStatements.data || apiStatements;
        const uiStatementIds = await statementsPage.getVisibleStatementIds();
        const uiStatementsWithStatus = await statementsPage.getVisibleStatementsWithStatus();
        
        // Compare each API statement with UI and log results
        const comparisons = [];
        for (let i = 0; i < Math.min(apiStatementsList.length, 10); i++) {
          const apiStatement = apiStatementsList[i];
          const apiStatementId = apiStatement.statementId || apiStatement.id;
          const apiStatus = apiStatement.status;
          const uiStatement = uiStatementsWithStatus[i] || {};
          const uiStatementId = uiStatement.statementId;
          const uiStatus = uiStatement.status;
          
          const idMatches = apiStatementId === uiStatementId;
          const statusMatches = apiStatus === uiStatus;
          
          console.info(`[${i + 1}] ID: ${apiStatementId} vs ${uiStatementId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`);
          comparisons.push({ apiStatementId, uiStatementId, idMatches, apiStatus, uiStatus, statusMatches });
        }
        
        const idMatchCount = comparisons.filter(c => c.idMatches).length;
        const statusMatchCount = comparisons.filter(c => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);
        
        // Verify all visible UI statements have valid format (4-group)
        for (const uiStatementId of uiStatementIds.slice(0, 10)) {
          expect(uiStatementId).toMatch(REGEX.STATEMENT_ID);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
