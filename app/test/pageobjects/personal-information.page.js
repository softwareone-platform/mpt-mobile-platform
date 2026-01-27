const { $ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const { getSelector, selectors } = require('./utils/selectors');
const { TIMEOUT } = require('./utils/constants');

class PersonalInformationPage extends BasePage {
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
    return $(selectors.byText('Personal Information'));
  }

  // ========== User Profile Section ==========
  get userFullName() {
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

  get firstNameField() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "First Name,")]',
        android: '//*[contains(@content-desc, "First Name,") or contains(@text, "First Name")]',
      }),
    );
  }

  get lastNameField() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "Last Name,")]',
        android: '//*[contains(@content-desc, "Last Name,") or contains(@text, "Last Name")]',
      }),
    );
  }

  get emailField() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "E-mail,")]',
        android: '//*[contains(@content-desc, "E-mail,") or contains(@text, "E-mail")]',
      }),
    );
  }

  get phoneNumberField() {
    return $(
      getSelector({
        ios: '//*[contains(@name, "Phone number")]',
        android: '//*[contains(@content-desc, "Phone number") or contains(@text, "Phone number")]',
      }),
    );
  }

  // ========== Value Extraction Helpers ==========
  /**
   * Gets the first name value from the First Name field
   * The field has format "First Name, <value>"
   */
  async getFirstName() {
    const element = this.firstNameField;
    await element.waitForDisplayed();

    if (this.isIOS()) {
      const name = await element.getAttribute('name');
      // Format: "First Name, Marketplatform"
      return name.replace('First Name, ', '');
    } else {
      const desc = await element.getAttribute('content-desc');
      return desc.replace('First Name, ', '');
    }
  }

  /**
   * Gets the last name value from the Last Name field
   */
  async getLastName() {
    const element = this.lastNameField;
    await element.waitForDisplayed();

    if (this.isIOS()) {
      const name = await element.getAttribute('name');
      return name.replace('Last Name, ', '');
    } else {
      const desc = await element.getAttribute('content-desc');
      return desc.replace('Last Name, ', '');
    }
  }

  /**
   * Gets the email value from the E-mail field
   */
  async getEmail() {
    const element = this.emailField;
    await element.waitForDisplayed();

    if (this.isIOS()) {
      const name = await element.getAttribute('name');
      return name.replace('E-mail, ', '');
    } else {
      const desc = await element.getAttribute('content-desc');
      return desc.replace('E-mail, ', '');
    }
  }

  /**
   * Gets the user's full name from the profile section
   */
  async getUserFullName() {
    return await this.getText(this.userFullName);
  }

  /**
   * Gets the user ID (USR-XXXX-XXXX format)
   */
  async getUserId() {
    return await this.getText(this.userId);
  }

  // ========== Navigation Helpers ==========
  async goBack() {
    await this.click(this.goBackButton);
  }

  // ========== Validation Helpers ==========
  async isPageDisplayed() {
    try {
      await this.headerTitle.waitForDisplayed({ timeout: TIMEOUT.HEADER_WAIT });
      return true;
    } catch (error) {
      console.debug(`Personal Information header not found: ${error.message}`);
      return false;
    }
  }

  async isUserDetailsVisible() {
    try {
      await this.userDetailsLabel.waitForDisplayed({ timeout: TIMEOUT.SHORT_WAIT });
      return true;
    } catch (error) {
      console.debug(`User details label not found: ${error.message}`);
      return false;
    }
  }
}

module.exports = new PersonalInformationPage();
