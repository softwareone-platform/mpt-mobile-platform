const homePage = require('../spotlights.page')
const footerPage = require('../base/footer.page')
const { isLoggedIn } = require('./auth.helper')

async function ensureHomePage() {
    // First check if we're logged in at all
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        throw new Error('User is not logged in. Please ensure authentication before navigating.');
    }
    
    // Check if already on home page with shortened timeout
    const isHomeVisible = await homePage.filterAll.isDisplayed({ timeout: 3000 }).catch(() => false);
    if (isHomeVisible) {
        return;
    }
    
    // Navigate to home page via footer tab
    await footerPage.clickSpotlightsTab();
}

module.exports = { ensureHomePage };
