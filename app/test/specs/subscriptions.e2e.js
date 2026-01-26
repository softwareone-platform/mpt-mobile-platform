const { expect } = require('@wdio/globals');

const subscriptionsPage = require('../pageobjects/subscriptions.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { isAndroid } = require('../pageobjects/utils/selectors');

describe('Subscriptions Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasSubscriptionsData = false;
  let hasEmptyState = false;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Subscriptions page to check data state
    await subscriptionsPage.footer.subscriptionsTab.click();
    await subscriptionsPage.waitForScreenReady();

    // Check data state ONCE and cache the results
    hasSubscriptionsData = await subscriptionsPage.hasSubscriptions();
    hasEmptyState = !hasSubscriptionsData && await subscriptionsPage.emptyState.isDisplayed().catch(() => false);

    console.log(`📊 Subscriptions data state: hasSubscriptions=${hasSubscriptionsData}, emptyState=${hasEmptyState}`);
  });

  beforeEach(async () => {
    // Ensure we're on Subscriptions page
    await subscriptionsPage.footer.subscriptionsTab.click();
    await subscriptionsPage.waitForScreenReady();
  });

  describe('Page Structure', () => {
    it('should display all footer navigation tabs', async () => {
      await expect(subscriptionsPage.footer.spotlightsTab).toBeDisplayed();
      await expect(subscriptionsPage.footer.ordersTab).toBeDisplayed();
      await expect(subscriptionsPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(subscriptionsPage.footer.moreTab).toBeDisplayed();
    });

    it('should have Subscriptions tab selected', async () => {
      const subscriptionsTab = subscriptionsPage.footer.subscriptionsTab;
      if (isAndroid()) {
        // Android uses 'selected' attribute
        const selected = await subscriptionsTab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        // iOS uses 'value' attribute
        const value = await subscriptionsTab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });

  describe('Empty State', () => {
    // This test suite runs when user has no subscriptions

    it('should display empty state when no subscriptions exist', async function () {
      if (hasSubscriptionsData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(subscriptionsPage.emptyState).toBeDisplayed();
      await expect(subscriptionsPage.noSubscriptionsTitle).toBeDisplayed();
      await expect(subscriptionsPage.noSubscriptionsDescription).toBeDisplayed();
    });

    it('should display "No subscriptions" title text', async function () {
      if (hasSubscriptionsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await subscriptionsPage.noSubscriptionsTitle.getText();
      expect(titleText).toBe('No subscriptions');
    });

    it('should display "No subscriptions found." description', async function () {
      if (hasSubscriptionsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await subscriptionsPage.noSubscriptionsDescription.getText();
      expect(descriptionText).toBe('No subscriptions found.');
    });
  });

  describe('Subscriptions List', () => {
    // This test suite runs when user has subscriptions data

    it('should not display empty state when subscriptions exist', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await subscriptionsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });
});
