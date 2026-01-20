const { $ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const { selectors } = require('./utils/selectors');

class WelcomePage extends BasePage {
  constructor() {
    super();
  }

  get logoImage() {
    return $(selectors.byResourceId('welcome-logo-image'));
  }

  get welcomeTitle() {
    return $(selectors.byResourceId('welcome-title-text'));
  }

  get enterEmailSubTitle() {
    return $(selectors.byResourceId('welcome-subtitle-text'));
  }

  get emailInput() {
    return $(selectors.byResourceId('welcome-email-input'));
  }

  get continueButton() {
    return $(selectors.byResourceId('welcome-continue-button'));
  }

  get troubleSigningInButton() {
    return $(selectors.byResourceId('welcome-trouble-link'));
  }

  get emailRequiredErrorLabel() {
    return $(selectors.byText('Email is required'));
  }

  get validEmailErrorLabel() {
    return $(selectors.byText('Please enter a valid email address'));
  }
}

module.exports = new WelcomePage();
