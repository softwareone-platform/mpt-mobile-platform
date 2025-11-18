const { expect } = require('@wdio/globals')
const homePage = require('../pageobjects/spotlights.page')
const navigation = require('../pageobjects/utils/navigation.page')

describe('Home page of application', () => {
    beforeEach(async () => {
        await navigation.ensureHomePage();
    })

    it('to display heading with title', async () => {
        await expect(homePage.header.logoTitle).toBeDisplayed()
        await expect(homePage.header.logoTitle).toHaveText('Spotlight')
    })

    it('to display footer with tabs', async () => {
        await expect(homePage.footer.spotlightTab).toBeDisplayed()
        await expect(homePage.footer.ordersTab).toBeDisplayed()
        await expect(homePage.footer.subscriptionsTab).toBeDisplayed()
        await expect(homePage.footer.moreTab).toBeDisplayed()
    })

    it('to display footer with tabs', async () => {
        await expect(homePage.defaultText).toBeDisplayed()
        await expect(homePage.defaultText).toHaveText('Spotlight Screen')
    })
})
