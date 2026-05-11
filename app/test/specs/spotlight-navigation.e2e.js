const { expect, $ } = require('@wdio/globals');

const headingPage = require('../pageobjects/base/heading.page');
const spotlightsPage = require('../pageobjects/spotlights.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureClientAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, PAUSE } = require('../pageobjects/utils/constants');
const { ensureHomePage } = require('../pageobjects/utils/navigation.page');
const { getSelector, isAndroid } = require('../pageobjects/utils/selectors');
const { getClientApi } = require('../utils/api-client');

/**
 * Spotlight Navigation Tests
 *
 * MPT-17255: Tapping a spotlight item navigates to the correct entity details page.
 * MPT-17256: Tapping the "View All" footer on a spotlight card navigates to the list screen.
 *
 * Strategy:
 * - Discover the first card type that has visible items in the before() hook.
 * - Each test independently navigates from the spotlight home page (enforced by beforeEach).
 * - Navigation is verified by checking for the back button and/or the entity ID on the destination.
 */
describe('Spotlight Navigation', () => {
  let api;
  let hasSpotlightsData = false;
  let sectionData = {};
  let firstAvailableCardType = null;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();

    await ensureLoggedIn();
    await ensureHomePage({ resetFilters: false });
    await ensureClientAccount();

    hasSpotlightsData = await spotlightsPage.hasSpotlights();

    if (!hasSpotlightsData) {
      console.info('⚠️ No spotlight data - navigation tests will be skipped');
      return;
    }

    try {
      sectionData = await api.getSpotlightDataAvailability();
      console.info('📊 Spotlight section data (from API):', {
        hasOrders: sectionData.hasOrders,
        hasSubscriptions: sectionData.hasSubscriptions,
        hasInvoices: sectionData.hasInvoices,
        hasJournals: sectionData.hasJournals,
        hasBuyers: sectionData.hasBuyers,
        hasEnrollments: sectionData.hasEnrollments,
      });
    } catch (apiError) {
      console.info(`⚠️ API check failed, falling back to UI checks: ${apiError.message}`);
      sectionData = {
        hasOrders: await spotlightsPage.isOrdersSectionVisible().catch(() => false),
        hasSubscriptions: await spotlightsPage.isSubscriptionsSectionVisible().catch(() => false),
        hasInvoices: await spotlightsPage.isInvoicesSectionVisible().catch(() => false),
        hasJournals: await spotlightsPage.inProgressJournalsCard.isExisting().catch(() => false),
        hasBuyers: await spotlightsPage.isBuyersSectionVisible().catch(() => false),
        hasEnrollments: await spotlightsPage.isEnrollmentsSectionVisible().catch(() => false),
      };
    }

    // Discover first card type that has visible items in the DOM
    const cardPriority = [
      { type: 'orders', flag: 'hasOrders' },
      { type: 'subscriptions', flag: 'hasSubscriptions' },
      { type: 'invoices', flag: 'hasInvoices' },
      { type: 'journals', flag: 'hasJournals' },
      { type: 'buyers', flag: 'hasBuyers' },
      { type: 'enrollments', flag: 'hasEnrollments' },
    ];

    for (const card of cardPriority) {
      if (!sectionData[card.flag]) continue;
      const items = await spotlightsPage.getVisibleItemsFromCard(card.type, 1);
      if (items.length > 0) {
        firstAvailableCardType = card.type;
        break;
      }
    }

    console.info(
      `📊 Spotlight Navigation setup: hasData=${hasSpotlightsData}, firstCard=${firstAvailableCardType}`,
    );
  });

  beforeEach(async function () {
    if (!hasSpotlightsData) return;
    await ensureHomePage({ resetFilters: false });
    await browser.pause(PAUSE.ANIMATION_SETTLE);
  });

  // ========== MPT-17255: Spotlight Item → Details Navigation ==========
  describe('Item Navigation to Details (MPT-17255)', () => {
    it('should display a back button after tapping a spotlight item', async function () {
      if (!hasSpotlightsData || !firstAvailableCardType) {
        this.skip();
        return;
      }

      const items = await spotlightsPage.getVisibleItemsFromCard(firstAvailableCardType, 1);
      if (items.length === 0) {
        this.skip();
        return;
      }

      await items[0].click();
      await browser.pause(PAUSE.NAVIGATION);

      const backButtonVisible = await headingPage.backButton.isDisplayed().catch(() => false);
      expect(backButtonVisible).toBe(true);
    });

    it('should show the entity ID matching the tapped card type on the details page', async function () {
      if (!hasSpotlightsData || !firstAvailableCardType) {
        this.skip();
        return;
      }

      const items = await spotlightsPage.getVisibleItemsFromCard(firstAvailableCardType, 1);
      if (items.length === 0) {
        this.skip();
        return;
      }

      const prefixMap = {
        orders: 'ORD-',
        subscriptions: 'SUB-',
        invoices: 'INV-',
        journals: 'BJO-',
        buyers: 'BUY-',
        enrollments: 'ENR-',
      };
      const expectedPrefix = prefixMap[firstAvailableCardType];

      await items[0].click();
      await browser.pause(PAUSE.NAVIGATION);

      const idElement = $(
        getSelector({
          ios: `//XCUIElementTypeStaticText[contains(@name, "${expectedPrefix}")]`,
          android: `//*[contains(@text, "${expectedPrefix}") or contains(@content-desc, "${expectedPrefix}")]`,
        }),
      );
      await idElement.waitForDisplayed({ timeout: TIMEOUT.SCREEN_READY });
      const idText = isAndroid()
        ? await idElement.getText()
        : await idElement.getAttribute('name');
      expect(idText).toContain(expectedPrefix);
    });

    it('should return to spotlight home after pressing back from a details page', async function () {
      if (!hasSpotlightsData || !firstAvailableCardType) {
        this.skip();
        return;
      }

      const items = await spotlightsPage.getVisibleItemsFromCard(firstAvailableCardType, 1);
      if (items.length === 0) {
        this.skip();
        return;
      }

      await items[0].click();
      await browser.pause(PAUSE.NAVIGATION);

      await headingPage.backButton.click();
      await browser.pause(PAUSE.NAVIGATION);

      const filterAllVisible = await spotlightsPage.filterAll.isDisplayed().catch(() => false);
      expect(filterAllVisible).toBe(true);
    });
  });

  // ========== MPT-17256: View All Footer → List Navigation ==========
  describe('View All Navigation to List (MPT-17256)', () => {
    it('should display a "View All" footer on spotlight cards', async function () {
      if (!hasSpotlightsData || !firstAvailableCardType) {
        this.skip();
        return;
      }

      const viewAllFooter = spotlightsPage.getCardFooterByPattern('view all');
      const isVisible = await viewAllFooter.isDisplayed().catch(() => false);
      expect(isVisible).toBe(true);
    });

    it('should navigate away from spotlight when "View All" is tapped', async function () {
      if (!hasSpotlightsData || !firstAvailableCardType) {
        this.skip();
        return;
      }

      await spotlightsPage.clickViewAll();
      await browser.pause(PAUSE.NAVIGATION);

      // Navigation succeeded if either:
      // - A back button appeared (list screen pushed onto the stack), OR
      // - The spotlight filter chips are no longer visible (tab-level navigation occurred)
      const backButtonVisible = await headingPage.backButton.isDisplayed().catch(() => false);
      const spotlightFilterGone = !(await spotlightsPage.filterAll.isDisplayed().catch(() => false));
      expect(backButtonVisible || spotlightFilterGone).toBe(true);
    });

    it('should be able to navigate back to spotlight after "View All"', async function () {
      if (!hasSpotlightsData || !firstAvailableCardType) {
        this.skip();
        return;
      }

      await spotlightsPage.clickViewAll();
      await browser.pause(PAUSE.NAVIGATION);

      const backButtonVisible = await headingPage.backButton.isDisplayed().catch(() => false);
      if (backButtonVisible) {
        await headingPage.backButton.click();
      } else {
        await spotlightsPage.footer.clickSpotlightsTab();
      }
      await browser.pause(PAUSE.NAVIGATION);

      const filterAllVisible = await spotlightsPage.filterAll.isDisplayed().catch(() => false);
      expect(filterAllVisible).toBe(true);
    });
  });

  // ========== MPT-20237: Journals in Spotlights ==========
  describe('Journals in Spotlights (MPT-20237)', () => {
    it('should display the journals filter chip when journal spotlight data is available', async function () {
      if (!hasSpotlightsData || !sectionData.hasJournals) {
        this.skip();
        return;
      }

      const filterVisible = await spotlightsPage.filterJournals.isDisplayed().catch(() => false);
      expect(filterVisible).toBe(true);
    });

    it('should display the "in progress journals" card heading', async function () {
      if (!hasSpotlightsData || !sectionData.hasJournals) {
        this.skip();
        return;
      }

      await spotlightsPage.scrollToSection('in progress journals');
      const headerVisible = await spotlightsPage.inProgressJournalsHeader.isDisplayed().catch(() => false);
      expect(headerVisible).toBe(true);
    });

    it('should navigate to Journal Details when a journals spotlight item is tapped', async function () {
      if (!hasSpotlightsData || !sectionData.hasJournals) {
        this.skip();
        return;
      }

      await spotlightsPage.scrollToSection('in progress journals');
      const items = await spotlightsPage.getVisibleItemsFromCard('journals', 1);
      if (items.length === 0) {
        this.skip();
        return;
      }

      await items[0].click();
      await browser.pause(PAUSE.NAVIGATION);

      const idElement = $(
        getSelector({
          ios: '//XCUIElementTypeStaticText[contains(@name, "BJO-")]',
          android: '//*[contains(@text, "BJO-") or contains(@content-desc, "BJO-")]',
        }),
      );
      await idElement.waitForDisplayed({ timeout: TIMEOUT.SCREEN_READY });
      const idText = isAndroid()
        ? await idElement.getText()
        : await idElement.getAttribute('name');
      expect(idText).toContain('BJO-');
    });

    it('should filter spotlight cards to show only journal items when journals filter chip is tapped', async function () {
      if (!hasSpotlightsData || !sectionData.hasJournals) {
        this.skip();
        return;
      }

      await spotlightsPage.filterJournals.click();
      await browser.pause(PAUSE.ANIMATION_SETTLE);

      const journalItems = await spotlightsPage.getVisibleItemsFromCard('journals', 1);
      expect(journalItems.length).toBeGreaterThan(0);
    });
  });
});
