const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const headingPage = require('./base/heading.page');
const footerPage = require('./base/footer.page');

class SubscriptionsPage extends BasePage {
    constructor () {
        super();
        this.header = headingPage;
        this.footer = footerPage;
    }

    get defaultText () {
        return $('//*[contains(@name, "Subscriptions Screen")]');
    }
}

module.exports = new SubscriptionsPage();
