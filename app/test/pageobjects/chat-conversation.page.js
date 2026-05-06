const { $ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const footerPage = require('./base/footer.page');
const headingPage = require('./base/heading.page');
const { selectors, getSelector } = require('./utils/selectors');
const { PAUSE, TIMEOUT, REGEX } = require('./utils/constants');

/**
 * Chat Conversation Page - Individual chat thread view
 *
 * Opened by tapping a chat item from the Chat list screen.
 * Header shows conversation name and CHT-XXXX-XXXX-XXXX ID.
 * Footer contains the message input text view and send button.
 *
 * ID Format: CHT-XXXX-XXXX-XXXX (3 groups of 4 digits)
 */
class ChatConversationPage extends BasePage {
  constructor() {
    super();
    this.header = headingPage;
    this.footer = footerPage;
  }

  // ========== Header / Navigation ==========

  get goBackButton() {
    return $(
      getSelector({
        ios: '~Go back',
        android: '//android.widget.Button[@content-desc="Go back"]',
      }),
    );
  }

  /**
   * The screen-level "Chat" title in the nav bar (always present on this screen)
   */
  get screenTitle() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeStaticText[@name="Chat" and contains(@traits, "Header")])[last()]',
        android: '//android.view.View[@text="Chat" and @heading="true"]',
      }),
    );
  }

  // ========== Conversation Details Header ==========

  /**
   * The conversation name shown in the details header (e.g. "Lets talk about commerce!!")
   * This is below the nav bar — it's the first non-"Chat" header StaticText
   */
  get conversationTitle() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeStaticText[not(@name="Chat") and contains(@traits, "StaticText")])[1]',
        android: '//android.view.View[@heading="true" and @index="1"]',
      }),
    );
  }

  /**
   * Chat ID label (e.g. "CHT-8020-1103-3277") shown below the conversation name
   */
  get chatIdLabel() {
    return $(
      getSelector({
        ios: `//XCUIElementTypeStaticText[starts-with(@name, "CHT-")]`,
        android: `//android.widget.TextView[starts-with(@text, "CHT-")]`,
      }),
    );
  }

  // ========== State Elements ==========

  get loadingIndicator() {
    return $(selectors.byResourceId('chat-conversation-loading-indicator'));
  }

  get emptyState() {
    return $(selectors.byResourceId('chat-conversation-empty-state'));
  }

  get errorState() {
    return $(selectors.byResourceId('chat-conversation-error-state'));
  }

  // ========== Message Input ==========

  get messageInput() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeTextView[@name="Type a message"]',
        android: '//android.widget.EditText[@hint="Type a message"]',
      }),
    );
  }

  /**
   * Visibility toggle icon (lock / public globe) in the message input footer.
   * Only rendered for Operations users.
   */
  get visibilityToggleButton() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeButton[@name="lock"] | //XCUIElementTypeButton[@name="public"])',
        android: '(//*[@content-desc="lock"] | //*[@content-desc="public"])',
      }),
    );
  }

  /**
   * Private message indicator badge visible on messages sent with visibility=Private
   * when viewed by an Operations-role user.
   * Text is the i18n string: "Only my account"
   */
  get privateMessageIndicator() {
    return $(
      getSelector({
        ios: '(//XCUIElementTypeStaticText[@name="Only my account"])[last()]',
        android: '(//android.widget.TextView[@text="Only my account"])[last()]',
      }),
    );
  }

  /**
   * First visible link-preview card in the conversation.
   * @param {string} [linkName] - Optional link name to match. If omitted, returns the first card found.
   */
  getLinkPreviewCard(linkName) {
    if (linkName) {
      return $(
        getSelector({
          ios: `//XCUIElementTypeStaticText[@name="${linkName}"]`,
          android: `//android.widget.TextView[@text="${linkName}"]`,
        }),
      );
    }
    return $(selectors.byResourceId('chat-link-preview-card'));
  }

  /**
   * Find a rendered message element that contains the given text.
   * @param {string} text - Text to search for (the plain-text content after markdown conversion)
   * @returns {WebdriverIO.Element}
   */
  getMessageByContent(text) {
    return $(
      getSelector({
        ios: `//XCUIElementTypeScrollView//XCUIElementTypeStaticText[@name="${text}"]`,
        android: `//android.widget.ScrollView//android.widget.TextView[@text="${text}"]`,
      }),
    );
  }

  // ========== Scroll View ==========

  get messagesScrollView() {
    return $(selectors.scrollView());
  }

  // ========== Wait / State Methods ==========

  /**
   * Wait for the conversation screen to finish loading
   */
  async waitForScreenReady() {
    await this.loadingIndicator.waitForExist({
      timeout: TIMEOUT.SCREEN_READY,
      reverse: true,
    });
    await browser.pause(PAUSE.ANIMATION_SETTLE);
  }

  /**
   * Check if the "Go back" button is visible (i.e. we're on the conversation screen)
   * @returns {Promise<boolean>}
   */
  async isOnConversationPage() {
    try {
      return await this.goBackButton.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Extract and return the displayed chat ID text
   * @returns {Promise<string|null>}
   */
  async getChatId() {
    try {
      const text = await this.chatIdLabel.getText();
      const match = text.match(REGEX.CHAT_ID_EXTRACT);
      return match ? match[1] : text.trim();
    } catch {
      return null;
    }
  }

  /**
   * Navigate back to the chat list
   */
  async goBack() {
    await this.click(this.goBackButton);
    await browser.pause(PAUSE.NAVIGATION);
  }
}

module.exports = new ChatConversationPage();
