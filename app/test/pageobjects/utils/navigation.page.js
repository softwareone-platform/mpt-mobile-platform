const homePage = require('../spotlights.page')
const footerPage = require('../base/footer.page')

async function ensureHomePage() {
    const isHomeVisible = await homePage.defaultText.isDisplayed().catch(() => false);
    if (isHomeVisible)
        return
    await footerPage.clickSpotlightTab();
}

module.exports = { ensureHomePage };
