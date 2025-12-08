class BasePage {
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
}

module.exports = BasePage;
