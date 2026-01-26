const { expect } = require('@wdio/globals');

const homePage = require('../pageobjects/spotlights.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');

describe('Home page of application', () => {
  // Section visibility flags - set once in before() to avoid redundant checks
  let sectionVisibility = {};
  // Empty state flags
  let hasSpotlightsData = false;
  let hasEmptyState = false;

  before(async function () {
    // Set timeout for login flow
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage();

    // Check empty state vs data ONCE
    hasSpotlightsData = await homePage.hasSpotlights();
    hasEmptyState = !hasSpotlightsData && await homePage.emptyState.isDisplayed().catch(() => false);

    console.log(`📊 Spotlights data state: hasSpotlights=${hasSpotlightsData}, emptyState=${hasEmptyState}`);

    // Check section visibility ONCE and cache results
    // These sections may or may not be visible depending on user's data
    sectionVisibility = {
      expiringSubscriptions: await homePage.isExpiringSubscriptionsSectionVisible().catch(() => false),
      expiredInvites: await homePage.isExpiredInvitesSectionVisible().catch(() => false),
      pendingInvites: await homePage.isPendingInvitesSectionVisible().catch(() => false),
      invoicesPastDue: await homePage.isInvoicesPastDueSectionVisible().catch(() => false),
      inProgressJournals: await homePage.isInProgressJournalsSectionVisible().catch(() => false),
      mismatchingBuyers: await homePage.isMismatchingBuyersSectionVisible().catch(() => false),
      buyersWithBlockedConnections: await homePage.isBuyersWithBlockedConnectionsSectionVisible().catch(() => false),
    };

    console.log(`📊 Section visibility:`, sectionVisibility);
  });

  beforeEach(async () => {
    await navigation.ensureHomePage();
  });

  it('to display footer with tabs', async () => {
    await expect(homePage.footer.spotlightsTab).toBeDisplayed();
    await expect(homePage.footer.ordersTab).toBeDisplayed();
    await expect(homePage.footer.subscriptionsTab).toBeDisplayed();
    await expect(homePage.footer.moreTab).toBeDisplayed();
  });

  it('to display spotlight header', async () => {
    await expect(homePage.spotlightHeader).toBeDisplayed();
    await expect(homePage.spotlightHeader).toHaveText('Spotlight');
  });

  it('to display main scroll view', async () => {
    await expect(homePage.scrollView).toBeDisplayed();
  });

  describe('Empty State', () => {
    // This test suite runs when user has no spotlight tasks

    it('should display empty state when no spotlight tasks exist', async function () {
      if (hasSpotlightsData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(homePage.emptyState).toBeDisplayed();
      await expect(homePage.noSpotlightsTitle).toBeDisplayed();
      await expect(homePage.noSpotlightsDescription).toBeDisplayed();
    });

    it('should display "No tasks on your side" title text', async function () {
      if (hasSpotlightsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await homePage.noSpotlightsTitle.getText();
      expect(titleText).toBe('No tasks on your side');
    });

    it('should display "Great job in staying on top of things" description', async function () {
      if (hasSpotlightsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await homePage.noSpotlightsDescription.getText();
      expect(descriptionText).toBe('Great job in staying on top of things');
    });
  });

  describe('Section Headers', () => {
    it('should display long-running orders header', async function () {
      if (!hasSpotlightsData) {
        console.log('Skipping - no spotlight data for this user');
        this.skip();
        return;
      }
      await expect(homePage.longRunningOrdersHeader).toBeDisplayed();
      const headerText = await homePage.longRunningOrdersHeader.getText();
      // Android uses "long running orders" (no hyphen)
      expect(headerText.toLowerCase()).toContain('long running orders');
    });

    it('should display expiring subscriptions header', async function () {
      if (!sectionVisibility.expiringSubscriptions) {
        console.log('Skipping - no expiring subscriptions data for this user');
        this.skip();
        return;
      }
      await homePage.scrollToSection('expiring subscriptions');
      const headerText = await homePage.expiringSubscriptionsHeader.getText();
      expect(headerText).toContain('expiring subscriptions');
    });

    it('should display expired invites header', async function () {
      if (!sectionVisibility.expiredInvites) {
        console.log('Skipping - no expired invites data for this user');
        this.skip();
        return;
      }
      await homePage.scrollToSection('expired invites');
      const headerText = await homePage.expiredInvitesHeader.getText();
      expect(headerText).toContain('expired invites');
    });

    it('should display pending invites header', async function () {
      if (!sectionVisibility.pendingInvites) {
        console.log('Skipping - no pending invites data for this user');
        this.skip();
        return;
      }
      await homePage.scrollToSection('pending invites');
      const headerText = await homePage.pendingInvitesHeader.getText();
      expect(headerText).toContain('pending invites');
    });

    it('should display past due invoices header', async function () {
      if (!sectionVisibility.invoicesPastDue) {
        console.log('Skipping - no past due invoices data for this user');
        this.skip();
        return;
      }
      await homePage.scrollToSection('past due invoices');
      const headerText = await homePage.invoicesPastDueHeader.getText();
      expect(headerText).toContain('past due invoices');
    });

    it('should display in progress journals header', async function () {
      if (!sectionVisibility.inProgressJournals) {
        console.log('Skipping - no in progress journals data for this user');
        this.skip();
        return;
      }
      await homePage.scrollToSection('in progress journals');
      const headerText = await homePage.inProgressJournalsHeader.getText();
      // Android uses "in progress journals" (no hyphen)
      expect(headerText.toLowerCase()).toContain('in progress journals');
    });

    it('should display mismatching buyers header', async function () {
      if (!sectionVisibility.mismatchingBuyers) {
        console.log('Skipping - no mismatching buyers data for this user');
        this.skip();
        return;
      }
      await homePage.scrollToSection('mismatching buyers');
      const headerText = await homePage.mismatchingBuyersHeader.getText();
      expect(headerText).toContain('mismatching buyers');
    });

    it('should display buyers with blocked connections header', async function () {
      if (!sectionVisibility.buyersWithBlockedConnections) {
        console.log('Skipping - no buyers with blocked connections data for this user');
        this.skip();
        return;
      }
      await homePage.scrollToSection('buyers with blocked seller connections');
      const headerText = await homePage.buyersWithBlockedConnectionsHeader.getText();
      expect(headerText).toContain('buyers with blocked seller connections');
    });
  });
});
