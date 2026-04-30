const { $, expect } = require('@wdio/globals');

const chatPage = require('../pageobjects/chat.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient, getClientApi } = require('../utils/api-client');
const { isAndroid, selectors } = require('../pageobjects/utils/selectors');
const { TIMEOUT, PAUSE } = require('../pageobjects/utils/constants');
const { TEST_ENV_LABEL } = require('../utils/env');

const QA_CHAT_NAME_PREFIX = `MPT-QA-${TEST_ENV_LABEL}`;

describe('Chat Page', () => {
  let hasChatsData = false;
  let hasEmptyState = false;
  let apiAvailable = false;
  let qaChat = null;

  async function navigateToChat() {
    await chatPage.footer.chatTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    await chatPage.waitForScreenReady();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });

    qaChat = await getClientApi().ensureQaGroupChat(QA_CHAT_NAME_PREFIX);

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
});
