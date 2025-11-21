const { expect } = require('@wdio/globals')
const welcomePage = require('../pageobjects/welcome.page')

describe('Failing test', () => {
    it('to assert for failure', async () => {
        await expect(welcomePage.welcomeTitle).toHaveText('haha')
    })
})
