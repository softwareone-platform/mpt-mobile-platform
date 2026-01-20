const { isAndroid, isIOS } = require('../utils/selectors');

class BasePage {
  constructor() {
    this.platform = isAndroid() ? 'android' : 'ios';
  }

  async click(element) {
    await element.waitForDisplayed();
    await element.click();
  }

  async typeText(element, text) {
    await element.waitForDisplayed();
    await element.setValue(text);
  }

  async clearText(element) {
    await element.waitForDisplayed();
    await element.clearValue();
  }

  async getText(element) {
    await element.waitForDisplayed();
    return await element.getText();
  }

  /**
   * Platform detection helpers
   */
  isAndroid() {
    return isAndroid();
  }

  isIOS() {
    return isIOS();
  }

  /**
   * Cross-platform scroll helper - scroll down
   */
  async scrollDown() {
    if (this.isAndroid()) {
      await browser.execute('mobile: scrollGesture', {
        left: 100,
        top: 500,
        width: 200,
        height: 500,
        direction: 'down',
        percent: 0.75,
      });
    } else {
      await browser.execute('mobile: scroll', { direction: 'down' });
    }
  }

  /**
   * Cross-platform scroll helper - scroll up
   */
  async scrollUp() {
    if (this.isAndroid()) {
      await browser.execute('mobile: scrollGesture', {
        left: 100,
        top: 500,
        width: 200,
        height: 500,
        direction: 'up',
        percent: 0.75,
      });
    } else {
      await browser.execute('mobile: scroll', { direction: 'up' });
    }
  }

  /**
   * Cross-platform swipe helper
   * @param {string} direction - 'left', 'right', 'up', or 'down'
   */
  async swipe(direction) {
    if (this.isAndroid()) {
      await browser.execute('mobile: swipeGesture', {
        left: 100,
        top: 500,
        width: 200,
        height: 500,
        direction: direction,
        percent: 0.75,
      });
    } else {
      await browser.execute('mobile: swipe', { direction: direction });
    }
  }
}

module.exports = BasePage;
