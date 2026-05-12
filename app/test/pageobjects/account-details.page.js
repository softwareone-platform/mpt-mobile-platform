const { $ } = require('@wdio/globals');
const DetailsPage = require('./base/details.page');
const { getSelector, selectors } = require('./utils/selectors');
const { PAUSE, SCROLL } = require('./utils/constants');

/**
 * Account Details Page - displays detailed information for a single client account.
 * Accessed by tapping a client item from the Clients list page.
 * Extends DetailsPage for common detail page functionality.
 *
 * Navigation: More → Clients → [tap ACC- item] → Account Details
 * Requires Operations role account (ensureOperationsAccount).
 */
class AccountDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'ACC-';
  }

  get pageName() {
    return 'Client';
  }

  /**
   * @alias for itemIdText
   */
  get accountIdText() {
    return this.itemIdText;
  }

  /**
   * The account name element rendered in the details header (testID: account-details-header-title).
   * Distinct from the navigation bar title ('Client') — this shows the actual account name.
   */
  get accountNameText() {
    return $(selectors.byAccessibilityId('account-details-header-title'));
  }

  /**
   * The status badge element (testID: account-details-header-status).
   * The status text itself is a sibling StaticText — use getStatus() to read it.
   */
  get accountStatusBadge() {
    return $(selectors.byAccessibilityId('account-details-header-status'));
  }

  /**
   * Returns a selector for the NavigationItem sublist entry with the given name.
   * Sublists (Buyers, Licensees, Users) render as accessible XCUIElementTypeOther elements
   * with label format "Name, " on iOS / content-desc "Name, " on Android.
   * @param {string} name - Sublist name, e.g. 'Buyers', 'Licensees', 'Users'
   * @returns {WebdriverIO.Element}
   */
  findSubListItem(name) {
    return $(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${name}")]`,
        android: `//*[contains(@content-desc, "${name}")]`,
      }),
    );
  }

  /**
   * Scroll down until the named sublist navigation item is visible, then return it.
   * @param {string} name - Sublist name, e.g. 'Buyers', 'Licensees', 'Users'
   * @returns {Promise<WebdriverIO.Element>} The visible sublist element
   * @throws {Error} If not found after max scroll attempts
   */
  async scrollToSubListItem(name) {
    for (let attempt = 0; attempt < SCROLL.MAX_SCROLL_ATTEMPTS; attempt++) {
      const el = this.findSubListItem(name);
      const isDisplayed = await el.isDisplayed().catch(() => false);
      if (isDisplayed) return el;
      await this.scrollDown();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
    }
    throw new Error(`Sub-list item "${name}" not found after ${SCROLL.MAX_SCROLL_ATTEMPTS} scroll attempts`);
  }

  /**
   * Check whether the named sublist item is present on the page (with scroll).
   * @param {string} name - Sublist name, e.g. 'Buyers', 'Licensees', 'Users'
   * @returns {Promise<boolean>}
   */
  async hasSubList(name) {
    try {
      await this.scrollToSubListItem(name);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll to find the named sublist item and tap it to navigate into the sublist.
   * @param {string} name - Sublist name, e.g. 'Buyers', 'Licensees', 'Users'
   */
  async tapSubList(name) {
    const el = await this.scrollToSubListItem(name);
    await el.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Get the account name shown in the details header content area.
   * @returns {Promise<string>} Account name (e.g. '[e2e] Dummy Client')
   */
  async getAccountName() {
    const text = await this.accountNameText.getText();
    return text.trim();
  }

  /**
   * Get all visible account details fields as an object.
   * Scrolls to top first to ensure consistent extraction order.
   * @returns {Promise<Object>} Account details object
   */
  async getAllAccountDetails() {
    await this.scrollToTop();
    return {
      accountId: await this.getItemId(),
      status: await this.getStatus(),
      serviceLevel: await this.getSimpleFieldValue('Service level', true).catch(() => ''),
      companyWebsite: await this.getSimpleFieldValue('Company website', true).catch(() => ''),
      companyDescription: await this.getSimpleFieldValue('Company description', true).catch(() => ''),
      technicalSupportEmail: await this.getSimpleFieldValue('Technical support email', true).catch(() => ''),
      pycId: await this.getSimpleFieldValue('PYC ID', true).catch(() => ''),
    };
  }

  /**
   * Get headquarters address fields (requires scrolling past the details section).
   * @returns {Promise<Object>} Address fields object
   */
  async getAddressDetails() {
    return {
      addressLine1: await this.getSimpleFieldValue('Address line 1', true).catch(() => ''),
      addressLine2: await this.getSimpleFieldValue('Address line 2', true).catch(() => ''),
      city: await this.getSimpleFieldValue('City', true).catch(() => ''),
      state: await this.getSimpleFieldValue('State', true).catch(() => ''),
      postCode: await this.getSimpleFieldValue('ZIP/Postal code', true).catch(() => ''),
      country: await this.getSimpleFieldValue('Country', true).catch(() => ''),
    };
  }
}

module.exports = new AccountDetailsPage();
