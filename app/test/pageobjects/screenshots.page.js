const fs = require('fs');
const path = require('path');

const { $ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const morePage = require('./more.page');
const ordersPage = require('./orders.page');
const productsPage = require('./products.page');
const profilePage = require('./profile.page');
const spotlightsPage = require('./spotlights.page');
const subscriptionsPage = require('./subscriptions.page');
const userSettingsPage = require('./user-settings.page');
const { PAUSE, RETRY, TIMEOUT } = require('./utils/constants');
const { selectors } = require('./utils/selectors');
const verifyPage = require('./verify.page');
const welcomePage = require('./welcome.page');

class ScreenshotsPage extends BasePage {
  constructor() {
    super();
    this.journey = require('../config/screenshot-journey.json');
    this.outputDir = path.resolve(__dirname, '..', '..', '..', 'appstore-screenshots');
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  resolveSelector(selectorObject) {
    if (!selectorObject || !selectorObject.method || !selectorObject.value) {
      throw new Error('Selector must include method and value');
    }

    switch (selectorObject.method) {
      case 'resourceId':
        return $(selectors.byResourceId(selectorObject.value));
      case 'text':
        return $(selectors.byText(selectorObject.value));
      case 'containsText':
        return $(selectors.byContainsText(selectorObject.value));
      case 'accessibilityId':
        return $(selectors.byAccessibilityId(selectorObject.value));
      default:
        throw new Error(`Unknown selector method: ${selectorObject.method}`);
    }
  }

  async navigateToPage(pageKey) {
    await this.ensureHomeForJourney();
    await browser.pause(PAUSE.NAVIGATION);

    switch (pageKey) {
      case 'home':
        return;
      case 'chat':
        await footerPage.clickChatTab();
        await browser.pause(PAUSE.NAVIGATION);
        return;
      case 'orders':
        await ordersPage.ensureOrdersPage();
        return;
      case 'products':
        await productsPage.ensureProductsPage();
        return;
      case 'agreements':
        await morePage.navigateToAgreements();
        return;
      case 'subscriptions':
        await subscriptionsPage.ensureSubscriptionsPage();
        return;
      case 'invoices':
        await morePage.navigateToInvoices();
        return;
      case 'creditMemos':
        await morePage.navigateToCreditMemos();
        return;
      case 'users':
        await morePage.navigateToUsers();
        return;
      case 'programs':
        await morePage.navigateToPrograms();
        return;
      case 'enrollments':
        await morePage.navigateToEnrollments();
        return;
      case 'licensees':
        await morePage.navigateToLicensees();
        return;
      case 'buyers':
        await morePage.navigateToBuyers();
        return;
      case 'statements':
        await morePage.navigateToStatements();
        return;
      case 'more':
        await morePage.ensureMorePage();
        await browser.pause(PAUSE.NAVIGATION);
        return;
      case 'profile':
        await headingPage.navAccountButton.click();
        await profilePage.profileHeaderTitle.waitForDisplayed({
          timeout: TIMEOUT.ELEMENT_DISPLAYED,
        });
        return;
      case 'userSettings':
        await this.navigateToPage('profile');
        await profilePage.currentUserCard.click();
        await userSettingsPage.headerTitle.waitForDisplayed({
          timeout: TIMEOUT.ELEMENT_DISPLAYED,
        });
        return;
      case 'personalInfo':
        await this.navigateToPage('userSettings');
        await userSettingsPage.openPersonalInformation();
        await $(selectors.byText('Personal Information')).waitForDisplayed({
          timeout: TIMEOUT.ELEMENT_DISPLAYED,
        });
        return;
      default:
        throw new Error(`Unknown page key: ${pageKey}`);
    }
  }

  async ensureHomeForJourney() {
    const isWelcomeVisible = await welcomePage.emailInput.isDisplayed().catch(() => false);
    if (isWelcomeVisible) {
      throw new Error(
        'Screenshot journey reached Welcome page unexpectedly. Authentication state was lost.',
      );
    }

    const isVerifyVisible = await verifyPage.verifyTitle.isDisplayed().catch(() => false);
    if (isVerifyVisible) {
      throw new Error(
        'Screenshot journey reached OTP verification unexpectedly. Authentication state was lost.',
      );
    }

    const isAlreadyHome =
      (await spotlightsPage.filterAll.isDisplayed().catch(() => false)) ||
      (await spotlightsPage.emptyState.isDisplayed().catch(() => false)) ||
      (await spotlightsPage.spotlightHeader.isDisplayed().catch(() => false));

    if (isAlreadyHome) {
      return;
    }

    for (let attempt = 0; attempt < RETRY.MAX_BACK_ATTEMPTS; attempt++) {
      const isFooterVisible = await footerPage.spotlightsTab.isDisplayed().catch(() => false);
      if (isFooterVisible) {
        break;
      }

      const canGoBack = await headingPage.backButton.isDisplayed().catch(() => false);
      if (!canGoBack) {
        break;
      }

      await headingPage.backButton.click();
      await browser.pause(PAUSE.NAVIGATION);
    }

    const isFooterVisible = await footerPage.spotlightsTab.isDisplayed().catch(() => false);
    if (isFooterVisible) {
      await footerPage.clickSpotlightsTab();
      await browser.pause(PAUSE.POLL_INTERVAL);
    }
  }

  async executeAction(action) {
    switch (action.type) {
      case 'tap':
        await this.click(this.resolveSelector(action.selector));
        return;
      case 'tapFirstOrder':
        await ordersPage.tapFirstOrder();
        return;
      case 'scrollDown':
        await this.scrollDown(action.percent || 0.5);
        return;
      case 'scrollUp':
        await this.scrollUp(action.percent || 0.5);
        return;
      case 'swipe':
        await this.swipe(action.direction, action.percent || 0.5);
        return;
      case 'pause':
        await browser.pause(action.duration);
        return;
      case 'waitForElement': {
        const element = this.resolveSelector(action.selector);
        await element.waitForDisplayed({
          timeout: action.timeout || TIMEOUT.ELEMENT_DISPLAYED,
        });
        return;
      }
      case 'waitForScreenReady': {
        if (!action.loadingIndicatorId) {
          throw new Error('waitForScreenReady action requires loadingIndicatorId');
        }

        const loadingIndicator = $(selectors.byResourceId(action.loadingIndicatorId));
        const isVisible = await loadingIndicator.isDisplayed().catch(() => false);
        if (isVisible) {
          await loadingIndicator.waitForDisplayed({
            reverse: true,
            timeout: TIMEOUT.SCREEN_READY,
          });
        }
        return;
      }
      case 'typeText':
        await this.typeText(this.resolveSelector(action.selector), action.text);
        return;
      case 'back':
        await browser.back();
        await browser.pause(PAUSE.NAVIGATION);
        return;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  async captureScreenshot(screenshotName) {
    this.ensureOutputDir();
    const filePath = path.join(this.outputDir, `${screenshotName}.png`);
    await browser.saveScreenshot(filePath);
    console.info(`Screenshot saved: ${filePath}`);
    return filePath;
  }
}

module.exports = new ScreenshotsPage();
