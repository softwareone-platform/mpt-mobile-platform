const { $, $$, $$ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const headingPage = require('./base/heading.page');
const footerPage = require('./base/footer.page');
const { selectors, isAndroid, getSelector, isAndroid, getSelector } = require('./utils/selectors');

class SpotlightsPage extends BasePage {
    constructor () {
        super();
        this.header = headingPage;
        this.footer = footerPage;
    }

    // Spotlight Header - use element type to distinguish from footer tab (Button on iOS) - use element type to distinguish from footer tab (Button on iOS)
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

    get filterEnrollments () {
        return $(selectors.byResourceId('spotlight-filter-enrollments'));
    }

    // ========== Filter Scroll Container ==========
    get filterScrollView () {
        return $(getSelector({
            ios: '//XCUIElementTypeScrollView[.//XCUIElementTypeOther[contains(@name, "spotlight-filter-")]]',
            android: '//android.widget.HorizontalScrollView[.//*[contains(@resource-id, "spotlight-filter-")]]'
        }));
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
        // Note: Android text is "long running orders" (no hyphen)
        return $(selectors.byContainsTextAnyAny('long-running orders', 'long running orders', 'long running orders'));
    }

    get longRunningOrdersCard () {
        return this.getCardByType('orders');
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

    get expiringSubscriptionsCard () {
        return this.getCardByType('subscriptions');
    }

    // ========== Expired Invites Section ==========
    get expiredInvitesHeader () {
        return $(selectors.textContainsButNotContains('expired invites', 'of my clients'));
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
    // ========== Past due invoices Section ==========
    get invoicesPastDueHeader () {
        // Note: Android text may be "past due invoices" or "past due invoices"
        return $(selectors.byContainsTextAny('past due invoices', 'past due invoices'));
    }

    get invoicesPastDueCard () {
        return this.getCardByType('invoices');
        // Note: Android text may be "past due invoices" or "past due invoices"
        return $(selectors.byContainsTextAny('past due invoices', 'past due invoices'));
    }

    get invoicesPastDueCard () {
        return this.getCardByType('invoices');
    }

    // ========== In progress Journals Section ==========
    // ========== In progress Journals Section ==========
    get inProgressJournalsHeader () {
        // Note: Android text is "in progress journals" (no hyphen)
        return $(selectors.byContainsTextAny('in progress journals', 'in progress journals'));
    }

    get inProgressJournalsCard () {
        return this.getCardByType('journals');
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

    // ========== Long-Running Enrollments Section ==========
    get longRunningEnrollmentsHeader () {
        return $(selectors.byContainsText('long-running enrollments'));
    }

    get enrollmentsCard () {
        return this.getCardByType('enrollments');
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

    /**
     * Scroll content to top - useful for resetting scroll position after filter changes
     * Only scrolls if the top section is not already visible
     */
    async scrollToTop () {
        // Check if we're already at the top by looking for the orders section header text
        // If already visible, don't scroll
        const ordersHeader = $(selectors.byContainsTextAny('long-running orders', 'long running orders'));
        const isAlreadyAtTop = await ordersHeader.isDisplayed().catch(() => false);
        if (isAlreadyAtTop) {
            return; // Already at top, no need to scroll
        }

        if (isAndroid()) {
            // Android: Use mobile: scrollGesture with direction 'down' to scroll content down (reveal top)
            // This is a controlled scroll within the ScrollView bounds
            const scrollView = await $('//android.widget.ScrollView');
            const isScrollViewPresent = await scrollView.isExisting();
            if (isScrollViewPresent) {
                // Perform multiple swipe gestures to scroll to top
                const maxScrolls = 10;
                for (let i = 0; i < maxScrolls; i++) {
                    const isVisible = await ordersHeader.isDisplayed().catch(() => false);
                    if (isVisible) break;
                    
                    // Swipe down gesture - finger moves down, content reveals top
                    await browser.execute('mobile: swipeGesture', {
                        left: 100,
                        top: 500,
                        width: 880,
                        height: 800,
                        direction: 'down',
                        percent: 0.75
                    });
                    await browser.pause(200);
                }
            }
        } else {
            // iOS: Use mobile: swipe with direction 'down' multiple times
            const maxScrolls = 10;
            for (let i = 0; i < maxScrolls; i++) {
                const isVisible = await ordersHeader.isDisplayed().catch(() => false);
                if (isVisible) break;
                
                await browser.execute('mobile: swipe', {
                    direction: 'down',
                    velocity: 500
                });
                await browser.pause(200);
            }
        }
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
        await this.scrollToSection('past due invoices');
        return await this.invoicesPastDueHeader.isDisplayed();
    }

    async isInProgressJournalsSectionVisible () {
        await this.scrollToSection('in progress journals');
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

    async isLongRunningEnrollmentsSectionVisible () {
        await this.scrollToSection('long-running enrollments');
        return await this.longRunningEnrollmentsHeader.isDisplayed();
    }

    // ========== Horizontal Filter Scroll Methods ==========
    /**
     * Scroll filter chips horizontally to reveal a specific filter
     * @param {string} filterName - 'all', 'orders', 'subscriptions', 'users', 'invoices', 'enrollments', 'journals', 'buyers'
     */
    async scrollToFilter (filterName) {
        const filterMap = {
            all: this.filterAll,
            orders: this.filterOrders,
            subscriptions: this.filterSubscriptions,
            users: this.filterUsers,
            invoices: this.filterInvoices,
            enrollments: this.filterEnrollments,
            journals: this.filterJournals,
            buyers: this.filterBuyers
        };
        const filter = filterMap[filterName.toLowerCase()];
        if (!filter) {
            throw new Error(`Unknown filter: ${filterName}`);
        }

        // First check if already visible
        const initiallyVisible = await filter.isDisplayed().catch(() => false);
        if (initiallyVisible) return filter;

        const maxScrolls = 5;
        for (let i = 0; i < maxScrolls; i++) {
            // Horizontal swipe left to reveal more filters (later filters like enrollments, journals, buyers)
            await this.horizontalSwipeOnFilters('left');
            await browser.pause(300);

            const isVisible = await filter.isDisplayed().catch(() => false);
            if (isVisible) return filter;
        }
        
        throw new Error(`Could not scroll to filter: ${filterName}`);
    }

    /**
     * Perform horizontal swipe on filter chips container
     * Uses platform-specific gestures matching existing vertical scroll implementation
     * @param {string} direction - 'left' or 'right' (direction content should move/scroll)
     */
    async horizontalSwipeOnFilters (direction) {
        if (isAndroid()) {
            // Android: Use mobile: swipeGesture with coordinates
            // HorizontalScrollView from DOM: bounds [0,296][1080,454]
            // Filter chips Y range: 338-412, center at y=375
            // Android swipeGesture 'direction' = direction content moves
            // 'left' = content moves left, revealing content on the right (later filters)
            await browser.execute('mobile: swipeGesture', {
                left: 100,
                top: 338,
                width: 880,
                height: 74,
                direction: direction,
                percent: 0.6
            });
        } else {
            // iOS: Use mobile: swipe with velocity (matching vertical scroll pattern)
            // Filter ScrollView location from DOM: y=91, height=60 (y range: 91-151)
            await browser.execute('mobile: swipe', {
                direction: direction,
                velocity: 500
            });
        }
    }

    /**
     * Reset filter scroll position to show 'All' filter
     */
    async resetFilterScrollPosition () {
        const maxScrolls = 5;
        for (let i = 0; i < maxScrolls; i++) {
            const isVisible = await this.filterAll.isDisplayed().catch(() => false);
            if (isVisible) return;
            await this.horizontalSwipeOnFilters('right');
            await browser.pause(300);
        }
    }

    // ========== Section Visibility Check Methods for Filtered State ==========
    /**
     * Check which section types are currently visible (not hidden by filter)
     * @returns {Promise<Object>} Object with section types as keys and visibility as values
     */
    async getVisibleSectionTypes () {
        return {
            orders: await this.isOrdersSectionVisible(),
            subscriptions: await this.isSubscriptionsSectionVisible(),
            users: await this.isUsersSectionVisible(),
            invoices: await this.isInvoicesSectionVisible(),
            enrollments: await this.isEnrollmentsSectionVisible(),
            journals: await this.isJournalsSectionVisible(),
            buyers: await this.isBuyersSectionVisible()
        };
    }

    /**
     * Check if any orders section is visible (long-running orders)
     * Does NOT scroll - only checks current view state
     */
    async isOrdersSectionVisible () {
        try {
            const header = await this.longRunningOrdersHeader;
            return await header.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Check if any subscriptions section is visible (expiring subscriptions)
     */
    async isSubscriptionsSectionVisible () {
        try {
            const card = await this.expiringSubscriptionsCard;
            return await card.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Check if any users section is visible (pending/expired invites)
     */
    async isUsersSectionVisible () {
        try {
            const pendingHeader = await this.pendingInvitesHeader;
            const expiredHeader = await this.expiredInvitesHeader;
            return (await pendingHeader.isDisplayed()) || (await expiredHeader.isDisplayed());
        } catch {
            return false;
        }
    }

    /**
     * Check if any invoices section is visible (past due invoices)
     */
    async isInvoicesSectionVisible () {
        try {
            const card = await this.invoicesPastDueCard;
            return await card.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Check if any journals section is visible (in progress journals)
     */
    async isJournalsSectionVisible () {
        try {
            const card = await this.inProgressJournalsCard;
            return await card.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Check if any enrollments section is visible (long-running enrollments)
     */
    async isEnrollmentsSectionVisible () {
        try {
            const card = await this.getCardByType('enrollments');
            return await card.isDisplayed();
        } catch {
            return false;
        }
    }

    /**
     * Check if any buyers section is visible (mismatching buyers, blocked connections)
     */
    async isBuyersSectionVisible () {
        try {
            const mismatchingHeader = await this.mismatchingBuyersHeader;
            const blockedHeader = await this.buyersWithBlockedConnectionsHeader;
            return (await mismatchingHeader.isDisplayed()) || (await blockedHeader.isDisplayed());
        } catch {
            return false;
        }
    }

    // ========== Filter Chip Methods ==========
    /**
     * Select a filter chip by name
     * @param {string} filterName - 'all', 'orders', 'subscriptions', 'users', 'invoices', 'journals', 'buyers'
     */
    async selectFilter (filterName) {
        const filterKey = filterName.toLowerCase();
        const validFilters = ['all', 'orders', 'subscriptions', 'users', 'invoices', 'enrollments', 'journals', 'buyers'];
        if (!validFilters.includes(filterKey)) {
            throw new Error(`Unknown filter: ${filterName}`);
        }
        
        // Construct selector directly to avoid any issues with ChainablePromiseElement
        const resourceId = `spotlight-filter-${filterKey}`;
        const selector = isAndroid() 
            ? `//*[@resource-id="${resourceId}"]`
            : `~${resourceId}`;
        
        const filterElement = $(selector);
        await filterElement.click();
        
        // Wait for filter state to update after click
        // Note: On Android, the accessibilityState.selected update timing is unreliable,
        // so we use a fixed pause. The section visibility tests validate actual filter behavior.
        await browser.pause(500);
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
            enrollments: this.filterEnrollments,
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
