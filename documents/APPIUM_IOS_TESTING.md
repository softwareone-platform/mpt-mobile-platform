# Appium Testing Guide

This guide covers how to run Appium tests locally and explains the CI/CD setup for automated iOS testing.

## Overview

This project uses Appium with WebDriverIO for automated iOS testing. Tests can be run locally during development or automatically in GitHub Actions CI/CD pipelines.

## Quick Start Guide

For the fastest testing workflow, use these three approaches based on your needs:

### 🚀 **Recommended Workflow**

```bash
# 1. First time: Build fresh Release app (requires .env file in app/ directory)
./scripts/run-local-test.sh --build welcome

# 2. Iteration: Reuse last build for fast testing
./scripts/run-local-test.sh --skip-build welcome

# 3. Quick runs: Test with currently installed app
./scripts/run-local-test.sh welcome
```

### ⚡ **Development Workflow**

1. **Initial build**: Use `--build` when you change app code (requires `.env` file in `app/` directory)
2. **Fast iteration**: Use `--skip-build` for repeated testing without rebuilding  
3. **Debug mode**: Add `--verbose` to see detailed logs for troubleshooting

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

#### Method 1: Using Local Test Script (Recommended)

The easiest way to build, deploy, and test the app is using the integrated local test script:

```bash
# Navigate to project root
cd /path/to/mpt-mobile-platform

# Run tests with existing app (fastest)
./scripts/run-local-test.sh welcome

# Build fresh Release app and run tests (requires .env file)
./scripts/run-local-test.sh --build welcome

# Run with verbose output for debugging
./scripts/run-local-test.sh --build --verbose welcome

# Run specific test file
./scripts/run-local-test.sh ./test/specs/welcome.e2e.js

# Get help and see all options
./scripts/run-local-test.sh --help
```

The `run-local-test.sh` script provides a complete testing solution:
- **Builds** Release version of the app (optional with `--build`, requires `.env` file)
- **Sets up** iOS simulator and installs the app
- **Starts** Appium server automatically
- **Runs** your specified test suite or spec file
- **Cleans up** Appium processes when done

This is the **recommended approach** for local development as it handles the entire workflow automatically.

## Appium version sync

The test script includes a guard to prefer the `app/package.json` Appium version where possible and will choose between a local `node_modules/.bin/appium`, `npx appium@<version>`, or a global `appium` binary. If you have version mismatches or want more details, see [Appium Version & Binary Sync](APPIUM_VERSION_SYNC.md).

#### Method 2: Using Deploy Script Only

If you only want to build and deploy without running tests:

```bash
# Make sure you're in the project root directory
cd /path/to/mpt-mobile-platform

# Run the iOS deployment script
./scripts/deploy-ios.sh --client-id YOUR_AUTH0_CLIENT_ID

# The script will:
# 1. Build the iOS app for simulator
# 2. Boot an available iOS simulator  
# 3. Install the app on the simulator
# 4. Launch the app
```

The `deploy-ios.sh` script handles all the complexity of building, installing, and launching your app automatically. Once it completes successfully, your app will be ready for Appium testing.

#### Method 3: Manual Setup (Advanced)

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

### 3. Automated Testing with Local Script

The `run-local-test.sh` script provides the most streamlined testing experience:

```bash
# Basic usage - run tests with existing app
./scripts/run-local-test.sh welcome

# Full workflow - build Release app and test (requires .env file)
./scripts/run-local-test.sh --build welcome

# Fast workflow - reuse last build and test (recommended for iteration)
./scripts/run-local-test.sh --skip-build welcome

# Available options:
#   --platform, -p        Target platform: ios or android (default: ios)
#   --build, -b           Build release version of the app before testing
#   --skip-build, -s      Skip build and install existing app from last build
#   --build-from-artifact Download and install app from artifact URL (zip or apk)
#   --list, --dry-run     List all test cases without running them
#   --verbose, -v         Enable verbose output for debugging
#   --help, -h            Show help message
```

**Script Features:**
- ✅ **Automatic build** (optional): Builds Release configuration using Expo prebuild + xcodebuild
- ✅ **Fast iteration**: Reuses last build for quick testing cycles with `--skip-build`
- ✅ **Artifact support**: Download and install app from artifact URL with `--build-from-artifact`
- ✅ **Test discovery**: List all tests without running them with `--list` or `--dry-run`
- ✅ **Simulator management**: Boots simulator and installs app automatically
- ✅ **Appium lifecycle**: Starts/stops Appium server as needed
- ✅ **Flexible execution**: Run from project root or scripts directory
- ✅ **Production parity**: Uses same build process as CI/CD pipeline
- ✅ **Environment config**: Reads Auth0 configuration from `.env` file in `app/` directory

**Performance Comparison:**
- **Full build** (`--build`): ~6-8 minutes (build + test)
- **Skip build** (`--skip-build`): ~10 seconds (install + test) 
- **No flags**: ~5 seconds (test only)

### Workflow Strategies

#### 🏗️ **Development Cycle**
```bash
# 1. Make code changes
# 2. Build once with new changes (requires .env file)
./scripts/run-local-test.sh --build welcome

# 3. Iterate quickly without rebuilding
./scripts/run-local-test.sh --skip-build welcome
./scripts/run-local-test.sh --skip-build home  
./scripts/run-local-test.sh --skip-build --verbose navigation  # Debug a failing test
```

#### 🧪 **Test-Driven Development**
```bash
# Quick test runs during TDD
./scripts/run-local-test.sh welcome                    # Fastest option
./scripts/run-local-test.sh ./test/specs/new.e2e.js  # Test specific new spec
```

#### 🚀 **Production Validation**
```bash
# Always use fresh builds for production testing (requires .env file)
./scripts/run-local-test.sh --build welcome

# Or download and test from CI artifact URL
./scripts/run-local-test.sh --build-from-artifact https://github.com/.../app.zip welcome
```

### 4. Manual Appium Testing (Alternative)

If you need more control over the testing process:

#### Start Appium Server

```bash
# Start Appium server with logging
appium --log-level info --log appium.log

# Or start in background
appium --log-level info --log appium.log &
```

The server will start on `http://localhost:4723` by default.

#### WebDriverIO Configuration

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

### 5. Running Tests with Manual Setup

#### Standard Testing Flow

After setting up your app using the deploy script or manual method:

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

#### Complete Manual Workflow

For complete control over the testing process:

```bash
# 1. Deploy app to simulator (from project root)
./scripts/deploy-ios.sh --client-id YOUR_AUTH0_CLIENT_ID

# 2. Start Appium server in background
cd app
appium --log-level info --log appium.log &

# 3. Wait for Appium to start, then run tests
sleep 3
npx wdio run wdio.conf.js --suite welcome

# 4. Stop Appium when done
pkill -f appium
```

#### Alternative: Manual Setup with Deploy Script

If you want to use the deploy script separately:

```bash
# 1. Build and deploy app manually
./scripts/deploy-ios.sh --client-id YOUR_AUTH0_CLIENT_ID

# 2. Start Appium server  
cd app
appium --log-level info --log appium.log &

# 3. Run tests
npx wdio run wdio.conf.js --suite welcome

# 4. Clean up
pkill -f appium
```

### 6. Debugging and Troubleshooting

#### Common Debugging Resources
- **Appium logs**: Check `appium.log` for server-side issues
- **Test results**: Results are saved to `app/test-results/`
- **Screenshots**: Automatic screenshots on failure in `screenshots/`
- **Simulator logs**: Use `xcrun simctl spawn <device_udid> log stream`

#### Script Debugging
- Use `--verbose` flag with `run-local-test.sh` for detailed logging
- Check script exit codes and error messages
- Verify `.env` file exists in `app/` directory with Auth0 configuration

#### Build and Installation Issues
- **No existing build error**: If `--skip-build` fails, run with `--build` first or use `./scripts/deploy-ios.sh`
- **Build conflicts**: Cannot use `--build` and `--skip-build` together
- **Missing .env file**: `--build` requires `.env` file in `app/` directory with Auth0 configuration
- **Stale builds**: Use `--build` to rebuild if app behavior seems outdated

#### Simulator Issues
- If simulator boot fails, try manually booting: `xcrun simctl boot "iPhone 16"`
- Clean simulator data if needed: `xcrun simctl erase "iPhone 16"`
- Check available simulators: `xcrun simctl list devices available`

#### Performance Optimization Tips
- Use `--skip-build` for test development and debugging  
- Use `--build` only when app code or configuration changes
- Keep simulator running between test sessions for faster startup

## Environment Variables

Create a `.env` file in the `app` directory with the following configuration (see `app/.env.example` for a template):

```bash
# app/.env

# Auth0 Configuration (required for app builds)
AUTH0_DOMAIN=login-test.pyracloud.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_AUDIENCE=https://api-test.pyracloud.com/
AUTH0_SCOPE=openid profile email offline_access
AUTH0_API_URL=https://api.s1.show/public/
AUTH0_OTP_DIGITS=6
AUTH0_SCHEME=com.softwareone.marketplaceMobile

# Airtable Configuration for OTP Testing (required for OTP automation)
AIRTABLE_EMAIL=marketplaceplatformemailtest@gmail.com
AIRTABLE_API_TOKEN=your_airtable_personal_access_token
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_NAME=your_airtable_table_id
AIRTABLE_FROM_EMAIL=no-reply.test@softwareone.com

# Optional Appium Configuration (auto-detected if not set)
APPIUM_HOST=localhost
APPIUM_PORT=4723
DEVICE_NAME=iPhone 16
PLATFORM_VERSION=26.0
APP_BUNDLE_ID=com.softwareone.marketplaceMobile
```

### Environment Setup Script

Use the automated environment setup script for easy configuration:

```bash
# Load configuration from .env file and set up test environment (iOS default)
source ./scripts/setup-test-env.sh

# Setup for Android
source ./scripts/setup-test-env.sh --platform android

# Start a simulator/emulator by name
source ./scripts/setup-test-env.sh --start-emulator "iPhone 16"
source ./scripts/setup-test-env.sh --platform android --start-emulator "Pixel_8_API_34"

# Start Appium server with inspector plugin
source ./scripts/setup-test-env.sh --start-appium

# Stop Appium server
source ./scripts/setup-test-env.sh --stop-appium

# List available simulators and emulators
source ./scripts/setup-test-env.sh --list-emulators
```

**Available Options:**
- `--platform <ios|android>`: Set the target platform (default: ios)
- `--start-emulator <name>`: Start emulator/simulator by name
- `--start-appium`: Start Appium server with inspector plugin
- `--stop-appium`: Stop all running Appium processes
- `--list-emulators`: List available emulators/simulators
- `--help`: Show help message

### Test Discovery

List all available tests without running them:

```bash
# List all tests
./scripts/run-local-test.sh --list all

# List tests for a specific suite
./scripts/run-local-test.sh --dry-run welcome
./scripts/run-local-test.sh --list spotlight

# List tests for a specific spec file
./scripts/run-local-test.sh --list ./test/specs/navigation.e2e.js
```

This is useful for discovering available tests before running them, or for CI/CD pipelines that need to know test counts.

The setup script will automatically:
- Load values from `app/.env` 
- Detect and optionally start iOS simulators or Android emulators
- Configure platform-specific Appium variables
- Set up Airtable OTP testing variables
- Display current configuration

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
│       ├── base/        # Base classes (base.page.js, list.page.js, footer.page.js)
│       ├── utils/       # Utilities (selectors.js, constants.js)
│       ├── welcome.page.js
│       └── ...
├── test-results/        # Test execution results
└── wdio.conf.js        # WebDriverIO configuration

screenshots/             # Failure screenshots (project root)
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