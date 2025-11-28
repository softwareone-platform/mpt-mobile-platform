const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const headingPage = require('./base/heading.page');
const footerPage = require('./base/footer.page');

class SpotlightsPage extends BasePage {
    constructor () {
        super();
        this.header = headingPage;
        this.footer = footerPage;
    }

    get defaultText () {
        return $('//*[contains(@name, "Spotlight Screen")]');
    }
}

module.exports = new SpotlightsPage();
