const { expect } = require('@wdio/globals')
const homePage = require('../pageobjects/spotlights.page')
const navigation = require('../pageobjects/utils/navigation.page')
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper')

describe('Home page of application', () => {
    before(async function() {
        // Set timeout for login flow
        this.timeout(150000);
        await ensureLoggedIn();
    })

    beforeEach(async () => {
        await navigation.ensureHomePage();
    })

    it('to display footer with tabs', async () => {
        await expect(homePage.footer.spotlightsTab).toBeDisplayed()
        await expect(homePage.footer.ordersTab).toBeDisplayed()
        await expect(homePage.footer.subscriptionsTab).toBeDisplayed()
        await expect(homePage.footer.moreTab).toBeDisplayed()
    })

    it('to display spotlight header', async () => {
        await expect(homePage.spotlightHeader).toBeDisplayed()
        await expect(homePage.spotlightHeader).toHaveText('Spotlight')
    })

    describe('Long-Running Orders Section', () => {
        it('should display long-running orders header', async () => {
            await expect(homePage.longRunningOrdersHeader).toBeDisplayed()
            const headerText = await homePage.longRunningOrdersHeader.getText()
            expect(headerText).toContain('long-running orders')
        })

        it('should display long-running orders count', async () => {
            const count = await homePage.longRunningOrdersCount()
            expect(parseInt(count)).toBeGreaterThan(0)
        })

        it('should display list of long-running orders', async () => {
            const ordersList = await homePage.longRunningOrdersList
            expect(ordersList.length).toBeGreaterThan(0)
            expect(ordersList.length).toBeLessThanOrEqual(5)
        })

        it('should be able to access long-running order by index', async () => {
            const firstOrder = await homePage.longRunningOrderByIndex(0)
            await expect(firstOrder).toBeDisplayed()
            const orderName = await firstOrder.getAttribute('name')
            expect(orderName).toContain('ORD-')
        })

        it('should display view all button for long-running orders', async () => {
            await expect(homePage.longRunningOrdersViewAll).toBeDisplayed()
            const viewAllText = await homePage.longRunningOrdersViewAll.getText()
            expect(viewAllText).toContain('view all')
        })
    })

    describe('Expiring Subscriptions Section', () => {
        beforeEach(async () => {
            await homePage.scrollToSection('expiring subscriptions')
        })

        it('should display expiring subscriptions header', async () => {
            const isVisible = await homePage.isExpiringSubscriptionsSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.expiringSubscriptionsHeader.getText()
            expect(headerText).toContain('expiring subscriptions')
        })

        it('should display expiring subscriptions count', async () => {
            const count = await homePage.expiringSubscriptionsCount()
            expect(parseInt(count)).toBeGreaterThan(0)
        })

        it('should display list of expiring subscriptions', async () => {
            const subscriptionsList = await homePage.expiringSubscriptionsList
            expect(subscriptionsList.length).toBeGreaterThan(0)
            expect(subscriptionsList.length).toBeLessThanOrEqual(5)
        })

        it('should be able to access expiring subscription by index', async () => {
            const firstSubscription = await homePage.expiringSubscriptionByIndex(0)
            await expect(firstSubscription).toBeDisplayed()
            const subscriptionName = await firstSubscription.getAttribute('name')
            expect(subscriptionName).toContain('SUB-')
        })

        it('should display view all button for expiring subscriptions', async () => {
            await expect(homePage.expiringSubscriptionsViewAll).toBeDisplayed()
            const viewAllText = await homePage.expiringSubscriptionsViewAll.getText()
            expect(viewAllText).toContain('view all')
        })
    })

    describe('Expired Invites Section', () => {
        beforeEach(async () => {
            await homePage.scrollToSection('expired invites')
        })

        it('should display expired invites header', async () => {
            const isVisible = await homePage.isExpiredInvitesSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.expiredInvitesHeader.getText()
            expect(headerText).toContain('expired invites')
        })

        it('should display expired invites count', async () => {
            const count = await homePage.expiredInvitesCount()
            expect(parseInt(count)).toBeGreaterThan(0)
        })

        it('should display list of expired invites', async () => {
            const invitesList = await homePage.expiredInvitesList
            expect(invitesList.length).toBeGreaterThan(0)
            expect(invitesList.length).toBeLessThanOrEqual(5)
        })

        it('should be able to access expired invite by index', async () => {
            const firstInvite = await homePage.expiredInviteByIndex(0)
            await expect(firstInvite).toBeDisplayed()
            const inviteName = await firstInvite.getAttribute('name')
            expect(inviteName).toContain('USR-')
        })

        it('should display view all button for expired invites', async () => {
            await expect(homePage.expiredInvitesViewAll).toBeDisplayed()
            const viewAllText = await homePage.expiredInvitesViewAll.getText()
            expect(viewAllText).toContain('view all')
        })
    })

    describe('Pending Invites Section', () => {
        beforeEach(async () => {
            await homePage.scrollToSection('pending invites')
        })

        it('should display pending invites header', async () => {
            const isVisible = await homePage.isPendingInvitesSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.pendingInvitesHeader.getText()
            expect(headerText).toContain('pending invites')
        })

        it('should display pending invites count', async () => {
            const count = await homePage.pendingInvitesCount()
            expect(parseInt(count)).toBeGreaterThan(0)
        })

        it('should display list of pending invites', async () => {
            const invitesList = await homePage.pendingInvitesList
            expect(invitesList.length).toBeGreaterThan(0)
            expect(invitesList.length).toBeLessThanOrEqual(5)
        })

        it('should be able to access pending invite by index', async () => {
            const firstInvite = await homePage.pendingInviteByIndex(0)
            await expect(firstInvite).toBeDisplayed()
            const inviteName = await firstInvite.getAttribute('name')
            expect(inviteName).toContain('USR-')
        })

        it('should display view all button for pending invites', async () => {
            await expect(homePage.pendingInvitesViewAll).toBeDisplayed()
            const viewAllText = await homePage.pendingInvitesViewAll.getText()
            expect(viewAllText).toContain('view all')
        })
    })

    describe('Expired Invites of My Clients Section', () => {
        beforeEach(async () => {
            await homePage.scrollToSection('expired invites of my clients')
        })

        it('should display expired invites of my clients header', async () => {
            const isVisible = await homePage.isExpiredInvitesOfMyClientsSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.expiredInvitesOfMyClientsHeader.getText()
            expect(headerText).toContain('expired invites of my clients')
        })

        it('should display expired invites of my clients count', async () => {
            const count = await homePage.expiredInvitesOfMyClientsCount()
            expect(parseInt(count)).toBeGreaterThan(0)
        })

        it('should display list of expired invites of my clients', async () => {
            const invitesList = await homePage.expiredInvitesOfMyClientsList
            expect(invitesList.length).toBeGreaterThan(0)
            expect(invitesList.length).toBeLessThanOrEqual(5)
        })

        it('should be able to access expired invite of my clients by index', async () => {
            const firstInvite = await homePage.expiredInviteOfMyClientsByIndex(0)
            await expect(firstInvite).toBeDisplayed()
            const inviteName = await firstInvite.getAttribute('name')
            expect(inviteName).toContain('USR-')
        })

        it('should display view all button for expired invites of my clients', async () => {
            await expect(homePage.expiredInvitesOfMyClientsViewAll).toBeDisplayed()
            const viewAllText = await homePage.expiredInvitesOfMyClientsViewAll.getText()
            expect(viewAllText).toContain('view all')
        })
    })

    describe('Invoices Past Due Section', () => {
        beforeEach(async () => {
            await homePage.scrollToSection('invoices past due')
        })

        it('should display invoices past due header', async () => {
            const isVisible = await homePage.isInvoicesPastDueSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.invoicesPastDueHeader.getText()
            expect(headerText).toContain('invoices past due')
        })

        it('should display invoices past due count', async () => {
            const count = await homePage.invoicesPastDueCount()
            expect(parseInt(count)).toBeGreaterThan(0)
        })

        it('should display list of invoices past due', async () => {
            const invoicesList = await homePage.invoicesPastDueList
            expect(invoicesList.length).toBeGreaterThan(0)
            expect(invoicesList.length).toBeLessThanOrEqual(5)
        })

        it('should be able to access invoice past due by index', async () => {
            const firstInvoice = await homePage.invoicePastDueByIndex(0)
            await expect(firstInvoice).toBeDisplayed()
            const invoiceName = await firstInvoice.getAttribute('name')
            expect(invoiceName).toContain('INV-')
        })

        it('should display view all button for invoices past due', async () => {
            await expect(homePage.invoicesPastDueViewAll).toBeDisplayed()
            const viewAllText = await homePage.invoicesPastDueViewAll.getText()
            expect(viewAllText).toContain('view all')
        })
    })

    describe('In-Progress Journals Section', () => {
        beforeEach(async () => {
            await homePage.scrollToSection('in-progress journals')
        })

        it('should display in-progress journals header', async () => {
            const isVisible = await homePage.isInProgressJournalsSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.inProgressJournalsHeader.getText()
            expect(headerText).toContain('in-progress journals')
        })

        it('should display in-progress journals count', async () => {
            const count = await homePage.inProgressJournalsCount()
            expect(parseInt(count)).toBeGreaterThan(0)
        })

        it('should display list of in-progress journals', async () => {
            const journalsList = await homePage.inProgressJournalsList
            expect(journalsList.length).toBeGreaterThan(0)
            expect(journalsList.length).toBeLessThanOrEqual(5)
        })

        it('should be able to access in-progress journal by index', async () => {
            const firstJournal = await homePage.inProgressJournalByIndex(0)
            await expect(firstJournal).toBeDisplayed()
            const journalName = await firstJournal.getAttribute('name')
            expect(journalName).toContain('BJO-')
        })

        it('should display view all button for in-progress journals', async () => {
            await expect(homePage.inProgressJournalsViewAll).toBeDisplayed()
            const viewAllText = await homePage.inProgressJournalsViewAll.getText()
            expect(viewAllText).toContain('view all')
        })
    })

    describe('Mismatching Buyers Section', () => {
        beforeEach(async () => {
            await homePage.scrollToSection('mismatching buyers')
        })

        it('should display mismatching buyers header', async () => {
            const isVisible = await homePage.isMismatchingBuyersSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.mismatchingBuyersHeader.getText()
            expect(headerText).toContain('mismatching buyers')
        })

        it('should display mismatching buyers count', async () => {
            const count = await homePage.mismatchingBuyersCount()
            expect(parseInt(count)).toBeGreaterThan(0)
        })

        it('should display list of mismatching buyers', async () => {
            const buyersList = await homePage.mismatchingBuyersList
            expect(buyersList.length).toBeGreaterThan(0)
            expect(buyersList.length).toBeLessThanOrEqual(5)
        })

        it('should be able to access mismatching buyer by index', async () => {
            const firstBuyer = await homePage.mismatchingBuyerByIndex(0)
            await expect(firstBuyer).toBeDisplayed()
            const buyerName = await firstBuyer.getAttribute('name')
            expect(buyerName).toContain('BUY-')
        })

        it('should display view all button for mismatching buyers', async () => {
            await expect(homePage.mismatchingBuyersViewAll).toBeDisplayed()
            const viewAllText = await homePage.mismatchingBuyersViewAll.getText()
            expect(viewAllText).toContain('view all')
        })
    })

    describe('Buyers with Blocked Seller Connections Section', () => {
        beforeEach(async () => {
            await homePage.scrollToSection('buyers with blocked seller connections')
        })

        it('should display buyers with blocked connections header', async () => {
            const isVisible = await homePage.isBuyersWithBlockedConnectionsSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.buyersWithBlockedConnectionsHeader.getText()
            expect(headerText).toContain('buyers with blocked seller connections')
        })

        it('should display buyers with blocked connections count', async () => {
            const count = await homePage.buyersWithBlockedConnectionsCount()
            expect(parseInt(count)).toBeGreaterThan(0)
        })

        it('should display list of buyers with blocked connections', async () => {
            const buyersList = await homePage.buyersWithBlockedConnectionsList
            expect(buyersList.length).toBeGreaterThan(0)
            expect(buyersList.length).toBeLessThanOrEqual(5)
        })

        it('should be able to access buyer with blocked connection by index', async () => {
            const firstBuyer = await homePage.buyerWithBlockedConnectionByIndex(0)
            await expect(firstBuyer).toBeDisplayed()
            const buyerName = await firstBuyer.getAttribute('name')
            expect(buyerName).toContain('BUY-')
        })

        it('should display view all button for buyers with blocked connections', async () => {
            await expect(homePage.buyersWithBlockedConnectionsViewAll).toBeDisplayed()
            const viewAllText = await homePage.buyersWithBlockedConnectionsViewAll.getText()
            expect(viewAllText).toContain('view all')
        })
    })

    describe('Scroll View and Navigation', () => {
        it('should display main scroll view', async () => {
            await expect(homePage.scrollView).toBeDisplayed()
        })

        it('should be able to scroll to different sections', async () => {
            await homePage.scrollToSection('expiring subscriptions')
            const expiringVisible = await homePage.isExpiringSubscriptionsSectionVisible()
            expect(expiringVisible).toBe(true)

            await homePage.scrollToSection('pending invites')
            const pendingVisible = await homePage.isPendingInvitesSectionVisible()
            expect(pendingVisible).toBe(true)

            await homePage.scrollToSection('invoices past due')
            const invoicesVisible = await homePage.isInvoicesPastDueSectionVisible()
            expect(invoicesVisible).toBe(true)
        })
    })
})
