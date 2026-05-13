const { expect } = require('@wdio/globals');

const programDetailsPage = require('../pageobjects/program-details.page');
const programsPage = require('../pageobjects/programs.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureClientAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');

describe('Program Details Page', () => {
  let api;
  let hasProgramsData = false;
  let apiAvailable = false;
  let testProgramId = null;
  let apiProgramData = null;
  let programsMenuAvailable = false;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureClientAccount();

    await programsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);

    programsMenuAvailable = await morePage.programsMenuItem.isExisting().catch(() => false);
    if (!programsMenuAvailable) {
      console.info('⚠️ Programs menu item not available for this user - skipping Program Details tests');
      return;
    }

    await morePage.programsMenuItem.click();
    await programsPage.waitForScreenReady();

    hasProgramsData = await programsPage.hasPrograms();
    apiAvailable = !!api;

    if (hasProgramsData) {
      const programIds = await programsPage.getVisibleProgramIds();
      testProgramId = programIds[0];

      if (apiAvailable && testProgramId) {
        try {
          apiProgramData = await api.getProgramById(testProgramId);
          console.info(`📊 Pre-fetched API data for program: ${testProgramId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Program Details test setup: hasPrograms=${hasProgramsData}, apiAvailable=${apiAvailable}, testProgramId=${testProgramId}`,
    );

    if (hasProgramsData && testProgramId) {
      await programsPage.tapProgram(testProgramId);
      await programDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Program header title', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }
      await expect(programDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Program ID', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }
      await expect(programDetailsPage.programIdText).toBeDisplayed();
      const programId = await programDetailsPage.getItemId();
      expect(programId).toMatch(REGEX.PROGRAM_ID);
    });

    it('should display the status field', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }
      const status = await programDetailsPage.getStatus();
      expect(status).toBeTruthy();
    });

    it('should display the Name field', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }
      const name = await programDetailsPage.getSimpleFieldValue('Name', true);
      expect(name).toBeTruthy();
    });

    it('should display the Website field', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }
      const website = await programDetailsPage.getSimpleFieldValue('Website', true);
      expect(website).toBeDefined();
    });

    it('should display the Eligibility field', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }
      const eligibility = await programDetailsPage.getSimpleFieldValue('Eligibility', true);
      expect(['Partner', 'Client']).toContain(eligibility);
    });

    it('should display the Applicable To field', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }
      const applicableTo = await programDetailsPage.getSimpleFieldValue('Applicable To', true);
      expect(['Buyer', 'Licensee']).toContain(applicableTo);
    });

    it('should display an avatar in the header', async function () {
      if (!hasProgramsData) {
        this.skip();
        return;
      }
      await expect(programDetailsPage.headerAvatarWrapper).toBeDisplayed();
    });
  });

  describe('API Data Validation', () => {
    it('should match Program ID with API response', async function () {
      if (!hasProgramsData || !apiAvailable || !apiProgramData) {
        this.skip();
        return;
      }
      const uiProgramId = await programDetailsPage.getItemId();
      expect(uiProgramId).toBe(apiProgramData.id);
    });

    it('should match status with API response', async function () {
      if (!hasProgramsData || !apiAvailable || !apiProgramData) {
        this.skip();
        return;
      }
      const uiStatus = await programDetailsPage.getStatus();
      expect(uiStatus).toBe(apiProgramData.status);
    });

    it('should match name with API response', async function () {
      if (!hasProgramsData || !apiAvailable || !apiProgramData) {
        this.skip();
        return;
      }
      const uiName = await programDetailsPage.getSimpleFieldValue('Name', true);
      expect(uiName).toBe((apiProgramData.name || '').trim());
    });

    it('should log all program details for comparison', async function () {
      if (!hasProgramsData || !apiAvailable || !apiProgramData) {
        this.skip();
        return;
      }
      const uiDetails = await programDetailsPage.getAllProgramDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Program Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Program ID:   UI="${uiDetails.programId}" | API="${apiProgramData.id}"`);
      console.info(`Status:       UI="${uiDetails.status}" | API="${apiProgramData.status}"`);
      console.info(`Name:         UI="${uiDetails.name}" | API="${apiProgramData.name}"`);
      console.info(`Website:      UI="${uiDetails.website}" | API="${apiProgramData.website}"`);
      console.info(`Eligibility:  UI="${uiDetails.eligibility}" | API="${apiProgramData.eligibility?.partner ? 'Partner' : 'Client'}"`);
      console.info(`Applicable:   UI="${uiDetails.applicableTo}" | API="${apiProgramData.applicableTo}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.programId).toBe(apiProgramData.id);
    });
  });
});
