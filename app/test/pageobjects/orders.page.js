const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const headingPage = require('./base/heading.page');
const footerPage = require('./base/footer.page');

class OrdersPage extends BasePage {
    constructor () {
        super();
        this.header = headingPage;
        this.footer = footerPage;
    }

    get defaultText () {
        return $('//*[contains(@name, "Orders Screen")]');
    }
}

module.exports = new OrdersPage();
