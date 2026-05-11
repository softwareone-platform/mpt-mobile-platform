const { $, $$ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const { getSelector, selectors, isAndroid } = require('./utils/selectors');
const { PAUSE, GESTURE } = require('./utils/constants');

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

  get ordersMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-orders',
        android: '//*[@resource-id="nav-menu-orders"]',
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

  get clientsMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-clients',
        android: '//*[@resource-id="nav-menu-clients"]',
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

  get productsMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-products',
        android: '//*[@resource-id="nav-menu-products"]',
      }),
    );
  }

  get subscriptionsMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-subscriptions',
        android: '//*[@resource-id="nav-menu-subscriptions"]',
      }),
    );
  }

  get journalsMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-journals',
        android: '//*[@resource-id="nav-menu-journals"]',
      }),
    );
  }

  get vendorsMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-vendors',
        android: '//*[@resource-id="nav-menu-vendors"]',
      }),
    );
  }

  get allBuyersMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-allBuyers',
        android: '//*[@resource-id="nav-menu-allBuyers"]',
      }),
    );
  }

  get allUsersMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-allUsers',
        android: '//*[@resource-id="nav-menu-allUsers"]',
      }),
    );
  }

  get certificatesMenuItem() {
    return $(
      getSelector({
        ios: '~nav-menu-certificates',
        android: '//*[@resource-id="nav-menu-certificates"]',
      }),
    );
  }

  // ========== Group Heading Elements ==========

  get administrationGroupHeading() {
    return $(selectors.byText('Administration'));
  }

  get billingGroupHeading() {
    return $(selectors.byText('Billing'));
  }

  get catalogGroupHeading() {
    return $(selectors.byText('Catalog'));
  }

  get marketplaceGroupHeading() {
    return $(selectors.byText('Marketplace'));
  }

  get programGroupHeading() {
    return $(selectors.byText('Program'));
  }

  get settingsGroupHeading() {
    return $(selectors.byText('Settings'));
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
   * Navigate to Orders page
   */
  async navigateToOrders() {
    await this.ensureMorePage();
    await this.ordersMenuItem.click();
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
   * Navigate to Journals page
   */
  async navigateToJournals() {
    await this.ensureMorePage();
    await this.journalsMenuItem.click();
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
   * Navigate to Clients page (Operations role only)
   */
  async navigateToClients() {
    await this.ensureMorePage();
    await this.clientsMenuItem.click();
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
   * Navigate to Certificates page
   */
  async navigateToCertificates() {
    await this.ensureMorePage();
    await this.certificatesMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Licensees page
   * @deprecated Licensees is not in the More menu. Use Clients → Client Details → sub-list navigation instead.
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

  /**
   * Navigate to Products page
   */
  async navigateToProducts() {
    await this.ensureMorePage();
    await this.productsMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Subscriptions page
   */
  async navigateToSubscriptions() {
    await this.ensureMorePage();
    await this.subscriptionsMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Vendors page (Operations role only)
   */
  async navigateToVendors() {
    await this.ensureMorePage();
    await this.vendorsMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to All Buyers page (Operations role only)
   */
  async navigateToAllBuyers() {
    await this.ensureMorePage();
    await this.allBuyersMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to All Users page (Operations role only)
   */
  async navigateToAllUsers() {
    await this.ensureMorePage();
    await this.allUsersMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate to Certificates page
   */
  async navigateToCertificates() {
    await this.ensureMorePage();
    await this.certificatesMenuItem.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Scroll down within the More menu scroll view.
   * Uses the same swipe gesture pattern as list.page.js to avoid
   * scrollIntoView direction issues on iOS with nested ScrollViews.
   */
  async scrollDown() {
    if (isAndroid()) {
      await browser.execute('mobile: swipeGesture', {
        left: GESTURE.SWIPE_LEFT,
        top: GESTURE.SWIPE_TOP,
        width: GESTURE.SWIPE_WIDTH,
        height: GESTURE.SWIPE_HEIGHT,
        direction: 'up',
        percent: 0.5,
      });
    } else {
      await browser.execute('mobile: swipe', {
        direction: 'up',
        velocity: GESTURE.IOS_VELOCITY,
      });
    }
    await browser.pause(PAUSE.SWIPE_ANIMATION);
  }

  /**
   * Scroll down until the given element is displayed, or the scroll limit is reached.
   * @param {object} element - WebdriverIO element to scroll to
   * @param {number} maxScrolls - Maximum number of swipes (default 8)
   * @returns {Promise<boolean>} True if the element became displayed
   */
  async scrollToElement(element, maxScrolls = 8) {
    for (let i = 0; i < maxScrolls; i++) {
      const displayed = await element.isDisplayed().catch(() => false);
      if (displayed) return true;
      await this.scrollDown();
    }
    return await element.isDisplayed().catch(() => false);
  }

  /**
   * Returns an array of testIDs for all menu items currently visible on the More page.
   * Used to assert which items are present for the current user role/modules.
   * @returns {Promise<string[]>} Array of testID strings (e.g. 'nav-menu-agreements')
   */
  async getVisibleMenuItemIds() {
    await this.ensureMorePage();
    const allMenuItems = await $$(
      getSelector({
        ios: `//XCUIElementTypeOther[starts-with(@name, "nav-menu-")]`,
        android: `//*[starts-with(@resource-id, "nav-menu-")]`,
      }),
    );
    const ids = [];
    for (const el of allMenuItems) {
      try {
        const id = await el.getAttribute(
          getSelector({ ios: 'name', android: 'resource-id' }),
        );
        if (id) ids.push(id);
      } catch (_) {
        // skip elements that can't be read
      }
    }
    return ids;
  }
}

module.exports = new MorePage();
