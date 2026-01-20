const { $, $$ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const { getSelector, selectors } = require('./utils/selectors');

class ProfilePage extends BasePage {
  constructor() {
    super();
  }

  // ========== Header Elements ==========
  get goBackButton() {
    return $(
      getSelector({
        ios: '~Go back',
        android: '//android.widget.Button[@content-desc="Go back"]',
      }),
    );
  }

  get profileHeaderTitle() {
    return $(
      getSelector({
        ios: '~Profile',
        android: '//android.view.View[@text="Profile"]',
      }),
    );
  }

  // ========== Your Profile Section ==========
  get yourProfileLabel() {
    return $(selectors.byText('YOUR PROFILE'));
  }

  get currentUserCard() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "USR-")]',
        android: '//android.view.ViewGroup[contains(@content-desc, "USR-")][@clickable="true"]',
      }),
    );
  }

  get currentUserName() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "USR-")]/preceding-sibling::*[1]',
        android:
          '//android.view.ViewGroup[contains(@content-desc, "USR-")]//android.widget.TextView[1]',
      }),
    );
  }

  get currentUserId() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "USR-")]',
        android:
          '//android.view.ViewGroup[contains(@content-desc, "USR-")]//android.widget.TextView[contains(@text, "USR-")]',
      }),
    );
  }

  // ========== Switch Account Section ==========
  get switchAccountLabel() {
    return $(selectors.byText('SWITCH ACCOUNT'));
  }

  // ========== Account List Items ==========
  // First account item (can be used as reference for pattern)
  get firstAccountItem() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeOther[contains(@name, "ACC-")])[1]',
        android:
          '(//android.view.ViewGroup[contains(@content-desc, "ACC-") and not(contains(@content-desc, "USR-"))][@clickable="true"])[1]',
      }),
    );
  }

  // Get account item by index (1-based)
  getAccountItemByIndex(index) {
    return $(
      getSelector({
        ios: `(//XCUIElementTypeOther[contains(@name, "ACC-")])[${index}]`,
        android: `(//android.view.ViewGroup[contains(@content-desc, "ACC-") and not(contains(@content-desc, "USR-"))][@clickable="true"])[${index}]`,
      }),
    );
  }

  // Get account name by index (1-based)
  getAccountNameByIndex(index) {
    return $(
      getSelector({
        ios: `(//XCUIElementTypeOther[contains(@name, "ACC-")])[${index}]//XCUIElementTypeStaticText[1]`,
        android: `(//android.view.ViewGroup[contains(@content-desc, "ACC-") and not(contains(@content-desc, "USR-"))][@clickable="true"])[${index}]//android.widget.TextView[1]`,
      }),
    );
  }

  // Get account ID by index (1-based)
  getAccountIdByIndex(index) {
    return $(
      getSelector({
        ios: `(//XCUIElementTypeOther[contains(@name, "ACC-")])[${index}]//XCUIElementTypeStaticText[contains(@name, "ACC-")]`,
        android: `(//android.view.ViewGroup[contains(@content-desc, "ACC-") and not(contains(@content-desc, "USR-"))][@clickable="true"])[${index}]//android.widget.TextView[contains(@text, "ACC-")]`,
      }),
    );
  }

  // Get all account items
  get allAccountItems() {
    return $$(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "ACC-")]',
        android:
          '//android.view.ViewGroup[contains(@content-desc, "ACC-") and not(contains(@content-desc, "USR-"))][@clickable="true"]',
      }),
    );
  }

  // ========== Helper Methods ==========
  async goBack() {
    await this.click(this.goBackButton);
  }

  async selectCurrentUser() {
    await this.click(this.currentUserCard);
  }

  async selectAccountByIndex(index) {
    const account = this.getAccountItemByIndex(index);
    await this.click(account);
  }

  async selectFirstAccount() {
    await this.click(this.firstAccountItem);
  }

  async getAccountCount() {
    const accounts = await this.allAccountItems;
    return accounts.length;
  }

  async getAccountNameAtIndex(index) {
    const nameElement = this.getAccountNameByIndex(index);
    return await this.getText(nameElement);
  }

  async getAccountIdAtIndex(index) {
    const idElement = this.getAccountIdByIndex(index);
    return await this.getText(idElement);
  }

  async getCurrentUserName() {
    return await this.getText(this.currentUserName);
  }

  async getCurrentUserId() {
    return await this.getText(this.currentUserId);
  }

  async scrollToAccount(index) {
    // Scroll down to find account if not visible
    const account = this.getAccountItemByIndex(index);
    const isDisplayed = await account.isDisplayed();
    if (!isDisplayed) {
      await this.scrollDown();
    }
    return account;
  }
}

module.exports = new ProfilePage();
