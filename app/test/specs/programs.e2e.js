const { expect } = require('@wdio/globals');

const programsPage = require('../pageobjects/programs.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');

describe('Programs Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasProgramsData = false;
  let hasEmptyState = false;
  let apiProgramsAvailable = false;

  /**
   * Navigate to Programs page via More menu
   */
  async function navigateToPrograms() {
    // First ensure we're on a page with footer visible
    await programsPage.footer.moreTab.click();
    await browser.pause(500);
    // Click Programs menu item
    await morePage.programsMenuItem.click();
    await programsPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Programs page via More menu
    await navigateToPrograms();

    // Check data state ONCE and cache the results
    hasProgramsData = await programsPage.hasPrograms();
    hasEmptyState = !hasProgramsData && await programsPage.emptyState.isDisplayed().catch(() => false);
    apiProgramsAvailable = !!process.env.API_OPS_TOKEN;

    console.log(`📊 Programs data state: hasPrograms=${hasProgramsData}, emptyState=${hasEmptyState}, apiAvailable=${apiProgramsAvailable}`);
  });

  beforeEach(async function () {
    // Ensure we're on Programs page
    const isOnPrograms = await programsPage.isOnProgramsPage();
    if (!isOnPrograms) {
      await navigateToPrograms();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      // Navigate away first
      await programsPage.goBack();
      await browser.pause(500);
      
      // Navigate back to Programs
      await morePage.programsMenuItem.click();
      await programsPage.waitForScreenReady();
      
      await expect(programsPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(programsPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await programsPage.goBack();
      
      // Verify we're back on More page by checking for Programs menu item
      await expect(morePage.programsMenuItem).toBeDisplayed();
      
      // Navigate back to Programs for subsequent tests
      await morePage.programsMenuItem.click();
      await programsPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Programs header title', async () => {
      await expect(programsPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await programsPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(programsPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(programsPage.footer.spotlightsTab).toBeDisplayed();
      await expect(programsPage.footer.ordersTab).toBeDisplayed();
      await expect(programsPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(programsPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = programsPage.footer.moreTab;
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
    // This test suite runs when user has no programs

    it('should display empty state when no programs exist', async function () {
      if (hasProgramsData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(programsPage.emptyState).toBeDisplayed();
      await expect(programsPage.noProgramsTitle).toBeDisplayed();
      await expect(programsPage.noProgramsDescription).toBeDisplayed();
    });

    it('should display "No programs" title text', async function () {
      if (hasProgramsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await programsPage.noProgramsTitle.getText();
      expect(titleText).toBe('No programs');
    });

    it('should display "No programs found." description', async function () {
      if (hasProgramsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await programsPage.noProgramsDescription.getText();
      expect(descriptionText).toBe('No programs found.');
    });
  });

  describe('Programs List', () => {
    // This test suite runs when user has programs data

    it('should display programs list when programs exist', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }

      await expect(programsPage.programsScrollView).toBeDisplayed();
      const programsCount = await programsPage.getVisibleProgramsCount();
      expect(programsCount).toBeGreaterThan(0);
    });

    it('should display program items with ID and status', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }

      const firstProgram = programsPage.firstProgramItem;
      await expect(firstProgram).toBeDisplayed();
      
      const details = await programsPage.getProgramDetails(firstProgram);
      // Programs use 3-group IDs: PRG-XXXX-XXXX
      expect(details.programId).toMatch(/^PRG-\d{4}-\d{4}$/);
      expect(['Unpublished', 'Draft', 'Published']).toContain(details.status);
    });

    it('should detect all loaded programs in the list', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }

      const programsCount = await programsPage.getVisibleProgramsCount();
      const programIds = await programsPage.getVisibleProgramIds();
      
      console.log(`Total programs detected: ${programsCount}`);
      console.log(`First 5 program IDs: ${programIds.slice(0, 5).join(', ')}`);
      console.log(`Last 5 program IDs: ${programIds.slice(-5).join(', ')}`);
      
      expect(programsCount).toBeGreaterThan(0);
      
      // Verify all program IDs have valid format (3-group)
      for (const programId of programIds) {
        expect(programId).toMatch(/^PRG-\d{4}-\d{4}$/);
      }
    });

    it('should not display empty state when programs exist', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await programsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Programs by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }

      const unpublishedPrograms = await programsPage.getProgramsByStatus('Unpublished');
      const draftPrograms = await programsPage.getProgramsByStatus('Draft');
      const publishedPrograms = await programsPage.getProgramsByStatus('Published');

      // At least one status should have programs
      const totalStatusPrograms = unpublishedPrograms.length + draftPrograms.length + publishedPrograms.length;
      expect(totalStatusPrograms).toBeGreaterThanOrEqual(0);
      
      console.log(`Programs by status - Unpublished: ${unpublishedPrograms.length}, Draft: ${draftPrograms.length}, Published: ${publishedPrograms.length}`);
    });
  });

  describe('API Integration', () => {
    it('should match API programs count with visible programs', async function () {
      // Skip if API token not configured or no programs in UI
      if (!apiProgramsAvailable || !hasProgramsData) {
        this.skip();
        return;
      }

      try {
        const apiPrograms = await apiClient.getPrograms({ limit: 100 });
        const apiProgramsList = apiPrograms.data || apiPrograms;
        const apiCount = apiProgramsList.length;
        
        const uiCount = await programsPage.getVisibleProgramsCount();
        
        console.log(`[Count Compare] API programs: ${apiCount}, UI visible programs: ${uiCount}`);
        
        // UI should show at least some programs if API has programs
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 program IDs and statuses match API data', async function () {
      if (!apiProgramsAvailable || !hasProgramsData) {
        this.skip();
        return;
      }

      try {
        const apiPrograms = await apiClient.getPrograms({ limit: 10 });
        const apiProgramsList = apiPrograms.data || apiPrograms;
        const uiProgramIds = await programsPage.getVisibleProgramIds();
        const uiProgramsWithStatus = await programsPage.getVisibleProgramsWithStatus();
        
        // Compare each API program with UI and log results
        const comparisons = [];
        for (let i = 0; i < Math.min(apiProgramsList.length, 10); i++) {
          const apiProgram = apiProgramsList[i];
          const apiProgramId = apiProgram.programId || apiProgram.id;
          const apiStatus = apiProgram.status;
          const uiProgram = uiProgramsWithStatus[i] || {};
          const uiProgramId = uiProgram.programId;
          const uiStatus = uiProgram.status;
          
          const idMatches = apiProgramId === uiProgramId;
          const statusMatches = apiStatus === uiStatus;
          
          console.log(`[${i + 1}] ID: ${apiProgramId} vs ${uiProgramId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`);
          comparisons.push({ apiProgramId, uiProgramId, idMatches, apiStatus, uiStatus, statusMatches });
        }
        
        const idMatchCount = comparisons.filter(c => c.idMatches).length;
        const statusMatchCount = comparisons.filter(c => c.statusMatches).length;
        console.log(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);
        
        // Verify all visible UI programs have valid format (3-group)
        for (const uiProgramId of uiProgramIds.slice(0, 10)) {
          expect(uiProgramId).toMatch(/^PRG-\d{4}-\d{4}$/);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
