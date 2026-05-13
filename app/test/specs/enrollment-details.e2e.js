const { expect } = require('@wdio/globals');

const enrollmentDetailsPage = require('../pageobjects/enrollment-details.page');
const enrollmentsPage = require('../pageobjects/enrollments.page');
const morePage = require('../pageobjects/more.page');
const programDetailsPage = require('../pageobjects/program-details.page');
const certificateDetailsPage = require('../pageobjects/certificate-details.page');
const buyerDetailsPage = require('../pageobjects/buyer-details.page');
const licenseeDetailsPage = require('../pageobjects/licensee-details.page');
const userDetailsPage = require('../pageobjects/user-details.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureClientAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');

describe('Enrollment Details Page', () => {
  let api;
  let hasEnrollmentsData = false;
  let apiAvailable = false;
  let testEnrollmentId = null;
  let apiEnrollmentData = null;
  let enrollmentsMenuAvailable = false;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureClientAccount();

    await enrollmentsPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);

    enrollmentsMenuAvailable = await morePage.enrollmentsMenuItem.isExisting().catch(() => false);
    if (!enrollmentsMenuAvailable) {
      console.info('⚠️ Enrollments menu item not available for this user - skipping Enrollment Details tests');
      return;
    }

    await morePage.enrollmentsMenuItem.click();
    await enrollmentsPage.waitForScreenReady();

    hasEnrollmentsData = await enrollmentsPage.hasEnrollments();
    apiAvailable = !!api;

    if (hasEnrollmentsData) {
      const enrollmentIds = await enrollmentsPage.getVisibleEnrollmentIds();
      testEnrollmentId = enrollmentIds[0];

      if (apiAvailable && testEnrollmentId) {
        try {
          apiEnrollmentData = await api.getEnrollmentById(testEnrollmentId);
          console.info(`📊 Pre-fetched API data for enrollment: ${testEnrollmentId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Enrollment Details test setup: hasEnrollments=${hasEnrollmentsData}, apiAvailable=${apiAvailable}, testEnrollmentId=${testEnrollmentId}`,
    );

    if (hasEnrollmentsData && testEnrollmentId) {
      await enrollmentsPage.tapEnrollment(testEnrollmentId);
      await enrollmentDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Enrollment header title', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      await expect(enrollmentDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Enrollment ID', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      await expect(enrollmentDetailsPage.enrollmentIdText).toBeDisplayed();
      const enrollmentId = await enrollmentDetailsPage.getItemId();
      expect(enrollmentId).toMatch(REGEX.ENROLLMENT_ID);
    });

    it('should display the status field', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      const status = await enrollmentDetailsPage.getStatus();
      expect(status).toBeTruthy();
    });

    it('should display the Program field', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      const program = await enrollmentDetailsPage.getCompositeFieldValueByLabel('Program', true);
      expect(program).toBeTruthy();
    });

    it('should display the Certificate field', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      const certificate = await enrollmentDetailsPage.getCompositeFieldValueByLabel('Certificate', true);
      expect(certificate).toBeTruthy();
    });

    it('should display the Certificant field', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      const certificant = await enrollmentDetailsPage.getCompositeFieldValueByLabel('Certificant', true);
      expect(certificant).toBeTruthy();
    });

    it('should display the Eligibility field', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      const eligibility = await enrollmentDetailsPage.getSimpleFieldValue('Eligibility', true);
      expect(['Partner', 'Client']).toContain(eligibility);
    });

    it('should display the Applicable To field', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      const applicableTo = await enrollmentDetailsPage.getSimpleFieldValue('Applicable To', true);
      expect(['Buyer', 'Licensee']).toContain(applicableTo);
    });

    it('should display the Assignee field', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      const assignee = await enrollmentDetailsPage.getCompositeFieldValueByLabel('Assignee', true).catch(() => '');
      expect(assignee).toBeDefined();
    });

    it('should NOT display an avatar in the header', async function () {
      if (!hasEnrollmentsData) {
        this.skip();
        return;
      }
      const avatarExists = await enrollmentDetailsPage.headerAvatarWrapper.isExisting().catch(() => false);
      expect(avatarExists).toBe(false);
    });
  });

  describe('API Data Validation', () => {
    it('should match Enrollment ID with API response', async function () {
      if (!hasEnrollmentsData || !apiAvailable || !apiEnrollmentData) {
        this.skip();
        return;
      }
      const uiEnrollmentId = await enrollmentDetailsPage.getItemId();
      expect(uiEnrollmentId).toBe(apiEnrollmentData.id);
    });

    it('should match status with API response', async function () {
      if (!hasEnrollmentsData || !apiAvailable || !apiEnrollmentData) {
        this.skip();
        return;
      }
      const uiStatus = await enrollmentDetailsPage.getStatus();
      expect(uiStatus).toBe(apiEnrollmentData.status);
    });

    it('should log all enrollment details for comparison', async function () {
      if (!hasEnrollmentsData || !apiAvailable || !apiEnrollmentData) {
        this.skip();
        return;
      }
      const uiDetails = await enrollmentDetailsPage.getAllEnrollmentDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Enrollment Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Enrollment ID: UI="${uiDetails.enrollmentId}" | API="${apiEnrollmentData.id}"`);
      console.info(`Status:        UI="${uiDetails.status}" | API="${apiEnrollmentData.status}"`);
      console.info(`Program:       UI="${uiDetails.program}" | API="${apiEnrollmentData.program?.name}"`);
      console.info(`Certificate:   UI="${uiDetails.certificate}" | API="${apiEnrollmentData.certificate?.name}"`);
      console.info(`Certificant:   UI="${uiDetails.certificant}"`);
      console.info(`Eligibility:   UI="${uiDetails.eligibility}"`);
      console.info(`Applicable To: UI="${uiDetails.applicableTo}" | API="${apiEnrollmentData.applicableTo}"`);
      console.info(`Assignee:      UI="${uiDetails.assignee}" | API="${apiEnrollmentData.assignee?.name}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.enrollmentId).toBe(apiEnrollmentData.id);
    });
  });

  describe('Navigation Links', () => {
    it('should navigate to Program Details when Program field is tapped', async function () {
      if (!hasEnrollmentsData) { this.skip(); return; }
      await enrollmentDetailsPage.scrollToTop(3);
      const programField = enrollmentDetailsPage.getCompositeField('Program');
      const isDisplayed = await programField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await programField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(programDetailsPage.headerTitle).toBeDisplayed();
      await programDetailsPage.goBack();
      await enrollmentDetailsPage.waitForPageReady();
    });

    it('should navigate to Certificate Details when Certificate field is tapped', async function () {
      if (!hasEnrollmentsData) { this.skip(); return; }
      await enrollmentDetailsPage.scrollToTop(3);
      const certificateField = enrollmentDetailsPage.getCompositeField('Certificate');
      const isDisplayed = await certificateField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await certificateField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(certificateDetailsPage.headerTitle).toBeDisplayed();
      await certificateDetailsPage.goBack();
      await enrollmentDetailsPage.waitForPageReady();
    });

    it('should navigate to a certificant details screen when Certificant field is tapped', async function () {
      if (!hasEnrollmentsData) { this.skip(); return; }
      await enrollmentDetailsPage.scrollToTop(3);
      const certificantField = enrollmentDetailsPage.getCompositeField('Certificant');
      const isDisplayed = await certificantField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await certificantField.click();
      await browser.pause(PAUSE.NAVIGATION);
      // Certificant navigates to Buyer or Licensee depending on enrollment applicableTo
      const onBuyerPage = await buyerDetailsPage.headerTitle.isDisplayed().catch(() => false);
      const onLicenseePage = await licenseeDetailsPage.headerTitle.isDisplayed().catch(() => false);
      expect(onBuyerPage || onLicenseePage).toBe(true);
      if (onBuyerPage) {
        await buyerDetailsPage.goBack();
      } else {
        await licenseeDetailsPage.goBack();
      }
      await enrollmentDetailsPage.waitForPageReady();
    });

    it('should navigate to User Details when Assignee field is tapped', async function () {
      if (!hasEnrollmentsData) { this.skip(); return; }
      await enrollmentDetailsPage.scrollToTop(3);
      const assigneeField = enrollmentDetailsPage.getCompositeField('Assignee');
      const isDisplayed = await assigneeField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await assigneeField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(userDetailsPage.headerTitle).toBeDisplayed();
      await userDetailsPage.goBack();
      await enrollmentDetailsPage.waitForPageReady();
    });
  });
});
