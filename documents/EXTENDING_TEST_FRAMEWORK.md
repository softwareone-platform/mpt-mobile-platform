# Extending the Appium Test Framework

This guide explains how to extend the Appium test framework with new page objects, test files, and testing strategies for different app states and user flows.

> 📖 **See also:** 
> - [iOS Testing Guide](./APPIUM_IOS_TESTING.md) - Complete iOS setup, workflow strategies, and troubleshooting
> - [Android Testing Guide](./APPIUM_ANDROID_TESTING.md) - Complete Android setup for macOS/Linux
> - [Test Element Identification Strategy](./TEST_ELEMENT_IDENTIFICATION_STRATEGY.md) - TestID strategy for cross-platform testing

## Configuration Overview

> 📚 **Official Docs:** [WebDriverIO Configuration](https://webdriver.io/docs/configuration/) | [Appium Capabilities](https://appium.io/docs/en/writing-running-appium/caps/)

Before creating tests, ensure your `wdio.conf.js` and environment are properly configured. The framework supports both iOS and Android platforms with automatic capability selection.

### Key Configuration Settings

**In `wdio.conf.js`:**
```javascript
// Platform detection (case-insensitive, defaults to iOS)
const isAndroid = () => (process.env.PLATFORM_NAME || 'iOS').toLowerCase() === 'android';

// iOS capabilities
const iosCapabilities = {
    'appium:bundleId': process.env.APP_BUNDLE_ID || 'com.softwareone.marketplaceMobile',
    'appium:deviceName': process.env.DEVICE_NAME || 'iPhone 16',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '26.0',
    'appium:udid': process.env.DEVICE_UDID,
};

// Android capabilities
const androidCapabilities = {
    'appium:appPackage': process.env.APP_PACKAGE || 'com.softwareone.marketplaceMobile',
    'appium:appActivity': process.env.APP_ACTIVITY || '.MainActivity',
    'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '14.0',
    'appium:automationName': 'UiAutomator2',
    'appium:udid': process.env.DEVICE_UDID,
};

// Select capabilities based on platform
capabilities: [isAndroid() ? androidCapabilities : iosCapabilities]
```

> ⚠️ **Important:** Always use case-insensitive checks for `PLATFORM_NAME`. The framework normalizes to lowercase (e.g., `'android'`, `'ios'`) to avoid casing bugs. Use the `isAndroid()` and `isIOS()` helper functions from `selectors.js` in tests and page objects.

**Required Environment Variables by Platform:**

**iOS:**
- `PLATFORM_NAME`: Set to `iOS` or `ios` (case-insensitive, or omit for default)
- `APP_BUNDLE_ID`: iOS app bundle identifier (default: `com.softwareone.marketplaceMobile`)
- `DEVICE_NAME`: Target iOS simulator name (default: `iPhone 16`)
- `PLATFORM_VERSION`: iOS version (default: `26.0` for iOS 18.0)
- `DEVICE_UDID`: Simulator UUID (auto-detected by test script)

**Android:**
- `PLATFORM_NAME`: Set to `Android` or `android` (case-insensitive)
- `APP_PACKAGE`: Android package name (default: `com.softwareone.marketplaceMobile`)
- `APP_ACTIVITY`: Main activity (default: `.MainActivity`)
- `DEVICE_NAME`: Emulator or device name (default: `Android Emulator`)
- `PLATFORM_VERSION`: Android version (default: `14.0`)
- `DEVICE_UDID`: Device serial (auto-detected by test script)

**Common:**
- `APPIUM_HOST`: Appium server host (default: `127.0.0.1`)
- `APPIUM_PORT`: Appium server port (default: `4723`)

The framework automatically selects the correct capabilities based on `PLATFORM_NAME`.

## Build and Deployment Scripts

> 📚 **Official Docs:** [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) | [React Native iOS Guide](https://reactnative.dev/docs/running-on-device) | [React Native Android Guide](https://reactnative.dev/docs/running-on-device-android)

### iOS Release Build for Testing
Use the testing script for production-like builds:
```bash
./scripts/run-local-test.sh --platform ios --build --client-id YOUR_AUTH0_CLIENT_ID welcome
```
- Builds **Release** configuration
- Optimized for performance testing  
- **Requires `--client-id`** for Auth0 configuration
- Suitable for comprehensive test suites

### iOS Development Build and Deployment
Use the deployment script for complete development cycles:
```bash
# With client ID (creates/updates .env file)
./scripts/deploy-ios.sh --client-id YOUR_AUTH0_CLIENT_ID

# Or with existing .env file containing AUTH0_CLIENT_ID
./scripts/deploy-ios.sh
```
This script performs a complete deployment cycle:
1. Configures Auth0 test environment
2. Uninstalls existing app from simulator
3. Cleans React Native build cache
4. Builds fresh React Native app with Expo
5. Deploys to iOS simulator
6. Launches the app

**iOS Deploy Script Options:**
- `--client-id`: Auth0 client ID (required if `.env` not configured)
- `--release`: Build in release mode (default: debug)
- `--simulator`: Specify simulator name
- `--logs`: Show app logs after launch
- `--verbose`: Show detailed output

### Android Build and Deployment
Use the deployment script for Android:
```bash
# With client ID
./scripts/deploy-android.sh --env dev --client-id YOUR_AUTH0_CLIENT_ID

# With existing .env file
./scripts/deploy-android.sh --env dev
```
This script performs a complete Android deployment:
1. Validates environment (Android SDK, JDK)
2. Checks for running emulator or connected device
3. Configures Auth0 environment
4. Uninstalls existing app
5. Builds Android app with Expo
6. Installs on emulator/device
7. Launches the app

**Android Deploy Script Options:**
- `--env`: Environment (dev, test, prod) - required
- `--client-id`: Auth0 client ID (required if `.env` not configured)
- `--emulator`: Specify emulator name to auto-start
- `--verbose`: Show detailed output

> **Note:** Both deploy scripts can use an existing `.env` file with `AUTH0_CLIENT_ID` configured, making the `--client-id` parameter optional when the environment is already set up.

### Fast Iteration Testing
For repeated test runs without rebuilding:

**iOS:**
```bash
./scripts/run-local-test.sh --platform ios --skip-build welcome
```

**Android:**
```bash
./scripts/run-local-test.sh --platform android --skip-build welcome
```
- Reuses last built app (~10 seconds vs 6-8 minutes)
- Ideal for test development and debugging

## Test States and Authentication Flow

> 📚 **Official Docs:** [Appium Test Design](https://appium.io/docs/en/about-appium/intro/) | [Mobile App Testing Best Practices](https://appium.github.io/appium.io/docs/en/about-appium/getting-started/)

### Current Test States

**1. Welcome Suite (Unauthenticated State)**
- Runs from fresh app install
- Tests welcome screen, email validation, initial UI
- No authentication required
- Location: `test/specs/welcome.e2e.js`

**2. Post-Authentication Tests (Authenticated State)**
- Requires manual login completion
- Tests home screen, navigation, authenticated features
- **Current Limitation**: Manual OTP code retrieval required

### Authentication Process

To test authenticated flows:

1. **Start app and navigate through welcome screen**
2. **Enter valid email address**
3. **Manually retrieve OTP code** from email/SMS
4. **Complete login process**
5. **Run tests from authenticated home screen state**

> **Note**: Automated OTP retrieval is not currently implemented. Tests requiring authentication need manual setup before execution.

## Creating New Page Objects

> 📚 **Official Docs:** [Page Object Model](https://webdriver.io/docs/pageobjects/) | [WebDriverIO Element Selectors](https://webdriver.io/docs/selectors/)

### Cross-Platform Page Objects

All page objects should use the platform-agnostic selector utility for cross-platform compatibility. Here's a real example from `welcome.page.js`:

```javascript
const { $ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const { selectors } = require('./utils/selectors');

class WelcomePage extends BasePage {
    constructor () {
        super();
    }

    // Using byResourceId with testID (recommended for cross-platform)
    get logoImage () {
        return $(selectors.byResourceId('welcome-logo-image'));
    }

    get welcomeTitle () {
        return $(selectors.byResourceId('welcome-title-text'));
    }

    get enterEmailSubTitle () {
        return $(selectors.byResourceId('welcome-subtitle-text'));
    }

    get emailInput () {
        return $(selectors.byResourceId('welcome-email-input'));
    }

    get continueButton () {
        return $(selectors.byResourceId('welcome-continue-button'));
    }

    // Text-based selectors for error messages
    get emailRequiredErrorLabel () {
        return $(selectors.byText('Email is required'));
    }

    get validEmailErrorLabel () {
        return $(selectors.byText('Please enter a valid email address'));
    }
}

module.exports = new WelcomePage();
```

### Selector Utility Functions

The framework provides a `selectors.js` utility (`app/test/pageobjects/utils/selectors.js`) with cross-platform helpers:

```javascript
// Text-based selectors:
selectors.byText(text)              // Find by exact text (@name on iOS, @text on Android)
selectors.byContainsText(text)      // Find by partial text match
selectors.byContainsTextAny(...patterns) // Find by any of multiple text patterns (OR condition)
selectors.staticText(text)          // Find static text element (TextView/StaticText)
selectors.textContainsButNotContains(contains, excludes) // Find text containing one string but not another

// Element type selectors:
selectors.textField()               // Find text input field (no params)
selectors.secureTextField()         // Find password field (no params)
selectors.button(name)              // Find button by text/label
selectors.image()                   // Find image element (no params)
selectors.scrollView()              // Find scroll container (no params)
selectors.switchElement()           // Find toggle switch (no params)

// ID-based selectors:
selectors.byAccessibilityId(id)     // Find by accessibility ID (works with testID)
selectors.byResourceId(id)          // Find by resource ID (accessibility ID on iOS, resource-id on Android)
selectors.byContentDesc(desc)       // Find by content-desc (Android) / accessibility ID (iOS)
selectors.byStartsWithResourceId(prefix) // Find where resource-id/name starts with prefix
selectors.accessibleByIndex(index)  // Find accessible/clickable element by 1-based index

// Pattern-based selectors for spotlight items:
selectors.staticTextByIdPrefixAndPattern(idPrefix, textPattern) // Find by ID prefix and text pattern
selectors.spotlightItemsByPrefix(prefix) // Find spotlight items by entity prefix (ORD, SUB, etc.)

// Low-level helper functions:
isAndroid()                         // Returns true if running on Android
isIOS()                             // Returns true if running on iOS
getSelector({ ios, android })       // Returns platform-specific selector string
```

**Example Usage (from actual page objects):**
```javascript
const { getSelector, selectors } = require('./utils/selectors');

// ID-based selectors (recommended - uses testID from React Native)
get welcomeTitle () { return $(selectors.byResourceId('welcome-title-text')); }
get emailInput () { return $(selectors.byResourceId('welcome-email-input')); }
get filterAll () { return $(selectors.byResourceId('spotlight-filter-all')); }

// Text-based selectors (for elements without testID)
get errorLabel () { return $(selectors.byText('Email is required')); }
get subtitle () { return $(selectors.byContainsText('Existing Marketplace users')); }

// Multi-pattern text matching (handles cross-platform text differences)
// Note: Android may use "long running orders" while iOS uses "long-running orders"
get longRunningOrdersHeader () {
    return $(selectors.byContainsTextAny('long-running orders', 'long running orders'));
}

// Exclusion pattern (find text containing one string but not another)
get expiredInvitesHeader () {
    return $(selectors.textContainsButNotContains('expired invites', 'of my clients'));
}

// Element type selectors  
get mainScrollView () { return $(selectors.scrollView()); }

// Using getSelector for complex platform-specific XPath
get spotlightHeader () {
    return $(getSelector({
        ios: '(//XCUIElementTypeStaticText[@name="Spotlight"])[last()]',
        android: '//android.view.View[@text="Spotlight" and @heading="true"]'
    }));
}
```

### Platform Detection in Page Objects

The `BasePage` class provides platform detection and cross-platform scroll helpers:

```javascript
// Platform detection (inherited from BasePage)
this.isAndroid()  // Returns true if running on Android
this.isIOS()      // Returns true if running on iOS

// Cross-platform scroll helpers (already implemented in BasePage)
await this.scrollDown();  // Scrolls down on both platforms
await this.scrollUp();    // Scrolls up on both platforms
await this.swipe('left'); // Swipes in direction: 'left', 'right', 'up', 'down'
```

**Custom platform-specific handling:**
```javascript
async scrollToElement(element) {
    if (this.isAndroid()) {
        // Android-specific implementation
        await browser.execute('mobile: scrollGesture', {
            left: 100, top: 500, width: 200, height: 500,
            direction: 'down', percent: 0.75
        });
    } else {
        // iOS-specific implementation
        await browser.execute('mobile: scroll', { direction: 'down' });
    }
}
```

### Page Object Structure

**File Location:** `app/test/pageobjects/[page-name].page.js`

**Required Elements:**
1. **Constructor**: Call `super()` to inherit base functionality
2. **Locators**: Use getter methods with platform-agnostic selectors
3. **Actions**: Page-specific interaction methods
4. **Export**: Export instantiated page object

### Locator Strategy Best Practices

**Recommended: Built-in Selector Helpers:**
```javascript
// Text-based - most common pattern in the codebase
get welcomeTitle () { return $(selectors.byText('Welcome')); }
get subtitle () { return $(selectors.byContainsText('Existing Marketplace users')); }

// Button by label
get continueButton () { return $(selectors.button('Continue')); }
get verifyButton () { return $(selectors.button('Verify')); }

// Input fields
get emailInput () { return $(selectors.textField()); }
get passwordInput () { return $(selectors.secureTextField()); }

// Other element types
get logoImage () { return $(selectors.image()); }
get mainScrollView () { return $(selectors.scrollView()); }
```

**For Complex Elements: Platform-Specific XPath with getSelector:**
```javascript
// When elements need different selectors per platform (from verify.page.js)
get otpInput1 () {
    return $(getSelector({
        ios: '(//XCUIElementTypeOther[@accessible="true"])[1]',
        android: '(//android.view.ViewGroup[@clickable="true" and @content-desc])[3]'
    }));
}

// Image by index (from welcome.page.js)
get logoImage () {
    return $(getSelector({
        ios: '//*[contains(@name, "logo")]',
        android: '(//android.widget.ImageView)[1]'
    }));
}
```

**Using Accessibility IDs (when testID is set in React Native):**
```javascript
// App component:
<Button testID="submit-button" />

// Page object:
get submitButton () { return $(selectors.byAccessibilityId('submit-button')); }
```

> **See:** [TEST_ELEMENT_IDENTIFICATION_STRATEGY.md](./TEST_ELEMENT_IDENTIFICATION_STRATEGY.md) for comprehensive testID implementation guidance.

## Creating Test Suites

> 📚 **Official Docs:** [WebDriverIO Test Framework](https://webdriver.io/docs/frameworks/) | [Mocha Test Structure](https://mochajs.org/#getting-started)

### Test File Structure

**File Location:** `app/test/specs/[feature-name].e2e.js`

**Example (from `welcome.e2e.js`):**
```javascript
const { expect } = require('@wdio/globals')
const welcomePage = require('../pageobjects/welcome.page')
const verifyPage = require('../pageobjects/verify.page')
const homePage = require('../pageobjects/spotlights.page')

describe('Welcome page of application', () => {
    it('to display welcome title', async () => {
        await expect(welcomePage.welcomeTitle).toBeDisplayed()
        await expect(welcomePage.welcomeTitle).toHaveText('Welcome')
        await expect(welcomePage.enterEmailSubTitle).toBeDisplayed()
    })

    it('to display email input and submit button', async () => {
        await expect(welcomePage.emailInput).toBeDisplayed()
        await expect(welcomePage.continueButton).toBeDisplayed()
    })

    it('to show email required error when progressing without entering one', async () => {
        await welcomePage.click(welcomePage.continueButton)
        await expect(welcomePage.emailRequiredErrorLabel).toBeDisplayed()
        await expect(welcomePage.emailRequiredErrorLabel).toHaveText('Email is required')
    })

    it('to show invalid email error when progressing with invalid one', async () => {
        await welcomePage.typeText(welcomePage.emailInput, 'invalid-email')
        await welcomePage.click(welcomePage.continueButton)
        await expect(welcomePage.validEmailErrorLabel).toBeDisplayed()
    })
})
```

**Key Patterns:**
- Use `welcomePage.click(element)` and `welcomePage.typeText(element, text)` from `BasePage`
- Use `await expect(element).toBeDisplayed()` for visibility assertions
- Use `await expect(element).toHaveText('text')` for text assertions

### Test Reset Logic

**Note**: The current test suite (`welcome.e2e.js`) does not use `beforeEach` for reset - tests run sequentially from app launch. For more complex test suites, you may need:

**For Unauthenticated Tests (app starts fresh):**
```javascript
// Tests run from fresh app install - no beforeEach needed
// The welcome screen is automatically displayed on app launch
describe('Welcome page of application', () => {
    it('to display welcome title', async () => {
        await expect(welcomePage.welcomeTitle).toBeDisplayed()
    })
})
```

**For Navigation Between Screens (using footer tabs):**
```javascript
const footerPage = require('../pageobjects/base/footer.page')

// Footer page uses accessibility IDs for reliable cross-platform navigation
// Tab elements: spotlightsTab, ordersTab, subscriptionsTab, moreTab
await footerPage.clickOrdersTab()
await footerPage.clickSubscriptionsTab()
await footerPage.clickSpotlightsTab()
await footerPage.clickMoreTab()
```

### Suite Configuration (Optional)

Optionally group related tests into suites by adding them to `wdio.conf.js`:

```javascript
suites: {
    welcome: ['./test/specs/welcome.e2e.js'],
    home: ['./test/specs/home.e2e.js'],
    navigation: ['./test/specs/navigation.e2e.js'],
    newFeature: ['./test/specs/new-feature.e2e.js']
}
```

## Running Tests

> 📚 **Official Docs:** [WebDriverIO CLI](https://webdriver.io/docs/clioptions/) | [Running Specific Tests](https://webdriver.io/docs/organizingsuites/)

### Cross-Platform Test Execution

The unified test script supports both iOS and Android:

**iOS Tests:**
```bash
# Run specific suite
./scripts/run-local-test.sh --platform ios welcome

# Run all tests
./scripts/run-local-test.sh --platform ios all

# Run specific file
./scripts/run-local-test.sh --platform ios ./test/specs/welcome.e2e.js

# Build and run
./scripts/run-local-test.sh --platform ios --build --env dev --client-id YOUR_ID welcome
```

**Android Tests:**
```bash
# Run specific suite
./scripts/run-local-test.sh --platform android welcome

# Run all tests
./scripts/run-local-test.sh --platform android all

# Run specific file
./scripts/run-local-test.sh --platform android ./test/specs/welcome.e2e.js

# Build and run
./scripts/run-local-test.sh --platform android --build --env dev --client-id YOUR_ID welcome
```

**Using NPM Scripts:**
```bash
cd app

# iOS tests
npm run test:e2e:ios

# Android tests
npm run test:e2e:android

# Specific suite on iOS
PLATFORM_NAME=iOS npx wdio run wdio.conf.js --suite welcome

# Specific suite on Android
PLATFORM_NAME=Android npx wdio run wdio.conf.js --suite welcome
```

### Test Suite Configuration

Add new test suites to `wdio.conf.js`:

```javascript
suites: {
    welcome: ['./test/specs/welcome.e2e.js'],
    home: ['./test/specs/home.e2e.js'],
    navigation: ['./test/specs/navigation.e2e.js'],
    newFeature: ['./test/specs/new-feature.e2e.js'],  // Add your suite here
}
```

Then run with:
```bash
./scripts/run-local-test.sh --platform ios newFeature
./scripts/run-local-test.sh --platform android newFeature
```

> 📚 **Official Docs:** [WebDriverIO CLI](https://webdriver.io/docs/clioptions/) | [Test Execution](https://webdriver.io/docs/organizingsuites/)

### Direct Test File Execution
```bash
./scripts/run-local-test.sh ./test/specs/new-feature.e2e.js
```

### Suite Execution (if configured)
```bash
./scripts/run-local-test.sh newFeature
```

### Multiple Test Files
```bash
./scripts/run-local-test.sh ./test/specs/home.e2e.js ./test/specs/profile.e2e.js
```

## Appium Inspector for Element Discovery

> 📚 **Official Docs:** [Appium Inspector GitHub](https://github.com/appium/appium-inspector) | [Element Identification Guide](https://appium.io/docs/en/commands/element/)

### Starting Appium with Inspector Support

To use Appium Inspector for element identification and test development, start Appium with GUI support:

```bash
# Install Appium Inspector globally (one-time setup)
npm install -g @appium/inspector

# Start Appium server (in one terminal)
appium --log-level info --log appium.log

# Start Appium Inspector (in another terminal)
appium-inspector
```

Alternatively, you can download the standalone Appium Inspector application from the [GitHub releases page](https://github.com/appium/appium-inspector/releases).

### Connecting to Your App

Once Appium Inspector is running:

1. **Open Inspector** at `http://localhost:4724` in your browser (or use the desktop app)
2. **Configure Session** with your app capabilities:
   ```json
   {
     "platformName": "iOS",
     "appium:deviceName": "iPhone 16",
     "appium:platformVersion": "26.0", 
     "appium:automationName": "XCUITest",
     "appium:bundleId": "com.softwareone.marketplaceMobile",
     "appium:udid": "YOUR_DEVICE_UDID"
   }
   ```
3. **Start Session** to connect to your running app
4. **Inspect Elements** by clicking on them in the app preview

### Using Inspector for Test Development

**Element Discovery:**
- **Click elements** in the app preview to see their attributes
- **Copy locators** (XPath, accessibility ID, etc.) directly from the inspector
- **Validate selectors** before using them in tests

**Debugging Tests:**
- **Step through actions** manually in the inspector
- **Test element interactions** before writing automation code  
- **Verify element states** and properties

### Official Documentation

For comprehensive Appium Inspector documentation:

- **Appium Inspector GitHub:** https://github.com/appium/appium-inspector
- **Appium Inspector Documentation:** https://appium.github.io/appium-inspector/
- **Element Selection Guide:** https://appium.io/docs/en/commands/element/
- **iOS-Specific Selectors:** https://appium.github.io/appium-xcuitest-driver/

### Inspector Tips

- **Use accessibility identifiers** when available for more reliable selectors
- **Test on the same simulator** you'll use for automated tests
- **Capture element hierarchies** to understand app structure
- **Export sessions** to save your configuration for future use

## Best Practices

> 📚 **Official Docs:** [WebDriverIO Best Practices](https://webdriver.io/docs/bestpractices/) | [Appium Pro Tips](https://appiumpro.com/)

### Page Object Design
- **Single Responsibility**: One page object per screen/component
- **Descriptive Naming**: Use clear, descriptive names for locators and methods
- **Reusable Actions**: Create common actions in base page or utility classes
- **Wait Strategies**: Use WebDriverIO's built-in wait methods for reliability

### Test Design
- **Isolated Tests**: Each test should be independent and not rely on previous tests
- **Clear Assertions**: Use descriptive expect messages and specific assertions
- **Error Handling**: Test both happy paths and error scenarios
- **Test Data**: Use meaningful test data that reflects real user scenarios

### Debugging Tips
- **Verbose Mode**: Use `--verbose` flag for detailed logging
- **Screenshot Capture**: Automatic screenshots on test failures
- **Appium Inspector**: Use for element identification and debugging
- **Console Logging**: Add strategic console.log statements for debugging

## Example: Creating a New Page Object and Test

This example shows how to create a new page object following the patterns used in the existing codebase.

### 1. Create Page Object

**File:** `app/test/pageobjects/profile.page.js`

This is the actual implementation from the codebase:
```javascript
const { $, $$ } = require('@wdio/globals');
const BasePage = require('./base/base.page');
const { getSelector, selectors } = require('./utils/selectors');

class ProfilePage extends BasePage {
    constructor () {
        super();
    }

    // ========== Header Elements ==========
    get goBackButton () {
        return $(getSelector({
            ios: '~Go back',
            android: '//android.widget.Button[@content-desc="Go back"]'
        }));
    }

    get profileHeaderTitle () {
        return $(getSelector({
            ios: '~Profile',
            android: '//android.view.View[@text="Profile"]'
        }));
    }

    // ========== Your Profile Section ==========
    get yourProfileLabel () {
        return $(selectors.byText('YOUR PROFILE'));
    }

    get currentUserCard () {
        return $(getSelector({
            ios: '//*[contains(@name, "USR-")]',
            android: '//android.view.ViewGroup[contains(@content-desc, "USR-")][@clickable="true"]'
        }));
    }

    // ========== Switch Account Section ==========
    get switchAccountLabel () {
        return $(selectors.byText('SWITCH ACCOUNT'));
    }

    // First account item (can be used as reference for pattern)
    get firstAccountItem () {
        return $(getSelector({
            ios: '(//XCUIElementTypeOther[contains(@name, "ACC-")])[1]',
            android: '(//android.view.ViewGroup[contains(@content-desc, "ACC-") and not(contains(@content-desc, "USR-"))][@clickable="true"])[1]'
        }));
    }

    // Get account item by index (1-based)
    getAccountItemByIndex (index) {
        return $(getSelector({
            ios: `(//XCUIElementTypeOther[contains(@name, "ACC-")])[${index}]`,
            android: `(//android.view.ViewGroup[contains(@content-desc, "ACC-") and not(contains(@content-desc, "USR-"))][@clickable="true"])[${index}]`
        }));
    }

    // ========== Helper Methods ==========
    async goBack () {
        await this.click(this.goBackButton);
    }

    async selectAccountByIndex (index) {
        const account = this.getAccountItemByIndex(index);
        await this.click(account);
    }
}

module.exports = new ProfilePage();
```

### 2. Create Test File

**File:** `app/test/specs/profile.e2e.js`
```javascript
const { expect } = require('@wdio/globals')
const profilePage = require('../pageobjects/profile.page')

describe('User Profile Tests', () => {
    it('should display profile header', async () => {
        await expect(profilePage.profileHeaderTitle).toBeDisplayed()
        await expect(profilePage.goBackButton).toBeDisplayed()
    })

    it('should display your profile section', async () => {
        await expect(profilePage.yourProfileLabel).toHaveText('YOUR PROFILE')
        await expect(profilePage.currentUserCard).toBeDisplayed()
    })

    it('should display switch account section', async () => {
        await expect(profilePage.switchAccountLabel).toHaveText('SWITCH ACCOUNT')
        await expect(profilePage.firstAccountItem).toBeDisplayed()
    })

    it('should allow selecting an account', async () => {
        await profilePage.selectAccountByIndex(1)
        // Add assertions for account selection result
    })

    it('should navigate back', async () => {
        await profilePage.goBack()
        // Add assertions for previous screen
    })
})
```

### 3. Update Suite Configuration

**In `wdio.conf.js`:**
```javascript
suites: {
    welcome: ['./test/specs/welcome.e2e.js'],
    profile: ['./test/specs/profile.e2e.js'],
    authenticated: [
        './test/specs/home.e2e.js',
        './test/specs/profile.e2e.js'
    ]
}
```

### 4. Run the Tests

```bash
# Run profile tests specifically (iOS)
./scripts/run-local-test.sh --platform ios profile

# Run profile tests specifically (Android)
./scripts/run-local-test.sh --platform android profile

# Run all authenticated tests
./scripts/run-local-test.sh --platform ios authenticated
```

## Troubleshooting

### Common Issues
- **Element Not Found**: Verify locators using Appium Inspector
- **Timing Issues**: Add appropriate wait conditions
- **App State**: Ensure proper test reset logic
- **Authentication**: Complete OTP flow or manually login before running authenticated tests
- **Platform Differences**: Check that selectors work on both iOS and Android

### Debug Commands

**iOS:**
```bash
# Run with verbose logging
./scripts/run-local-test.sh --platform ios --verbose welcome

# Check Appium server logs
tail -f appium.log

# Verify iOS simulator state
xcrun simctl list devices
```

**Android:**
```bash
# Run with verbose logging
./scripts/run-local-test.sh --platform android --verbose welcome

# Check connected Android devices
adb devices

# View device logs
adb logcat | grep -i "ReactNative\|Appium"
```

This framework provides a robust foundation for comprehensive cross-platform mobile app testing. Follow these patterns to create maintainable, reliable tests that work on both iOS and Android.

This framework provides a robust foundation for comprehensive iOS app testing. Follow these patterns to create maintainable, reliable tests that cover both unauthenticated and authenticated user journeys.