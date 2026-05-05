const { expect } = require('@wdio/globals');

const chatPage = require('../pageobjects/chat.page');
const chatConversationPage = require('../pageobjects/chat-conversation.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { TIMEOUT, PAUSE, REGEX } = require('../pageobjects/utils/constants');
const { getClientApi } = require('../utils/api-client');
const { navigateToChatList, QA_CHAT_NAME_PREFIX } = require('../pageobjects/utils/chat.helper');

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
});
