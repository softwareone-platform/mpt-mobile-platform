const { expect } = require('@wdio/globals');

const statementDetailsPage = require('../pageobjects/statement-details.page');
const statementsPage = require('../pageobjects/statements.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureOperationsAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

describe('Statement Details Page', () => {
  let hasStatementsData = false;
  let apiAvailable = false;
  let testStatementId = null;
  let apiStatementData = null;
  let statementsMenuAvailable = false;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    // Statements requires an Operations account for meaningful data
    await ensureOperationsAccount();

    await statementsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);

    statementsMenuAvailable = await morePage.statementsMenuItem.isExisting().catch(() => false);
    if (!statementsMenuAvailable) {
      console.info('⚠️ Statements menu item not available for this user - skipping Statement Details tests');
      return;
    }

    await morePage.statementsMenuItem.click();
    await statementsPage.waitForScreenReady();

    hasStatementsData = await statementsPage.hasStatements();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasStatementsData) {
      const statementsWithStatus = await statementsPage.getVisibleStatementsWithStatus();
      const issuedStatement = statementsWithStatus.find((s) => s.status === 'Issued');
      testStatementId = issuedStatement ? issuedStatement.id : statementsWithStatus[0]?.id;

      if (apiAvailable && testStatementId) {
        try {
          apiStatementData = await apiClient.getStatementById(testStatementId);
          console.info(`📊 Pre-fetched API data for statement: ${testStatementId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Statement Details test setup: hasStatements=${hasStatementsData}, apiAvailable=${apiAvailable}, testStatementId=${testStatementId}`,
    );

    if (hasStatementsData && testStatementId) {
      await statementsPage.tapStatement(testStatementId);
      await statementDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Statement header title', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }
      await expect(statementDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Statement ID', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }
      await expect(statementDetailsPage.statementIdText).toBeDisplayed();
      const statementId = await statementDetailsPage.getItemId();
      expect(statementId).toMatch(REGEX.STATEMENT_ID);
    });

    it('should display the status field', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }
      const status = await statementDetailsPage.getStatus();
      expect(status).toBeTruthy();
    });

    it('should display the Client field', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }
      const client = await statementDetailsPage.getCompositeFieldValueByLabel('Client', true);
      expect(client).toBeTruthy();
    });

    it('should display the Product field', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }
      // Product is only linked on some statements; skip when API confirms it is absent
      if (apiAvailable && apiStatementData && !apiStatementData.product) {
        console.info('⚠️ Statement has no linked product - skipping Product field test');
        this.skip();
        return;
      }
      const product = await statementDetailsPage.getCompositeFieldValueByLabel('Product', true);
      expect(product).toBeTruthy();
    });

    it('should display the Statement type field', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }
      // Reset scroll position so previous test's scroll attempts don't interfere
      await statementDetailsPage.scrollToTop();
      const type = await statementDetailsPage.getSimpleFieldValue('Statement type', true);
      expect(type).toBeTruthy();
    });

    it('should display the ∑ SP field', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }
      const sp = await statementDetailsPage.getSimpleFieldValue('∑ SP', true);
      expect(sp).toBeTruthy();
    });

    it('should NOT display an avatar in the header', async function () {
      if (!hasStatementsData) {
        this.skip();
        return;
      }
      const avatarExists = await statementDetailsPage.headerAvatarWrapper.isExisting().catch(() => false);
      expect(avatarExists).toBe(false);
    });
  });

  describe('API Data Validation', () => {
    it('should match Statement ID with API response', async function () {
      if (!hasStatementsData || !apiAvailable || !apiStatementData) {
        this.skip();
        return;
      }
      const uiStatementId = await statementDetailsPage.getItemId();
      expect(uiStatementId).toBe(apiStatementData.id);
    });

    it('should match status with API response', async function () {
      if (!hasStatementsData || !apiAvailable || !apiStatementData) {
        this.skip();
        return;
      }
      const uiStatus = await statementDetailsPage.getStatus();
      expect(uiStatus).toBe(apiStatementData.status);
    });

    it('should log all statement details for comparison', async function () {
      if (!hasStatementsData || !apiAvailable || !apiStatementData) {
        this.skip();
        return;
      }
      const uiDetails = await statementDetailsPage.getAllStatementDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Statement Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Statement ID: UI="${uiDetails.statementId}" | API="${apiStatementData.id}"`);
      console.info(`Status:       UI="${uiDetails.status}" | API="${apiStatementData.status}"`);
      console.info(`Client:       UI="${uiDetails.client}" | API="${apiStatementData.client?.name}"`);
      console.info(`Buyer:        UI="${uiDetails.buyer}" | API="${apiStatementData.buyer?.name}"`);
      console.info(`Vendor:       UI="${uiDetails.vendor}" | API="${apiStatementData.vendor?.name}"`);
      console.info(`Product:      UI="${uiDetails.product}" | API="${apiStatementData.product?.name}"`);
      console.info(`Agreement:    UI="${uiDetails.agreement}" | API="${apiStatementData.agreement?.name}"`);
      console.info(`Seller:       UI="${uiDetails.seller}" | API="${apiStatementData.seller?.name}"`);
      console.info(`Type:         UI="${uiDetails.statementType}" | API="${apiStatementData.type}"`);
      console.info(`∑ SP:         UI="${uiDetails.sp}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.statementId).toBe(apiStatementData.id);
    });
  });
});
