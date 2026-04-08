const { $ } = require('@wdio/globals');

const { REGEX } = require('../utils/constants');
const { getSelector, selectors } = require('../utils/selectors');

class HeadingPage {
  get logoTitle() {
    return $(selectors.byContainsText('Spotlight'));
  }

  get navAccountButton() {
    return $(
      getSelector({
        ios: '~nav-account-button',
        android: '//*[@resource-id="nav-account-button"]',
      }),
    );
  }

  get navAccountUserId() {
    return $(
      getSelector({
        ios: '~nav-account-user-id',
        android: '//*[@resource-id="nav-account-user-id"]',
      }),
    );
  }

  get backButton() {
    return $(
      getSelector({
        ios: '~Go back',
        android: '//android.widget.Button[@content-desc="Go back"]',
      }),
    );
  }

  async getNavAccountButtonLabel() {
    return this.navAccountButton.getAttribute('label');
  }

  async getNavAccountUserIdFromButtonLabel() {
    const label = String((await this.getNavAccountButtonLabel()) || '').trim();
    const match = label.match(REGEX.USER_ID);

    if (match) {
      return match[0];
    }

    const fallbackText = String(
      (await this.navAccountUserId.getText().catch(() => '')) || '',
    ).trim();
    const fallbackMatch = fallbackText.match(REGEX.USER_ID);
    return fallbackMatch ? fallbackMatch[0] : null;
  }
}

module.exports = new HeadingPage();
