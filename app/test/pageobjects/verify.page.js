const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');

class VerifyPage extends BasePage {
    constructor () {
        super();
    }

    get logoImage () {
        return $('//XCUIElementTypeImage');
    }

    get verifyTitle () {
        return $('//*[@name="Verify your identity"]');
    }

    get verificationCodeMessage () {
        return $('//*[contains(@name, "We have sent a verification code to")]');
    }

    // OTP input fields (6 digits)
    get otpInput1 () {
        return $('(//XCUIElementTypeOther[@accessible="true"])[1]');
    }

    get otpInput2 () {
        return $('(//XCUIElementTypeOther[@accessible="true"])[2]');
    }

    get otpInput3 () {
        return $('(//XCUIElementTypeOther[@accessible="true"])[3]');
    }

    get otpInput4 () {
        return $('(//XCUIElementTypeOther[@accessible="true"])[4]');
    }

    get otpInput5 () {
        return $('(//XCUIElementTypeOther[@accessible="true"])[5]');
    }

    get otpInput6 () {
        return $('(//XCUIElementTypeOther[@accessible="true"])[6]');
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
        return $('//*[@name="Verify"]');
    }

    get changeEmailButton () {
        return $('//*[@name="Change email"]');
    }

    get didntGetCodeText () {
        return $('//*[@name="Didn\'t get a code? "]');
    }

    get resendCodeButton () {
        return $('//*[@name="Resend Code"]');
    }

    // Method to enter OTP code
    async enterOTP(otpCode) {
        if (otpCode.length !== 6) {
            throw new Error(`OTP code must be 6 digits, received: ${otpCode}`);
        }

        const digits = otpCode.split('');
        const inputs = this.otpInputs;

        for (let i = 0; i < digits.length; i++) {
            await this.typeText(inputs[i], digits[i]);
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
