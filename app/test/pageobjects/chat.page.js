const { $, $$ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const { selectors, isAndroid, getSelector } = require('./utils/selectors');
const { PAUSE, TIMEOUT, SCROLL } = require('./utils/constants');

/**
 * Chat Page - Chat list screen accessed via footer chat tab
 *
 * This screen is a footer-level tab (not accessible via More menu).
 * Chat items are identified by their accessibility label (no testIDs on items).
 * Item label format: "Title[, LastMessage][, Timestamp][, UnreadCount]"
 *
 * ID Format: CHT-XXXX-XXXX-XXXX (3 groups of 4 digits)
 */
class ChatPage extends BasePage {
  constructor() {
    super();
    this.header = headingPage;
    this.footer = footerPage;
  }

  // ========== Header Elements ==========

  get headerTitle() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeStaticText[@name="Chat" and contains(@traits, "Header")])[last()]',
        android: '//android.view.View[@text="Chat" and @heading="true"]',
      }),
    );
  }

  get createChatButton() {
    return $(selectors.byResourceId('create-chat-button'));
  }

  get accountButton() {
    return $(selectors.byResourceId('nav-account-button'));
  }

  // ========== State Elements ==========

  get loadingIndicator() {
    return $(selectors.byResourceId('chats-loading-indicator'));
  }

  get emptyState() {
    return $(selectors.byResourceId('chats-empty-state'));
  }

  get errorState() {
    return $(selectors.byResourceId('chats-error-state'));
  }

  // ========== List Elements ==========

  get scrollView() {
    return $(selectors.scrollView());
  }

  /**
   * All visible chat list items (accessible elements inside the scroll view)
   * Items have label format: "Title[, LastMessage][, Timestamp][, UnreadCount]"
   */
  get chatItems() {
    return $$(
      getSelector({
        ios: '//XCUIElementTypeScrollView//XCUIElementTypeOther[@accessible="true"]',
        android: '//android.widget.ScrollView//*[@clickable="true" and @class="android.view.ViewGroup"]',
      }),
    );
  }

  get firstChatItem() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeScrollView//XCUIElementTypeOther[@accessible="true"])[1]',
        android: '(//android.widget.ScrollView//*[@clickable="true" and @class="android.view.ViewGroup"])[1]',
      }),
    );
  }

  // ========== Wait / State Methods ==========

  /**
   * Wait for the chat list screen to finish loading
   */
  async waitForScreenReady() {
    await this.loadingIndicator.waitForExist({
      timeout: TIMEOUT.SCREEN_READY,
      reverse: true,
    });
    await browser.pause(PAUSE.ANIMATION_SETTLE);
  }

  /**
   * Check if currently on the Chat list screen
   * @returns {Promise<boolean>}
   */
  async isOnChatPage() {
    try {
      return await this.headerTitle.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Check if the chat list has any items
   * @returns {Promise<boolean>}
   */
  async hasChats() {
    try {
      const items = await this.chatItems;
      return items.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get the count of visible chat items
   * @returns {Promise<number>}
   */
  async getVisibleChatsCount() {
    try {
      const items = await this.chatItems;
      return items.length;
    } catch {
      return 0;
    }
  }

  /**
   * Get accessibility label from a chat item
   * @param {WebdriverIO.Element} itemElement - Chat list item element
   * @returns {Promise<string>}
   */
  async getChatItemLabel(itemElement) {
    return (
      (await itemElement.getAttribute('name')) ||
      (await itemElement.getAttribute('content-desc')) ||
      ''
    );
  }

  /**
   * Tap the first chat item in the list
   */
  async tapFirstChat() {
    const first = await this.firstChatItem;
    await first.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });
    await first.click();
    await browser.pause(PAUSE.NAVIGATION);
  }

  /**
   * Open the Create Chat wizard by tapping the create-chat-button
   */
  async tapCreateChatButton() {
    await this.click(this.createChatButton);
    await browser.pause(PAUSE.ANIMATION_SETTLE);
  }

  /**
   * Find a chat item whose label starts with the given name prefix and tap it.
   * Scrolls down up to MAX_SCROLL_ATTEMPTS times to find the item.
   * @param {string} namePrefix - Name prefix to match against the chat title portion of the label
   * @returns {Promise<boolean>} true if the chat was found and tapped, false otherwise
   */
  async tapChatByNamePrefix(namePrefix) {
    for (let attempt = 0; attempt <= SCROLL.MAX_SCROLL_ATTEMPTS; attempt++) {
      const items = await this.chatItems;
      for (const item of items) {
        const label = await this.getChatItemLabel(item);
        const title = label.split(',')[0].trim();
        if (title.startsWith(namePrefix)) {
          await item.click();
          await browser.pause(PAUSE.NAVIGATION);
          return true;
        }
      }
      if (attempt < SCROLL.MAX_SCROLL_ATTEMPTS) {
        await this.scrollDown();
        await browser.pause(PAUSE.SCROLL_PAGINATION);
      }
    }
    return false;
  }
}

module.exports = new ChatPage();
