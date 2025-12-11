const { $ } = require('@wdio/globals');
const BasePage = require('./base.page');
const { selectors } = require('../utils/selectors');

class FooterPage extends BasePage {
    get spotlightsTab () {
        return $(selectors.byContainsText('Spotlight'));
    }

    get ordersTab () {
        return $(selectors.byContainsText('Orders'));
    }

    get subscriptionsTab () {
        return $(selectors.byContainsText('Subscriptions'));
    }

    get moreTab () {
        return $(selectors.byContainsText('More'));
    }

    async clickspotlightsTab() {
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
