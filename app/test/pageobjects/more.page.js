const { $ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const { getSelector, selectors } = require('./utils/selectors');
const { PAUSE } = require('./utils/constants');

class MorePage extends BasePage {
  constructor() {
    super();
    this.header = headingPage;
    this.footer = footerPage;
  }

  // ========== Header Elements ==========

  get headerTitle() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="More" and contains(@traits, "Header")]',
        android: '//android.view.View[@text="More" and @heading="true"]',
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

  // ========== Menu Items ==========

  get agreementsMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-agreements',
        android: '//*[@resource-id="nav-menu-agreements"]',
      }),
    );
  }

  get creditMemosMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-creditMemos',
        android: '//*[@resource-id="nav-menu-creditMemos"]',
      }),
    );
  }

  get invoicesMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-invoices',
        android: '//*[@resource-id="nav-menu-invoices"]',
      }),
    );
  }

  get statementsMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-statements',
        android: '//*[@resource-id="nav-menu-statements"]',
      }),
    );
  }

  get usersMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-users',
        android: '//*[@resource-id="nav-menu-users"]',
      }),
    );
  }

  get programsMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-programs',
        android: '//*[@resource-id="nav-menu-programs"]',
      }),
    );
  }

  get enrollmentsMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-enrollments',
        android: '//*[@resource-id="nav-menu-enrollments"]',
      }),
    );
  }

  get licenseesMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-licensees',
        android: '//*[@resource-id="nav-menu-licensees"]',
      }),
    );
  }

  get buyersMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-buyers',
        android: '//*[@resource-id="nav-menu-buyers"]',
      }),
    );
  }

  // ========== Helper Methods ==========

  /**
   * Check if currently on the More page
   * @returns {Promise<boolean>}
   */
  async isOnMorePage() {
    try {
      return await this.headerTitle.isDisplayed();
    } catch (error) {
      console.debug(`More header title not found: ${error.message}`);
      return false;
    }
  }

  /**
   * Ensures the app is on the More page, navigating there if needed
   */
  async ensureMorePage() {
    const isOnMore = await this.isOnMorePage();
    if (isOnMore) {
      return;
    }

    // Click More tab from footer
    await this.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Agreements page
   */
  async navigateToAgreements() {
    await this.ensureMorePage();
    await this.agreementsMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Credit Memos page
   */
  async navigateToCreditMemos() {
    await this.ensureMorePage();
    await this.creditMemosMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Invoices page
   */
  async navigateToInvoices() {
    await this.ensureMorePage();
    await this.invoicesMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Statements page
   */
  async navigateToStatements() {
    await this.ensureMorePage();
    await this.statementsMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Users page
   */
  async navigateToUsers() {
    await this.ensureMorePage();
    await this.usersMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Programs page
   */
  async navigateToPrograms() {
    await this.ensureMorePage();
    await this.programsMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Enrollments page
   */
  async navigateToEnrollments() {
    await this.ensureMorePage();
    await this.enrollmentsMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Licensees page
   */
  async navigateToLicensees() {
    await this.ensureMorePage();
    await this.licenseesMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Buyers page
   */
  async navigateToBuyers() {
    await this.ensureMorePage();
    await this.buyersMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }
}

module.exports = new MorePage();
