const { expect } = require('@wdio/globals');

const journalDetailsPage = require('../pageobjects/journal-details.page');
const journalsPage = require('../pageobjects/journals.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const {
  ensureOperationsAccount,
  ensureClientAccount,
  ensureVendorAccount,
  CLIENT_ACCOUNT_ID,
  VENDOR_ACCOUNT_ID,
} = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

describe('Journal Details Page', () => {
  let hasJournalsData = false;
  let apiAvailable = false;
  let testJournalId = null;
  let apiJournalData = null;
  let journalsMenuAvailable = false;

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
      console.info(
        '⚠️ Journals menu item not available for this user - skipping Journal Details tests',
      );
      return;
    }

    await morePage.journalsMenuItem.click();
    await journalsPage.waitForScreenReady();

    hasJournalsData = await journalsPage.hasJournals();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasJournalsData) {
      const journalIds = await journalsPage.getVisibleJournalIds();
      testJournalId = journalIds[0];

      if (apiAvailable && testJournalId) {
        try {
          apiJournalData = await apiClient.getJournalById(testJournalId);
          console.info(`📊 Pre-fetched API data for journal: ${testJournalId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Journal Details test setup: hasJournals=${hasJournalsData}, apiAvailable=${apiAvailable}, testJournalId=${testJournalId}`,
    );

    if (hasJournalsData && testJournalId) {
      await journalsPage.tapJournal(testJournalId);
      await journalDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Journal header title', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      await expect(journalDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Journal ID', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      await expect(journalDetailsPage.journalIdText).toBeDisplayed();
      const journalId = await journalDetailsPage.getItemId();
      expect(journalId).toBeTruthy();
    });

    it('should display the status field', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const status = await journalDetailsPage.getStatus();
      expect(status).toBeTruthy();
    });

    it('should display the Product field', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const product = await journalDetailsPage.getCompositeFieldValueByLabel('Product', true);
      expect(product).toBeTruthy();
    });

    it('should display the Owner field', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const owner = await journalDetailsPage.getCompositeFieldValueByLabel('Owner', true);
      expect(owner).toBeTruthy();
    });

    it('should display the Due date field', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const dueDate = await journalDetailsPage.getSimpleFieldValue('Due date', true);
      expect(dueDate).toBeDefined();
    });

    it('should display the Base currency field', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const currency = await journalDetailsPage.getSimpleFieldValue('Base currency', true);
      expect(currency).toBeTruthy();
    });

    it('should display the All charges field', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const charges = await journalDetailsPage.getSimpleFieldValue('All charges', true);
      expect(charges).toBeDefined();
    });

    it('should NOT display an avatar in the header', async function () {
      if (!hasJournalsData) {
        this.skip();
        return;
      }
      const avatarExists = await journalDetailsPage.headerAvatarWrapper.isExisting().catch(() => false);
      expect(avatarExists).toBe(false);
    });
  });

  describe('API Data Validation', () => {
    it('should match Journal ID with API response', async function () {
      if (!hasJournalsData || !apiAvailable || !apiJournalData) {
        this.skip();
        return;
      }
      const uiJournalId = await journalDetailsPage.getItemId();
      expect(uiJournalId).toBe(apiJournalData.id);
    });

    it('should match status with API response', async function () {
      if (!hasJournalsData || !apiAvailable || !apiJournalData) {
        this.skip();
        return;
      }
      const uiStatus = await journalDetailsPage.getStatus();
      expect(uiStatus).toBe(apiJournalData.status);
    });

    it('should log all journal details for comparison', async function () {
      if (!hasJournalsData || !apiAvailable || !apiJournalData) {
        this.skip();
        return;
      }
      const uiDetails = await journalDetailsPage.getAllJournalDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Journal Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Journal ID:   UI="${uiDetails.journalId}" | API="${apiJournalData.id}"`);
      console.info(`Status:       UI="${uiDetails.status}" | API="${apiJournalData.status}"`);
      console.info(`Product:      UI="${uiDetails.product}" | API="${apiJournalData.product?.name}"`);
      console.info(`Owner:        UI="${uiDetails.owner}" | API="${apiJournalData.owner?.name}"`);
      console.info(`Due Date:     UI="${uiDetails.dueDate}"`);
      console.info(`Currency:     UI="${uiDetails.baseCurrency}" | API="${apiJournalData.price?.currency}"`);
      console.info(`All Charges:  UI="${uiDetails.allCharges}" | API="${apiJournalData.processing?.total}"`);
      console.info(`Assignee:     UI="${uiDetails.assignee}" | API="${apiJournalData.assignee?.name}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.journalId).toBe(apiJournalData.id);
    });
  });
});

describe('[MPT-18620] Journal Details - Role-Based Access', function () {
  it('should NOT show Journals menu item for Client account', async function () {
    if (!CLIENT_ACCOUNT_ID) { this.skip(); return; }
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureClientAccount();
    await journalsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const journalsItemVisible = await morePage.journalsMenuItem.isExisting().catch(() => false);
    expect(journalsItemVisible).toBe(false);
    await ensureOperationsAccount();
  });

  it('should show Journals menu item for Vendor account', async function () {
    if (!VENDOR_ACCOUNT_ID) { this.skip(); return; }
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureVendorAccount();
    await journalsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const journalsItemVisible = await morePage.journalsMenuItem.isExisting().catch(() => false);
    expect(journalsItemVisible).toBe(true);
    await ensureOperationsAccount();
  });

  it('should show Ignored charges field for Operations account', async function () {
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureOperationsAccount();
    await journalsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const available = await morePage.journalsMenuItem.isExisting().catch(() => false);
    if (!available) { this.skip(); return; }
    await morePage.journalsMenuItem.click();
    await journalsPage.waitForScreenReady();
    const hasJournals = await journalsPage.hasJournals();
    if (!hasJournals) { this.skip(); return; }
    const ids = await journalsPage.getVisibleJournalIds();
    await journalsPage.tapJournal(ids[0]);
    await journalDetailsPage.waitForPageReady();
    const ignoredCharges = await journalDetailsPage.getSimpleFieldValue('Ignored charges', true);
    expect(ignoredCharges).toBeDefined();
  });

  it('should hide Ignored charges field for Vendor account', async function () {
    if (!VENDOR_ACCOUNT_ID) { this.skip(); return; }
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureVendorAccount();
    await journalsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const available = await morePage.journalsMenuItem.isExisting().catch(() => false);
    if (!available) { await ensureOperationsAccount(); this.skip(); return; }
    await morePage.journalsMenuItem.click();
    await journalsPage.waitForScreenReady();
    const hasJournals = await journalsPage.hasJournals();
    if (!hasJournals) { await ensureOperationsAccount(); this.skip(); return; }
    const ids = await journalsPage.getVisibleJournalIds();
    await journalsPage.tapJournal(ids[0]);
    await journalDetailsPage.waitForPageReady();
    const ignoredCharges = await journalDetailsPage.getSimpleFieldValue('Ignored charges', false);
    expect(ignoredCharges).toBeFalsy();
    await ensureOperationsAccount();
  });
});
