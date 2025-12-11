const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const { getSelector, selectors } = require('./utils/selectors');

class WelcomePage extends BasePage {
    constructor () {
        super();
    }

    get logoImage () {
        return $(getSelector({
            ios: '//*[contains(@name, "FIXME!")]',
            android: '(//android.widget.ImageView)[1]'
        }));
    }

    get welcomeTitle () {
        return $(selectors.byText('Welcome'));
    }

    get enterEmailSubTitle () {
        return $(selectors.byContainsText('Existing Marketplace users'));
    }

    get emailInput () {
        return $(selectors.textField());
    }

    get continueButton () {
        return $(selectors.button('Continue'));
    }

    get troubleSigningInButton () {
        return $(selectors.button('Trouble signing in?'));
    }

    get emailRequiredErrorLabel () {
        return $(selectors.byText('Email is required'));
    }

    get validEmailErrorLabel () {
        return $(selectors.byText('Please enter a valid email address'));
    }
}

module.exports = new WelcomePage();
