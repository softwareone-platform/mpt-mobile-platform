const { $ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const { getSelector, selectors } = require('./utils/selectors');

class UserSettingsPage extends BasePage {
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

  get headerTitle() {
    return $(selectors.byText('User Settings'));
  }

  // ========== User Info Section ==========
  get userName() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "USR-")]/preceding-sibling::XCUIElementTypeStaticText[1]',
        android: '//android.widget.TextView[following-sibling::*[contains(@text, "USR-")]]',
      }),
    );
  }

  get userId() {
    return $(selectors.byContainsText('USR-'));
  }

  // ========== User Details Section ==========
  get userDetailsLabel() {
    return $(selectors.byText('USER DETAILS'));
  }

  // Note: The accessibility ID includes an icon character from the OutlinedIcon component
  // The NavigationItemWithIcon component auto-generates accessibility labels from content
  get personalInformationItem() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "Personal Information")]',
        android: '//*[contains(@content-desc, "Personal Information") or contains(@text, "Personal Information")]',
      }),
    );
  }

  get regionalSettingsItem() {
    return $(selectors.byAccessibilityId('Regional Settings'));
  }

  get securityItem() {
    return $(selectors.byAccessibilityId('Security'));
  }

  // ========== Communication Section ==========
  get communicationLabel() {
    return $(selectors.byText('COMMUNICATION'));
  }

  get notificationSettingsItem() {
    return $(selectors.byAccessibilityId('Notification Settings'));
  }

  get emailSettingsItem() {
    return $(selectors.byAccessibilityId('Email Settings'));
  }

  // ========== Sign Out ==========
  get signOutButton() {
    return $(selectors.byAccessibilityId('Sign out'));
  }

  // ========== Helper Methods ==========
  async goBack() {
    await this.click(this.goBackButton);
  }

  async openPersonalInformation() {
    await this.click(this.personalInformationItem);
  }

  async openRegionalSettings() {
    await this.click(this.regionalSettingsItem);
  }

  async openSecurity() {
    await this.click(this.securityItem);
  }

  async openNotificationSettings() {
    await this.click(this.notificationSettingsItem);
  }

  async openEmailSettings() {
    await this.click(this.emailSettingsItem);
  }

  async signOut() {
    await this.click(this.signOutButton);
  }

  async getUserName() {
    return await this.getText(this.userName);
  }

  async getUserId() {
    return await this.getText(this.userId);
  }
}

module.exports = new UserSettingsPage();
