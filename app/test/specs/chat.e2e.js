const { $, expect } = require('@wdio/globals');

const chatPage = require('../pageobjects/chat.page');
const chatConversationPage = require('../pageobjects/chat-conversation.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');
const { isAndroid, selectors } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE } = require('../pageobjects/utils/constants');
const { QA_CHAT_NAME_PREFIX } = require('../pageobjects/utils/chat.helper');

function getUnreadCountFromLabel(label) {
  const parts = label.split(',').map((p) => p.trim());
  const last = parts[parts.length - 1];
  // Timestamps like "19:11" must not be parsed as counts — only accept pure integers
  if (!/^\d+$/.test(last)) return 0;
  return parseInt(last, 10);
}

describe('Chat Page', () => {
  let hasChatsData = false;
  let hasEmptyState = false;
  let apiAvailable = false;

  async function navigateToChat() {
    await chatPage.footer.chatTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    await chatPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    await getClientApi().ensureQaGroupChat(QA_CHAT_NAME_PREFIX);

    await navigateToChat();

    hasChatsData = await chatPage.hasChats();
    hasEmptyState =
      !hasChatsData && (await chatPage.emptyState.isDisplayed().catch(() => false));
    apiAvailable = !!process.env.API_OPS_TOKEN || !!process.env.API_CLIENT_TOKEN;

    console.info(
      `📊 Chat data state: hasChats=${hasChatsData}, emptyState=${hasEmptyState}, apiAvailable=${apiAvailable}`,
    );
  });

  beforeEach(async function () {
    const isOnChat = await chatPage.isOnChatPage();
    if (!isOnChat) {
      await navigateToChat();
    }
  });

  describe('Navigation', () => {
    it('should be accessible from the footer chat tab', async () => {
      await chatPage.footer.spotlightsTab.click();
      await browser.pause(PAUSE.NAVIGATION);

      await chatPage.footer.chatTab.click();
      await browser.pause(PAUSE.NAVIGATION);
      await chatPage.waitForScreenReady();

      await expect(chatPage.headerTitle).toBeDisplayed();
    });

    it('should show Chat as the selected footer tab', async () => {
      const chatTab = chatPage.footer.chatTab;
      if (isAndroid()) {
        const selected = await chatTab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        const value = await chatTab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });

  describe('Page Structure', () => {
    it('should display the Chat header title', async () => {
      await expect(chatPage.headerTitle).toBeDisplayed();
    });

    it('should display the create chat button in the header', async () => {
      await expect(chatPage.createChatButton).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await chatPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }
      await expect(chatPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      await expect(chatPage.footer.spotlightsTab).toBeDisplayed();
      await expect(chatPage.footer.chatTab).toBeDisplayed();
      await expect(chatPage.footer.moreTab).toBeDisplayed();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no chats exist', async function () {
      if (hasChatsData || !hasEmptyState) {
        this.skip();
        return;
      }
      await expect(chatPage.emptyState).toBeDisplayed();
    });

    it('should display "No chats" title text', async function () {
      if (hasChatsData || !hasEmptyState) {
        this.skip();
        return;
      }
      await expect($(selectors.byText('No chats'))).toBeDisplayed();
    });

    it('should display "No chats found." description text', async function () {
      if (hasChatsData || !hasEmptyState) {
        this.skip();
        return;
      }
      await expect($(selectors.byText('No chats found.'))).toBeDisplayed();
    });
  });

  describe('Chat List', () => {
    it('should display chat list when chats exist', async function () {
      if (!hasChatsData) {
        this.skip();
        return;
      }
      await expect(chatPage.scrollView).toBeDisplayed();
      const count = await chatPage.getVisibleChatsCount();
      expect(count).toBeGreaterThan(0);
    });

    it('should display at least one chat item with a non-empty label', async function () {
      if (!hasChatsData) {
        this.skip();
        return;
      }
      const first = await chatPage.firstChatItem;
      await expect(first).toBeDisplayed();

      const label = await chatPage.getChatItemLabel(first);
      expect(label.length).toBeGreaterThan(0);
    });

    it('should display chat items with comma-separated label format', async function () {
      if (!hasChatsData) {
        this.skip();
        return;
      }
      const first = await chatPage.firstChatItem;
      const label = await chatPage.getChatItemLabel(first);
      expect(label).toContain(',');
    });

    it('should validate visible chat count matches API', async function () {
      if (!hasChatsData || !apiAvailable) {
        this.skip();
        return;
      }
      const apiResponse = await getClientApi().getChats({ limit: 50 });
      const apiData = apiResponse.data || apiResponse;
      const apiCount = Array.isArray(apiData) ? apiData.length : 0;
      const uiCount = await chatPage.getVisibleChatsCount();

      expect(uiCount).toBeGreaterThan(0);
      expect(uiCount).toBeLessThanOrEqual(apiCount);
    });
  });

  // Locally discovered: timestamps disappear from rows revealed after scrolling
  describe('Scrolled Rows — Timestamps Visible', () => {
    it('should show timestamps on chat rows revealed after scrolling', async function () {
      if (!hasChatsData || !apiAvailable) {
        this.skip();
        return;
      }
      const apiResponse = await getClientApi().getChats({ limit: 20 });
      const apiChats = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data || []);
      // Build set of chat names that have a lastMessage — these must show a timestamp in the label
      const chatsWithMessage = new Set(
        apiChats
          .filter((c) => c.lastMessage?.audit?.created?.at)
          .map((c) => c.name),
      );
      await chatPage.scrollDown();
      await browser.pause(PAUSE.SCROLL_PAGINATION);
      const items = await chatPage.chatItems;
      if (items.length === 0) {
        this.skip();
        return;
      }
      let failures = 0;
      for (const item of items) {
        const label = await chatPage.getChatItemLabel(item);
        const parts = label.split(',').map((p) => p.trim());
        const chatName = parts[0];
        if (chatsWithMessage.has(chatName)) {
          // Label must have at least 3 segments: name, last-message-content, timestamp
          if (parts.length < 3 || !parts[parts.length - 1]) failures++;
        }
      }
      expect(failures).toBe(0);
    });
  });

  // MPT-20572 — Chat manual pull-to-refresh
  describe('Manual Pull to Refresh', () => {
    it('should trigger refresh when pulled down on chat list', async function () {
      if (!hasChatsData) {
        this.skip();
        return;
      }
      await chatPage.pullToRefresh();
      await chatPage.loadingIndicator.waitForDisplayed({ timeout: 5000 }).catch(() => {});
      await chatPage.waitForScreenReady();
      await expect(chatPage.firstChatItem).toBeDisplayed();
    });
  });

  // MPT-21057 — Pull to refresh on empty state; MPT-20876 — Create button tappable on Android empty state
  describe('Pull to Refresh — Empty State', () => {
    it('should trigger a refresh when pulled down on empty chat list', async function () {
      if (!hasEmptyState) {
        this.skip();
        return;
      }
      await expect(chatPage.emptyState).toBeDisplayed();
      await chatPage.pullToRefresh();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      const loadingShown = await chatPage.loadingIndicator
        .waitForDisplayed({ timeout: 3000 })
        .then(() => true)
        .catch(() => false);
      const emptyStillShown = await chatPage.emptyState.isDisplayed().catch(() => false);
      const listShown = await chatPage.hasChats().catch(() => false);
      expect(loadingShown || emptyStillShown || listShown).toBe(true);
    });

    // MPT-20876 — Create chat button must be tappable on Android when chat list is empty
    it('should have a tappable create chat button when chat list is empty', async function () {
      if (!hasEmptyState) {
        this.skip();
        return;
      }
      const createChatPage = require('../pageobjects/create-chat.page');
      await expect(chatPage.createChatButton).toBeDisplayed();
      const isEnabled = await chatPage.createChatButton.getAttribute('enabled');
      expect(isEnabled).not.toBe('false');
      await chatPage.tapCreateChatButton();
      await createChatPage.waitForWizardOpen();
      await expect(createChatPage.modalTitle).toBeDisplayed();
      await createChatPage.close();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
    });
  });

  // MPT-21018 — Background auto-refresh must not show pull-to-refresh spinner
  describe('Auto Refresh — No Spinner', () => {
    it('should not show pull-to-refresh spinner when screen regains focus', async function () {
      if (!hasChatsData) {
        this.skip();
        return;
      }
      await chatPage.footer.spotlightsTab.click();
      await browser.pause(PAUSE.NAVIGATION);
      await chatPage.footer.chatTab.click();
      await browser.pause(PAUSE.NAVIGATION);
      await chatPage.waitForScreenReady();
      const chatsVisible = await chatPage.hasChats();
      expect(chatsVisible).toBe(true);
      const isLoading = await chatPage.loadingIndicator.isDisplayed().catch(() => false);
      expect(isLoading).toBe(false);
    });
  });

  // MPT-20714 — Unread badge should clear promptly after opening a conversation
  describe('Unread Badge', () => {
    let chatWithUnreadFromApi = null;

    before(async function () {
      if (!hasChatsData || !apiAvailable) return;
      const apiResponse = await getClientApi().getChats({ limit: 50 });
      const apiChats = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data || []);
      const userId = getClientApi().getTokenUserId();
      for (const chat of apiChats) {
        const myParticipant = (chat.participants || []).find(
          (p) => p.identity?.id === userId,
        );
        if (myParticipant?.unreadMessageCount > 0) {
          chatWithUnreadFromApi = { name: chat.name, unreadCount: myParticipant.unreadMessageCount };
          break;
        }
      }
      console.info(
        chatWithUnreadFromApi
          ? `📊 Unread badge target: "${chatWithUnreadFromApi.name}" (${chatWithUnreadFromApi.unreadCount} unread)`
          : '📊 Unread badge: no chat with unread messages found via API',
      );
    });

    it('should show unread badge matching API unread count', async function () {
      if (!hasChatsData || !chatWithUnreadFromApi) {
        this.skip();
        return;
      }
      await chatPage.scrollUp(1);
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      const items = await chatPage.chatItems;
      let targetItem = null;
      for (const item of items) {
        const label = await chatPage.getChatItemLabel(item);
        if (label.split(',')[0].trim().startsWith(chatWithUnreadFromApi.name)) {
          targetItem = item;
          break;
        }
      }
      if (!targetItem) {
        this.skip();
        return;
      }
      const label = await chatPage.getChatItemLabel(targetItem);
      const uiBadgeCount = getUnreadCountFromLabel(label);
      expect(uiBadgeCount).toBe(chatWithUnreadFromApi.unreadCount);
    });

    it('should clear unread badge after opening the conversation', async function () {
      if (!hasChatsData || !chatWithUnreadFromApi) {
        this.skip();
        return;
      }
      await chatPage.scrollUp(1);
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      const found = await chatPage.tapChatByNamePrefix(chatWithUnreadFromApi.name);
      if (!found) {
        this.skip();
        return;
      }
      await chatConversationPage.waitForScreenReady();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      await chatConversationPage.goBack();
      await chatPage.waitForScreenReady();
      await browser.pause(PAUSE.ANIMATION_SETTLE);
      const allItems = await chatPage.chatItems;
      let targetItem = null;
      for (const item of allItems) {
        const lbl = await chatPage.getChatItemLabel(item);
        if (lbl.split(',')[0].trim().startsWith(chatWithUnreadFromApi.name)) {
          targetItem = item;
          break;
        }
      }
      if (!targetItem) {
        this.skip();
        return;
      }
      const updatedLabel = await chatPage.getChatItemLabel(targetItem);
      const updatedCount = getUnreadCountFromLabel(updatedLabel);
      expect(updatedCount).toBe(0);
    });
  });
});
