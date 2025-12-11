const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const headingPage = require('./base/heading.page');
const footerPage = require('./base/footer.page');
const { selectors } = require('./utils/selectors');

class SpotlightsPage extends BasePage {
    constructor () {
        super();
        this.header = headingPage;
        this.footer = footerPage;
    }

    // Spotlight Header
    get spotlightHeader () {
        return $(selectors.staticText('Spotlight'));
    }

    // Main scroll view
    get scrollView () {
        return $(selectors.scrollView());
    }

    // ========== Long-Running Orders Section ==========
    get longRunningOrdersHeader () {
        return $(selectors.byContainsText('long-running orders'));
    }

    // ========== Expiring Subscriptions Section ==========
    get expiringSubscriptionsHeader () {
        return $(selectors.byContainsText('expiring subscriptions'));
    }

    // ========== Expired Invites Section ==========
    get expiredInvitesHeader () {
        return $('//XCUIElementTypeStaticText[contains(@name, "expired invites") and not(contains(@name, "of my clients"))]');
    }

    // ========== Pending Invites Section ==========
    get pendingInvitesHeader () {
        return $('//*[contains(@name, "pending invites")]');
    }

    // ========== Expired Invites of My Clients Section ==========
    get expiredInvitesOfMyClientsHeader () {
        return $('//*[contains(@name, "expired invites of my clients")]');
    }

    // ========== Invoices Past Due Section ==========
    get invoicesPastDueHeader () {
        return $('//*[contains(@name, "invoices past due")]');
    }

    // ========== In-Progress Journals Section ==========
    get inProgressJournalsHeader () {
        return $('//*[contains(@name, "in-progress journals")]');
    }

    // ========== Mismatching Buyers Section ==========
    get mismatchingBuyersHeader () {
        return $('//*[contains(@name, "mismatching buyers")]');
    }

    // ========== Buyers with Blocked Seller Connections Section ==========
    get buyersWithBlockedConnectionsHeader () {
        return $('//*[contains(@name, "buyers with blocked seller connections")]');
    }

    // ========== Helper Methods ==========
    async scrollToSection (sectionName) {
        const sectionSelector = `//*[contains(@name, "${sectionName}")]`;
        const section = $(sectionSelector);
        await section.scrollIntoView({ direction: 'down' });
        return section;
    }

    async isLongRunningOrdersSectionVisible () {
        return await this.longRunningOrdersHeader.isDisplayed();
    }

    async isExpiringSubscriptionsSectionVisible () {
        await this.scrollToSection('expiring subscriptions');
        return await this.expiringSubscriptionsHeader.isDisplayed();
    }

    async isExpiredInvitesSectionVisible () {
        await this.scrollToSection('expired invites');
        return await this.expiredInvitesHeader.isDisplayed();
    }

    async isPendingInvitesSectionVisible () {
        await this.scrollToSection('pending invites');
        return await this.pendingInvitesHeader.isDisplayed();
    }

    async isExpiredInvitesOfMyClientsSectionVisible () {
        await this.scrollToSection('expired invites of my clients');
        return await this.expiredInvitesOfMyClientsHeader.isDisplayed();
    }

    async isInvoicesPastDueSectionVisible () {
        await this.scrollToSection('invoices past due');
        return await this.invoicesPastDueHeader.isDisplayed();
    }

    async isInProgressJournalsSectionVisible () {
        await this.scrollToSection('in-progress journals');
        return await this.inProgressJournalsHeader.isDisplayed();
    }

    async isMismatchingBuyersSectionVisible () {
        await this.scrollToSection('mismatching buyers');
        return await this.mismatchingBuyersHeader.isDisplayed();
    }

    async isBuyersWithBlockedConnectionsSectionVisible () {
        await this.scrollToSection('buyers with blocked seller connections');
        return await this.buyersWithBlockedConnectionsHeader.isDisplayed();
    }
}

module.exports = new SpotlightsPage();
