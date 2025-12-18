const { $, $$ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const headingPage = require('./base/heading.page');
const footerPage = require('./base/footer.page');
const { selectors, isAndroid, getSelector } = require('./utils/selectors');

class SpotlightsPage extends BasePage {
    constructor () {
        super();
        this.header = headingPage;
        this.footer = footerPage;
    }

    // Spotlight Header - use element type to distinguish from footer tab (Button on iOS)
    get spotlightHeader () {
        return $(getSelector({
            ios: '(//XCUIElementTypeStaticText[@name="Spotlight"])[last()]',
            android: '//android.view.View[@text="Spotlight" and @heading="true"]'
        }));
    }

    // Main scroll view
    get scrollView () {
        return $(selectors.scrollView());
    }

    // ========== Filter Chips ==========
    get filterAll () {
        return $(selectors.byResourceId('spotlight-filter-all'));
    }

    get filterOrders () {
        return $(selectors.byResourceId('spotlight-filter-orders'));
    }

    get filterSubscriptions () {
        return $(selectors.byResourceId('spotlight-filter-subscriptions'));
    }

    get filterUsers () {
        return $(selectors.byResourceId('spotlight-filter-users'));
    }

    get filterInvoices () {
        return $(selectors.byResourceId('spotlight-filter-invoices'));
    }

    get filterJournals () {
        return $(selectors.byResourceId('spotlight-filter-journals'));
    }

    get filterBuyers () {
        return $(selectors.byResourceId('spotlight-filter-buyers'));
    }

    // ========== Account Button ==========
    get accountButton () {
        return $(selectors.byResourceId('nav-account-button'));
    }

    // ========== Navigation Tabs ==========
    get navTabSpotlight () {
        return $(selectors.byContentDesc('nav-tab-spotlight'));
    }

    get navTabOrders () {
        return $(selectors.byContentDesc('nav-tab-orders'));
    }

    get navTabSubscriptions () {
        return $(selectors.byContentDesc('nav-tab-subscriptions'));
    }

    get navTabMore () {
        return $(selectors.byContentDesc('nav-tab-more'));
    }

    // ========== Generic Card Selectors ==========
    /**
     * Get a spotlight card by type
     * @param {string} type - 'orders', 'subscriptions', 'users', 'invoices', 'journals', 'buyers'
     */
    getCardByType (type) {
        return $(selectors.byStartsWithResourceId(`spotlight-card-${type}-`));
    }

    /**
     * Get all spotlight cards of a specific type
     * @param {string} type - 'orders', 'subscriptions', 'users', 'invoices', 'journals', 'buyers'
     */
    getAllCardsByType (type) {
        return $$(selectors.byStartsWithResourceId(`spotlight-card-${type}-`));
    }

    /**
     * Get card header by text pattern
     * @param {string} pattern - e.g., 'long running orders', 'expiring subscriptions'
     */
    getCardHeaderByPattern (pattern) {
        return $(selectors.staticTextByIdPrefixAndPattern('spotlight-card-header-', pattern));
    }

    /**
     * Get card footer by text pattern
     * @param {string} pattern - e.g., 'view all'
     */
    getCardFooterByPattern (pattern) {
        return $(selectors.staticTextByIdPrefixAndPattern('spotlight-card-footer-', pattern));
    }

    // ========== Individual Item Selectors ==========
    /**
     * Get a specific spotlight item by entity ID
     * @param {string} entityId - e.g., 'ORD-2143-9364-6285', 'SUB-0362-5725-8196'
     */
    getSpotlightItem (entityId) {
        return $(selectors.byResourceId(`spotlight-item-${entityId}`));
    }

    /**
     * Get visible items from a card type
     * @param {string} cardType - 'orders', 'subscriptions', 'users', 'invoices', 'journals', 'buyers'
     * @param {number} count - max items to return (default 5)
     */
    async getVisibleItemsFromCard (cardType, count = 5) {
        const prefixMap = {
            orders: 'ORD',
            subscriptions: 'SUB',
            users: 'USR',
            invoices: 'INV',
            journals: 'BJO',
            buyers: 'BUY'
        };
        const prefix = prefixMap[cardType] || cardType.substring(0, 3).toUpperCase();

        const items = await $$(selectors.spotlightItemsByPrefix(prefix));
        return items.slice(0, count);
    }

    // ========== Long-Running Orders Section ==========
    get longRunningOrdersHeader () {
        // Note: Android text is "long running orders" (no hyphen)
        return $(selectors.byContainsTextAny('long-running orders', 'long running orders'));
    }

    get longRunningOrdersCard () {
        return this.getCardByType('orders');
    }

    // ========== Expiring Subscriptions Section ==========
    get expiringSubscriptionsHeader () {
        return $(selectors.byContainsText('expiring subscriptions'));
    }

    get expiringSubscriptionsCard () {
        return this.getCardByType('subscriptions');
    }

    // ========== Expired Invites Section ==========
    get expiredInvitesHeader () {
        return $(selectors.textContainsButNotContains('expired invites', 'of my clients'));
    }

    // ========== Pending Invites Section ==========
    get pendingInvitesHeader () {
        return $(selectors.byContainsText('pending invites'));
    }

    // ========== Expired Invites of My Clients Section ==========
    get expiredInvitesOfMyClientsHeader () {
        return $(selectors.byContainsText('expired invites of my clients'));
    }

    // ========== Past due invoices Section ==========
    get invoicesPastDueHeader () {
        // Note: Android text may be "past due invoices" or "past due invoices"
        return $(selectors.byContainsTextAny('past due invoices', 'past due invoices'));
    }

    get invoicesPastDueCard () {
        return this.getCardByType('invoices');
    }

    // ========== In progress Journals Section ==========
    get inProgressJournalsHeader () {
        // Note: Android text is "in progress journals" (no hyphen)
        return $(selectors.byContainsTextAny('in progress journals', 'in progress journals'));
    }

    get inProgressJournalsCard () {
        return this.getCardByType('journals');
    }

    // ========== Mismatching Buyers Section ==========
    get mismatchingBuyersHeader () {
        return $(selectors.byContainsText('mismatching buyers'));
    }

    // ========== Buyers with Blocked Seller Connections Section ==========
    get buyersWithBlockedConnectionsHeader () {
        return $(selectors.byContainsText('buyers with blocked seller connections'));
    }

    get buyersCard () {
        return this.getCardByType('buyers');
    }

    // ========== Helper Methods ==========
    async scrollToSection (sectionName) {
        const section = $(selectors.byContainsText(sectionName));
        // On Android, isDisplayed() returns false for off-screen elements, so we can skip scroll if visible
        // On iOS, visibility checks don't work reliably - scroll in small increments
        if (isAndroid()) {
            const isVisible = await section.isDisplayed().catch(() => false);
            if (!isVisible) {
                await section.scrollIntoView();
            }
        } else {
            // iOS: scroll in small increments until element is found
            const maxScrolls = 15;
            for (let i = 0; i < maxScrolls; i++) {
                const isVisible = await section.isDisplayed().catch(() => false);
                if (isVisible) break;
                // Small swipe gesture - swipe up from middle to scroll content down
                await browser.execute('mobile: swipe', {
                    direction: 'up',
                    velocity: 500
                });
                await browser.pause(200);
            }
        }
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
        await this.scrollToSection('past due invoices');
        return await this.invoicesPastDueHeader.isDisplayed();
    }

    async isInProgressJournalsSectionVisible () {
        await this.scrollToSection('in progress journals');
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

    // ========== Filter Chip Methods ==========
    /**
     * Select a filter chip by name
     * @param {string} filterName - 'all', 'orders', 'subscriptions', 'users', 'invoices', 'journals', 'buyers'
     */
    async selectFilter (filterName) {
        const filterMap = {
            all: this.filterAll,
            orders: this.filterOrders,
            subscriptions: this.filterSubscriptions,
            users: this.filterUsers,
            invoices: this.filterInvoices,
            journals: this.filterJournals,
            buyers: this.filterBuyers
        };
        const filter = filterMap[filterName.toLowerCase()];
        if (!filter) {
            throw new Error(`Unknown filter: ${filterName}`);
        }
        await filter.click();
    }

    /**
     * Check if a filter is selected (iOS uses value="1" for selected state)
     * @param {string} filterName - filter name
     */
    async isFilterSelected (filterName) {
        const filterMap = {
            all: this.filterAll,
            orders: this.filterOrders,
            subscriptions: this.filterSubscriptions,
            users: this.filterUsers,
            invoices: this.filterInvoices,
            journals: this.filterJournals,
            buyers: this.filterBuyers
        };
        const filter = filterMap[filterName.toLowerCase()];
        const selected = await filter.getAttribute('value');
        return selected === '1';
    }

    // ========== Card Count Methods ==========
    /**
     * Count visible spotlight cards
     */
    async getVisibleCardCount () {
        const cards = await $$(selectors.byStartsWithResourceId('spotlight-card-'));
        return cards.length;
    }

    /**
     * Check if a card type is visible
     * @param {string} cardType - 'orders', 'subscriptions', 'users', 'invoices', 'journals', 'buyers'
     */
    async isCardVisible (cardType) {
        const card = this.getCardByType(cardType);
        return await card.isDisplayed();
    }

    /**
     * Scroll to a specific card type
     * @param {string} cardType - 'orders', 'subscriptions', 'users', 'invoices', 'journals', 'buyers'
     */
    async scrollToCard (cardType) {
        const card = this.getCardByType(cardType);
        await card.scrollIntoView({ direction: 'down', maxScrolls: 10 });
        return card;
    }

    // ========== Item Interaction Methods ==========
    /**
     * Click a specific spotlight item by entity ID
     * @param {string} entityId - e.g., 'ORD-2143-9364-6285'
     */
    async clickSpotlightItem (entityId) {
        const item = this.getSpotlightItem(entityId);
        await item.waitForDisplayed();
        await item.click();
    }

    /**
     * Click "view all" link for a card
     */
    async clickViewAll () {
        const footer = this.getCardFooterByPattern('view all');
        await footer.scrollIntoView();
        await footer.click();
    }

    // ========== Navigation Methods ==========
    /**
     * Navigate to a tab
     * @param {string} tabName - 'spotlight', 'orders', 'subscriptions', 'more'
     */
    async navigateToTab (tabName) {
        const tabMap = {
            spotlight: this.navTabSpotlight,
            orders: this.navTabOrders,
            subscriptions: this.navTabSubscriptions,
            more: this.navTabMore
        };
        const tab = tabMap[tabName.toLowerCase()];
        if (!tab) {
            throw new Error(`Unknown tab: ${tabName}`);
        }
        await tab.click();
    }
}

module.exports = new SpotlightsPage();
