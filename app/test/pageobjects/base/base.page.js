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
   * Perform a swipe gesture with dynamic coordinates
   * @param {string} direction - Swipe direction: 'up', 'down', 'left', 'right'
   * @param {number} percent - Scroll percentage (0.0 to 1.0, default 0.5)
   * @private
   */
  async _performSwipe(direction, percent = SCROLL.DEFAULT_PERCENT) {
    if (this.isAndroid()) {
      const { height, width } = await browser.getWindowRect();
      const scrollTop = Math.floor(height * 0.35); // Start from ~35% down (below header)
      const scrollHeight = Math.floor(height * 0.5); // Scroll area is ~50% of screen

      await browser.execute('mobile: swipeGesture', {
        left: 100,
        top: scrollTop,
        width: width - 200,
        height: scrollHeight,
        direction,
        percent,
      });
    } else {
      // iOS: direction indicates where finger moves, content moves opposite
      const iosDirection = direction
      // const iosDirection = direction === 'up' ? 'down' : direction === 'down' ? 'up' : direction;
      await browser.execute('mobile: swipe', {
        direction: iosDirection,
        velocity: GESTURE.IOS_VELOCITY,
      });
    }
  }

  /**
   * Cross-platform scroll helper - scroll down (reveal content below)
   * @param {number} percent - Scroll percentage (0.0 to 1.0, default 0.5)
   */
  async scrollDown(percent = SCROLL.DEFAULT_PERCENT) {
    await this._performSwipe('up', percent);
  }

  /**
   * Cross-platform scroll helper - scroll up (reveal content above)
   * @param {number} percent - Scroll percentage (0.0 to 1.0, default 0.5)
   */
  async scrollUp(percent = SCROLL.DEFAULT_PERCENT) {
    await this._performSwipe('down', percent);
  }

  /**
   * Cross-platform swipe helper
   * @param {string} direction - 'left', 'right', 'up', or 'down'
   * @param {number} percent - Swipe percentage (0.0 to 1.0, default 0.5)
   */
  async swipe(direction, percent = SCROLL.DEFAULT_PERCENT) {
    await this._performSwipe(direction, percent);
  }
}

module.exports = BasePage;
