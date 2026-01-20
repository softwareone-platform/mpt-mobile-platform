const { $ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const { selectors } = require('./utils/selectors');

class OrdersPage extends BasePage {
  constructor() {
    super();
    this.header = headingPage;
    this.footer = footerPage;
  }

  get defaultText() {
    return $(selectors.byContainsText('Orders Screen'));
  }
}

module.exports = new OrdersPage();
