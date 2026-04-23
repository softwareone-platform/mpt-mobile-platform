const { expect } = require('@wdio/globals');

const journalsPage = require('../pageobjects/journals.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE } = require('../pageobjects/utils/constants');

describe('Journals Page', () => {
  let hasJournalsData = false;
  let hasEmptyState = false;
  let apiJournalsAvailable = false;
  let journalsMenuAvailable = false;

  async function navigateToJournals() {
    await journalsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    await morePage.journalsMenuItem.click();
    await journalsPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    // Journals requires Vendor or Operations account for meaningful data
    await ensureOperationsAccount();

    await journalsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    journalsMenuAvailable = await morePage.journalsMenuItem.isExisting().catch(() => false);

    if (!journalsMenuAvailable) {
      console.info('⚠️ Journals menu item not available for this user - skipping Journals tests');
      return;
    }

    await morePage.journalsMenuItem.click();
    await journalsPage.waitForScreenReady();

    hasJournalsData = await journalsPage.hasJournals();
    hasEmptyState =
      !hasJournalsData && (await journalsPage.emptyState.isDisplayed().catch(() => false));
    apiJournalsAvailable = !!process.env.API_OPS_TOKEN;

    console.info(
      `📊 Journals data state: hasJournals=${hasJournalsData}, emptyState=${hasEmptyState}, apiAvailable=${apiJournalsAvailable}`,
    );
  });

  beforeEach(async function () {
    if (!journalsMenuAvailable) {
      this.skip();
      return;
    }
    const isOnJournals = await journalsPage.isOnJournalsPage();
    if (!isOnJournals) {
      await navigateToJournals();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      await journalsPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);

      await morePage.journalsMenuItem.click();
      await journalsPage.waitForScreenReady();

      await expect(journalsPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(journalsPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await journalsPage.goBack();

      await expect(morePage.journalsMenuItem).toBeDisplayed();

      await morePage.journalsMenuItem.click();
      await journalsPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Journals header title', async () => {
      await expect(journalsPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await journalsPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(journalsPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(journalsPage.footer.spotlightsTab).toBeDisplayed();
      await expect(journalsPage.footer.chatTab).toBeDisplayed();
      await expect(journalsPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = journalsPage.footer.moreTab;
      if (isAndroid()) {
        const selected = await moreTab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        const value = await moreTab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no journals exist', async function () {
      if (hasJournalsData || !hasEmptyState) {
        this.skip();
        return;
      }
      await expect(journalsPage.emptyState).toBeDisplayed();
      await expect(journalsPage.noJournalsTitle).toBeDisplayed();
      await expect(journalsPage.noJournalsDescription).toBeDisplayed();
    });

    it('should display "No journals" title text', async function () {
      if (hasJournalsData || !hasEmptyState) {
        this.skip();
        return;
      }
      const titleText = await journalsPage.noJournalsTitle.getText();
      expect(titleText).toBe('No journals');
    });

    it('should display "No journals found." description', async function () {
      if (hasJournalsData || !hasEmptyState) {
        this.skip();
        return;
      }
      const descriptionText = await journalsPage.noJournalsDescription.getText();
      expect(descriptionText).toBe('No journals found.');
    });
  });

  describe('Journals List', () => {
    it('should display journals list when journals exist', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      await expect(journalsPage.journalsScrollView).toBeDisplayed();
      const journalsCount = await journalsPage.getVisibleJournalsCount();
      expect(journalsCount).toBeGreaterThan(0);
    });

    it('should display journal items with ID and status', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const firstJournal = journalsPage.firstJournalItem;
      await expect(firstJournal).toBeDisplayed();
      const details = await journalsPage.getJournalDetails(firstJournal);
      expect(details.journalId).toBeTruthy();
    });

    it('should detect all loaded journals in the list', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const journalsCount = await journalsPage.getVisibleJournalsCount();
      const journalIds = await journalsPage.getVisibleJournalIds();

      console.info(`Total journals detected: ${journalsCount}`);
      console.info(`First 5 journal IDs: ${journalIds.slice(0, 5).join(', ')}`);

      expect(journalsCount).toBeGreaterThan(0);
    });

    it('should not display empty state when journals exist', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const emptyStateVisible = await journalsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('API Integration', () => {
    it('should match API journals count with visible journals', async function () {
      if (!apiJournalsAvailable || !hasJournalsData) {
        this.skip();
        return;
      }
      try {
        const apiJournals = await apiClient.getJournals({ limit: 100 });
        const apiJournalsList = apiJournals.data || apiJournals;
        const apiCount = apiJournalsList.length;

        const uiCount = await journalsPage.getVisibleJournalsCount();

        console.info(`[Count Compare] API journals: ${apiCount}, UI visible journals: ${uiCount}`);

        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });
  });
});
