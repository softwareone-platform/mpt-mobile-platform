const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const { selectors, getSelector } = require('./utils/selectors');

class VerifyPage extends BasePage {
    constructor () {
        super();
    }

    get logoImage () {
        return $(selectors.image());
    }

    get verifyTitle () {
        return $(selectors.byText('Verify your identity'));
    }

    get verificationCodeMessage () {
        return $(selectors.byContainsText('We have sent a verification code to'));
    }

    // OTP input fields (6 digits)
    // On Android: clickable ViewGroup elements with content-desc
    // On iOS: accessible elements
    get otpInput1 () {
        return $(getSelector({
            ios: '(//XCUIElementTypeOther[@accessible="true"])[1]',
            android: '(//android.view.ViewGroup[@clickable="true" and @content-desc])[3]'
        }));
    }

    get otpInput2 () {
        return $(getSelector({
            ios: '(//XCUIElementTypeOther[@accessible="true"])[2]',
            android: '(//android.view.ViewGroup[@clickable="true" and @content-desc])[4]'
        }));
    }

    get otpInput3 () {
        return $(getSelector({
            ios: '(//XCUIElementTypeOther[@accessible="true"])[3]',
            android: '(//android.view.ViewGroup[@clickable="true" and @content-desc])[5]'
        }));
    }

    get otpInput4 () {
        return $(getSelector({
            ios: '(//XCUIElementTypeOther[@accessible="true"])[4]',
            android: '(//android.view.ViewGroup[@clickable="true" and @content-desc])[6]'
        }));
    }

    get otpInput5 () {
        return $(getSelector({
            ios: '(//XCUIElementTypeOther[@accessible="true"])[5]',
            android: '(//android.view.ViewGroup[@clickable="true" and @content-desc])[7]'
        }));
    }

    get otpInput6 () {
        return $(getSelector({
            ios: '(//XCUIElementTypeOther[@accessible="true"])[6]',
            android: '(//android.view.ViewGroup[@clickable="true" and @content-desc])[8]'
        }));
    }

    // Get all OTP input fields as an array
    get otpInputs () {
        return [
            this.otpInput1,
            this.otpInput2,
            this.otpInput3,
            this.otpInput4,
            this.otpInput5,
            this.otpInput6
        ];
    }

    get verifyButton () {
        return $(selectors.button('Verify'));
    }

    get changeEmailButton () {
        return $(selectors.button('Change email'));
    }

    get didntGetCodeText () {
        return $(selectors.byText("Didn't get a code? "));
    }

    get resendCodeButton () {
        return $(selectors.button('Resend Code'));
    }

    // Method to enter OTP code
    async enterOTP(otpCode) {
        if (otpCode.length !== 6) {
            throw new Error(`OTP code must be 6 digits, received: ${otpCode}`);
        }

        const digits = otpCode.split('');
        const inputs = this.otpInputs;

        for (let i = 0; i < digits.length; i++) {
            const input = inputs[i];
            await input.waitForDisplayed({ timeout: 5000 });
            
            // Click to focus the field first (important for Android ViewGroups)
            await this.click(input);
            
            // Small delay to ensure field is focused
            await browser.pause(200);
            
            // Type the digit
            await browser.keys(digits[i]);
            
            // Small delay before moving to next field
            await browser.pause(200);
        }
    }

    // Method to clear all OTP inputs
    async clearOTP() {
        const inputs = this.otpInputs;
        for (const input of inputs) {
            await this.clearText(input);
        }
    }

    // Method to get the entered OTP value
    async getEnteredOTP() {
        const inputs = this.otpInputs;
        let otp = '';
        
        for (const input of inputs) {
            const value = await input.getAttribute('value') || await input.getAttribute('name') || '';
            otp += value;
        }
        
        return otp;
    }
}

module.exports = new VerifyPage();
