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
// Platform detection
const isAndroid = process.env.PLATFORM_NAME === 'Android';
const isIOS = process.env.PLATFORM_NAME === 'iOS' || !process.env.PLATFORM_NAME;

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
capabilities: [isAndroid ? androidCapabilities : iosCapabilities]
```

**Required Environment Variables by Platform:**

**iOS:**
- `PLATFORM_NAME`: Set to `iOS` (or omit for default)
- `APP_BUNDLE_ID`: iOS app bundle identifier (default: `com.softwareone.marketplaceMobile`)
- `DEVICE_NAME`: Target iOS simulator name (default: `iPhone 16`)
- `PLATFORM_VERSION`: iOS version (default: `26.0` for iOS 18.0)
- `DEVICE_UDID`: Simulator UUID (auto-detected by test script)

**Android:**
- `PLATFORM_NAME`: Set to `Android`
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

All page objects should use the platform-agnostic selector utility for cross-platform compatibility:

```javascript
const BasePage = require('./base/base.page');
const { getSelector, selectors } = require('./utils/selectors');

class NewPage extends BasePage {
    constructor() {
        super();
    }

    // Platform-agnostic locators using getSelector
    get mainHeader() {
        return $(getSelector({
            ios: '~Page Title',  // iOS accessibility id
            android: '~Page Title'  // Android content description
        }));
    }

    get actionButton() {
        return $(getSelector({
            ios: '~Action Button',
            android: '~Action Button'
        }));
    }

    // Using selector utility functions
    get emailInput() {
        return $(selectors.textField({
            ios: '~Email Input',
            android: '~Email Input'
        }));
    }

    // Text-based selectors (when testID is not available)
    get submitButtonByText() {
        return $(selectors.byText({
            ios: 'Submit',
            android: 'Submit'
        }));
    }

    // Page-specific actions
    async performPageAction() {
        await this.click(this.actionButton);
    }
}

module.exports = new NewPage();
```

### Selector Utility Functions

The framework provides a `selectors.js` utility with cross-platform helpers:

```javascript
// Available selector functions:
selectors.byText({ ios, android })           // Find by exact text
selectors.byContainsText({ ios, android })   // Find by partial text
selectors.textField({ ios, android })        // Text input fields
selectors.secureTextField({ ios, android })  // Password fields
selectors.button({ ios, android })           // Buttons
selectors.staticText({ ios, android })       // Static text labels
selectors.image({ ios, android })            // Images
selectors.scrollView({ ios, android })       // Scroll containers
selectors.cell({ ios, android })             // List items
selectors.switch({ ios, android })           // Toggle switches
selectors.slider({ ios, android })           // Sliders
selectors.tabBar({ ios, android })           // Tab bars
selectors.navigationBar({ ios, android })    // Navigation bars
```

### Platform Detection in Page Objects

Use base page methods to conditionally handle platform differences:

```javascript
async scrollToElement(element) {
    if (this.isAndroid()) {
        // Android-specific scroll implementation
        await this.scrollDown(5);
    } else {
        // iOS-specific scroll implementation
        await driver.execute('mobile: scroll', { direction: 'down' });
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

**Recommended Approach (testID):**
```javascript
// App component (preferred):
<Button testID="submit-button" />

// Page object:
get submitButton() {
    return $(getSelector({
        ios: '~submit-button',
        android: '~submit-button'
    }));
}
```

**Text-Based Fallback:**
```javascript
// When testID is not available
get submitButtonByText() {
    return $(selectors.byText({
        ios: 'Submit',
        android: 'Submit'
    }));
}
```

**Platform-Specific XPath (avoid when possible):**
```javascript
// Only use when absolutely necessary
get complexElement() {
    return $(getSelector({
        ios: '//XCUIElementTypeButton[@name="Submit"]',
        android: '//android.widget.Button[@text="Submit"]'
    }));
}
```

> **See:** [TEST_ELEMENT_IDENTIFICATION_STRATEGY.md](./TEST_ELEMENT_IDENTIFICATION_STRATEGY.md) for comprehensive testID implementation guidance.

## Creating Test Suites

> 📚 **Official Docs:** [WebDriverIO Test Framework](https://webdriver.io/docs/frameworks/) | [Mocha Test Structure](https://mochajs.org/#getting-started)

### Test File Structure

**File Location:** `app/test/specs/[feature-name].e2e.js`

**Template Structure:**
```javascript
const { expect } = require('@wdio/globals')
const newPage = require('../pageobjects/new.page')
const homePage = require('../pageobjects/home.page')

describe('New Feature Tests', () => {
    beforeEach(async () => {
        // Reset to home screen before each test
        await homePage.navigateToHome();
        await newPage.navigateToNewPage();
    });

    it('should display main elements', async () => {
        await expect(newPage.mainHeader).toBeDisplayed();
        await expect(newPage.mainHeader).toHaveText('Expected Title');
    });

    it('should handle user interactions', async () => {
        await newPage.performPageAction();
        await expect(newPage.successMessage).toBeDisplayed();
    });

    it('should validate error states', async () => {
        await newPage.triggerError();
        await expect(newPage.errorMessage).toBeDisplayed();
        await expect(newPage.errorMessage).toHaveText('Expected Error Message');
    });
});
```

### Test Reset Logic

**Critical**: Each test should start from a known state to ensure reliability.

**For Unauthenticated Tests:**
```javascript
beforeEach(async () => {
    // App automatically starts at welcome screen
    await expect(welcomePage.welcomeTitle).toBeDisplayed();
});
```

**For Authenticated Tests:**
```javascript
beforeEach(async () => {
    // Navigate back to home screen
    await homePage.navigateToHome();
    // Verify home state
    await expect(homePage.homeTitle).toBeDisplayed();
});
```

### Suite Configuration (Optional)

Optionally group related tests into suites by adding them to `wdio.conf.js`:

```javascript
suites: {
    welcome: ['./test/specs/welcome.e2e.js'],
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

## Example: Creating a Profile Page Test

### 1. Create Page Object

**File:** `app/test/pageobjects/profile.page.js`
```javascript
const BasePage = require('./base/base.page');

class ProfilePage extends BasePage {
    constructor() {
        super();
    }

    get profileTitle() {
        return $('//*[@name="Profile"]');
    }

    get userNameDisplay() {
        return $('//*[@name="User Name"]');
    }

    get editButton() {
        return $('//*[@name="Edit Profile"]');
    }

    get logoutButton() {
        return $('//*[@name="Logout"]');
    }

    async editProfile() {
        await this.click(this.editButton);
    }

    async logout() {
        await this.click(this.logoutButton);
    }
}

module.exports = new ProfilePage();
```

### 2. Create Test File

**File:** `app/test/specs/profile.e2e.js`
```javascript
const { expect } = require('@wdio/globals')
const profilePage = require('../pageobjects/profile.page')
const homePage = require('../pageobjects/home.page')

describe('User Profile Tests', () => {
    beforeEach(async () => {
        // Ensure we start from home screen
        await homePage.navigateToHome();
        // Navigate to profile
        await homePage.navigateToProfile();
        await expect(profilePage.profileTitle).toBeDisplayed();
    });

    it('should display user profile information', async () => {
        await expect(profilePage.userNameDisplay).toBeDisplayed();
        await expect(profilePage.editButton).toBeDisplayed();
        await expect(profilePage.logoutButton).toBeDisplayed();
    });

    it('should open edit profile screen', async () => {
        await profilePage.editProfile();
        // Add assertions for edit screen
    });

    it('should handle logout functionality', async () => {
        await profilePage.logout();
        // Verify return to welcome screen
    });
});
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
# Run profile tests specifically
./scripts/run-local-test.sh profile

# Run all authenticated tests
./scripts/run-local-test.sh authenticated
```

## Troubleshooting

### Common Issues
- **Element Not Found**: Verify locators using Appium Inspector
- **Timing Issues**: Add appropriate wait conditions
- **App State**: Ensure proper test reset logic
- **Authentication**: Manually complete login before running authenticated tests

### Debug Commands
```bash
# Run with verbose logging
./scripts/run-local-test.sh --verbose profile

# Check Appium server logs
tail -f appium.log

# Verify device state
xcrun simctl list devices
```

This framework provides a robust foundation for comprehensive iOS app testing. Follow these patterns to create maintainable, reliable tests that cover both unauthenticated and authenticated user journeys.