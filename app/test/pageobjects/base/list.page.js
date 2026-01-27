const { $, $$ } = require('@wdio/globals');

const BasePage = require('./base.page');
const footerPage = require('./footer.page');
const headingPage = require('./heading.page');
const { getSelector, selectors } = require('../utils/selectors');
const { TIMEOUT, PAUSE, SCROLL, GESTURE } = require('../utils/constants');

/**
 * Base class for list-type pages (Orders, Subscriptions, Agreements, etc.)
 * Provides common patterns for:
 * - Loading/empty/error states
 * - List item interactions
 * - Scrolling behavior
 * - Page state detection
 *
 * Subclasses must implement the following abstract properties:
 * - itemPrefix: string - e.g., 'ORD-', 'SUB-', 'AGR-'
 * - pageName: string - e.g., 'Orders', 'Subscriptions', 'Agreements'
 * - loadingIndicatorId: string - accessibility ID for loading indicator
 * - emptyStateId: string - accessibility ID for empty state
 * - errorStateId: string - accessibility ID for error state
 *
 * @abstract
 */
class ListPage extends BasePage {
  constructor() {
    super();
    this.header = headingPage;
    this.footer = footerPage;
  }

  // ========== Abstract Properties (must be overridden) ==========

  /**
   * @abstract
   * @returns {string} The item prefix (e.g., 'ORD-', 'SUB-', 'AGR-')
   */
  get itemPrefix() {
    throw new Error('Subclass must implement itemPrefix getter');
  }

  /**
   * @abstract
   * @returns {string} The page name (e.g., 'Orders', 'Subscriptions', 'Agreements')
   */
  get pageName() {
    throw new Error('Subclass must implement pageName getter');
  }

  /**
   * @abstract
   * @returns {string} The loading indicator accessibility ID
   */
  get loadingIndicatorId() {
    throw new Error('Subclass must implement loadingIndicatorId getter');
  }

  /**
   * @abstract
   * @returns {string} The empty state accessibility ID
   */
  get emptyStateId() {
    throw new Error('Subclass must implement emptyStateId getter');
  }

  /**
   * @abstract
   * @returns {string} The error state accessibility ID
   */
  get errorStateId() {
    throw new Error('Subclass must implement errorStateId getter');
  }

  // ========== Common Loading States ==========

  get loadingIndicator() {
    return $(selectors.byAccessibilityId(this.loadingIndicatorId));
  }

  get emptyState() {
    return $(selectors.byAccessibilityId(this.emptyStateId));
  }

  get errorState() {
    return $(selectors.byAccessibilityId(this.errorStateId));
  }

  // ========== Common Header Elements ==========

  get headerTitle() {
    return $(
      getSelector({
        ios: `//XCUIElementTypeStaticText[@name="${this.pageName}" and contains(@traits, "Header")]`,
        android: `//android.view.View[@text="${this.pageName}" and @heading="true"]`,
      }),
    );
  }

  get accountButton() {
    return $(
      getSelector({
        ios: '~nav-account-button',
        android: '//*[@resource-id="nav-account-button"]',
      }),
    );
  }

  get goBackButton() {
    return $(
      getSelector({
        ios: '~Go back',
        android: '//android.widget.Button[@content-desc="Go back" or @text="Go back"]',
      }),
    );
  }

  // ========== Common List Elements ==========

  get scrollView() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeScrollView',
        android: '//android.widget.ScrollView',
      }),
    );
  }

  /**
   * Get all visible list items
   * @returns {Promise<ElementArray>} Array of list item elements
   */
  get listItems() {
    return $$(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${this.itemPrefix}") and contains(@name, ",")]`,
        android: `//*[contains(@content-desc, "${this.itemPrefix}") and contains(@content-desc, ",")]`,
      }),
    );
  }

  /**
   * Get the first list item
   * @returns {WebdriverIO.Element}
   */
  get firstListItem() {
    return $(
      getSelector({
        ios: `(//XCUIElementTypeOther[contains(@name, "${this.itemPrefix}") and contains(@name, ",")])[1]`,
        android: `(//*[contains(@content-desc, "${this.itemPrefix}") and contains(@content-desc, ",")])[1]`,
      }),
    );
  }

  /**
   * Get list item by ID
   * @param {string} itemId - Item ID (e.g., 'ORD-3760-9768-9099')
   * @returns {WebdriverIO.Element}
   */
  getItemById(itemId) {
    return $(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${itemId}")]`,
        android: `//*[contains(@content-desc, "${itemId}")]`,
      }),
    );
  }

  /**
   * Get list items by status
   * @param {string} status - Item status
   * @returns {Promise<ElementArray>}
   */
  getItemsByStatus(status) {
    return $$(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${this.itemPrefix}") and contains(@name, ", ${status}")]`,
        android: `//*[contains(@content-desc, "${this.itemPrefix}") and contains(@content-desc, ", ${status}")]`,
      }),
    );
  }

  // ========== Common Helper Methods ==========

  /**
   * Wait for the screen to be ready (either shows data, empty state, or error)
   * @param {number} timeout - Maximum wait time in milliseconds
   */
  async waitForScreenReady(timeout = TIMEOUT.SCREEN_READY) {
    // First wait for loading to potentially appear and disappear
    const loadingVisible = await this.loadingIndicator.isDisplayed().catch(() => false);
    if (loadingVisible) {
      await this.loadingIndicator.waitForDisplayed({ timeout, reverse: true }).catch(() => {});
    }
    // Screen is ready when either empty state or content is shown
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Check if currently on this page
   * @returns {Promise<boolean>}
   */
  async isOnPage() {
    try {
      return await this.headerTitle.isDisplayed();
    } catch (error) {
      console.debug(`${this.pageName} header title not found: ${error.message}`);
      return false;
    }
  }

  /**
   * Navigate back from this page
   */
  async goBack() {
    await this.goBackButton.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Check if the list has any items (not showing empty state)
   * @returns {Promise<boolean>} True if items exist, false if empty state is shown
   */
  async hasItems() {
    try {
      const items = await this.listItems;
      return items.length > 0;
    } catch (error) {
      console.debug(`Error checking for ${this.pageName} items: ${error.message}`);
      return false;
    }
  }

  /**
   * Get count of visible items
   * @returns {Promise<number>}
   */
  async getVisibleItemsCount() {
    const items = await this.listItems;
    return items.length;
  }

  /**
   * Tap on a specific item by ID
   * @param {string} itemId - Item ID to tap
   */
  async tapItem(itemId) {
    const item = this.getItemById(itemId);
    await item.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });
    await item.click();
  }

  /**
   * Tap on the first item in the list
   */
  async tapFirstItem() {
    await this.firstListItem.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });
    await this.firstListItem.click();
  }

  /**
   * Scroll down in the list
   * @param {number} percent - Scroll percentage (0.0 to 1.0, default 0.5)
   */
  async scrollDown(percent = SCROLL.DEFAULT_PERCENT) {
    if (this.isAndroid()) {
      await browser.execute('mobile: swipeGesture', {
        left: GESTURE.SWIPE_LEFT,
        top: GESTURE.SWIPE_TOP,
        width: GESTURE.SWIPE_WIDTH,
        height: GESTURE.SWIPE_HEIGHT,
        direction: 'up',
        percent: percent,
      });
    } else {
      await browser.execute('mobile: swipe', {
        direction: 'up',
        velocity: GESTURE.IOS_VELOCITY,
      });
    }
  }

  /**
   * Scroll to find an item by ID
   * @param {string} itemId - Item ID to find
   * @param {number} maxScrolls - Maximum scroll attempts
   * @returns {Promise<boolean>} - True if found
   */
  async scrollToItem(itemId, maxScrolls = SCROLL.MAX_SCROLL_ATTEMPTS) {
    for (let i = 0; i < maxScrolls; i++) {
      const item = this.getItemById(itemId);
      const isDisplayed = await item.isDisplayed().catch(() => false);
      if (isDisplayed) {
        return true;
      }
      await this.scrollDown();
      await browser.pause(PAUSE.NAVIGATION);
    }
    return false;
  }

  /**
   * Get item details from an item's accessibility label
   * Default implementation - subclasses can override for specific parsing
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{id: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));
    // Basic parsing - subclasses should override for specific formats
    const idMatch = label.match(new RegExp(`(${this.itemPrefix}\\d{4}-\\d{4}-\\d{4})`));
    const id = idMatch ? idMatch[1] : '';

    // Try to extract status (assumes format ends with ", Status")
    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';

    return { id, status, label };
  }

  /**
   * Get all visible item IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleItemIds() {
    const items = await this.listItems;
    const itemIds = [];
    for (const item of items) {
      const details = await this.getItemDetails(item);
      itemIds.push(details.id);
    }
    return itemIds;
  }

  /**
   * Get all visible items with their statuses
   * @returns {Promise<Array<{id: string, status: string, label: string}>>}
   */
  async getVisibleItemsWithStatus() {
    const items = await this.listItems;
    const itemDetails = [];
    for (const item of items) {
      const details = await this.getItemDetails(item);
      itemDetails.push(details);
    }
    return itemDetails;
  }

  /**
   * Scroll to the bottom of the list to trigger pagination
   * @param {number} maxScrolls - Maximum scroll attempts to reach bottom
   * @returns {Promise<{initialCount: number, finalCount: number, newItemsLoaded: boolean}>}
   */
  async scrollToBottomAndWaitForMore(maxScrolls = SCROLL.MAX_SCROLL_ATTEMPTS) {
    const initialCount = await this.getVisibleItemsCount();
    let previousCount = initialCount;
    let scrollAttempts = 0;
    let noChangeCount = 0;

    // Keep scrolling until we stop seeing new items (reached bottom)
    while (scrollAttempts < maxScrolls && noChangeCount < SCROLL.NO_CHANGE_THRESHOLD) {
      await this.scrollDown(SCROLL.PAGINATION_PERCENT);
      await browser.pause(PAUSE.SCROLL_PAGINATION);

      const currentCount = await this.getVisibleItemsCount();

      if (currentCount === previousCount) {
        noChangeCount++;
      } else {
        noChangeCount = 0;
      }

      previousCount = currentCount;
      scrollAttempts++;
    }

    const finalCount = await this.getVisibleItemsCount();

    return {
      initialCount,
      finalCount,
      newItemsLoaded: finalCount > initialCount,
    };
  }
}

module.exports = ListPage;
