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
    return $(selectors.byText('Personal Information'));
  }

  get firstNameField() {
    return $(selectors.byText('First Name'));
  }

  get lastNameField() {
    return $(selectors.byText('Last Name'));
  }

  get emailField() {
    return $(selectors.byText('E-mail'));
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
   * Gets the first name value from the element following the First Name label
   */
  async getFirstName() {
    const element = this.firstNameField;
    await element.waitForDisplayed();
    const valueElement = $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="First Name"]/following-sibling::XCUIElementTypeStaticText[1]',
        android: '//android.widget.TextView[@text="First Name"]/following-sibling::android.widget.TextView[1]',
      }),
    );
    return await valueElement.getText();
  }

  /**
   * Gets the last name value from the element following the Last Name label
   */
  async getLastName() {
    const element = this.lastNameField;
    await element.waitForDisplayed();
    const valueElement = $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Last Name"]/following-sibling::XCUIElementTypeStaticText[1]',
        android: '//android.widget.TextView[@text="Last Name"]/following-sibling::android.widget.TextView[1]',
      }),
    );
    return await valueElement.getText();
  }

  /**
   * Gets the email value from the element following the E-mail label
   */
  async getEmail() {
    const element = this.emailField;
    await element.waitForDisplayed();
    const valueElement = $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="E-mail"]/following-sibling::XCUIElementTypeStaticText[1]',
        android: '//android.widget.TextView[@text="E-mail"]/following-sibling::android.widget.TextView[1]',
      }),
    );
    return await valueElement.getText();
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
