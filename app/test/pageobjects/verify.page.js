const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const { selectors } = require('./utils/selectors');

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
    get otpInput1 () {
        return $(selectors.accessibleByIndex(1));
    }

    get otpInput2 () {
        return $(selectors.accessibleByIndex(2));
    }

    get otpInput3 () {
        return $(selectors.accessibleByIndex(3));
    }

    get otpInput4 () {
        return $(selectors.accessibleByIndex(4));
    }

    get otpInput5 () {
        return $(selectors.accessibleByIndex(5));
    }

    get otpInput6 () {
        return $(selectors.accessibleByIndex(6));
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
