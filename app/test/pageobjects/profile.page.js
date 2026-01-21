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
    return $(
      getSelector({
        ios: '~YOUR PROFILE',
        android: '//*[@resource-id="profile-section-yourprofile-text"]',
      }),
    );
  }

  get currentUserCard() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "USR-")]',
        android: '//*[@resource-id="profile-user-item"]',
      }),
    );
  }

  get currentUserName() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "USR-")]/preceding-sibling::*[1]',
        android: '//*[@resource-id="profile-user-item"]//android.widget.TextView[1]',
      }),
    );
  }

  get currentUserId() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "USR-")]',
        android: '//*[@resource-id="profile-user-item"]//android.widget.TextView[contains(@text, "USR-")]',
      }),
    );
  }

  // ========== Switch Account Section ==========
  get switchAccountLabel() {
    return $(
      getSelector({
        ios: '~SWITCH ACCOUNT',
        android: '//*[@resource-id="profile-section-switchaccount-text"]',
      }),
    );
  }

  // ========== Account List Items ==========
  // First account item (can be used as reference for pattern)
  get firstAccountItem() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeOther[contains(@name, "ACC-")])[1]',
        android: '(//*[contains(@resource-id, "profile-account-item-ACC-")])[1]',
      }),
    );
  }

  // Get account item by index (1-based)
  getAccountItemByIndex(index) {
    return $(
      getSelector({
        ios: `(//XCUIElementTypeOther[contains(@name, "ACC-")])[${index}]`,
        android: `(//*[contains(@resource-id, "profile-account-item-ACC-")])[${index}]`,
      }),
    );
  }

  // Get account item by ACC ID (e.g., "ACC-1090-7378")
  getAccountItemById(accountId) {
    return $(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${accountId}")]`,
        android: `//*[@resource-id="profile-account-item-${accountId}"]`,
      }),
    );
  }

  // Get account name by index (1-based)
  getAccountNameByIndex(index) {
    return $(
      getSelector({
        ios: `(//XCUIElementTypeOther[contains(@name, "ACC-")])[${index}]//XCUIElementTypeStaticText[1]`,
        android: `(//*[contains(@resource-id, "profile-account-item-ACC-")])[${index}]//android.widget.TextView[1]`,
      }),
    );
  }

  // Get account ID by index (1-based)
  getAccountIdByIndex(index) {
    return $(
      getSelector({
        ios: `(//XCUIElementTypeOther[contains(@name, "ACC-")])[${index}]//XCUIElementTypeStaticText[contains(@name, "ACC-")]`,
        android: `(//*[contains(@resource-id, "profile-account-item-ACC-")])[${index}]//android.widget.TextView[contains(@text, "ACC-")]`,
      }),
    );
  }

  // Get all account items
  get allAccountItems() {
    return $$(
      getSelector({
        ios: '//XCUIElementTypeOther[contains(@name, "ACC-")]',
        android: '//*[contains(@resource-id, "profile-account-item-ACC-")]',
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

  async selectAccountById(accountId) {
    const account = this.getAccountItemById(accountId);
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
    const accountItem = this.getAccountItemByIndex(index);
    await accountItem.waitForDisplayed({ timeout: 10000 });
    
    // Get the label/name attribute which contains "AccountName, ACC-XXXX-XXXX"
    // iOS uses 'label' attribute, Android uses 'content-desc' or we need to get child TextView
    const isIOS = driver.capabilities.platformName?.toLowerCase() === 'ios';
    
    if (isIOS) {
      // iOS: Extract name from label attribute (format: "AccountName, ACC-XXXX-XXXX, ...")
      const label = await accountItem.getAttribute('label');
      // Split by ", ACC-" to get the account name part
      const namePart = label.split(', ACC-')[0];
      return namePart;
    } else {
      // Android: Try to get from child TextView
      const nameElement = this.getAccountNameByIndex(index);
      return await this.getText(nameElement);
    }
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
