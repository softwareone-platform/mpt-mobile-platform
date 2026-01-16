# Appium Android Testing Guide

This guide covers how to run Appium tests for Android on macOS and Linux. It provides cross-platform instructions for building, deploying, and testing the Android application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **macOS or Linux** (recommended for Android testing)
- **Android Studio** or Android SDK Command-line Tools
- **Java Development Kit (JDK) 17** (NOT Java 24+ which is incompatible)
- **Node.js** (version 20.x or later)
- **Android device or emulator**
- **Appium** with UiAutomator2 driver

---

## Quick Start

### 🚀 Fastest Workflow

```bash
# 1. Install UiAutomator2 driver (one-time setup)
appium driver install uiautomator2

# 2. Create .env file in app/ directory with Auth0 configuration
# See app/.env for required variables

# 3. Start an Android emulator or connect a device
emulator -avd YOUR_EMULATOR_NAME

# 4. Build and test (first run)
./scripts/deploy-android.sh
./scripts/run-local-test.sh --platform android welcome

# 5. Fast iteration (subsequent runs)
./scripts/run-local-test.sh --platform android welcome

# 6. Run all tests
./scripts/run-local-test.sh --platform android all
```

### ⚡ Development Workflow

| Scenario | Command |
|----------|---------|  
| Check environment | Check Android SDK and adb are available |
| Build + test | `./scripts/run-local-test.sh --platform android --build welcome` |
| Reuse installed app | `./scripts/run-local-test.sh --platform android welcome` |
| Test specific file | `./scripts/run-local-test.sh --platform android ./test/specs/welcome.e2e.js` |
| Run all tests | `./scripts/run-local-test.sh --platform android all` |
| Test from artifact | `./scripts/run-local-test.sh --platform android --build-from-artifact URL welcome` |

---

## Environment Setup

### 1. Install Java 17

Java 17 is required for Android development. Java 24+ is NOT compatible.

#### macOS (using Homebrew):

```bash
brew install --cask zulu@17
```

#### Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

#### Verify Installation:

```bash
java -version
# Should show: openjdk version "17.x.x"

echo $JAVA_HOME
# Should show your JDK installation path
```

### 2. Install Android SDK

#### Option A: Android Studio (Recommended)

1. Download [Android Studio](https://developer.android.com/studio)
2. Run installer with default settings
3. Complete the setup wizard (downloads SDK components)
4. SDK will be installed at:
   - macOS: `$HOME/Library/Android/sdk`
   - Linux: `$HOME/Android/Sdk`

#### Option B: Command-line Tools Only

```bash
# Download command-line tools from https://developer.android.com/studio#command-tools
# Extract to appropriate directory

# macOS
mkdir -p ~/Library/Android/sdk/cmdline-tools
cd ~/Library/Android/sdk/cmdline-tools
# Move extracted files to 'latest' directory

# Linux
mkdir -p ~/Android/Sdk/cmdline-tools
cd ~/Android/Sdk/cmdline-tools
# Move extracted files to 'latest' directory

# Install required components
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager "system-images;android-34;google_apis;arm64-v8a"
sdkmanager --licenses
```

#### Set Environment Variables

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# macOS
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# Linux
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Reload your shell:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

#### Verify Installation

```bash
adb --version
# Should show Android Debug Bridge version

emulator -list-avds
# Should list available emulators (may be empty initially)
```

### 3. Create Android Emulator (Optional)

If you don't have a physical device, create an emulator:

#### Using Android Studio

1. Open Android Studio
2. Go to **Tools > Device Manager**
3. Click **Create Device**
4. Select **Pixel 8** (or similar)
5. Select **API 34** system image
6. Complete wizard and click **Finish**

#### Using Command Line

```bash
# Create emulator
avdmanager create avd -n Pixel_8_API_34 -k "system-images;android-34;google_apis;arm64-v8a" -d "pixel_8"

# List emulators to verify
emulator -list-avds

# Start emulator
emulator -avd Pixel_8_API_34
```

### 4. Install Node.js

```bash
# macOS
brew install node@20

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 5. Install Appium

```bash
# Install Appium globally
npm install -g appium@3.1.1

# Install UiAutomator2 driver for Android
appium driver install uiautomator2

# Verify installation
appium --version
appium driver list --installed
```

### 6. Physical Device Setup (Optional)

To test on a physical Android device:

1. **Enable Developer Options**:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   
2. **Enable USB Debugging**:
   - Go to Settings > Developer Options
   - Enable "USB Debugging"
   
3. **Connect Device**:
   - Connect via USB cable
   - Accept the "Allow USB debugging?" prompt
   - Check "Always allow from this computer"

4. **Verify Connection**:
   ```bash
   adb devices
   # Should show your device with "device" status
   ```

---

## Running Tests

### Using the Test Script

The primary way to run tests on Android:

```bash
# Run specific test suite
./scripts/run-local-test.sh --platform android welcome

# Run all tests
./scripts/run-local-test.sh --platform android all

# Run specific spec file
./scripts/run-local-test.sh --platform android ./test/specs/welcome.e2e.js

# Build and run (when you've made app changes)
./scripts/run-local-test.sh --platform android --build welcome

# Download APK from artifact URL and run tests
./scripts/run-local-test.sh --platform android --build-from-artifact https://example.com/app.apk welcome

# Use verbose output for debugging
./scripts/run-local-test.sh --platform android --verbose welcome
```

### Using NPM Scripts

From the `app` directory:

```bash
# Set platform environment variable and run tests
cd app
npm run test:e2e:android

# Run specific suite
PLATFORM_NAME=Android npx wdio run wdio.conf.js --suite welcome
```

### Manual Testing Workflow

For more control over the process:

```bash
# 1. Build and deploy the app
./scripts/deploy-android.sh

# 2. Start Appium server (in separate terminal)
appium --address 127.0.0.1 --port 4723

# 3. Run tests
cd app
export PLATFORM_NAME=Android
npx wdio run wdio.conf.js --suite welcome
```

### Environment Setup Script

Use the automated environment setup script for easy configuration:

```bash
# Setup environment for Android
source ./scripts/setup-test-env.sh --platform android

# Start an emulator by name
source ./scripts/setup-test-env.sh --platform android --start-emulator "Pixel_8_API_34"

# List available emulators
source ./scripts/setup-test-env.sh --list-emulators
```

**Available Options:**
- `--platform <ios|android>`: Set the target platform (default: ios)
- `--start-emulator <name>`: Start emulator by AVD name
- `--list-emulators`: List available emulators
- `--help`: Show help message

The setup script will automatically:
- Load values from `app/.env`
- Start Android emulator if requested
- Configure platform-specific Appium variables
- Set up Airtable OTP testing variables
- Display current configuration

---

## CI/CD Integration

### GitHub Actions Workflow

The project includes a GitHub Actions workflow for Android E2E testing at `.github/workflows/android-build-and-test.yml`. The workflow:

- Runs on Ubuntu runners with KVM hardware acceleration enabled
- Sets up Android SDK and Java 17
- Creates and starts an Android emulator with optimized CI settings
- Builds the app (Release or Debug mode)
- Runs Appium tests with UiAutomator2 driver
- Uploads test results and screenshots as artifacts
- Creates a GitHub Release with the APK for easy download

#### Key Features

- **KVM Acceleration**: Enables hardware virtualization for fast emulator boot
- **Composite Actions**: Modular `android-install` and `android-test` actions for reusability
- **Artifact Management**: APK uploaded as artifact and GitHub Release
- **Airtable Integration**: OTP codes retrieved for authentication testing
- **ReportPortal Integration**: Optional test reporting dashboard

#### Triggering the Workflow

The workflow triggers on:
- Manual dispatch via GitHub Actions UI (workflow_dispatch)
- Can be called from other workflows (workflow_call)

#### Viewing Results

1. Go to the **Actions** tab in GitHub
2. Select the **Android Build and Appium Tests** workflow
3. View test results and download artifacts

#### Why Ubuntu Instead of Windows/macOS?

- **Ubuntu with KVM** is 2-3x faster and more cost-effective than macOS runners
- Windows runners lack nested virtualization support for Android emulators on GitHub Actions
- KVM provides native hardware acceleration on Ubuntu larger runners

---

## Troubleshooting

### Java Issues

#### "JAVA_HOME is not set"

```bash
# Find your Java installation
which java

# Set JAVA_HOME (add to ~/.zshrc or ~/.bashrc)
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home

# Reload shell
source ~/.zshrc
```

#### "Unsupported class file major version 68"

This means you're using Java 24+. Install Java 17:

```bash
# macOS
brew install --cask zulu@17

# Set JAVA_HOME to Java 17
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
```

### Android SDK Issues

#### "ANDROID_HOME is not set"

```bash
# macOS
export ANDROID_HOME=$HOME/Library/Android/sdk

# Linux
export ANDROID_HOME=$HOME/Android/Sdk

# Add to PATH
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload shell
source ~/.zshrc
```

#### "adb not found"

```bash
# Check if adb exists
ls $ANDROID_HOME/platform-tools/adb

# Add platform-tools to PATH
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Or use full path
$ANDROID_HOME/platform-tools/adb devices
```

### Device Issues

#### Device not detected

```bash
# 1. Check USB cable and try different port
# 2. Ensure USB Debugging is enabled on device
# 3. Revoke and re-authorize USB debugging:
#    Settings > Developer Options > Revoke USB debugging authorizations

# 4. Restart adb
adb kill-server
adb start-server
adb devices
```

#### "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

```bash
# Uninstall existing app first
adb uninstall com.softwareone.marketplaceMobile

# Then reinstall
./scripts/deploy-android.sh
```

### Emulator Issues

#### Emulator won't start

```bash
# 1. Check available emulators
emulator -list-avds

# 2. Start with verbose output
emulator -avd YOUR_AVD -verbose

# 3. Try with software rendering
emulator -avd YOUR_AVD -gpu swiftshader_indirect

# 4. Check if hardware virtualization is enabled (Linux)
egrep -c '(vmx|svm)' /proc/cpuinfo
# Should return > 0
```

#### Emulator is slow

1. Use ARM64 system image on Apple Silicon Macs
2. Allocate more RAM to emulator (edit AVD settings)
3. Enable hardware acceleration
4. Close other heavy applications

### Appium Issues

#### "Appium not found"

```bash
# Install Appium globally
npm install -g appium@3.1.1

# Verify installation
which appium
appium --version
```

#### "UiAutomator2 driver not found"

```bash
# Install the driver
appium driver install uiautomator2

# Verify installation
appium driver list --installed
```

#### Appium fails to start session

```bash
# 1. Check device is connected
adb devices

# 2. Verify app is installed
adb shell pm list packages | grep softwareone

# 3. Check Appium logs for specific error
appium --log-level debug

# 4. Try clearing app data
adb shell pm clear com.softwareone.marketplaceMobile
```

### Build Issues

#### Gradle build fails

```bash
cd app/android

# Stop Gradle daemons
./gradlew --stop

# Clean project
./gradlew clean

# Try build again
./gradlew assembleDebug
```

#### "SDK location not found"

Create `app/android/local.properties`:

```properties
sdk.dir=/Users/YOUR_USER/Library/Android/sdk
```

---

## Environment Variables Reference

| Variable | Description | Default/Example |
|----------|-------------|-----------------|
| `JAVA_HOME` | JDK installation path | `/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home` |
| `ANDROID_HOME` | Android SDK path | `$HOME/Library/Android/sdk` |
| `PLATFORM_NAME` | Target platform | `Android` |
| `DEVICE_UDID` | Device identifier | Auto-detected |
| `APP_PACKAGE` | Android app package | `com.softwareone.marketplaceMobile` |
| `APP_ACTIVITY` | Main activity | `.MainActivity` |
| `APPIUM_HOST` | Appium server host | `127.0.0.1` |
| `APPIUM_PORT` | Appium server port | `4723` |

---

## Useful Commands

```bash
# === Device Management ===
adb devices                              # List connected devices
adb shell getprop ro.product.model       # Get device model
adb shell getprop ro.build.version.sdk   # Get Android API level

# === App Management ===
adb install path/to/app.apk              # Install APK
adb install -r path/to/app.apk           # Replace existing app
adb uninstall com.package.name           # Uninstall app
adb shell pm list packages               # List installed packages
adb shell pm clear com.package.name      # Clear app data

# === Emulator ===
emulator -list-avds                      # List available emulators
emulator -avd AVD_NAME                   # Start emulator
emulator -avd AVD_NAME -no-audio         # Start without audio

# === Debugging ===
adb logcat                               # View device logs
adb logcat | grep ReactNative            # Filter React Native logs
adb shell screencap /sdcard/screen.png   # Take screenshot
adb pull /sdcard/screen.png              # Pull file from device

# === Appium ===
appium --version                         # Check Appium version
appium driver list --installed           # List installed drivers
appium --address 127.0.0.1 --port 4723   # Start Appium server
```

---

## Related Documentation

- [APPIUM_IOS_TESTING.md](./APPIUM_IOS_TESTING.md) - iOS testing guide
- [EXTENDING_TEST_FRAMEWORK.md](./EXTENDING_TEST_FRAMEWORK.md) - Adding new tests
- [TEST_ELEMENT_IDENTIFICATION_STRATEGY.md](./TEST_ELEMENT_IDENTIFICATION_STRATEGY.md) - TestID strategy

