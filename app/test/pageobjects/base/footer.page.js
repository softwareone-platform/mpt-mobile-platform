const { $ } = require('@wdio/globals');

const { selectors } = require('../utils/selectors');

const BasePage = require('./base.page');

class FooterPage extends BasePage {
  get spotlightsTab() {
    return $(selectors.byAccessibilityId('nav-tab-spotlight'));
  }

  get ordersTab() {
    return $(selectors.byAccessibilityId('nav-tab-orders'));
  }

  get subscriptionsTab() {
    return $(selectors.byAccessibilityId('nav-tab-subscriptions'));
  }

  get moreTab() {
    return $(selectors.byAccessibilityId('nav-tab-more'));
  }

  async clickSpotlightsTab() {
    await this.click(this.spotlightsTab);
  }

  async clickOrdersTab() {
    await this.click(this.ordersTab);
  }

  async clickSubscriptionsTab() {
    await this.click(this.subscriptionsTab);
  }

  async clickMoreTab() {
    await this.click(this.moreTab);
  }
}

module.exports = new FooterPage();
