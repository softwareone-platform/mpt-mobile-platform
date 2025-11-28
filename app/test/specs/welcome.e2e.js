const { expect } = require('@wdio/globals')
const welcomePage = require('../pageobjects/welcome.page')

describe('Welcome page of application', () => {
    it('to display welcome title', async () => {
        await expect(welcomePage.welcomeTitle).toBeDisplayed()
        await expect(welcomePage.welcomeTitle).toHaveText('Welcome')
        await expect(welcomePage.enterEmailSubTitle).toBeDisplayed()
        await expect(welcomePage.enterEmailSubTitle).toHaveText('Existing Marketplace users can now enjoy our mobile experience. Enter your registered email address below to gain access.')
    })

    it('to display email input and submit button', async () => {
        await expect(welcomePage.emailInput).toBeDisplayed()
        await expect(welcomePage.continueButton).toBeDisplayed()
    })

    it('to show email required error when progressing without entering one', async () => {
        await welcomePage.click(welcomePage.continueButton)
        await expect(welcomePage.emailRequiredErrorLabel).toBeDisplayed()
        await expect(welcomePage.emailRequiredErrorLabel).toHaveText('Email is required')
    })

    it('to show invalid email error when progressing with invalid one', async () => {
        await welcomePage.typeText(welcomePage.emailInput, 'invalid-email')
        await welcomePage.click(welcomePage.continueButton)
        await expect(welcomePage.validEmailErrorLabel).toBeDisplayed()
        await expect(welcomePage.validEmailErrorLabel).toHaveText('Please enter a valid email address')
    })
})
