const { $ } = require('@wdio/globals');
const BasePage = require('./base.page');


class FooterPage extends BasePage {
    get spotlightTab () {
        return $('//*[contains(@name, "Spotlight, tab, 1 of 4")]');
    }

    get ordersTab () {
        return $('//*[contains(@name, "Orders, tab, 2 of 4")]');
    }

    get subscriptionsTab () {
        return $('//*[contains(@name, "Subscriptions, tab, 3 of 4")]');
    }

    get moreTab () {
        return $('//*[contains(@name, "More, tab, 4 of 4")]');
    }

    async clickSpotlightTab() {
        await this.click(this.spotlightTab);
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
