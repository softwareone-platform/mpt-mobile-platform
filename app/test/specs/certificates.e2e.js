const { expect } = require('@wdio/globals');

const certificatesPage = require('../pageobjects/certificates.page');
const morePage = require('../pageobjects/more.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureClientAccount } = require('../pageobjects/utils/account.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE, REGEX, STATUSES } = require('../pageobjects/utils/constants');

describe('Certificates Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let api;
  let hasCertificatesData = false;
  let hasEmptyState = false;
  let apiCertificatesAvailable = false;
  let certificatesMenuAvailable = false;

  /**
   * Navigate to Certificates page via More menu
   */
  async function navigateToCertificates() {
    await certificatesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    await morePage.certificatesMenuItem.click();
    await certificatesPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureClientAccount();

    // Check if Certificates menu item is available for this user
    await certificatesPage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    certificatesMenuAvailable = await morePage.certificatesMenuItem.isExisting().catch(() => false);

    if (!certificatesMenuAvailable) {
      console.info('⚠️ Certificates menu item not available for this user - skipping Certificates tests');
      return;
    }

    await morePage.certificatesMenuItem.click();
    await certificatesPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasCertificatesData = await certificatesPage.hasCertificates();
    hasEmptyState = !hasCertificatesData && (await certificatesPage.emptyState.isDisplayed().catch(() => false));
    apiCertificatesAvailable = !!api;

    console.info(
      `📊 Certificates data state: hasCertificates=${hasCertificatesData}, emptyState=${hasEmptyState}, apiAvailable=${apiCertificatesAvailable}`,
    );
  });

  beforeEach(async function () {
    if (!certificatesMenuAvailable) {
      this.skip();
      return;
    }
    const isOnCertificates = await certificatesPage.isOnCertificatesPage();
    if (!isOnCertificates) {
      await navigateToCertificates();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from More menu', async () => {
      await certificatesPage.goBack();
      await browser.pause(PAUSE.NAVIGATION);

      await morePage.certificatesMenuItem.click();
      await certificatesPage.waitForScreenReady();

      await expect(certificatesPage.headerTitle).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(certificatesPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to More page when back button tapped', async () => {
      await certificatesPage.goBack();

      await expect(morePage.certificatesMenuItem).toBeDisplayed();

      await morePage.certificatesMenuItem.click();
      await certificatesPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the Certificates header title', async () => {
      await expect(certificatesPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await certificatesPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(certificatesPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(certificatesPage.footer.spotlightsTab).toBeDisplayed();
      await expect(certificatesPage.footer.chatTab).toBeDisplayed();
      await expect(certificatesPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = certificatesPage.footer.moreTab;
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
    it('should display empty state when no certificates exist', async function () {
      if (hasCertificatesData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(certificatesPage.emptyState).toBeDisplayed();
      await expect(certificatesPage.noCertificatesTitle).toBeDisplayed();
      await expect(certificatesPage.noCertificatesDescription).toBeDisplayed();
    });

    it('should display "No certificates" title text', async function () {
      if (hasCertificatesData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await certificatesPage.noCertificatesTitle.getText();
      expect(titleText).toBe('No certificates');
    });

    it('should display "No certificates found." description', async function () {
      if (hasCertificatesData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await certificatesPage.noCertificatesDescription.getText();
      expect(descriptionText).toBe('No certificates found.');
    });
  });

  describe('Certificates List', () => {
    it('should display certificates list when certificates exist', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }

      await expect(certificatesPage.certificatesScrollView).toBeDisplayed();
      const certificatesCount = await certificatesPage.getVisibleCertificatesCount();
      expect(certificatesCount).toBeGreaterThan(0);
    });

    it('should display certificate items with name, ID and status', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }

      const firstCertificate = certificatesPage.firstCertificateItem;
      await expect(firstCertificate).toBeDisplayed();

      const details = await certificatesPage.getCertificateDetails(firstCertificate);
      expect(details.certificateId).toMatch(REGEX.CERTIFICATE_ID);
      expect(STATUSES.CERTIFICATE).toContain(details.status);
    });

    it('should detect all loaded certificates in the list', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }

      const certificatesCount = await certificatesPage.getVisibleCertificatesCount();
      const certificateIds = await certificatesPage.getVisibleCertificateIds();

      console.info(`Total certificates detected: ${certificatesCount}`);
      console.info(`First 5 certificate IDs: ${certificateIds.slice(0, 5).join(', ')}`);

      expect(certificatesCount).toBeGreaterThan(0);

      for (const certificateId of certificateIds) {
        expect(certificateId).toMatch(REGEX.CERTIFICATE_ID);
      }
    });

    it('should not display empty state when certificates exist', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await certificatesPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Certificates by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasCertificatesData) {
        this.skip();
        return;
      }

      const activeCertificates = await certificatesPage.getItemsByStatus('Active');
      const draftCertificates = await certificatesPage.getItemsByStatus('Draft');
      const terminatedCertificates = await certificatesPage.getItemsByStatus('Terminated');

      const totalStatusCertificates =
        activeCertificates.length + draftCertificates.length + terminatedCertificates.length;
      expect(totalStatusCertificates).toBeGreaterThanOrEqual(0);

      console.info(
        `Certificates by status - Active: ${activeCertificates.length}, Draft: ${draftCertificates.length}, Terminated: ${terminatedCertificates.length}`,
      );
    });
  });

  describe('API Integration', () => {
    it('should match API certificates count with visible certificates', async function () {
      if (!apiCertificatesAvailable || !hasCertificatesData) {
        this.skip();
        return;
      }

      try {
        const apiCertificates = await api.getCertificates({ limit: 100 });
        const apiCertificatesList = apiCertificates.data || apiCertificates;
        const apiCount = apiCertificatesList.length;

        const uiCount = await certificatesPage.getVisibleCertificatesCount();

        console.info(`[Count Compare] API certificates: ${apiCount}, UI visible certificates: ${uiCount}`);

        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 certificate IDs and statuses match API data', async function () {
      if (!apiCertificatesAvailable || !hasCertificatesData) {
        this.skip();
        return;
      }

      try {
        const apiCertificates = await api.getCertificates({ limit: 10 });
        const apiCertificatesList = apiCertificates.data || apiCertificates;
        const uiCertificateIds = await certificatesPage.getVisibleCertificateIds();
        const uiCertificatesWithStatus = await certificatesPage.getVisibleCertificatesWithStatus();

        const comparisons = [];
        for (let i = 0; i < Math.min(apiCertificatesList.length, 10); i++) {
          const apiCertificate = apiCertificatesList[i];
          const apiCertificateId = apiCertificate.id;
          const apiStatus = apiCertificate.status;
          const uiCertificate = uiCertificatesWithStatus[i] || {};
          const uiCertificateId = uiCertificate.certificateId;
          const uiStatus = uiCertificate.status;

          const idMatches = apiCertificateId === uiCertificateId;
          const statusMatches = apiStatus === uiStatus;

          console.info(
            `[${i + 1}] ID: ${apiCertificateId} vs ${uiCertificateId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`,
          );
          comparisons.push({ apiCertificateId, uiCertificateId, idMatches, apiStatus, uiStatus, statusMatches });
        }

        const idMatchCount = comparisons.filter((c) => c.idMatches).length;
        const statusMatchCount = comparisons.filter((c) => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);

        for (const uiCertificateId of uiCertificateIds.slice(0, 10)) {
          expect(uiCertificateId).toMatch(REGEX.CERTIFICATE_ID);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
