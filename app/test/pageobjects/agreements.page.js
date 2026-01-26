const { $, $$ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const { getSelector, selectors } = require('./utils/selectors');

class AgreementsPage extends BasePage {
  constructor() {
    super();
    this.header = headingPage;
    this.footer = footerPage;
  }

  // ========== Loading States ==========

  get loadingIndicator() {
    return $(selectors.byAccessibilityId('agreements-loading-indicator'));
  }

  get emptyState() {
    return $(selectors.byAccessibilityId('agreements-empty-state'));
  }

  get errorState() {
    return $(selectors.byAccessibilityId('agreements-error-state'));
  }

  // ========== Header Elements ==========

  get headerTitle() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Agreements" and contains(@traits, "Header")]',
        android: '//android.view.View[@text="Agreements" and @heading="true"]',
      }),
    );
  }

  get goBackButton() {
    return $(
      getSelector({
        ios: '~Go back',
        android: '//android.widget.Button[@content-desc="Go back" or @text="Go back"]',
      }),
    );
  }

  get accountButton() {
    return $(
      getSelector({
        ios: '~nav-account-button',
        android: '//*[@resource-id="nav-account-button"]',
      }),
    );
  }

  // ========== Empty State Elements ==========

  get noAgreementsTitle() {
    return $(selectors.byText('No agreements'));
  }

  get noAgreementsDescription() {
    return $(selectors.byText('No agreements found.'));
  }

  // ========== Agreements List Elements ==========

  get agreementsScrollView() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeScrollView',
        android: '//android.widget.ScrollView',
      }),
    );
  }

  /**
   * Get all visible agreement items
   * @returns {Promise<ElementArray>} Array of agreement item elements
   */
  get agreementItems() {
    return $$(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "AGR-") and contains(@name, ",")]',
        android: '//*[contains(@content-desc, "AGR-") and contains(@content-desc, ",")]',
      }),
    );
  }

  /**
   * Get agreement item by agreement ID
   * @param {string} agreementId - Agreement ID (e.g., 'AGR-0000-0039-2883')
   * @returns {WebdriverIO.Element}
   */
  getAgreementById(agreementId) {
    return $(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${agreementId}")]`,
        android: `//*[contains(@content-desc, "${agreementId}")]`,
      }),
    );
  }

  /**
   * Get agreement items by status
   * @param {string} status - Agreement status (Active, Terminated, Deleted, Provisioning)
   * @returns {Promise<ElementArray>}
   */
  getAgreementsByStatus(status) {
    return $$(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "AGR-") and contains(@name, ", ${status}")]`,
        android: `//*[contains(@content-desc, "AGR-") and contains(@content-desc, ", ${status}")]`,
      }),
    );
  }

  /**
   * Get the first agreement item in the list
   * @returns {WebdriverIO.Element}
   */
  get firstAgreementItem() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeOther[contains(@name, "AGR-") and contains(@name, ",")])[1]',
        android: '(//*[contains(@content-desc, "AGR-") and contains(@content-desc, ",")])[1]',
      }),
    );
  }

  // ========== Helper Methods ==========

  /**
   * Wait for the agreements screen to be ready (either shows data, empty state, or error)
   * @param {number} timeout - Maximum wait time in milliseconds
   */
  async waitForScreenReady(timeout = 30000) {
    // First wait for loading to potentially appear and disappear
    const loadingVisible = await this.loadingIndicator.isDisplayed().catch(() => false);
    if (loadingVisible) {
      await this.loadingIndicator.waitForDisplayed({ timeout, reverse: true }).catch(() => {});
    }
    // Screen is ready when either empty state or content is shown
    await browser.pause(500);
  }

  /**
   * Check if currently on the Agreements page
   * @returns {Promise<boolean>}
   */
  async isOnAgreementsPage() {
    try {
      return await this.headerTitle.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Navigate back from Agreements page to More page
   */
  async goBack() {
    await this.goBackButton.click();
    await browser.pause(500);
  }

  /**
   * Check if the agreements page has any agreements (not showing empty state)
   * @returns {Promise<boolean>} True if agreements exist, false if empty state is shown
   */
  async hasAgreements() {
    try {
      const agreements = await this.agreementItems;
      return agreements.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get count of visible agreements
   * @returns {Promise<number>}
   */
  async getVisibleAgreementsCount() {
    const agreements = await this.agreementItems;
    return agreements.length;
  }

  /**
   * Get agreement details from an agreement item's accessibility label
   * @param {WebdriverIO.Element} agreementElement - Agreement item element
   * @returns {Promise<{name: string, agreementId: string, status: string}>}
   */
  async getAgreementDetails(agreementElement) {
    const label = await agreementElement.getAttribute('name') || await agreementElement.getAttribute('content-desc');
    // Format: "Name, AGR-XXXX-XXXX-XXXX, Status"
    const match = label.match(/^(.+),\s*(AGR-\d{4}-\d{4}-\d{4}),\s*(\w+)$/);
    if (match) {
      return {
        name: match[1].trim(),
        agreementId: match[2],
        status: match[3],
      };
    }
    return { name: label, agreementId: '', status: '' };
  }

  /**
   * Tap on a specific agreement by ID
   * @param {string} agreementId - Agreement ID to tap
   */
  async tapAgreement(agreementId) {
    const agreement = this.getAgreementById(agreementId);
    await agreement.waitForDisplayed({ timeout: 10000 });
    await agreement.click();
  }

  /**
   * Tap on the first agreement in the list
   */
  async tapFirstAgreement() {
    await this.firstAgreementItem.waitForDisplayed({ timeout: 10000 });
    await this.firstAgreementItem.click();
  }

  /**
   * Get all visible agreement IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleAgreementIds() {
    const agreements = await this.agreementItems;
    const agreementIds = [];
    for (const agreement of agreements) {
      const details = await this.getAgreementDetails(agreement);
      agreementIds.push(details.agreementId);
    }
    return agreementIds;
  }

  /**
   * Get all visible agreements with their statuses
   * @returns {Promise<Array<{name: string, agreementId: string, status: string}>>}
   */
  async getVisibleAgreementsWithStatus() {
    const agreements = await this.agreementItems;
    const agreementDetails = [];
    for (const agreement of agreements) {
      const details = await this.getAgreementDetails(agreement);
      agreementDetails.push(details);
    }
    return agreementDetails;
  }

  /**
   * Scroll down in the agreements list
   * @param {number} percent - Scroll percentage (0.0 to 1.0, default 0.5)
   */
  async scrollDown(percent = 0.5) {
    if (this.isAndroid()) {
      await browser.execute('mobile: swipeGesture', {
        left: 100,
        top: 300,
        width: 880,
        height: 800,
        direction: 'up',
        percent: percent,
      });
    } else {
      await browser.execute('mobile: swipe', {
        direction: 'up',
        velocity: 800,
      });
    }
  }
}

module.exports = new AgreementsPage();
