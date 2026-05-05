const { $, $$ } = require('@wdio/globals');

const BasePage = require('./base/base.page');
const { selectors, getSelector } = require('./utils/selectors');
const { PAUSE, TIMEOUT } = require('./utils/constants');

/**
 * Create Chat Wizard Page - Multi-step bottom-sheet modal for creating chats
 *
 * Opened by tapping the `create-chat-button` on the Chat list screen.
 *
 * Step flow for Group chat:
 *   1. Type selection (ChatTypeStep)  — tap chat-types-groupChat
 *   2. Chat details (ChatDetailsStep) — enter optional group name, tap Next
 *   3. Participants (ChatUsersStep)   — search contacts, select participants, tap Create
 *
 * For Direct chat:
 *   1. Type selection (ChatTypeStep)  — tap a contact item directly
 */
class CreateChatPage extends BasePage {
  // ========== Wizard Header (all steps) ==========

  /**
   * "Create chat" title text visible at the top of all wizard steps
   */
  get modalTitle() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Create chat"]',
        android: '//android.widget.TextView[@text="Create chat"]',
      }),
    );
  }

  get closeButton() {
    return $(
      getSelector({
        ios: '//*[@name="Close" and @visible="true"]',
        android: '//*[@content-desc="Close" and @displayed="true"]',
      }),
    );
  }

  // ========== Step 1: Type Selection ==========

  /**
   * "Group" chat type button (only available chat type)
   * testID: chat-types-groupChat
   */
  get groupChatTypeButton() {
    return $(selectors.byResourceId('chat-types-groupChat'));
  }

  /**
   * All contact items in the direct chat contact list
   * Label format: "Name, USR-XXXX-XXXX, Status"
   */
  get contactItems() {
    return $$(
      getSelector({
        ios: '//XCUIElementTypeScrollView//XCUIElementTypeOther[@accessible="true"]',
        android: '//android.widget.ScrollView//*[@clickable="true" and @class="android.view.ViewGroup"]',
      }),
    );
  }

  // ========== Step 2: Chat Details (Group Name) ==========

  /**
   * Group name text field with placeholder "Enter a group name (optional)"
   */
  get groupNameInput() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeTextField[@placeholderValue="Enter a group name (optional)"]',
        android: '//android.widget.EditText[@hint="Enter a group name (optional)"]',
      }),
    );
  }

  get nextButton() {
    return $(
      getSelector({
        ios: '//*[@name="Next" and @visible="true"]',
        android: '//*[@content-desc="Next" and @displayed="true"]',
      }),
    );
  }

  // ========== Step 3: Participants (Contact Search) ==========

  /**
   * Contact search text field
   * testID: create-chat-contact-search
   */
  get contactSearchInput() {
    return $(selectors.byResourceId('create-chat-contact-search'));
  }

  /**
   * "Create" button — enabled once at least one participant is selected
   */
  get createButton() {
    return $(
      getSelector({
        ios: '//*[@name="Create" and @visible="true"]',
        android: '//*[@content-desc="Create" and @displayed="true"]',
      }),
    );
  }

  /**
   * All contact items in the participants step (same format as type selection)
   * Label format: "Name, USR-XXXX-XXXX, Status"
   */
  get participantItems() {
    return $$(
      getSelector({
        ios: '//XCUIElementTypeScrollView//XCUIElementTypeOther[@accessible="true"]',
        android: '//android.widget.ScrollView//*[@clickable="true" and @class="android.view.ViewGroup"]',
      }),
    );
  }

  // ========== State Methods ==========

  /**
   * Check if the wizard is open (modal title visible)
   * @returns {Promise<boolean>}
   */
  async isWizardOpen() {
    try {
      return await this.modalTitle.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Check if the "Create" button is enabled
   * @returns {Promise<boolean>}
   */
  async isCreateButtonEnabled() {
    try {
      const enabled = await this.createButton.getAttribute('enabled');
      return enabled === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Close the wizard by tapping the Close button
   */
  async close() {
    await this.click(this.closeButton);
    await browser.pause(PAUSE.ANIMATION_SETTLE);
  }

  /**
   * Tap the Group chat type button to start a group chat creation flow
   */
  async selectGroupChatType() {
    await this.click(this.groupChatTypeButton);
    await browser.pause(PAUSE.ANIMATION_SETTLE);
  }

  /**
   * Tap Next to proceed from the Chat Details step to the Participants step
   */
  async tapNext() {
    await this.click(this.nextButton);
    await browser.pause(PAUSE.ANIMATION_SETTLE);
  }

  /**
   * Wait for the wizard modal to appear
   */
  async waitForWizardOpen() {
    await this.modalTitle.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });
  }
}

module.exports = new CreateChatPage();
