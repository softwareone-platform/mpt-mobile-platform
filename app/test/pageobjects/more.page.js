const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const headingPage = require('./base/heading.page');
const footerPage = require('./base/footer.page');

class MorePage extends BasePage {
    constructor () {
        super();
        this.header = headingPage;
        this.footer = footerPage;
    }
}

module.exports = new MorePage();
