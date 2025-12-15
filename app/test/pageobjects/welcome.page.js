const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const { selectors } = require('./utils/selectors');

class WelcomePage extends BasePage {
    constructor () {
        super();
    }

    get logoImage () {
        return $('~welcome-logo-image');
    }

    get welcomeTitle () {
        return $('~welcome-title-text');
    }

    get enterEmailSubTitle () {
        return $('~welcome-subtitle-text');
    }

    get emailInput () {
        return $('~welcome-email-input');
    }

    get continueButton () {
        return $('~welcome-continue-button');
    }

    get troubleSigningInButton () {
        return $('~welcome-trouble-link');
    }

    get emailRequiredErrorLabel () {
        return $(selectors.byText('Email is required'));
    }

    get validEmailErrorLabel () {
        return $(selectors.byText('Please enter a valid email address'));
    }
}

module.exports = new WelcomePage();
