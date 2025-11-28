const { expect } = require('@wdio/globals')
const homePage = require('../pageobjects/spotlights.page')
const ordersPage = require('../pageobjects/orders.page')
const subscriptionsPage = require('../pageobjects/subscriptions.page')
const morePage = require('../pageobjects/more.page')
const navigation = require('../pageobjects/utils/navigation.page')

describe('Navigation via footer', () => {
    beforeEach(async () => {
        await navigation.ensureHomePage();
    })

    it('click on Orders button to load Orders page', async () => {
        await expect(homePage.footer.ordersTab).toBeDisplayed()
        await homePage.footer.clickOrdersTab();
        await expect(ordersPage.defaultText).toBeDisplayed()
    })

    it('click on Subscriptions button to load Subscriptions page', async () => {
        await expect(ordersPage.footer.subscriptionsTab).toBeDisplayed()
        await ordersPage.footer.clickSubscriptionsTab();
        await expect(subscriptionsPage.defaultText).toBeDisplayed()
    })

    it('click on Spotlights button to load Spotlights page', async () => {
        await expect(subscriptionsPage.footer.spotlightsTab).toBeDisplayed()
        await subscriptionsPage.footer.clickSpotlightsTab();
        await expect(homePage.defaultText).toBeDisplayed()
    })

    it('click on More button to load More page', async () => {
        await expect(homePage.footer.moreTab).toBeDisplayed()
        await homePage.footer.clickMoreTab();
        await expect(morePage.footer.moreTab).toBeDisplayed()
    })
})
