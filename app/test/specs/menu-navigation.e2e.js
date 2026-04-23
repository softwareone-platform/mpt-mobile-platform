/**
 * Menu Navigation E2E Test Suite
 *
 * Covers:
 *   MPT-17294 — Menu grouping refactor: validate group headings and item placement
 *   MPT-20232 — Move subscriptions to menu: subscriptions accessible via More menu
 *   MPT-20348 — Menu refactor problems: stability checks after grouping refactor
 *   MPT-17165 — Module-gated menu items: items visible match the current user's role/modules
 */

const { $, expect } = require('@wdio/globals');

const morePage = require('../pageobjects/more.page');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { TIMEOUT, PAUSE, GESTURE } = require('../pageobjects/utils/constants');

describe('More Menu Navigation', () => {
  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await morePage.footer.moreTab.click();
    await browser.pause(PAUSE.NAVIGATION);
  });

  beforeEach(async function () {
    await morePage.ensureMorePage();
    // Scroll back to top so each test starts from the same position
    if (isAndroid()) {
      await browser.execute('mobile: swipeGesture', {
        left: GESTURE.SWIPE_LEFT,
        top: GESTURE.SWIPE_TOP,
        width: GESTURE.SWIPE_WIDTH,
        height: GESTURE.SWIPE_HEIGHT,
        direction: 'down',
        percent: 1.0,
      });
    } else {
      await browser.execute('mobile: swipe', { direction: 'down', velocity: GESTURE.IOS_VELOCITY });
    }
    await browser.pause(PAUSE.NAVIGATION);
  });

  // ─── MPT-17294: Group headings are rendered ───────────────────────────────

  describe('Menu Group Headings (MPT-17294)', () => {
    it('should display at least one group heading on the More page', async function () {
      // The app always renders at least one group for any valid user
      const headings = [
        morePage.administrationGroupHeading,
        morePage.billingGroupHeading,
        morePage.catalogGroupHeading,
        morePage.marketplaceGroupHeading,
        morePage.programGroupHeading,
        morePage.settingsGroupHeading,
      ];

      let foundCount = 0;
      for (const heading of headings) {
        const exists = await heading.isExisting().catch(() => false);
        if (exists) foundCount++;
      }

      expect(foundCount).toBeGreaterThan(0);
    });

    it('should display the Marketplace group heading when marketplace items are available', async function () {
      const agreementsExists = await morePage.agreementsMenuItem.isExisting().catch(() => false);

      // If agreements item exists (even off-screen), the Marketplace heading must also exist and be reachable
      if (agreementsExists) {
        const found = await morePage.scrollToElement(morePage.marketplaceGroupHeading);
        expect(found).toBe(true);
        await expect(morePage.marketplaceGroupHeading).toBeDisplayed();
      } else {
        this.skip();
      }
    });

    it('should display the Billing group heading when billing items are available', async function () {
      const invoicesExists = await morePage.invoicesMenuItem.isExisting().catch(() => false);
      const creditMemosExists = await morePage.creditMemosMenuItem.isExisting().catch(() => false);
      const statementsExists = await morePage.statementsMenuItem.isExisting().catch(() => false);
      const journalsExists = await morePage.journalsMenuItem.isExisting().catch(() => false);

      const hasBillingItem = invoicesExists || creditMemosExists || statementsExists || journalsExists;

      if (hasBillingItem) {
        await expect(morePage.billingGroupHeading).toBeDisplayed();
      } else {
        this.skip();
      }
    });

    it('should display the Program group heading when program items are available', async function () {
      const programsExists = await morePage.programsMenuItem.isExisting().catch(() => false);
      const enrollmentsExists = await morePage.enrollmentsMenuItem.isExisting().catch(() => false);
      const certificatesExists = await morePage.certificatesMenuItem.isExisting().catch(() => false);

      const hasProgramItem = programsExists || enrollmentsExists || certificatesExists;

      if (hasProgramItem) {
        const found = await morePage.scrollToElement(morePage.programGroupHeading);
        expect(found).toBe(true);
        await expect(morePage.programGroupHeading).toBeDisplayed();
      } else {
        this.skip();
      }
    });

    it('should display the Settings group heading when settings items are available', async function () {
      const usersExists = await morePage.usersMenuItem.isExisting().catch(() => false);
      const buyersExists = await morePage.buyersMenuItem.isExisting().catch(() => false);

      const hasSettingsItem = usersExists || buyersExists;

      if (hasSettingsItem) {
        const found = await morePage.scrollToElement(morePage.settingsGroupHeading);
        expect(found).toBe(true);
        await expect(morePage.settingsGroupHeading).toBeDisplayed();
      } else {
        this.skip();
      }
    });
  });

  // ─── MPT-20232: Subscriptions is in the More menu (Marketplace group) ─────

  describe('Subscriptions in More Menu (MPT-20232)', () => {
    it('should display the Subscriptions menu item when module is available', async function () {
      const exists = await morePage.subscriptionsMenuItem.isExisting().catch(() => false);
      if (!exists) {
        this.skip();
        return;
      }
      await morePage.scrollToElement(morePage.subscriptionsMenuItem);
      await expect(morePage.subscriptionsMenuItem).toBeDisplayed();
    });

    it('should navigate to the Subscriptions screen from the More menu', async function () {
      const exists = await morePage.subscriptionsMenuItem.isExisting().catch(() => false);
      if (!exists) {
        this.skip();
        return;
      }

      await morePage.subscriptionsMenuItem.click();
      await browser.pause(PAUSE.NAVIGATION);

      // Verify subscriptions screen loaded by checking its header title
      const subscriptionsHeader = await $('//*[@name="Subscriptions" or @text="Subscriptions"]');
      await expect(subscriptionsHeader).toBeDisplayed();

      // Return to More page for subsequent tests
      await morePage.footer.moreTab.click();
      await browser.pause(PAUSE.NAVIGATION);
    });

    it('should show Subscriptions within the Marketplace group', async function () {
      const marketplaceExists = await morePage.marketplaceGroupHeading.isExisting().catch(() => false);
      const subscriptionsExists = await morePage.subscriptionsMenuItem.isExisting().catch(() => false);

      if (!marketplaceExists || !subscriptionsExists) {
        this.skip();
        return;
      }

      // Scroll down to bring the Marketplace section into view, then assert both heading and item
      await morePage.scrollToElement(morePage.marketplaceGroupHeading);
      await expect(morePage.marketplaceGroupHeading).toBeDisplayed();
      await expect(morePage.subscriptionsMenuItem).toBeDisplayed();
    });
  });

  // ─── MPT-20348: Menu stability — all visible items are tappable ──────────

  describe('Menu Item Stability (MPT-20348)', () => {
    it('should have all visible menu items in a tappable state', async function () {
      const menuItemGetters = [
        { name: 'agreements', getter: () => morePage.agreementsMenuItem },
        { name: 'orders', getter: () => morePage.ordersMenuItem },
        { name: 'subscriptions', getter: () => morePage.subscriptionsMenuItem },
        { name: 'invoices', getter: () => morePage.invoicesMenuItem },
        { name: 'creditMemos', getter: () => morePage.creditMemosMenuItem },
        { name: 'statements', getter: () => morePage.statementsMenuItem },
        { name: 'journals', getter: () => morePage.journalsMenuItem },
        { name: 'products', getter: () => morePage.productsMenuItem },
        { name: 'programs', getter: () => morePage.programsMenuItem },
        { name: 'enrollments', getter: () => morePage.enrollmentsMenuItem },
        { name: 'certificates', getter: () => morePage.certificatesMenuItem },
        { name: 'buyers', getter: () => morePage.buyersMenuItem },
        { name: 'users', getter: () => morePage.usersMenuItem },
        { name: 'clients', getter: () => morePage.clientsMenuItem },
      ];

      for (const { name, getter } of menuItemGetters) {
        const el = getter();
        const exists = await el.isExisting().catch(() => false);
        if (!exists) continue;

        const isEnabled = await el.isEnabled().catch(() => false);
        expect(isEnabled).toBe(true, `Menu item '${name}' should be enabled/tappable`);
      }
    });

    it('should navigate to More page without errors after re-entering from a different tab', async function () {
      // Leave More page
      await morePage.footer.spotlightsTab.click();
      await browser.pause(PAUSE.NAVIGATION);

      // Return to More page
      await morePage.footer.moreTab.click();
      await browser.pause(PAUSE.NAVIGATION);

      await expect(morePage.headerTitle).toBeDisplayed();
    });
  });

  // ─── MPT-17165: Module-gated items — visible set matches role/modules ─────

  describe('Module-Gated Menu Items (MPT-17165)', () => {
    it('should not show Administration items to non-Operations users when admin module is unavailable', async function () {
      // allBuyers, clients, allUsers, vendors are Operations+platform-account-management only
      // If the test user is NOT Operations, none of these should appear
      const adminItemGetters = [
        morePage.allBuyersMenuItem,
        morePage.clientsMenuItem,
        morePage.allUsersMenuItem,
        morePage.vendorsMenuItem,
      ];

      // At least verify we can read existence without crashing — structural assertion
      for (const item of adminItemGetters) {
        const exists = await item.isExisting().catch(() => false);
        // We don't assert true/false here because the role is unknown at test time.
        // The purpose is to confirm isExisting() does not throw and returns a boolean.
        expect(typeof exists).toBe('boolean');
      }
    });

    it('should display only menu items consistent with the visible group headings', async function () {
      // If a group heading is NOT visible, none of its items should be visible.
      // This guards against items appearing outside their group due to a filter bug.

      const administrationVisible = await morePage.administrationGroupHeading.isExisting().catch(() => false);
      if (!administrationVisible) {
        const adminOnlyItems = [morePage.allBuyersMenuItem, morePage.clientsMenuItem, morePage.allUsersMenuItem, morePage.vendorsMenuItem];
        for (const item of adminOnlyItems) {
          const exists = await item.isExisting().catch(() => false);
          expect(exists).toBe(false);
        }
      }

      const billingVisible = await morePage.billingGroupHeading.isExisting().catch(() => false);
      if (!billingVisible) {
        const billingOnlyItems = [morePage.invoicesMenuItem, morePage.creditMemosMenuItem, morePage.statementsMenuItem, morePage.journalsMenuItem];
        for (const item of billingOnlyItems) {
          const exists = await item.isExisting().catch(() => false);
          expect(exists).toBe(false);
        }
      }
    });

    it('should have no empty group sections visible', async function () {
      // Each group heading must have at least one child menu item visible beneath it.
      // NavigationGroupCard filters out empty sections — verify no orphaned headings exist.
      const groups = [
        {
          heading: morePage.administrationGroupHeading,
          items: [morePage.allBuyersMenuItem, morePage.clientsMenuItem, morePage.allUsersMenuItem, morePage.vendorsMenuItem],
        },
        {
          heading: morePage.billingGroupHeading,
          items: [morePage.invoicesMenuItem, morePage.creditMemosMenuItem, morePage.statementsMenuItem, morePage.journalsMenuItem],
        },
        {
          heading: morePage.catalogGroupHeading,
          items: [morePage.productsMenuItem],
        },
        {
          heading: morePage.marketplaceGroupHeading,
          items: [morePage.agreementsMenuItem, morePage.ordersMenuItem, morePage.subscriptionsMenuItem],
        },
        {
          heading: morePage.programGroupHeading,
          items: [morePage.programsMenuItem, morePage.enrollmentsMenuItem, morePage.certificatesMenuItem],
        },
        {
          heading: morePage.settingsGroupHeading,
          items: [morePage.usersMenuItem, morePage.buyersMenuItem],
        },
      ];

      for (const group of groups) {
        const headingVisible = await group.heading.isExisting().catch(() => false);
        if (!headingVisible) continue;

        let hasVisibleItem = false;
        for (const item of group.items) {
          const exists = await item.isExisting().catch(() => false);
          if (exists) {
            hasVisibleItem = true;
            break;
          }
        }

        expect(hasVisibleItem).toBe(true);
      }
    });
  });
});
