const { $ } = require('@wdio/globals');


class HeadingPage {
    get logoTitle () {
        return $('//*[contains(@name, "Spotlight")]');
    }
}

module.exports = new HeadingPage();
