const { isAndroid, isIOS } = require('../utils/selectors');
const { PAUSE, SCROLL, GESTURE, RETRY } = require('../utils/constants');

class BasePage {
  constructor() {
    this.platform = isAndroid() ? 'android' : 'ios';
  }

  async click(element) {
    await element.waitForDisplayed();
    await element.click();
  }

  async typeText(element, text, maxRetries = RETRY.TEXT_ENTRY_MAX) {
    await element.waitForDisplayed();
    
    // Android uses 'text' attribute, iOS uses 'value'
    const textAttribute = this.isAndroid() ? 'text' : 'value';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Clear any existing text first
      await element.clearValue().catch(() => {});
      await browser.pause(PAUSE.RETRY_DELAY);
      
      // Type the text
      await element.setValue(text);
      await browser.pause(PAUSE.TEXT_ENTRY);
      
      // Verify the text was entered correctly
      const enteredValue = await element.getAttribute(textAttribute);
      if (enteredValue === text) {
        return; // Success
      }
      
      console.warn(`⚠️  Text entry attempt ${attempt}/${maxRetries} failed. Expected: "${text}", Got: "${enteredValue}"`);
      
      if (attempt < maxRetries) {
        // Clear and retry
        await element.clearValue().catch(() => {});
        await browser.pause(PAUSE.ANIMATION_SETTLE);
      }
    }
    
    // Final attempt - try character by character for iOS
    if (this.isIOS()) {
      console.info('🔄 Attempting character-by-character input...');
      await element.clearValue().catch(() => {});
      await browser.pause(PAUSE.RETRY_DELAY);
      await element.click();
      await browser.pause(PAUSE.RETRY_DELAY);
      
      for (const char of text) {
        await element.addValue(char);
        await browser.pause(PAUSE.CHARACTER_INPUT);
      }
    }
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
        left: GESTURE.SWIPE_LEFT,
        top: GESTURE.BASE_SCROLL_TOP,
        width: GESTURE.BASE_SCROLL_WIDTH,
        height: GESTURE.BASE_SCROLL_HEIGHT,
        direction: 'down',
        percent: SCROLL.PAGINATION_PERCENT,
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
        left: GESTURE.SWIPE_LEFT,
        top: GESTURE.BASE_SCROLL_TOP,
        width: GESTURE.BASE_SCROLL_WIDTH,
        height: GESTURE.BASE_SCROLL_HEIGHT,
        direction: 'up',
        percent: SCROLL.PAGINATION_PERCENT,
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
        left: GESTURE.SWIPE_LEFT,
        top: GESTURE.BASE_SCROLL_TOP,
        width: GESTURE.BASE_SCROLL_WIDTH,
        height: GESTURE.BASE_SCROLL_HEIGHT,
        direction: direction,
        percent: SCROLL.PAGINATION_PERCENT,
      });
    } else {
      await browser.execute('mobile: swipe', { direction: direction });
    }
  }
}

module.exports = BasePage;
