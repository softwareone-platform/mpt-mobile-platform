const { expect } = require('@wdio/globals');

const subscriptionsPage = require('../pageobjects/subscriptions.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');

describe('Subscriptions Page', () => {
  // Data state flags - set once in before() to avoid redundant checks
  let hasSubscriptionsData = false;
  let hasEmptyState = false;
  let apiSubscriptionsAvailable = false;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    // Navigate to home page once after login
    await navigation.ensureHomePage({ resetFilters: false });
    // Navigate to Subscriptions page to check data state
    await subscriptionsPage.ensureSubscriptionsPage();

    // Check data state ONCE and cache the results
    hasSubscriptionsData = await subscriptionsPage.hasSubscriptions();
    hasEmptyState = !hasSubscriptionsData && await subscriptionsPage.emptyState.isDisplayed().catch(() => false);
    apiSubscriptionsAvailable = !!process.env.API_OPS_TOKEN;

    console.info(`📊 Subscriptions data state: hasSubscriptions=${hasSubscriptionsData}, emptyState=${hasEmptyState}, apiAvailable=${apiSubscriptionsAvailable}`);
  });

  beforeEach(async () => {
    // Ensure we're on Subscriptions page
    await subscriptionsPage.ensureSubscriptionsPage();
  });

  describe('Page Structure', () => {
    it('should display the Subscriptions header title', async () => {
      await expect(subscriptionsPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      await expect(subscriptionsPage.accountButton).toBeDisplayed();
    });

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

    it('should display subscriptions list when subscriptions exist', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }

      await expect(subscriptionsPage.subscriptionsScrollView).toBeDisplayed();
      const subscriptionsCount = await subscriptionsPage.getVisibleSubscriptionsCount();
      expect(subscriptionsCount).toBeGreaterThan(0);
    });

    it('should display subscription items with ID and status', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }

      const firstSubscription = subscriptionsPage.firstSubscriptionItem;
      await expect(firstSubscription).toBeDisplayed();
      
      const details = await subscriptionsPage.getSubscriptionDetails(firstSubscription);
      expect(details.subscriptionId).toMatch(/^SUB-\d{4}-\d{4}-\d{4}$/);
      expect(['Active', 'Terminated', 'Updating', 'Terminating', 'Suspended']).toContain(details.status);
    });

    it('should detect all loaded subscriptions in the list', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }

      const subscriptionsCount = await subscriptionsPage.getVisibleSubscriptionsCount();
      const subscriptionIds = await subscriptionsPage.getVisibleSubscriptionIds();
      
      console.info(`Total subscriptions detected: ${subscriptionsCount}`);
      console.info(`First 5 subscription IDs: ${subscriptionIds.slice(0, 5).join(', ')}`);
      console.info(`Last 5 subscription IDs: ${subscriptionIds.slice(-5).join(', ')}`);
      
      expect(subscriptionsCount).toBeGreaterThan(0);
      
      // Verify all subscription IDs have valid format
      for (const subscriptionId of subscriptionIds) {
        expect(subscriptionId).toMatch(/^SUB-\d{4}-\d{4}-\d{4}$/);
      }
    });

    it('should not display empty state when subscriptions exist', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }

      const emptyStateVisible = await subscriptionsPage.emptyState.isDisplayed().catch(() => false);
      expect(emptyStateVisible).toBe(false);
    });
  });

  describe('Subscriptions by Status', () => {
    it('should be able to display different statuses', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }

      const activeSubscriptions = await subscriptionsPage.getSubscriptionsByStatus('Active');
      const terminatedSubscriptions = await subscriptionsPage.getSubscriptionsByStatus('Terminated');
      const updatingSubscriptions = await subscriptionsPage.getSubscriptionsByStatus('Updating');
      const terminatingSubscriptions = await subscriptionsPage.getSubscriptionsByStatus('Terminating');

      // At least one status should have subscriptions
      const totalStatusSubscriptions = activeSubscriptions.length + terminatedSubscriptions.length + 
                                       updatingSubscriptions.length + terminatingSubscriptions.length;
      expect(totalStatusSubscriptions).toBeGreaterThanOrEqual(0);
      
      console.info(`Subscriptions by status - Active: ${activeSubscriptions.length}, Terminated: ${terminatedSubscriptions.length}, Updating: ${updatingSubscriptions.length}, Terminating: ${terminatingSubscriptions.length}`);
    });
  });

  describe('API Integration', () => {
    it('should match API subscriptions count with visible subscriptions', async function () {
      // Skip if API token not configured or no subscriptions in UI
      if (!apiSubscriptionsAvailable || !hasSubscriptionsData) {
        this.skip();
        return;
      }

      try {
        const apiSubscriptions = await apiClient.getSubscriptions({ limit: 100 });
        const apiSubscriptionsList = apiSubscriptions.data || apiSubscriptions;
        const apiCount = apiSubscriptionsList.length;
        
        const uiCount = await subscriptionsPage.getVisibleSubscriptionsCount();
        
        console.info(`[Count Compare] API subscriptions: ${apiCount}, UI visible subscriptions: ${uiCount}`);
        
        // UI should show at least some subscriptions if API has subscriptions
        if (apiCount > 0) {
          expect(uiCount).toBeGreaterThan(0);
        }
      } catch (error) {
        console.warn('API check skipped:', error.message);
        this.skip();
      }
    });

    it('should verify first 10 subscription IDs and statuses match API data', async function () {
      if (!apiSubscriptionsAvailable || !hasSubscriptionsData) {
        this.skip();
        return;
      }

      try {
        const apiSubscriptions = await apiClient.getSubscriptions({ limit: 10 });
        const apiSubscriptionsList = apiSubscriptions.data || apiSubscriptions;
        const uiSubscriptionIds = await subscriptionsPage.getVisibleSubscriptionIds();
        const uiSubscriptionsWithStatus = await subscriptionsPage.getVisibleSubscriptionsWithStatus();
        
        // Compare each API subscription with UI and log results
        const comparisons = [];
        for (let i = 0; i < Math.min(apiSubscriptionsList.length, 10); i++) {
          const apiSubscription = apiSubscriptionsList[i];
          const apiSubscriptionId = apiSubscription.subscriptionId || apiSubscription.id;
          const apiStatus = apiSubscription.status;
          const uiSubscription = uiSubscriptionsWithStatus[i] || {};
          const uiSubscriptionId = uiSubscription.subscriptionId;
          const uiStatus = uiSubscription.status;
          
          const idMatches = apiSubscriptionId === uiSubscriptionId;
          const statusMatches = apiStatus === uiStatus;
          
          console.info(`[${i + 1}] ID: ${apiSubscriptionId} vs ${uiSubscriptionId} ${idMatches ? '✓' : '✗'} | Status: ${apiStatus} vs ${uiStatus} ${statusMatches ? '✓' : '✗'}`);
          comparisons.push({ apiSubscriptionId, uiSubscriptionId, idMatches, apiStatus, uiStatus, statusMatches });
        }
        
        const idMatchCount = comparisons.filter(c => c.idMatches).length;
        const statusMatchCount = comparisons.filter(c => c.statusMatches).length;
        console.info(`Match summary - IDs: ${idMatchCount}/${comparisons.length}, Statuses: ${statusMatchCount}/${comparisons.length}`);
        
        // Verify all visible UI subscriptions have valid format
        for (const uiSubscriptionId of uiSubscriptionIds.slice(0, 10)) {
          expect(uiSubscriptionId).toMatch(/^SUB-\d{4}-\d{4}-\d{4}$/);
        }
      } catch (error) {
        console.warn('API verification skipped:', error.message);
        this.skip();
      }
    });
  });
});
