const { $, expect } = require('@wdio/globals');

const headingPage = require('../pageobjects/base/heading.page');
const morePage = require('../pageobjects/more.page');
const ordersPage = require('../pageobjects/orders.page');
const profilePage = require('../pageobjects/profile.page');
const homePage = require('../pageobjects/spotlights.page');
const subscriptionsPage = require('../pageobjects/subscriptions.page');
const userSettingsPage = require('../pageobjects/user-settings.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');

describe('Navigation via footer', () => {
  before(async function () {
    // Set timeout for login flow
    this.timeout(150000);
    await ensureLoggedIn();
  });

  beforeEach(async () => {
    await navigation.ensureHomePage({ resetFilters: false });
  });

  it('click on Orders button to load Orders page', async () => {
    await expect(homePage.footer.ordersTab).toBeDisplayed();
    await homePage.footer.clickOrdersTab();
    await ordersPage.waitForScreenReady();
    // Verify we navigated by checking the Orders tab is still accessible (we're on orders screen)
    await expect(ordersPage.footer.ordersTab).toBeDisplayed();
  });

  it('click on Subscriptions button to load Subscriptions page', async () => {
    await expect(ordersPage.footer.subscriptionsTab).toBeDisplayed();
    await ordersPage.footer.clickSubscriptionsTab();
    await subscriptionsPage.waitForScreenReady();
    // Verify we navigated by checking the Subscriptions tab is still accessible
    await expect(subscriptionsPage.footer.subscriptionsTab).toBeDisplayed();
  });

  it('click on More button to load More page', async () => {
    await expect(homePage.footer.moreTab).toBeDisplayed();
    await homePage.footer.clickMoreTab();
    await expect(morePage.footer.moreTab).toBeDisplayed();
  });

  it('click on Spotlights button to load Spotlights page', async () => {
    await expect(morePage.footer.spotlightsTab).toBeDisplayed();
    await morePage.footer.clickSpotlightsTab();
    await expect(homePage.filterAll).toBeDisplayed();
  });

  it('click on account button to load Profile page', async () => {
    await expect(headingPage.navAccountButton).toBeDisplayed();
    await headingPage.navAccountButton.click();
    await expect(profilePage.profileHeaderTitle).toBeDisplayed();
    await expect(profilePage.yourProfileLabel).toBeDisplayed();
  });

  it('navigate from home to Profile page then to User Settings', async () => {
    await expect(headingPage.navAccountButton).toBeDisplayed();
    await headingPage.navAccountButton.click();
    await expect(profilePage.profileHeaderTitle).toBeDisplayed();
    await profilePage.currentUserCard.click();
    await expect(userSettingsPage.headerTitle).toBeDisplayed();
    await expect(userSettingsPage.userDetailsLabel).toBeDisplayed();
  });

  it('navigate from home to Profile → User Settings → Personal Information', async () => {
    // Navigate to Profile page
    await expect(headingPage.navAccountButton).toBeDisplayed();
    await headingPage.navAccountButton.click();
    await expect(profilePage.profileHeaderTitle).toBeDisplayed();

    // Navigate to User Settings
    await profilePage.currentUserCard.click();
    await expect(userSettingsPage.headerTitle).toBeDisplayed();

    // Navigate to Personal Information
    await userSettingsPage.openPersonalInformation();
    const personalInfoHeader = await $('//*[@name="Personal Information" or @text="Personal Information"]');
    await expect(personalInfoHeader).toBeDisplayed();
  });

  it('navigate from Orders page to Profile via account button', async () => {
    // Navigate to Orders page first
    await homePage.footer.clickOrdersTab();
    await ordersPage.waitForScreenReady();

    // Tap account button from Orders page
    await expect(ordersPage.accountButton).toBeDisplayed();
    await ordersPage.accountButton.click();

    // Verify Profile page loaded
    await expect(profilePage.profileHeaderTitle).toBeDisplayed();
    await expect(profilePage.yourProfileLabel).toBeDisplayed();
  });
});
