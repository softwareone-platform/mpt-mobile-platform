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

    it('to display main scroll view', async () => {
        await expect(homePage.scrollView).toBeDisplayed()
    })

    describe('Section Headers', () => {
        it('should display long-running orders header', async () => {
            await expect(homePage.longRunningOrdersHeader).toBeDisplayed()
            const headerText = await homePage.longRunningOrdersHeader.getText()
            // Android uses "long running orders" (no hyphen)
            expect(headerText.toLowerCase()).toContain('long running orders')
        })

        it('should display expiring subscriptions header', async () => {
            await homePage.scrollToSection('expiring subscriptions')
            const isVisible = await homePage.isExpiringSubscriptionsSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.expiringSubscriptionsHeader.getText()
            expect(headerText).toContain('expiring subscriptions')
        })

        it('should display expired invites header', async () => {
            await homePage.scrollToSection('expired invites')
            const isVisible = await homePage.isExpiredInvitesSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.expiredInvitesHeader.getText()
            expect(headerText).toContain('expired invites')
        })

        it('should display pending invites header', async () => {
            await homePage.scrollToSection('pending invites')
            const isVisible = await homePage.isPendingInvitesSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.pendingInvitesHeader.getText()
            expect(headerText).toContain('pending invites')
        })

        it('should display past due invoices header', async () => {
            await homePage.scrollToSection('past due invoices')
            const isVisible = await homePage.isInvoicesPastDueSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.invoicesPastDueHeader.getText()
            expect(headerText).toContain('past due invoices')
        })

        it('should display in progress journals header', async () => {
            await homePage.scrollToSection('in progress journals')
            const isVisible = await homePage.isInProgressJournalsSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.inProgressJournalsHeader.getText()
            // Android uses "in progress journals" (no hyphen)
            expect(headerText.toLowerCase()).toContain('in progress journals')
        })

        it('should display mismatching buyers header', async () => {
            await homePage.scrollToSection('mismatching buyers')
            const isVisible = await homePage.isMismatchingBuyersSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.mismatchingBuyersHeader.getText()
            expect(headerText).toContain('mismatching buyers')
        })

        it('should display buyers with blocked connections header', async () => {
            await homePage.scrollToSection('buyers with blocked seller connections')
            const isVisible = await homePage.isBuyersWithBlockedConnectionsSectionVisible()
            expect(isVisible).toBe(true)
            const headerText = await homePage.buyersWithBlockedConnectionsHeader.getText()
            expect(headerText).toContain('buyers with blocked seller connections')
        })
    })
})
