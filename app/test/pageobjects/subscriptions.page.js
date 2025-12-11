const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const headingPage = require('./base/heading.page');
const footerPage = require('./base/footer.page');
const { selectors } = require('./utils/selectors');

class SubscriptionsPage extends BasePage {
    constructor () {
        super();
        this.header = headingPage;
        this.footer = footerPage;
    }

    get defaultText () {
        return $(selectors.byContainsText('Subscriptions Screen'));
    }
}

module.exports = new SubscriptionsPage();
