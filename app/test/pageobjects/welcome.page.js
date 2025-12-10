const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');

class WelcomePage extends BasePage {
    constructor () {
        super();
    }

    get logoImage () {
        // Appium inspector displays iOS specific element locators need to research agnorstic referencing
        return $('//*[contains(@name, "FIXME!")]');
    }

    get welcomeTitle () {
        return $('//*[@name="Welcome"]');
    }

    get enterEmailSubTitle () {
        return $('//*[@name="Existing Marketplace users can now enjoy our mobile experience. Enter your registered email address below to gain access."]');
    }

    get emailInput () {
        return $('//XCUIElementTypeTextField');
    }

    get continueButton () {
        return $('//*[@name="Continue"]');
    }

    get troubleSigningInButton () {
        return $('//*[@name="Trouble signing in?"]');
    }

    get emailRequiredErrorLabel () {
        return $('//*[@name="Email is required"]');
    }

    get validEmailErrorLabel () {
        return $('//*[@name="Please enter a valid email address"]');
    }
}

module.exports = new WelcomePage();
