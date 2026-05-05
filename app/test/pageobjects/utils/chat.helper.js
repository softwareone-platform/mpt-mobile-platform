const chatPage = require('../chat.page');
const { TEST_ENV_LABEL } = require('../../utils/env');
const { PAUSE } = require('./constants');

const QA_CHAT_NAME_PREFIX = `MPT-QA-${TEST_ENV_LABEL}`;

/**
 * Navigate to the Chat list screen via the footer tab.
 */
async function navigateToChatList() {
  await chatPage.footer.chatTab.click();
  await browser.pause(PAUSE.NAVIGATION);
  await chatPage.waitForScreenReady();
}

module.exports = { navigateToChatList, QA_CHAT_NAME_PREFIX };
