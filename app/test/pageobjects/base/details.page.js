const { $ } = require('@wdio/globals');

const BasePage = require('./base.page');
const footerPage = require('./footer.page');
const { getSelector, selectors } = require('../utils/selectors');
const { TIMEOUT, PAUSE, SCROLL } = require('../utils/constants');

/**
 * Base class for detail-type pages (Order Details, Subscription Details, Agreement Details, etc.)
 * Provides common patterns for:
 * - Header with back navigation
 * - Scrollable content area
 * - ID and status display
 * - Composite accessible field extraction
 * - Page state detection
 *
 * Subclasses must implement the following abstract properties:
 * - itemPrefix: string - e.g., 'ORD-', 'SUB-', 'AGR-'
 * - pageName: string - e.g., 'Order', 'Subscription', 'Agreement'
 *
 * Example usage:
 *
 *   class OrderDetailsPage extends DetailsPage {
 *     get itemPrefix() { return 'ORD-'; }
 *     get pageName() { return 'Order'; }
 *     // Add order-specific selectors or helpers here
 *   }
 *
 *   module.exports = new OrderDetailsPage();
 *
 * Naming conventions:
 * - Use getSimpleField(labelText) and getSimpleFieldValue(labelText, scrollIfNeeded) for label-value pairs
 * - Use getCompositeField(labelPrefix) and getCompositeFieldValue(element, scrollIfNeeded) for composite fields
 * - Use itemIdText for the main ID element, statusText for status
 * - Subclasses may add aliases (e.g., orderIdText, subscriptionIdText) for clarity
 *
 * @abstract
 */
/**
 * Abstract base class for all details pages.
 *
 * To extend:
 *   class MyDetailsPage extends DetailsPage {
 *     get itemPrefix() { return 'XXX-'; }
 *     get pageName() { return 'MyPage'; }
 *     // Add page-specific selectors or helpers here
 *   }
 *
 * Required overrides:
 *   - itemPrefix: string (e.g., 'ORD-', 'SUB-')
 *   - pageName: string (e.g., 'Order', 'Subscription')
 *
 * Provided helpers:
 *   - getItemId(), getStatus(), getSimpleFieldValue(), getCompositeFieldValue(), scrollToTop(), isOnDetailsPage()
 *   - getSimpleField(labelText), getCompositeField(labelPrefix)
 *
 * Naming conventions:
 *   - Use getSimpleField/getSimpleFieldValue for label-value pairs
 *   - Use getCompositeField/getCompositeFieldValue for composite fields
 *   - Use itemIdText for the main ID element, statusText for status
 *   - Subclasses may add aliases (e.g., orderIdText, subscriptionIdText) for clarity
 */
class DetailsPage extends BasePage {
  constructor() {
    super();
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
   * @returns {string} The page name for header (e.g., 'Order', 'Subscription', 'Agreement')
   */
  get pageName() {
    throw new Error('Subclass must implement pageName getter');
  }

  // ========== Common Header Elements ==========
  get goBackButton() {
    return $(
      getSelector({
        ios: '~Go back',
        android: '//android.widget.Button[@content-desc="Go back" or @text="Go back"]',
      }),
    );
  }

  get headerTitle() {
    return $(
      getSelector({
        ios: `//XCUIElementTypeStaticText[@name="${this.pageName}" and contains(@traits, "Header")]`,
        android: `//android.view.View[@text="${this.pageName}" and @heading="true"]`,
      }),
    );
  }

  get accountButton() {
    return $(selectors.byAccessibilityId('nav-account-button'));
  }

  // ========== Common Content Elements ==========

  /**
   * Get the ID text element (e.g., ORD-XXXX-XXXX-XXXX)
   */
  get itemIdText() {
    return $(
      getSelector({
        ios: `//XCUIElementTypeStaticText[contains(@name, "${this.itemPrefix}")]`,
        android: `//*[contains(@text, "${this.itemPrefix}") or contains(@content-desc, "${this.itemPrefix}")]`,
      }),
    );
  }

  /**
   * Get the status text element
   * Default implementation - subclasses may override for specific DOM structures
   */
  get statusText() {
    return $(
      getSelector({
        ios: `//XCUIElementTypeStaticText[contains(@name, "${this.itemPrefix}")]/following-sibling::XCUIElementTypeOther[1]/following-sibling::XCUIElementTypeStaticText[1]`,
        android: `//*[contains(@text, "${this.itemPrefix}")]/following-sibling::android.widget.TextView[1]`,
      }),
    );
  }

  get detailsHeader() {
    return $(selectors.byText('Details'));
  }

  get scrollView() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeScrollView',
        android: '//android.widget.ScrollView',
      }),
    );
  }

  /**
   * Get a status element by its string value (robust for standalone status fields)
   * @param {string} statusValue - The status string (e.g., 'Paid', 'Issued', 'Overdue')
   * @returns {WebdriverIO.Element}
   */
  getStatusByName(statusValue) {
    return $(
      getSelector({
        ios: `//XCUIElementTypeStaticText[@name="${statusValue}"]`,
        android: `//android.widget.TextView[@text="${statusValue}"]`,
      })
    );
  }

  // ========== Scroll Methods ==========
  // scrollDown(), scrollUp(), and _performSwipe() are inherited from BasePage

  /**
   * Scroll to the top of the details view
   * Useful before gathering all details to ensure we start from the top
   */
  async scrollToTop(maxAttempts = 3) {
    // Scroll up multiple times to ensure we're at the top
    for (let i = 0; i < maxAttempts; i++) {
      await this.scrollUp();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
    }
  }

  // ========== Common Helper Methods ==========

  /**
   * Check if on this details page
   * @returns {Promise<boolean>}
   */
  async isOnDetailsPage() {
    try {
      const titleDisplayed = await this.headerTitle.isDisplayed();
      const itemIdDisplayed = await this.itemIdText.isDisplayed();
      return titleDisplayed && itemIdDisplayed;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for the details page to be ready
   * @param {number} timeout - Maximum wait time
   */
  async waitForPageReady(timeout = TIMEOUT.SCREEN_READY) {
    await this.headerTitle.waitForDisplayed({ timeout });
    await this.itemIdText.waitForDisplayed({ timeout });
    await browser.pause(PAUSE.ANIMATION_SETTLE);
  }

  /**
   * Navigate back to the list page
   */
  async goBack() {
    await this.goBackButton.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Navigate back using system/hardware back action
   * iOS: Performs edge swipe from left to right (native iOS back gesture)
   * Android: Uses hardware back button
   */
  async systemBack() {
    if (this.isAndroid()) {
      // Android hardware back button
      await browser.back();
    } else {
      // iOS edge swipe gesture (swipe from left edge to right)
      // Must start from the very left edge of the screen to trigger back navigation
      const { width, height } = await browser.getWindowRect();
      const startX = 5; // Start from left edge (5px from edge)
      const endX = width * 0.6; // Swipe to 60% of screen width
      const y = height / 2; // Middle of screen vertically

      await browser.execute('mobile: dragFromToForDuration', {
        fromX: startX,
        fromY: y,
        toX: endX,
        toY: y,
        duration: 0.3, // Duration in seconds (fast but not instant)
      });
    }
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Get the displayed item ID
   * @returns {Promise<string>} Item ID (e.g., 'ORD-8235-3388-3309')
   */
  async getItemId() {
    const text = await this.itemIdText.getText();
    return text.trim();
  }

  /**
   * Get the displayed status
   * @returns {Promise<string>} Status (e.g., 'Completed')
   */
  async getStatus() {
    const text = await this.statusText.getText();
    return text.trim();
  }

  /**
   * Extract value from composite accessible element
   * These elements have accessibility labels in format: "Label, Value"
   * @param {WebdriverIO.Element} element - Element with "Label, Value" format
   * @param {boolean} scrollIfNeeded - Whether to scroll if element not visible
   * @returns {Promise<string>} Extracted value
   */
  async getCompositeFieldValue(element, scrollIfNeeded = false) {
    if (scrollIfNeeded) {
      const isDisplayed = await element.isDisplayed().catch(() => false);
      if (!isDisplayed) {
        await this.scrollDown();
        await browser.pause(PAUSE.NAVIGATION);
      }
    }
    const label = (await element.getAttribute('name')) || (await element.getAttribute('content-desc'));
    if (!label || !label.includes(', ')) {
      return '';
    }
    // Split on first ", " to get the value part
    const parts = label.split(', ');
    console.log(`[getCompositeFieldValue] Raw label: "${label}"`);
    console.log(`[getCompositeFieldValue] Extracted value: "${parts}"`);
    console.log(`[getCompositeFieldValue] Returned value: "${parts.slice(1).join(', ').trim()}"`);
    return parts.slice(1).join(', ').trim();
  }

  /**
   * Get a composite field element by its label prefix
   * @param {string} labelPrefix - The label prefix (e.g., 'Agreement', 'Product', 'Vendor')
   * @returns {WebdriverIO.Element}
   */
  getCompositeField(labelPrefix) {
    return $(
      getSelector({
        ios: `//XCUIElementTypeOther[starts-with(@name, "${labelPrefix},")]`,
        android: `//*[starts-with(@content-desc, "${labelPrefix},")]`,
      }),
    );
  }

  /**
   * Get value from a composite field by label prefix
   * @param {string} labelPrefix - The label prefix (e.g., 'Agreement', 'Product')
   * @param {boolean} scrollIfNeeded - Whether to scroll if element not visible
   * @returns {Promise<string>}
   */
  async getCompositeFieldValueByLabel(labelPrefix, scrollIfNeeded = false) {
    const field = this.getCompositeField(labelPrefix);
    if (scrollIfNeeded) {
      let isDisplayed = await field.isDisplayed().catch(() => false);
      let attempts = 0;
      while (!isDisplayed && attempts < SCROLL.MAX_SCROLL_ATTEMPTS) {
        await this.scrollDown();
        await browser.pause(PAUSE.NAVIGATION);
        isDisplayed = await field.isDisplayed().catch(() => false);
        attempts++;
      }
      if (!isDisplayed) {
        console.warn(`[getCompositeFieldValueByLabel] Field "${labelPrefix}" not visible after ${attempts} scroll attempts`);
        return '';
      }
    }
    return this.getCompositeFieldValue(field);
  }

  /**
   * Get a simple label-value field selector
   * @param {string} labelText - The label text (e.g., 'Type', 'Currency')
   * @returns {Object} Object with label and value element getters
   */
  getSimpleField(labelText) {
    return {
      label: $(selectors.byText(labelText)),
      value: $(
        getSelector({
          ios: `//XCUIElementTypeStaticText[@name="${labelText}"]/following-sibling::XCUIElementTypeStaticText[1]`,
          android: `//android.widget.TextView[@text="${labelText}"]/following-sibling::android.widget.TextView[1]`,
        }),
      ),
    };
  }

  /**
   * Get value from a simple label-value field
   * @param {string} labelText - The label text
   * @param {boolean} scrollIfNeeded - Whether to scroll if element not visible
   * @returns {Promise<string>}
   */
  async getSimpleFieldValue(labelText, scrollIfNeeded = false) {
    const field = this.getSimpleField(labelText);
    if (scrollIfNeeded) {
      let isDisplayed = await field.value.isDisplayed().catch(() => false);
      let attempts = 0;
      while (!isDisplayed && attempts < SCROLL.MAX_SCROLL_ATTEMPTS) {
        await this.scrollDown();
        await browser.pause(PAUSE.NAVIGATION);
        isDisplayed = await field.value.isDisplayed().catch(() => false);
        attempts++;
      }
      if (!isDisplayed) {
        console.warn(`[getSimpleFieldValue] Field "${labelText}" not visible after ${attempts} scroll attempts`);
        return '';
      }
    }
    const text = await field.value.getText();
    return text.trim();
  }
}

module.exports = DetailsPage;
