const { isAndroid, isIOS } = require('../utils/selectors');

class BasePage {
  constructor() {
    this.platform = isAndroid() ? 'android' : 'ios';
  }

  async click(element) {
    await element.waitForDisplayed();
    await element.click();
  }

  async typeText(element, text, maxRetries = 3) {
    await element.waitForDisplayed();
    
    // Android uses 'text' attribute, iOS uses 'value'
    const textAttribute = this.isAndroid() ? 'text' : 'value';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Clear any existing text first
      await element.clearValue().catch(() => {});
      await browser.pause(100);
      
      // Type the text
      await element.setValue(text);
      await browser.pause(200);
      
      // Verify the text was entered correctly
      const enteredValue = await element.getAttribute(textAttribute);
      if (enteredValue === text) {
        return; // Success
      }
      
      console.warn(`⚠️  Text entry attempt ${attempt}/${maxRetries} failed. Expected: "${text}", Got: "${enteredValue}"`);
      
      if (attempt < maxRetries) {
        // Clear and retry
        await element.clearValue().catch(() => {});
        await browser.pause(300);
      }
    }
    
    // Final attempt - try character by character for iOS
    if (this.isIOS()) {
      console.info('🔄 Attempting character-by-character input...');
      await element.clearValue().catch(() => {});
      await browser.pause(100);
      await element.click();
      await browser.pause(100);
      
      for (const char of text) {
        await element.addValue(char);
        await browser.pause(50);
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
