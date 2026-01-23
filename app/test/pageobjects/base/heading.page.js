const { $ } = require('@wdio/globals');

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

  get backButton() {
    return $(
      getSelector({
        ios: '~Go back',
        android: '//android.widget.Button[@content-desc="Go back"]',
      }),
    );
  }
}

module.exports = new HeadingPage();
