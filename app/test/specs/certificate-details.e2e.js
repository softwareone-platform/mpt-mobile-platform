const { expect } = require('@wdio/globals');

const certificateDetailsPage = require('../pageobjects/certificate-details.page');
const certificatesPage = require('../pageobjects/certificates.page');
const enrollmentsPage = require('../pageobjects/enrollments.page');
const agreementsPage = require('../pageobjects/agreements.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureClientAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');

describe('Certificate Details Page', () => {
  let api;
  let hasCertificatesData = false;
  let apiAvailable = false;
  let testCertificateId = null;
  let apiCertificateData = null;
  let certificatesMenuAvailable = false;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureClientAccount();

    await certificatesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);

    certificatesMenuAvailable = await morePage.certificatesMenuItem.isExisting().catch(() => false);
    if (!certificatesMenuAvailable) {
      console.info('⚠️ Certificates menu item not available for this user - skipping Certificate Details tests');
      return;
    }

    await morePage.certificatesMenuItem.click();
    await certificatesPage.waitForScreenReady();

    hasCertificatesData = await certificatesPage.hasCertificates();
    apiAvailable = !!api;

    if (hasCertificatesData) {
      const certificateIds = await certificatesPage.getVisibleCertificateIds();
      testCertificateId = certificateIds[0];

      if (apiAvailable && testCertificateId) {
        try {
          apiCertificateData = await api.getCertificateById(testCertificateId);
          console.info(`📊 Pre-fetched API data for certificate: ${testCertificateId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(
      `📊 Certificate Details test setup: hasCertificates=${hasCertificatesData}, apiAvailable=${apiAvailable}, testCertificateId=${testCertificateId}`,
    );

    if (hasCertificatesData && testCertificateId) {
      await certificatesPage.tapCertificate(testCertificateId);
      await certificateDetailsPage.waitForPageReady();
    }
  });

  describe('Page Structure', () => {
    it('should display the Certificates header title', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }
      await expect(certificateDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Certificate ID', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }
      await expect(certificateDetailsPage.certificateIdText).toBeDisplayed();
      const certificateId = await certificateDetailsPage.getItemId();
      expect(certificateId).toMatch(REGEX.CERTIFICATE_ID);
    });

    it('should display the status field', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }
      const status = await certificateDetailsPage.getStatus();
      expect(status).toBeTruthy();
    });

    it('should display the Program field', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }
      const program = await certificateDetailsPage.getCompositeFieldValueByLabel('Program', true);
      expect(program).toBeTruthy();
    });

    it('should display the Certificant field', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }
      const certificant = await certificateDetailsPage.getCompositeFieldValueByLabel('Certificant', true);
      expect(certificant).toBeTruthy();
    });

    it('should display the Eligibility field', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }
      const eligibility = await certificateDetailsPage.getSimpleFieldValue('Eligibility', true);
      expect(['Partner', 'Client']).toContain(eligibility);
    });

    it('should display the Applicable To field', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }
      const applicableTo = await certificateDetailsPage.getSimpleFieldValue('Applicable To', true);
      expect(['Buyer', 'Licensee']).toContain(applicableTo);
    });

    it('should display the Expiration field', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }
      const expiration = await certificateDetailsPage.getSimpleFieldValue('Expiration', true);
      expect(expiration).toBeDefined();
    });
  });

  describe('API Data Validation', () => {
    it('should match Certificate ID with API response', async function () {
      if (!hasCertificatesData || !apiAvailable || !apiCertificateData) {
        this.skip();
        return;
      }
      const uiCertificateId = await certificateDetailsPage.getItemId();
      expect(uiCertificateId).toBe(apiCertificateData.id);
    });

    it('should match status with API response', async function () {
      if (!hasCertificatesData || !apiAvailable || !apiCertificateData) {
        this.skip();
        return;
      }
      const uiStatus = await certificateDetailsPage.getStatus();
      expect(uiStatus).toBe(apiCertificateData.status);
    });

    it('should log all certificate details for comparison', async function () {
      if (!hasCertificatesData || !apiAvailable || !apiCertificateData) {
        this.skip();
        return;
      }
      const uiDetails = await certificateDetailsPage.getAllCertificateDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Certificate Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Certificate ID: UI="${uiDetails.certificateId}" | API="${apiCertificateData.id}"`);
      console.info(`Status:         UI="${uiDetails.status}" | API="${apiCertificateData.status}"`);
      console.info(`Program:        UI="${uiDetails.program}" | API="${apiCertificateData.program?.name}"`);
      console.info(`Vendor:         UI="${uiDetails.vendor}" | API="${apiCertificateData.vendor?.name}"`);
      console.info(`Certificant:    UI="${uiDetails.certificant}"`);
      console.info(`Eligibility:    UI="${uiDetails.eligibility}"`);
      console.info(`Applicable To:  UI="${uiDetails.applicableTo}" | API="${apiCertificateData.applicableTo}"`);
      console.info(`Expiration:     UI="${uiDetails.expiration}" | API="${apiCertificateData.expirationDate}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      expect(uiDetails.certificateId).toBe(apiCertificateData.id);
    });
  });

  describe('Sublists Navigation', () => {
    it('should display the Enrollments sublist navigation item', async function () {
      if (!hasCertificatesData) { this.skip(); return; }
      const has = await certificateDetailsPage.hasSubList('Enrollments');
      expect(has).toBe(true);
    });

    it('should display the Agreements sublist navigation item', async function () {
      if (!hasCertificatesData) { this.skip(); return; }
      await certificateDetailsPage.scrollToTop(3);
      const has = await certificateDetailsPage.hasSubList('Agreements');
      expect(has).toBe(true);
    });

    it('should navigate to Enrollments list when Enrollments sublist tapped', async function () {
      if (!hasCertificatesData) { this.skip(); return; }
      await certificateDetailsPage.scrollToTop(3);
      await certificateDetailsPage.tapSubList('Enrollments');
      await enrollmentsPage.waitForScreenReady();
      await expect(enrollmentsPage.headerTitle).toBeDisplayed();
      await enrollmentsPage.goBack();
      await certificateDetailsPage.waitForPageReady();
    });

    it('should navigate to Agreements list when Agreements sublist tapped', async function () {
      if (!hasCertificatesData) { this.skip(); return; }
      await certificateDetailsPage.scrollToTop(3);
      await certificateDetailsPage.tapSubList('Agreements');
      await agreementsPage.waitForScreenReady();
      await expect(agreementsPage.headerTitle).toBeDisplayed();
      await agreementsPage.goBack();
      await certificateDetailsPage.waitForPageReady();
    });
  });
});
