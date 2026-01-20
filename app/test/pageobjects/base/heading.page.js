const { $ } = require('@wdio/globals');

const { selectors } = require('../utils/selectors');

class HeadingPage {
  get logoTitle() {
    return $(selectors.byContainsText('Spotlight'));
  }
}

module.exports = new HeadingPage();
