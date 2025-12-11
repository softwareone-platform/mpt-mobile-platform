const { $, $$ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const headingPage = require('./base/heading.page');
const footerPage = require('./base/footer.page');
const { getSelector, selectors } = require('./utils/selectors');

class SpotlightsPage extends BasePage {
    constructor () {
        super();
        this.header = headingPage;
        this.footer = footerPage;
    }

    get defaultText () {
        return $(selectors.byContainsText('Spotlight Screen'));
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

    async longRunningOrdersCount () {
        const headerText = await this.longRunningOrdersHeader.getText();
        const match = headerText.match(/\d+/);
        return match ? match[0] : '0';
    }

    get longRunningOrdersList () {
        return $$(getSelector({
            ios: '//XCUIElementTypeOther[contains(@name, \"ORD-\") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, \"long-running orders\")]][position() <= 5]',
            android: '//*[contains(@text, \"ORD-\")]'
        }));
    }

    longRunningOrderByIndex (index) {
        return $$(getSelector({
            ios: '//XCUIElementTypeOther[contains(@name, \"ORD-\") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, \"long-running orders\")]]',
            android: '//*[contains(@text, \"ORD-\")]'
        }))[index];
    }

    longRunningOrderById (orderId) {
        return $(getSelector({
            ios: `//XCUIElementTypeOther[contains(@name, \"${orderId}\") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, \"long-running orders\")]]`,
            android: `//*[contains(@text, \"${orderId}\")]`
        }));
    }

    get longRunningOrdersViewAll () {
        return $(selectors.byContainsText('view all'));
    }

    // ========== Expiring Subscriptions Section ==========
    get expiringSubscriptionsHeader () {
        return $(selectors.byContainsText('expiring subscriptions'));
    }

    async expiringSubscriptionsCount () {
        const headerText = await this.expiringSubscriptionsHeader.getText();
        const match = headerText.match(/\d+/);
        return match ? match[0] : '0';
    }

    get expiringSubscriptionsList () {
        return $$(getSelector({
            ios: '//XCUIElementTypeOther[contains(@name, "SUB-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "expiring subscriptions")]][position() <= 5]',
            android: '//*[contains(@text, "SUB-")]'
        }));
    }

    expiringSubscriptionByIndex (index) {
        return $$(getSelector({
            ios: '//XCUIElementTypeOther[contains(@name, "SUB-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "expiring subscriptions")]]',
            android: '//*[contains(@text, "SUB-")]'
        }))[index];
    }

    expiringSubscriptionById (subscriptionId) {
        return $(getSelector({
            ios: `//XCUIElementTypeOther[contains(@name, "${subscriptionId}") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "expiring subscriptions")]]`,
            android: `//*[contains(@text, "${subscriptionId}")]`
        }));
    }

    get expiringSubscriptionsViewAll () {
        return $(selectors.byContainsText('view all'));
    }

    // ========== Expired Invites Section ==========
    get expiredInvitesHeader () {
        return $('//XCUIElementTypeStaticText[contains(@name, "expired invites") and not(contains(@name, "of my clients"))]');
    }

    async expiredInvitesCount () {
        const headerText = await this.expiredInvitesHeader.getText();
        const match = headerText.match(/\d+/);
        return match ? match[0] : '0';
    }

    get expiredInvitesList () {
        return $$('//XCUIElementTypeOther[contains(@name, "USR-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "expired invites") and not(contains(@name, "of my clients"))]][position() <= 5]');
    }

    expiredInviteByIndex (index) {
        return $$('//XCUIElementTypeOther[contains(@name, "USR-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "expired invites") and not(contains(@name, "of my clients"))]]')[index];
    }

    expiredInviteById (userId) {
        return $(`//XCUIElementTypeOther[contains(@name, "${userId}") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "expired invites") and not(contains(@name, "of my clients"))]]`);
    }

    expiredInviteByName (userName) {
        return $(`//XCUIElementTypeOther[contains(@name, "${userName}") and contains(@name, "USR-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "expired invites") and not(contains(@name, "of my clients"))]]`);
    }

    get expiredInvitesViewAll () {
        return $('//*[contains(@name, "expired invites") and not(contains(@name, "of my clients"))]/following-sibling::XCUIElementTypeStaticText[contains(@name, "view all")]');
    }

    // ========== Pending Invites Section ==========
    get pendingInvitesHeader () {
        return $('//*[contains(@name, "pending invites")]');
    }

    async pendingInvitesCount () {
        const headerText = await this.pendingInvitesHeader.getText();
        const match = headerText.match(/\d+/);
        return match ? match[0] : '0';
    }

    get pendingInvitesList () {
        return $$('//XCUIElementTypeOther[contains(@name, "USR-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "pending invites")]][position() <= 5]');
    }

    pendingInviteByIndex (index) {
        return $$('//XCUIElementTypeOther[contains(@name, "USR-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "pending invites")]]')[index];
    }

    get pendingInvitesViewAll () {
        return $('//*[contains(@name, "pending invites")]/following-sibling::XCUIElementTypeStaticText[contains(@name, "view all")]');
    }

    // ========== Expired Invites of My Clients Section ==========
    get expiredInvitesOfMyClientsHeader () {
        return $('//*[contains(@name, "expired invites of my clients")]');
    }

    async expiredInvitesOfMyClientsCount () {
        const headerText = await this.expiredInvitesOfMyClientsHeader.getText();
        const match = headerText.match(/\d+/);
        return match ? match[0] : '0';
    }

    get expiredInvitesOfMyClientsList () {
        return $$('//XCUIElementTypeOther[contains(@name, "USR-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "expired invites of my clients")]][position() <= 5]');
    }

    expiredInviteOfMyClientsByIndex (index) {
        return $$('//XCUIElementTypeOther[contains(@name, "USR-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "expired invites of my clients")]]')[index];
    }

    get expiredInvitesOfMyClientsViewAll () {
        return $('//*[contains(@name, "expired invites of my clients")]/following-sibling::XCUIElementTypeStaticText[contains(@name, "view all")]');
    }

    // ========== Invoices Past Due Section ==========
    get invoicesPastDueHeader () {
        return $('//*[contains(@name, "invoices past due")]');
    }

    async invoicesPastDueCount () {
        const headerText = await this.invoicesPastDueHeader.getText();
        const match = headerText.match(/\d+/);
        return match ? match[0] : '0';
    }

    get invoicesPastDueList () {
        return $$('//XCUIElementTypeOther[contains(@name, "INV-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "invoices past due")]][position() <= 5]');
    }

    invoicePastDueByIndex (index) {
        return $$('//XCUIElementTypeOther[contains(@name, "INV-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "invoices past due")]]')[index];
    }

    get invoicesPastDueViewAll () {
        return $('//*[contains(@name, "invoices past due")]/following-sibling::XCUIElementTypeStaticText[contains(@name, "view all")]');
    }

    // ========== In-Progress Journals Section ==========
    get inProgressJournalsHeader () {
        return $('//*[contains(@name, "in-progress journals")]');
    }

    async inProgressJournalsCount () {
        const headerText = await this.inProgressJournalsHeader.getText();
        const match = headerText.match(/\d+/);
        return match ? match[0] : '0';
    }

    get inProgressJournalsList () {
        return $$('//XCUIElementTypeOther[contains(@name, "BJO-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "in-progress journals")]][position() <= 5]');
    }

    inProgressJournalByIndex (index) {
        return $$('//XCUIElementTypeOther[contains(@name, "BJO-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "in-progress journals")]]')[index];
    }

    get inProgressJournalsViewAll () {
        return $('//*[contains(@name, "in-progress journals")]/following-sibling::XCUIElementTypeStaticText[contains(@name, "view all")]');
    }

    // ========== Mismatching Buyers Section ==========
    get mismatchingBuyersHeader () {
        return $('//*[contains(@name, "mismatching buyers")]');
    }

    async mismatchingBuyersCount () {
        const headerText = await this.mismatchingBuyersHeader.getText();
        const match = headerText.match(/\d+/);
        return match ? match[0] : '0';
    }

    get mismatchingBuyersList () {
        return $$('//XCUIElementTypeOther[contains(@name, "BUY-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "mismatching buyers")]][position() <= 5]');
    }

    mismatchingBuyerByIndex (index) {
        return $$('//XCUIElementTypeOther[contains(@name, "BUY-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "mismatching buyers")]]')[index];
    }

    get mismatchingBuyersViewAll () {
        return $('//*[contains(@name, "mismatching buyers")]/following-sibling::XCUIElementTypeStaticText[contains(@name, "view all")]');
    }

    // ========== Buyers with Blocked Seller Connections Section ==========
    get buyersWithBlockedConnectionsHeader () {
        return $('//*[contains(@name, "buyers with blocked seller connections")]');
    }

    async buyersWithBlockedConnectionsCount () {
        const headerText = await this.buyersWithBlockedConnectionsHeader.getText();
        const match = headerText.match(/\d+/);
        return match ? match[0] : '0';
    }

    get buyersWithBlockedConnectionsList () {
        return $$('//XCUIElementTypeOther[contains(@name, "BUY-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "buyers with blocked seller connections")]][position() <= 5]');
    }

    buyerWithBlockedConnectionByIndex (index) {
        return $$('//XCUIElementTypeOther[contains(@name, "BUY-") and preceding-sibling::XCUIElementTypeStaticText[contains(@name, "buyers with blocked seller connections")]]')[index];
    }

    get buyersWithBlockedConnectionsViewAll () {
        return $('//*[contains(@name, "buyers with blocked seller connections")]/following-sibling::XCUIElementTypeStaticText[contains(@name, "view all")]');
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

    async tapViewAllForSection (sectionName) {
        const viewAllButton = $(`//*[contains(@name, "${sectionName}")]/following-sibling::XCUIElementTypeStaticText[contains(@name, "view all")]`);
        await viewAllButton.click();
    }
}

module.exports = new SpotlightsPage();
