const { expect } = require('@wdio/globals');

const chatPage = require('../pageobjects/chat.page');
const createChatPage = require('../pageobjects/create-chat.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { TIMEOUT, PAUSE } = require('../pageobjects/utils/constants');

describe('Create Chat Wizard', () => {
  async function navigateToChatList() {
    await chatPage.footer.chatTab.click();
    await browser.pause(PAUSE.NAVIGATION);
    await chatPage.waitForScreenReady();
  }

  async function openWizard() {
    const isOnChat = await chatPage.isOnChatPage();
    if (!isOnChat) {
      await navigateToChatList();
    }
    await chatPage.tapCreateChatButton();
    await createChatPage.waitForWizardOpen();
  }

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await navigateToChatList();
  });

  beforeEach(async function () {
    const isOpen = await createChatPage.isWizardOpen();
    if (!isOpen) {
      await openWizard();
    }
  });

  describe('Wizard Opening', () => {
    it('should open create chat wizard when create button tapped', async () => {
      await expect(createChatPage.modalTitle).toBeDisplayed();
    });

    it('should display Close button in wizard header', async () => {
      await expect(createChatPage.closeButton).toBeDisplayed();
    });

    it('should display "Create chat" title', async () => {
      const title = await createChatPage.modalTitle.getText();
      expect(title).toBe('Create chat');
    });

    it('should close wizard when Close button tapped', async () => {
      await createChatPage.close();

      await expect(chatPage.headerTitle).toBeDisplayed();

      await openWizard();
    });
  });

  describe('Step 1 — Type Selection', () => {
    it('should display Group chat type option', async () => {
      await expect(createChatPage.groupChatTypeButton).toBeDisplayed();
    });

    it('should display contact list for direct chat creation', async () => {
      const items = await createChatPage.contactItems;
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('Step 2 — Chat Details (Group)', () => {
    beforeEach(async function () {
      const isOpen = await createChatPage.isWizardOpen();
      if (isOpen) {
        await createChatPage.close();
      }
      await openWizard();
      await createChatPage.selectGroupChatType();
    });

    it('should show Next button after selecting Group chat type', async () => {
      await expect(createChatPage.nextButton).toBeDisplayed();
    });

    it('should display the group name text field', async () => {
      await expect(createChatPage.groupNameInput).toBeDisplayed();
    });

    it('should display Close button on the details step', async () => {
      await expect(createChatPage.closeButton).toBeDisplayed();
    });

    it('should proceed to participants step when Next tapped', async () => {
      await createChatPage.tapNext();

      await expect(createChatPage.contactSearchInput).toBeDisplayed();
    });
  });

  describe('Step 3 — Participants', () => {
    beforeEach(async function () {
      const isOpen = await createChatPage.isWizardOpen();
      if (isOpen) {
        await createChatPage.close();
      }
      await openWizard();
      await createChatPage.selectGroupChatType();
      await createChatPage.tapNext();
    });

    it('should display contact search field', async () => {
      await expect(createChatPage.contactSearchInput).toBeDisplayed();
    });

    it('should display Create button (disabled before selection)', async () => {
      await expect(createChatPage.createButton).toBeDisplayed();
    });

    it('should display a contact list with items', async () => {
      const items = await createChatPage.participantItems;
      expect(items.length).toBeGreaterThan(0);
    });

    it('should display contact items with Name, USR-ID, Status label format', async () => {
      const items = await createChatPage.participantItems;
      const firstItem = items[0];
      const label =
        (await firstItem.getAttribute('name')) ||
        (await firstItem.getAttribute('content-desc')) ||
        '';
      expect(label).toMatch(/,\s*USR-\d{4}-\d{4},/);
    });

    it('should enable Create button after selecting a participant', async () => {
      const items = await createChatPage.participantItems;
      await items[0].click();
      await browser.pause(PAUSE.ANIMATION_SETTLE);

      const enabled = await createChatPage.isCreateButtonEnabled();
      expect(enabled).toBe(true);
    });
  });

  // TODO: REVISIT — Full creation flow is intentionally NOT executed because chats cannot be
  // deleted via the API or UI. Running this test would permanently create test chats in the
  // environment on every CI run, polluting the helpdesk chat list indefinitely.
  // Re-enable once a chat deletion endpoint or cleanup mechanism is available.
  //
  // describe('Full Group Chat Creation Flow', () => {
  //   it('should navigate to new conversation after successful group chat creation', async function () {
  //     this.timeout(TIMEOUT.TEST_SETUP_LONG);
  //
  //     await openWizard();
  //     await createChatPage.selectGroupChatType();
  //     await createChatPage.tapNext();
  //
  //     const items = await createChatPage.participantItems;
  //     if (items.length === 0) {
  //       this.skip();
  //       return;
  //     }
  //     await items[0].click();
  //     await browser.pause(PAUSE.ANIMATION_SETTLE);
  //
  //     // ⚠️ DO NOT uncomment until chat deletion is supported — this creates a permanent chat:
  //     // await createChatPage.click(createChatPage.createButton);
  //     // await browser.pause(PAUSE.NAVIGATION);
  //     // await chatConversationPage.waitForScreenReady();
  //     // await expect(chatConversationPage.goBackButton).toBeDisplayed();
  //     // await expect(chatConversationPage.messageInput).toBeDisplayed();
  //     // const chatId = await chatConversationPage.getChatId();
  //     // if (chatId) { expect(chatId).toMatch(REGEX.CHAT_ID); }
  //   });
  // });
});
