# Appium Testing Guide

This guide covers how to run Appium tests locally and explains the CI/CD setup for automated iOS testing.

## Overview

This project uses Appium with WebDriverIO for automated iOS testing. Tests can be run locally during development or automatically in GitHub Actions CI/CD pipelines.

## Local Development Setup

### Prerequisites

- **macOS** (required for iOS simulator testing)
- **Xcode** (latest version recommended)
- **Node.js** (version 20.x or later)
- **iOS Simulator** (installed with Xcode)

### 1. Install Dependencies

```bash
# Navigate to the app directory
cd app

# Install Node.js dependencies
npm install

# Install Appium globally
npm install -g appium@3.1.1

# Install Appium XCUITest driver for iOS testing
appium driver install xcuitest

# Verify Appium installation
appium --version
appium driver list --installed
```

### 2. iOS Simulator Setup and App Deployment

#### Method 1: Using Deploy Script (Recommended)

The easiest way to build and deploy the app to a simulator is using the provided deployment script:

```bash
# Make sure you're in the project root directory
cd /path/to/mpt-mobile-platform

# Run the iOS deployment script
./scripts/deploy-ios.sh

# The script will:
# 1. Build the iOS app for simulator
# 2. Boot an available iOS simulator
# 3. Install the app on the simulator
# 4. Launch the app
```

The `deploy-ios.sh` script handles all the complexity of building, installing, and launching your app automatically. Once it completes successfully, your app will be ready for Appium testing.

#### Method 2: Manual Setup (Alternate)

If you prefer manual control or need to troubleshoot, you can set up the simulator manually:

1. **Open Xcode** and install iOS simulators:
   ```bash
   # List available simulators
   xcrun simctl list devices available
   
   # Boot a specific simulator (example)
   xcrun simctl boot "iPhone 16"
   ```

2. **Build and install your app** on the simulator:
   ```bash
   # Build the iOS app for simulator
   cd ios
   xcodebuild -workspace SoftwareOne.xcworkspace \
     -scheme SoftwareOne \
     -configuration Debug \
     -sdk iphonesimulator \
     -destination 'generic/platform=iOS Simulator'
   
   # Install the app on simulator
   xcrun simctl install booted path/to/your/app.app
   ```

### 3. Start Appium Server

```bash
# Start Appium server with logging
appium --log-level info --log appium.log

# Or start in background
appium --log-level info --log appium.log &
```

The server will start on `http://localhost:4723` by default.

### 4. Configure WebDriverIO

The project includes a pre-configured `wdio.conf.js` file with iOS-specific settings. Key configuration:

```javascript
// app/wdio.conf.js
exports.config = {
  port: 4723,
  capabilities: [{
    platformName: 'iOS',
    'appium:deviceName': 'iPhone 16',
    'appium:platformVersion': '26.0',
    'appium:automationName': 'XCUITest',
    'appium:bundleId': 'com.softwareone.marketplaceMobile'
  }],
  // ... other config
};
```

### 5. Run Tests

#### Standard Testing Flow

After deploying your app using either method above:

```bash
# Navigate to app directory
cd app

# Run all tests
npx wdio run wdio.conf.js

# Run specific test suite
npx wdio run wdio.conf.js --suite welcome

# Run with specific spec file
npx wdio run wdio.conf.js --spec test/specs/welcome.spec.js
```

#### Complete Testing Workflow (Recommended)

For a complete end-to-end testing workflow:

```bash
# 1. Deploy app to simulator (from project root)
./scripts/deploy-ios.sh

# 2. Start Appium server in background
cd app
appium --log-level info --log appium.log &

# 3. Wait a moment for Appium to start, then run tests
sleep 3
npx wdio run wdio.conf.js --suite welcome

# 4. Stop Appium when done
pkill -f appium
```

#### Alternative Manual Flow

If using the manual setup method:

```bash
# 1. Manually build and install app (see Method 2 above)
# 2. Start Appium server
cd app
appium --log-level info --log appium.log &

# 3. Run tests
npx wdio run wdio.conf.js --suite welcome

# 4. Clean up
pkill -f appium
```

### 6. Debugging Tests

- **Appium logs**: Check `appium.log` for server-side issues
- **Test results**: Results are saved to `app/test-results/`
- **Screenshots**: Automatic screenshots on failure in `app/screenshots/`
- **Simulator logs**: Use `xcrun simctl spawn <device_udid> log stream`

## Environment Variables

Create a `.env` file in the `app` directory if needed:

```bash
# app/.env
APPIUM_HOST=localhost
APPIUM_PORT=4723
DEVICE_NAME=iPhone 16
PLATFORM_VERSION=26.0
APP_BUNDLE_ID=com.softwareone.marketplaceMobile
```

## CI/CD Setup

### GitHub Actions Workflows

The project includes automated CI/CD workflows in `.github/workflows/`:

#### 1. Main Build and Test Workflow
- **File**: `.github/workflows/ios-build-and-test.yml`
- **Triggers**: Pull requests to `main` branch, manual dispatch
- **Process**:
  1. **Build Job**: Compiles iOS app for simulator
  2. **Install and Test Job**: Downloads app, sets up simulator, runs Appium tests

#### 2. External Build Testing
- **File**: `.github/workflows/ios-external-test-example.yml` 
- **Purpose**: Test pre-built apps from external URLs (e.g., Azure blob storage)
- **Use case**: Testing builds from other CI systems

### GitHub Actions Composite Actions

Reusable components in `.github/actions/`:

#### iOS Install Action
- **Path**: `.github/actions/ios-install/`
- **Purpose**: Download, extract, and install iOS app on simulator
- **Inputs**:
  - `artifact_name`: GitHub artifact name
  - `download_url`: External download URL (alternative)
  - `ios_version`: iOS simulator version
  - `device_name`: Simulator device name

#### iOS Test Action  
- **Path**: `.github/actions/ios-test/`
- **Purpose**: Set up Appium and run test suite
- **Inputs**:
  - `device_uuid`: iOS simulator UUID
  - `app_bundle_id`: App bundle identifier
  - `node_version`: Node.js version
  - `appium_version`: Appium version

### CI Architecture Benefits

1. **Single Runner**: Install and test run on same GitHub Actions runner, preserving simulator state
2. **Reusable Components**: Composite actions can be used across multiple workflows
3. **Artifact Management**: Automatic handling of build artifacts and test results
4. **Error Handling**: Comprehensive logging and artifact uploads for debugging

### Using CI Workflows

#### For Internal Development:
```yaml
# .github/workflows/my-test.yml
jobs:
  test-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install iOS App
        uses: ./.github/actions/ios-install
        with:
          artifact_name: "my-ios-build"
          
      - name: Test iOS App  
        uses: ./.github/actions/ios-test
        with:
          device_uuid: ${{ steps.install-ios.outputs.device_udid }}
          app_bundle_id: ${{ steps.install-ios.outputs.bundle_id }}
```

#### For External Builds:
```yaml
- name: Install External Build
  uses: ./.github/actions/ios-install
  with:
    download_url: "https://example.com/build.zip"
    ios_version: "26.0"
    device_name: "iPhone 16"
```

## Test Structure

### Test Organization
```
app/
├── test/
│   ├── specs/           # Test specification files
│   │   ├── welcome.spec.js
│   │   └── auth.spec.js
│   └── pageobjects/     # Page object models
│       ├── welcome.page.js
│       └── base.page.js
├── test-results/        # Test execution results
├── screenshots/         # Failure screenshots
└── wdio.conf.js        # WebDriverIO configuration
```

### Writing Tests

```javascript
// test/specs/example.spec.js
describe('My App', () => {
  it('should display welcome screen', async () => {
    // Test implementation
    await expect($('~welcome-screen')).toBeDisplayed();
  });
});
```

## Troubleshooting

### Common Issues

1. **Deploy script fails**:
   ```bash
   # Check script permissions
   chmod +x ./scripts/deploy-ios.sh
   
   # Run with verbose output
   bash -x ./scripts/deploy-ios.sh
   ```

2. **Simulator not booting** (Manual setup):
   ```bash
   # Reset simulator
   xcrun simctl erase "iPhone 16"
   xcrun simctl boot "iPhone 16"
   ```

3. **App installation fails**:
   - Verify app is built for simulator (not device)
   - Check app bundle path is correct  
   - Ensure simulator is booted
   - Try using the deploy script instead of manual installation

4. **Appium connection issues**:
   - Verify Appium server is running on correct port
   - Check firewall settings
   - Ensure XCUITest driver is installed

5. **Test timeouts**:
   - Increase timeout values in `wdio.conf.js`
   - Check simulator performance
   - Verify app is launching correctly

### Logs and Debugging

- **Appium logs**: `appium.log`
- **WebDriverIO logs**: Console output during test run
- **Simulator logs**: `xcrun simctl spawn <udid> log stream`
- **CI logs**: GitHub Actions workflow logs and uploaded artifacts

## Best Practices

1. **Test Isolation**: Each test should be independent and clean up after itself
2. **Page Objects**: Use page object pattern for maintainable tests
3. **Explicit Waits**: Use WebDriverIO's built-in wait methods
4. **Error Handling**: Include proper error handling and cleanup
5. **CI Integration**: Design tests to work reliably in CI environment

## Resources

- [Appium Documentation](https://appium.io/docs/en/2.1/)
- [WebDriverIO Documentation](https://webdriver.io/)
- [iOS Simulator Guide](https://developer.apple.com/documentation/xcode/running-your-app-in-the-simulator-or-on-a-device)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)