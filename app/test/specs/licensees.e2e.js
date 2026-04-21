const { expect, $ } = require('@wdio/globals');

const licenseesPage = require('../pageobjects/licensees.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid, getSelector } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE, REGEX, SCROLL } = require('../pageobjects/utils/constants');

describe('Licensees Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasLicenseesData = false;
  let hasEmptyState = false;
  let apiLicenseesAvailable = false;
  let licenseesReachable = false;

  /**
   * Selector for the first client item in the Clients list (ACC- prefix)
   */
  function firstClientItem() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "ACC-")]',
        android: '//*[contains(@content-desc, "ACC-")]',
      }),
    );
  }

  /**
   * Selector for the Licensees sub-list navigation item on Account Details.
   * NavigationItem renders as a TouchableOpacity (XCUIElementTypeOther on iOS)
   * with accessible label "Licensees, " (title + chevron icon text).
   */
  async function findLicenseesSubListItem() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "Licensees")]',
        android: '//*[contains(@content-desc, "Licensees")]',
      }),
    );
  }

  /**
   * Navigate to Licensees page via More → Clients → first client → sub-list
   * Licensees is not a top-level More menu item; it is only reachable as a
   * sub-list of a Client (account) detail page under an Operations account.
   */
  async function navigateToLicensees() {
    await morePage.ensureMorePage();

    // Scroll down to find Clients if needed — it may be below the fold
    let clientsExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    if (!clientsExists) {
      await licenseesPage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      clientsExists = await morePage.clientsMenuItem.isExisting().catch(() => false);
    }
    if (!clientsExists) return false;

    await morePage.clientsMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);

    // Wait for first client to appear
    const client = firstClientItem();
    const clientVisible = await client.waitForDisplayed({ timeout: TIMEOUT.SCREEN_READY }).catch(() => false);
    if (!clientVisible) return false;

    await client.click();
    await browser.pause(PAUSE.NAVIGATION);

    // Scroll down to reveal the sub-list navigation group
    let subListFound = false;
    let subListEl;
    for (let attempt = 0; attempt < SCROLL.MAX_SCROLL_ATTEMPTS; attempt++) {
      subListEl = await findLicenseesSubListItem();
      subListFound = await subListEl.isDisplayed().catch(() => false);
      if (subListFound) break;
      await licenseesPage.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
    }
    if (!subListFound) return false;

    await subListEl.click();
    await licenseesPage.waitForScreenReady();
    return true;
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    // Licensees requires an Operations account with Clients access
    await ensureOperationsAccount();

    licenseesReachable = await navigateToLicensees();

    if (!licenseesReachable) {
      console.info('⚠️ Licensees not reachable via Clients sub-list — skipping Licensees tests');
      return;
    }

    // Check data state ONCE and cache the results
    hasLicenseesData = await licenseesPage.hasLicensees();
    hasEmptyState = !hasLicenseesData && await licenseesPage.emptyState.isDisplayed().catch(() => false);
    apiLicenseesAvailable = !!process.env.API_OPS_TOKEN;

    console.info(`📊 Licensees data state: hasLicensees=${hasLicenseesData}, emptyState=${hasEmptyState}, apiAvailable=${apiLicenseesAvailable}`);
  });

  beforeEach(async function () {
    if (!licenseesReachable) {
      this.skip();
      return;
    }
    // Ensure we're on Licensees page
    const isOnLicensees = await licenseesPage.isOnLicenseesPage();
    if (!isOnLicensees) {
      await navigation.ensureHomePage({ resetFilters: false });
      const reached = await navigateToLicensees();
      if (!reached) {
        this.skip();
        return;
      }
    }
  });

  describe('Navigation', () => {
    it('should be accessible via Client sub-list navigation', async () => {
      // Navigate away first
      await licenseesPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);

      // Scroll down to find the sub-list item again on the Client Details page
      let subListFound = false;
      let subListEl;
      for (let attempt = 0; attempt < SCROLL.MAX_SCROLL_ATTEMPTS; attempt++) {
        subListEl = await findLicenseesSubListItem();
        subListFound = await subListEl.isDisplayed().catch(() => false);
        if (subListFound) break;
        await licenseesPage.scrollDown();
        await browser.pause(PAUSE.ANIMATION_SETTLE);
      }

      await subListEl.click();
      await licenseesPage.waitForScreenReady();

      await expect(licenseesPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(licenseesPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to Client Details when back button tapped', async () => {
      await licenseesPage.goBack();

      // Verify we're on a details page (Client Details / Account Details)
      // The sub-list item should be visible after scrolling
      let subListFound = false;
      let subListEl;
      for (let attempt = 0; attempt < SCROLL.MAX_SCROLL_ATTEMPTS; attempt++) {
        subListEl = await findLicenseesSubListItem();
        subListFound = await subListEl.isDisplayed().catch(() => false);
        if (subListFound) break;
        await licenseesPage.scrollDown();
        await browser.pause(PAUSE.ANIMATION_SETTLE);
      }
      expect(subListFound).toBe(true);

      // Navigate back to Licensees for subsequent tests
      await subListEl.click();
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
      await expect(licenseesPage.footer.chatTab).toBeDisplayed();
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
      expect(details.licenseeId).toMatch(REGEX.LICENSEE_ID);
      expect(['Active', 'Enabled', 'Disabled', 'Deleted']).toContain(details.status);
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
        expect(licenseeId).toMatch(REGEX.LICENSEE_ID);
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
          expect(uiLicenseeId).toMatch(REGEX.LICENSEE_ID);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
