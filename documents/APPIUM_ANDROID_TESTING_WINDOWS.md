# Appium Android Testing Guide (Windows)

This guide covers how to set up and run Appium tests for Android on Windows. It provides Windows-specific instructions for building, deploying, and testing the Android application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)
- [Scripts Reference](#scripts-reference)
- [Troubleshooting](#troubleshooting)
- [CI/CD Considerations](#cicd-considerations)

---

## Prerequisites

- **Windows 10/11** (64-bit)
- **Android Studio** or Android SDK Command-line Tools
- **Java Development Kit (JDK) 17** (NOT Java 24+ which is incompatible)
- **Node.js** (version 20.x or later)
- **Android device or emulator**
- **USB drivers** (for physical device testing)

---

## Quick Start

### 🚀 Fastest Workflow

```batch
REM 1. First time: Verify your environment
scripts\windows\setup-android-env.bat

REM 2. Create .env file in app\ directory with Auth0 configuration
REM See app\.env for required variables

REM 3. Build and test (first run)
scripts\windows\run-local-test-android.bat --build welcome

REM 4. Fast iteration (subsequent runs)
scripts\windows\run-local-test-android.bat --skip-build welcome

REM 5. Run all tests
scripts\windows\run-local-test-android.bat all
```

### ⚡ Development Workflow

| Scenario | Command |
|----------|---------|
| Check environment | `scripts\windows\setup-android-env.bat` |
| Build + test | `scripts\windows\run-local-test-android.bat --build welcome` |
| Reuse last build | `scripts\windows\run-local-test-android.bat --skip-build welcome` |
| Test specific file | `scripts\windows\run-local-test-android.bat .\test\specs\welcome.e2e.js` |
| Run all tests | `scripts\windows\run-local-test-android.bat all` |

---

## Environment Setup

### 1. Install Java 17

Java 17 is required for Android development. Java 24+ is NOT compatible.

#### Option A: Eclipse Adoptium (Recommended)

1. Download from [Eclipse Adoptium](https://adoptium.net/)
2. Select **Temurin 17 (LTS)** for Windows x64
3. Run the MSI installer
4. During installation, check "Set JAVA_HOME variable"

#### Option B: Manual Installation

1. Download and install JDK 17
2. Set environment variables:

```batch
REM Set JAVA_HOME (adjust path to your installation)
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.10+7-hotspot"

REM Add to PATH
setx PATH "%PATH%;%JAVA_HOME%\bin"
```

#### Verify Installation

```batch
java -version
REM Should show: openjdk version "17.x.x"

echo %JAVA_HOME%
REM Should show your JDK installation path
```

### 2. Install Android SDK

#### Option A: Android Studio (Recommended)

1. Download [Android Studio](https://developer.android.com/studio)
2. Run installer with default settings
3. Complete the setup wizard (downloads SDK components)
4. SDK will be installed at: `%LOCALAPPDATA%\Android\Sdk`

#### Option B: Command-line Tools Only

1. Download [Command-line tools](https://developer.android.com/studio#command-tools)
2. Extract to `C:\Android\cmdline-tools\latest`
3. Install required components:

```batch
cd C:\Android\cmdline-tools\latest\bin
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager "system-images;android-34;google_apis;x86_64"
sdkmanager --licenses
```

#### Set Environment Variables

```batch
REM Set ANDROID_HOME
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

REM Add tools to PATH
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%ANDROID_HOME%\cmdline-tools\latest\bin"
```

#### Verify Installation

```batch
adb --version
REM Should show Android Debug Bridge version

emulator -list-avds
REM Should list available emulators (may be empty initially)
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

```batch
REM Create emulator
avdmanager create avd -n Pixel_8_API_34 -k "system-images;android-34;google_apis;x86_64" -d "pixel_8"

REM List emulators to verify
emulator -list-avds
```

### 4. Install Node.js

1. Download from [nodejs.org](https://nodejs.org/)
2. Install the **LTS version** (20.x)
3. Verify installation:

```batch
node --version
npm --version
```

### 5. Install Appium

```batch
REM Install Appium globally
npm install -g appium@3.1.1

REM Install UiAutomator2 driver for Android
appium driver install uiautomator2

REM Verify installation
appium --version
appium driver list --installed
```

### 6. USB Debugging (Physical Devices)

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

4. **Install USB Drivers** (if needed):
   - For Google devices: [Google USB Driver](https://developer.android.com/studio/run/win-usb)
   - For other manufacturers: Check manufacturer's website

5. **Verify Connection**:
   ```batch
   adb devices
   REM Should show your device with "device" status
   ```

### 7. Verify Environment

Run the setup helper to check everything:

```batch
scripts\windows\setup-android-env.bat
```

This will verify:
- ✅ Java installation and version
- ✅ JAVA_HOME environment variable
- ✅ Android SDK installation
- ✅ ADB availability
- ✅ Node.js installation
- ✅ Appium and UiAutomator2 driver
- ✅ Connected devices and available emulators

---

## Running Tests

### Using Batch Script

The primary way to run tests on Windows:

```batch
REM Run specific test suite
scripts\windows\run-local-test-android.bat welcome

REM Run all tests
scripts\windows\run-local-test-android.bat all

REM Run specific spec file
scripts\windows\run-local-test-android.bat .\test\specs\welcome.e2e.js

REM Build and run (when you've made app changes)
scripts\windows\run-local-test-android.bat --build welcome

REM Skip build, reuse last APK (fast iteration)
scripts\windows\run-local-test-android.bat --skip-build welcome

REM Use specific emulator
scripts\windows\run-local-test-android.bat --emulator Pixel_8_API_34 welcome
```

### Using PowerShell

Alternative with better error handling:

```powershell
# Run specific suite (uses .env file for Auth0 config)
.\scripts\windows\run-local-test-android.ps1 welcome

# Skip build, reuse last APK
.\scripts\windows\run-local-test-android.ps1 -SkipBuild welcome

# Use specific emulator
.\scripts\windows\run-local-test-android.ps1 -EmulatorName "Pixel_8_API_34" welcome

# Build and run (requires .env file with Auth0 configuration)
.\scripts\windows\run-local-test-android.ps1 -Build welcome
```

> **Note:** The PowerShell script supports legacy `-Environment` and `-ClientId` parameters for backwards compatibility, but the recommended approach is to configure Auth0 settings in the `.env` file in the `app\` directory.

### Manual Testing Workflow

For more control over the process:

```batch
REM 1. Build the APK
scripts\windows\deploy-android.bat

REM 2. Start Appium server (in separate terminal)
appium --address 127.0.0.1 --port 4723

REM 3. Run tests
cd app
set PLATFORM_NAME=Android
npx wdio run wdio.conf.js --suite welcome
```

---

## Scripts Reference

### `scripts\windows\run-local-test-android.bat`

Main testing script that handles the complete workflow.

**Prerequisites:** .env file must exist in app\ directory with Auth0 configuration

| Option | Description |
|--------|-------------|
| `--build`, `-b` | Build the app before testing |
| `--skip-build`, `-s` | Install existing APK from last build |
| `--emulator` | Specify emulator AVD name to start |
| `--verbose`, `-v` | Enable verbose output |
| `--help`, `-h` | Show help message |

### `scripts\windows\deploy-android.bat`

Builds and deploys the Android app.

**Prerequisites:** .env file must exist in app\ directory with Auth0 configuration

| Option | Description |
|--------|-------------|
| `--release`, `-r` | Build release version |
| `--debug`, `-d` | Build debug version (default) |
| `--emulator` | Specify emulator to start |
| `--verbose`, `-v` | Enable verbose output |

### `scripts\windows\setup-android-env.bat`

Checks and validates your development environment.

### `scripts\windows\run-local-test-android.ps1`

PowerShell alternative to the batch script with enhanced error handling.

| Parameter | Description |
|-----------|-------------|
| `-Build` | Build the app before testing (requires `.env` file) |
| `-SkipBuild` | Skip build and install existing APK from last build |
| `-EmulatorName` | Specify emulator AVD name to start |
| `TestTarget` | Suite name, spec file, or 'all' (required) |

---

## Troubleshooting

### Java Issues

#### "JAVA_HOME is not set"

```batch
REM Find your Java installation
where java

REM Set JAVA_HOME (adjust path as needed)
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.10+7-hotspot"

REM Restart your terminal
```

#### "Unsupported class file major version 68"

This means you're using Java 24+. Install Java 17:

```batch
REM 1. Install Java 17 from Adoptium
REM 2. Set JAVA_HOME to Java 17 path
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.10+7-hotspot"

REM 3. Stop Gradle daemons
cd app\android
gradlew --stop

REM 4. Clean and rebuild
gradlew clean
```

### Android SDK Issues

#### "ANDROID_HOME is not set"

```batch
REM Set ANDROID_HOME (adjust if you installed SDK elsewhere)
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

REM Add to PATH
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"

REM Restart your terminal
```

#### "adb is not recognized"

```batch
REM Check if adb exists
dir %ANDROID_HOME%\platform-tools\adb.exe

REM Add platform-tools to PATH
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"

REM Or use full path
%ANDROID_HOME%\platform-tools\adb devices
```

### Device Issues

#### Device not detected

1. Check USB cable and try different port
2. Ensure USB Debugging is enabled
3. Revoke and re-authorize USB debugging:
   - Settings > Developer Options > Revoke USB debugging authorizations
   - Disconnect and reconnect device
   - Accept authorization prompt

4. Install manufacturer USB drivers
5. Try:
   ```batch
   adb kill-server
   adb start-server
   adb devices
   ```

#### "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

```batch
REM Uninstall existing app first
adb uninstall com.softwareone.marketplaceMobile

REM Then install new APK
adb install path\to\app.apk
```

### Emulator Issues

#### Emulator won't start

1. **Enable virtualization** in BIOS (Intel VT-x or AMD-V)
2. **Install HAXM** (Intel) or enable **Windows Hypervisor Platform**:
   - Control Panel > Programs > Turn Windows features on or off
   - Check "Windows Hypervisor Platform"
   - Restart computer

3. **Try with software rendering**:
   ```batch
   emulator -avd YOUR_AVD -gpu swiftshader_indirect
   ```

#### Emulator is slow

1. Use x86_64 system image instead of ARM
2. Allocate more RAM to emulator
3. Enable GPU acceleration in AVD settings
4. Close other heavy applications

### Appium Issues

#### "Appium not found"

```batch
REM Install Appium globally
npm install -g appium@3.1.1

REM Verify it's in PATH
where appium
```

#### "UiAutomator2 driver not found"

```batch
REM Install the driver
appium driver install uiautomator2

REM Verify installation
appium driver list --installed
```

#### Appium fails to start session

1. Check device is connected: `adb devices`
2. Verify app is installed: `adb shell pm list packages | findstr softwareone`
3. Check Appium logs for specific error
4. Try clearing app data: `adb shell pm clear com.softwareone.marketplaceMobile`

### PowerShell Execution Policy

If you get an execution policy error:

```powershell
# Check current policy
Get-ExecutionPolicy

# Allow local scripts (for current user only)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run script with bypass
powershell -ExecutionPolicy Bypass -File .\scripts\windows\run-local-test-android.ps1 welcome
```

### Build Issues

#### Gradle build fails

```batch
cd app\android

REM Stop Gradle daemons
gradlew --stop

REM Clean project
gradlew clean

REM Try build again with more memory
set GRADLE_OPTS=-Xmx4096m
gradlew assembleDebug
```

#### "SDK location not found"

Create `app\android\local.properties`:

```properties
sdk.dir=C:\\Users\\YourUser\\AppData\\Local\\Android\\Sdk
```

---

## CI/CD Considerations

### GitHub Actions Windows Runner

While Windows runners can be used for Android testing, there are trade-offs:

**Pros:**
- Native Windows environment
- Good for Windows-specific testing
- Access to Windows tools

**Cons:**
- Slower emulator startup (no hardware acceleration in most runners)
- Higher cost than Linux runners
- Longer build times

**Recommendation:** Use **macOS runners** for Android CI/CD testing when possible, as they provide better emulator performance with hardware acceleration.

### Example Windows Workflow

If you need Windows-based CI/CD:

```yaml
name: Android E2E Tests (Windows)

on:
  workflow_dispatch:

jobs:
  test:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
      
      - name: Install dependencies
        run: |
          cd app
          npm ci
      
      - name: Install Appium
        run: |
          npm install -g appium@3.1.1
          appium driver install uiautomator2
      
      # Note: Emulator setup on Windows CI is complex
      # Consider using macOS runners instead
```

---

## Environment Variables Reference

| Variable | Description | Default/Example |
|----------|-------------|-----------------|
| `JAVA_HOME` | JDK installation path | `C:\Program Files\Eclipse Adoptium\jdk-17.0.10+7-hotspot` |
| `ANDROID_HOME` | Android SDK path | `%LOCALAPPDATA%\Android\Sdk` |
| `PLATFORM_NAME` | Target platform | `Android` |
| `DEVICE_UDID` | Device identifier | Auto-detected |
| `APP_PACKAGE` | Android app package | `com.softwareone.marketplaceMobile` |
| `APP_ACTIVITY` | Main activity | `.MainActivity` |
| `APPIUM_HOST` | Appium server host | `127.0.0.1` |
| `APPIUM_PORT` | Appium server port | `4723` |

---

## Useful Commands

```batch
REM === Device Management ===
adb devices                              REM List connected devices
adb shell getprop ro.product.model       REM Get device model
adb shell getprop ro.build.version.sdk   REM Get Android API level

REM === App Management ===
adb install path\to\app.apk              REM Install APK
adb install -r path\to\app.apk           REM Replace existing app
adb uninstall com.package.name           REM Uninstall app
adb shell pm list packages               REM List installed packages
adb shell pm clear com.package.name      REM Clear app data

REM === Emulator ===
emulator -list-avds                      REM List available emulators
emulator -avd AVD_NAME                   REM Start emulator
emulator -avd AVD_NAME -no-audio         REM Start without audio

REM === Debugging ===
adb logcat                               REM View device logs
adb logcat | findstr "ReactNative"       REM Filter React Native logs
adb shell screencap /sdcard/screen.png   REM Take screenshot
adb pull /sdcard/screen.png              REM Pull file from device

REM === Appium ===
appium --version                         REM Check Appium version
appium driver list --installed           REM List installed drivers
appium --address 127.0.0.1 --port 4723   REM Start Appium server
```

---

## Related Documentation

- [LOCAL_BUILD_ANDROID.md](./LOCAL_BUILD_ANDROID.md) - Android build guide
- [APPIUM_IOS_TESTING.md](./APPIUM_IOS_TESTING.md) - iOS testing guide (macOS)
- [EXTENDING_TEST_FRAMEWORK.md](./EXTENDING_TEST_FRAMEWORK.md) - Adding new tests

---

**Note**: This guide focuses on Windows-specific setup and commands. For cross-platform test architecture and writing tests, see the main testing documentation.
