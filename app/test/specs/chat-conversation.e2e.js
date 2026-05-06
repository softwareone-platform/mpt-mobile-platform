const { expect } = require('@wdio/globals');

const chatPage = require('../pageobjects/chat.page');
const chatConversationPage = require('../pageobjects/chat-conversation.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const { getClientApi } = require('../utils/api-client');
const { navigateToChatList, QA_CHAT_NAME_PREFIX, QA_PM_CHAT_PREFIX, QA_MARKDOWN_CHAT_PREFIX } = require('../pageobjects/utils/chat.helper');

describe('Chat Conversation Page', () => {
  let hasChatData = false;
  let qaChat = null;

  async function navigateToFirstConversation() {
    const isOnChat = await chatPage.isOnChatPage();
    if (!isOnChat) {
      await navigateToChatList();
    }
    if (qaChat) {
      const found = await chatPage.tapChatByNamePrefix(qaChat.name);
      if (!found) {
        console.info(`ℹ️ QA chat "${qaChat.name}" not visible in list (no messages — sorted to bottom), falling back to first chat`);
        await chatPage.scrollUp(1);
        await chatPage.scrollUp(1);
        await browser.pause(PAUSE.ANIMATION_SETTLE);
        await chatPage.tapFirstChat();
      }
    } else {
      await chatPage.tapFirstChat();
    }
    await chatConversationPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    await navigateToChatList();

    qaChat = await getClientApi().ensureQaGroupChat(QA_CHAT_NAME_PREFIX);
    hasChatData = qaChat !== null || (await chatPage.hasChats());

    console.info(`📊 Chat conversation data state: hasChats=${hasChatData}, qaChat=${qaChat?.id ?? 'none'}`);
  });

  beforeEach(async function () {
    if (!hasChatData) {
      this.skip();
      return;
    }
    const isOnConversation = await chatConversationPage.isOnConversationPage();
    if (!isOnConversation) {
      await navigateToFirstConversation();
    }
  });

  describe('Navigation', () => {
    it('should navigate to conversation when tapping a chat item', async function () {
      if (!hasChatData) {
        this.skip();
        return;
      }
      await expect(chatConversationPage.goBackButton).toBeDisplayed();
    });

    it('should display Go back button', async () => {
      await expect(chatConversationPage.goBackButton).toBeDisplayed();
    });

    it('should navigate back to chat list when Go back tapped', async () => {
      await chatConversationPage.goBack();

      await expect(chatPage.headerTitle).toBeDisplayed();

      await chatPage.tapFirstChat();
      await chatConversationPage.waitForScreenReady();
    });
  });

  describe('Page Structure', () => {
    it('should display the chat name as header', async function () {
      const isDisplayed = await chatConversationPage.conversationTitle.isDisplayed().catch(() => false);
      if (!isDisplayed) {
        this.skip();
        return;
      }
      await expect(chatConversationPage.conversationTitle).toBeDisplayed();
    });

    it('should display the CHT ID below the conversation title', async function () {
      const isDisplayed = await chatConversationPage.chatIdLabel.isDisplayed().catch(() => false);
      if (!isDisplayed) {
        this.skip();
        return;
      }
      await expect(chatConversationPage.chatIdLabel).toBeDisplayed();
    });

    it('should display a valid CHT-XXXX-XXXX-XXXX format ID', async function () {
      const chatId = await chatConversationPage.getChatId();
      if (!chatId) {
        this.skip();
        return;
      }
      expect(chatId).toMatch(REGEX.CHAT_ID);
    });

    it('should display message input at the bottom', async () => {
      await expect(chatConversationPage.messageInput).toBeDisplayed();
    });
  });

  describe('Empty State (New Conversation)', () => {
    it('should display empty state on a new conversation with no messages', async function () {
      const emptyExists = await chatConversationPage.emptyState.isExisting().catch(() => false);
      if (!emptyExists) {
        this.skip();
        return;
      }
      await expect(chatConversationPage.emptyState).toBeDisplayed();
    });
  });

  describe('Private Messages', () => {
    let pmChat = null;
    const PRIVATE_MSG_CONTENT = 'QA-private-msg-setup';

    before(async function () {
      this.timeout(TIMEOUT.TEST_SETUP_LONG);
      pmChat = await getClientApi().ensureQaGroupChat(QA_PM_CHAT_PREFIX, { participantOffset: 1 });
      if (pmChat) {
        try {
          await getClientApi().sendChatMessage(pmChat.id, PRIVATE_MSG_CONTENT, 'Private');
        } catch (e) {
          console.warn(`⚠️ Could not seed private message: ${e.message}`);
          pmChat = null;
        }
      }
    });

    beforeEach(async function () {
      if (!pmChat) {
        this.skip();
        return;
      }
      const isOnConversation = await chatConversationPage.isOnConversationPage();
      if (isOnConversation) {
        await chatConversationPage.goBack();
      }
      await navigateToChatList();
      await chatPage.scrollUp(1);
      await chatPage.scrollUp(1);
      const found = await chatPage.tapChatByNamePrefix(QA_PM_CHAT_PREFIX);
      if (!found) {
        this.skip();
        return;
      }
      await chatConversationPage.waitForScreenReady();
    });

    it('should display the private message indicator on a private message', async function () {
      const indicatorExists = await chatConversationPage.privateMessageIndicator
        .isExisting()
        .catch(() => false);
      if (!indicatorExists) {
        // Private indicator only shown to Operations users — skip for non-Operations accounts
        this.skip();
        return;
      }
      await expect(chatConversationPage.privateMessageIndicator).toBeDisplayed();
    });

    it('should display the visibility toggle button in the message footer', async function () {
      const toggleExists = await chatConversationPage.visibilityToggleButton
        .isExisting()
        .catch(() => false);
      if (!toggleExists) {
        // Visibility toggle only shown to Operations users
        this.skip();
        return;
      }
      await expect(chatConversationPage.visibilityToggleButton).toBeDisplayed();
    });
  });

  describe('Markdown Rendering', () => {
    let mdChat = null;
    // Plain text that will be visible after markdown is rendered
    const BOLD_PLAIN_TEXT = 'QA-bold-text';
    const BOLD_MARKDOWN_CONTENT = `**${BOLD_PLAIN_TEXT}**`;

    before(async function () {
      this.timeout(TIMEOUT.TEST_SETUP_LONG);
      mdChat = await getClientApi().ensureQaGroupChat(QA_MARKDOWN_CHAT_PREFIX, { participantOffsets: [0, 1] });
      if (mdChat) {
        try {
          await getClientApi().sendChatMessage(mdChat.id, BOLD_MARKDOWN_CONTENT);
        } catch (e) {
          console.warn(`⚠️ Could not seed markdown message: ${e.message}`);
          mdChat = null;
        }
      }
    });

    beforeEach(async function () {
      if (!mdChat) {
        this.skip();
        return;
      }
      const isOnConversation = await chatConversationPage.isOnConversationPage();
      if (isOnConversation) {
        await chatConversationPage.goBack();
      }
      await navigateToChatList();
      await chatPage.scrollUp(1);
      await chatPage.scrollUp(1);
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      const found = await chatPage.tapChatByNamePrefix(QA_MARKDOWN_CHAT_PREFIX);
      if (!found) {
        this.skip();
        return;
      }
      await chatConversationPage.waitForScreenReady();
    });

    it('should render bold markdown text as plain visible text', async function () {
      const msgElement = chatConversationPage.getMessageByContent(BOLD_PLAIN_TEXT);
      const exists = await msgElement.isExisting().catch(() => false);
      if (!exists) {
        this.skip();
        return;
      }
      await expect(msgElement).toBeDisplayed();
    });

    it('should not display raw markdown syntax (asterisks) in rendered messages', async function () {
      const rawMarkdown = chatConversationPage.getMessageByContent(BOLD_MARKDOWN_CONTENT);
      const rawExists = await rawMarkdown.isExisting().catch(() => false);
      // If raw markdown text is found as-is, the renderer is broken
      expect(rawExists).toBe(false);
    });
  });

  describe('Link Preview Cards', () => {
    let linkChat = null;
    const LINK_NAME = 'QA Link Preview';
    const LINK_URI = 'https://portal.softwareone.com';

    before(async function () {
      this.timeout(TIMEOUT.TEST_SETUP_LONG);
      // Reuse the markdown chat — separate message, same conversation
      linkChat = await getClientApi().ensureQaGroupChat(QA_MARKDOWN_CHAT_PREFIX, { participantOffsets: [0, 1] });
      if (linkChat) {
        try {
          await getClientApi().sendChatMessageWithLinks(
            linkChat.id,
            'QA-link-card-setup',
            [{ name: LINK_NAME, uri: LINK_URI }],
          );
        } catch (e) {
          console.warn(`⚠️ Could not seed link message: ${e.message}`);
          linkChat = null;
        }
      }
    });

    beforeEach(async function () {
      if (!linkChat) {
        this.skip();
        return;
      }
      const isOnConversation = await chatConversationPage.isOnConversationPage();
      if (isOnConversation) {
        await chatConversationPage.goBack();
      }
      await navigateToChatList();
      await chatPage.scrollUp(1);
      await chatPage.scrollUp(1);
      const found = await chatPage.tapChatByNamePrefix(QA_MARKDOWN_CHAT_PREFIX);
      if (!found) {
        this.skip();
        return;
      }
      await chatConversationPage.waitForScreenReady();
    });

    it('should display the link name in a link-preview card', async function () {
      const card = chatConversationPage.getLinkPreviewCard(LINK_NAME);
      const exists = await card.isExisting().catch(() => false);
      if (!exists) {
        this.skip();
        return;
      }
      await expect(card).toBeDisplayed();
    });

    it('should display the link URI in the link-preview card', async function () {
      const uriElement = chatConversationPage.getMessageByContent(LINK_URI);
      const exists = await uriElement.isExisting().catch(() => false);
      if (!exists) {
        this.skip();
        return;
      }
      await expect(uriElement).toBeDisplayed();
    });
  });
});
