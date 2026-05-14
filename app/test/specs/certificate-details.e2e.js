const { expect } = require('@wdio/globals');

const certificateDetailsPage = require('../pageobjects/certificate-details.page');
const certificatesPage = require('../pageobjects/certificates.page');
const morePage = require('../pageobjects/more.page');
const programDetailsPage = require('../pageobjects/program-details.page');
const buyerDetailsPage = require('../pageobjects/buyer-details.page');
const accountDetailsPage = require('../pageobjects/account-details.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const {
  ensureOperationsAccount,
  ensureClientAccount,
  ensureVendorAccount,
  CLIENT_ACCOUNT_ID,
  VENDOR_ACCOUNT_ID,
} = require('../pageobjects/utils/account.helper');
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

  describe('Navigation Links', () => {
    it('should navigate to Program Details when Program field is tapped', async function () {
      if (!hasCertificatesData) { this.skip(); return; }
      await certificateDetailsPage.scrollToTop(3);
      const programField = certificateDetailsPage.getCompositeField('Program');
      const isDisplayed = await programField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await programField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(programDetailsPage.headerTitle).toBeDisplayed();
      await programDetailsPage.goBack();
      await certificateDetailsPage.waitForPageReady();
    });

    it('should navigate to Buyer Details when Certificant field is tapped', async function () {
      if (!hasCertificatesData) { this.skip(); return; }
      await certificateDetailsPage.scrollToTop(3);
      const certificantField = certificateDetailsPage.getCompositeField('Certificant');
      const isDisplayed = await certificantField.isDisplayed().catch(() => false);
      if (!isDisplayed) { this.skip(); return; }
      await certificantField.click();
      await browser.pause(PAUSE.NAVIGATION);
      await expect(buyerDetailsPage.headerTitle).toBeDisplayed();
      await buyerDetailsPage.goBack();
      await certificateDetailsPage.waitForPageReady();
    });
  });
});

describe('[MPT-18620] Certificate Details - Role-Gated Field Visibility', function () {
  let hasData = false;

  async function navigateToFirstCertificateDetail(accountSwitchFn) {
    await navigation.ensureHomePage({ resetFilters: false });
    await accountSwitchFn();
    await certificatesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const available = await morePage.certificatesMenuItem.isExisting().catch(() => false);
    if (!available) return false;
    await morePage.certificatesMenuItem.click();
    await certificatesPage.waitForScreenReady();
    const exists = await certificatesPage.hasCertificates();
    if (!exists) return false;
    const ids = await certificatesPage.getVisibleCertificateIds();
    await certificatesPage.tapCertificate(ids[0]);
    await certificateDetailsPage.waitForPageReady();
    return true;
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureOperationsAccount();
    await certificatesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const available = await morePage.certificatesMenuItem.isExisting().catch(() => false);
    if (!available) { console.info('\u26a0\ufe0f Certificates menu not available - skipping role-gated tests'); return; }
    await morePage.certificatesMenuItem.click();
    await certificatesPage.waitForScreenReady();
    hasData = await certificatesPage.hasCertificates();
  });

  it('should show Vendor field for Operations account', async function () {
    if (!hasData) { this.skip(); return; }
    const ok = await navigateToFirstCertificateDetail(ensureOperationsAccount);
    if (!ok) { this.skip(); return; }
    const vendor = await certificateDetailsPage.getCompositeFieldValueByLabel('Vendor', true);
    expect(vendor).toBeTruthy();
  });

  it('should show Vendor field for Client account', async function () {
    if (!hasData || !CLIENT_ACCOUNT_ID) { this.skip(); return; }
    const ok = await navigateToFirstCertificateDetail(ensureClientAccount);
    if (!ok) { this.skip(); return; }
    const vendor = await certificateDetailsPage.getCompositeFieldValueByLabel('Vendor', true);
    expect(vendor).toBeTruthy();
    await ensureOperationsAccount();
  });

  it('should hide Vendor label for Vendor account', async function () {
    if (!hasData || !VENDOR_ACCOUNT_ID) { this.skip(); return; }
    const ok = await navigateToFirstCertificateDetail(ensureVendorAccount);
    if (!ok) { this.skip(); return; }
    const vendor = await certificateDetailsPage.getCompositeFieldValueByLabel('Vendor', false);
    expect(vendor).toBeFalsy();
    await ensureOperationsAccount();
  });

  it('should show Program field for Operations account', async function () {
    if (!hasData) { this.skip(); return; }
    const ok = await navigateToFirstCertificateDetail(ensureOperationsAccount);
    if (!ok) { this.skip(); return; }
    const program = await certificateDetailsPage.getCompositeFieldValueByLabel('Program', true);
    expect(program).toBeTruthy();
  });

  it('should show Program field for Vendor account', async function () {
    if (!hasData || !VENDOR_ACCOUNT_ID) { this.skip(); return; }
    const ok = await navigateToFirstCertificateDetail(ensureVendorAccount);
    if (!ok) { this.skip(); return; }
    const program = await certificateDetailsPage.getCompositeFieldValueByLabel('Program', true);
    expect(program).toBeTruthy();
    await ensureOperationsAccount();
  });
});

describe('[MPT-18042] Certificate Details - Non-navigable Vendor field for Client account', function () {
  let hasData = false;

  async function navigateToFirstCertificateDetail(accountSwitchFn) {
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await accountSwitchFn();
    await certificatesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const available = await morePage.certificatesMenuItem.isExisting().catch(() => false);
    if (!available) return false;
    await morePage.certificatesMenuItem.click();
    await certificatesPage.waitForScreenReady();
    const exists = await certificatesPage.hasCertificates();
    if (!exists) return false;
    const ids = await certificatesPage.getVisibleCertificateIds();
    await certificatesPage.tapCertificate(ids[0]);
    await certificateDetailsPage.waitForPageReady();
    return true;
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureOperationsAccount();
    await certificatesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    const available = await morePage.certificatesMenuItem.isExisting().catch(() => false);
    if (!available) { console.info('⚠️ Certificates menu not available - skipping MPT-18042 tests'); return; }
    await morePage.certificatesMenuItem.click();
    await certificatesPage.waitForScreenReady();
    hasData = await certificatesPage.hasCertificates();
  });

  // Per MPT-18042: Vendor field is visible to Client but has no navigation link —
  // tapping it must not navigate away from Certificate Details.
  it('should NOT navigate when Vendor field is tapped as Client account', async function () {
    if (!hasData || !CLIENT_ACCOUNT_ID) { this.skip(); return; }
    const ok = await navigateToFirstCertificateDetail(ensureClientAccount);
    if (!ok) { this.skip(); return; }
    await certificateDetailsPage.scrollToTop(3);
    const vendorField = certificateDetailsPage.getCompositeField('Vendor');
    const isDisplayed = await vendorField.isDisplayed().catch(() => false);
    if (!isDisplayed) { this.skip(); return; }
    await vendorField.click().catch(() => {});
    await browser.pause(PAUSE.NAVIGATION);
    // Must still be on Certificate Details — vendor link is display-only for Client
    const stillOnPage = await certificateDetailsPage.headerTitle.isDisplayed().catch(() => false);
    expect(stillOnPage).toBe(true);
    await ensureOperationsAccount();
  });

  // Counterpart: Vendor field IS navigable for Operations — confirms the test setup is valid.
  it('should navigate to Account Details when Vendor field is tapped as Operations account', async function () {
    if (!hasData) { this.skip(); return; }
    const ok = await navigateToFirstCertificateDetail(ensureOperationsAccount);
    if (!ok) { this.skip(); return; }
    await certificateDetailsPage.scrollToTop(3);
    const vendorField = certificateDetailsPage.getCompositeField('Vendor');
    const isDisplayed = await vendorField.isDisplayed().catch(() => false);
    if (!isDisplayed) { this.skip(); return; }
    await vendorField.click();
    await browser.pause(PAUSE.NAVIGATION);
    const onAccountDetails = await accountDetailsPage.itemIdText.isDisplayed().catch(() => false);
    expect(onAccountDetails).toBe(true);
    await accountDetailsPage.goBack();
    await certificateDetailsPage.waitForPageReady();
    await ensureOperationsAccount();
  });
});
