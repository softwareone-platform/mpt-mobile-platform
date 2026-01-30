const { expect } = require('@wdio/globals');

const headingPage = require('../pageobjects/base/heading.page');
const profilePage = require('../pageobjects/profile.page');
const userSettingsPage = require('../pageobjects/user-settings.page');
const welcomePage = require('../pageobjects/welcome.page');
const { restartApp } = require('../pageobjects/utils/app.helper');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { TIMEOUT } = require('../pageobjects/utils/constants');

describe('Logout Functionality', () => {
  before(async function () {
    // Set timeout for login flow
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
  });

  describe('Sign Out Flow', () => {
    it('should display sign out button in User Settings', async () => {
      // Navigate to Profile page
      await headingPage.navAccountButton.click();
      await profilePage.profileHeaderTitle.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });

      // Navigate to User Settings by clicking current user card
      await profilePage.currentUserCard.click();
      await userSettingsPage.headerTitle.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });

      // Verify sign out button is displayed
      await expect(userSettingsPage.signOutButton).toBeDisplayed();
    });

    it('should allow user to log out', async () => {
      // In User Settings
      await userSettingsPage.headerTitle.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });

      // Click sign out button
      await userSettingsPage.signOut();

      // Wait for and verify we're redirected to the welcome/login page
      await welcomePage.welcomeTitle.waitForDisplayed({ timeout: 15000 });
      await expect(welcomePage.welcomeTitle).toBeDisplayed();
      console.info('✅ User successfully logged out');
    });

    it('should prompt user to log in after app restart following logout', async () => {
      // Verify we're on the welcome page after logout from previous test
      await welcomePage.welcomeTitle.waitForDisplayed({ timeout: 15000 });

      // Restart the app
      await restartApp();

      // Verify welcome page elements are displayed (login prompt persists after restart)
      await welcomePage.welcomeTitle.waitForDisplayed({ timeout: 15000 });
      await expect(welcomePage.welcomeTitle).toBeDisplayed();
      await expect(welcomePage.enterEmailSubTitle).toBeDisplayed();
      await expect(welcomePage.emailInput).toBeDisplayed();
      await expect(welcomePage.continueButton).toBeDisplayed();
      console.info('✅ User is still logged out and prompted to log in after app restart');
    });
  });
});
