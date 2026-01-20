# Windows Android Development Environment Setup Plan

**Date:** January 16, 2026  
**Target System:** Windows (Intel MacBook running Windows)  
**Purpose:** Set up Android development and Appium testing environment for MPT Mobile Platform

---

## Overview

This plan outlines the steps to check and install all prerequisites needed for Android development and Appium E2E testing on Windows. The project is a React Native Expo application targeting iOS and Android.

---

## Phase 1: System Prerequisites Check

### 1.1 Run Existing Environment Check Script

First, run the environment setup script to configure and check what's installed:

```batch
cd c:\work\mpt-mobile-platform
scripts\windows\setup-test-env.bat
```

This script will:
- Load environment variables from .env file
- Configure platform-specific settings
- Detect connected devices
- [ ] Node.js
- [ ] Appium with UiAutomator2 driver

**Note down which items are marked as [MISSING] or [INVALID]**

---

## Phase 2: Core Tools Installation

### 2.1 Java 17 (JDK)

**Required:** Java 17 specifically (NOT Java 24+ which is incompatible)

#### Installation Steps:
1. Download from [Eclipse Adoptium](https://adoptium.net/)
   - Select **Windows x64** platform
   - Select **JDK 17 (LTS)**
   - Download MSI installer
2. Run the MSI installer with default options
3. **IMPORTANT:** Check the box to set JAVA_HOME during installation

#### Verification:
```batch
java -version
REM Should show: openjdk version "17.x.x"

echo %JAVA_HOME%
REM Should show your JDK installation path (e.g., C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot)
```

#### Manual JAVA_HOME Setup (if needed):
```batch
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot"
setx PATH "%PATH%;%JAVA_HOME%\bin"
```

---

### 2.2 Node.js 20.x LTS

#### Installation Steps:
1. Download from [https://nodejs.org/](https://nodejs.org/)
   - Select **20.x LTS** version for Windows
   - Download MSI installer
2. Run installer with default options
3. Restart terminal after installation

#### Verification:
```batch
node --version
REM Should show: v20.x.x

npm --version
REM Should show npm version
```

---

### 2.3 Android Studio & SDK

#### Installation Steps:
1. Download [Android Studio](https://developer.android.com/studio)
2. Run installer with default options
3. Complete the setup wizard (this downloads SDK components)
4. SDK will be installed at: `%LOCALAPPDATA%\Android\Sdk`

#### Configure Environment Variables:
```batch
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"
setx PATH "%PATH%;%ANDROID_HOME%\emulator"
setx PATH "%PATH%;%ANDROID_HOME%\cmdline-tools\latest\bin"
```

#### Required SDK Components (via Android Studio SDK Manager):
- [ ] Android SDK Platform 34 (Android 14)
- [ ] Android SDK Build-Tools 34.x
- [ ] Android SDK Platform-Tools
- [ ] Android Emulator
- [ ] Google Play system images (for emulator)

#### Verification:
```batch
adb --version
REM Should show Android Debug Bridge version

emulator -list-avds
REM Should list available emulators
```

---

### 2.4 Create Android Emulator

#### Using Android Studio:
1. Open Android Studio
2. Go to **Tools > Device Manager**
3. Click **Create Device**
4. Select **Pixel 8** (or similar modern device)
5. Select **API 34** system image with Google Play
6. Complete wizard and click **Finish**

#### Using Command Line:
```batch
avdmanager create avd -n Pixel_8_API_34 -k "system-images;android-34;google_apis;x86_64" -d "pixel_8"

REM List emulators to verify
emulator -list-avds

REM Start emulator
emulator -avd Pixel_8_API_34
```

---

## Phase 3: Appium Setup

### 3.1 Install Appium Globally

```batch
npm install -g appium@3.1.1
```

#### Verification:
```batch
appium --version
REM Should show: 3.1.1
```

### 3.2 Install UiAutomator2 Driver

```batch
appium driver install uiautomator2
```

#### Verification:
```batch
appium driver list --installed
REM Should show uiautomator2 in the list
```

---

## Phase 4: Project Setup

### 4.1 Configure NPM Registry for @swo packages

The project uses private packages from SoftwareOne registry:

```batch
cd c:\work\mpt-mobile-platform\app

REM Install authentication tool
npm install -g vsts-npm-auth

REM Authenticate (will prompt for Azure DevOps credentials)
vsts-npm-auth -config .npmrc
```

### 4.2 Install Project Dependencies

```batch
cd c:\work\mpt-mobile-platform\app
npm install
```

### 4.3 Configure Environment File

1. Copy `.env.example` to `.env` in the `app` directory
2. Download Auth0 credentials from [Keeper Vault](https://keepersecurity.eu/vault/)
3. Add Auth0 configuration:
   ```
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_AUDIENCE=your-api-audience
   ```

---

## Phase 5: Build & Test Verification

### 5.1 Start Android Emulator

```batch
emulator -avd Pixel_8_API_34
```

### 5.2 Build and Deploy Android App

```batch
cd c:\work\mpt-mobile-platform

REM Build and deploy using the test script
scripts\windows\run-local-test-android.bat --build welcome
```

Or manually:
```batch
cd c:\work\mpt-mobile-platform\app
npx expo run:android
```

### 5.3 Run E2E Tests

```batch
cd c:\work\mpt-mobile-platform

REM Run welcome test suite
scripts\windows\run-local-test-android.bat welcome

REM Run all tests
scripts\windows\run-local-test-android.bat all

REM Build and run tests
scripts\windows\run-local-test-android.bat --build welcome
```

---

## Phase 6: Final Environment Verification

Run the setup script one more time to confirm everything is configured:

```batch
scripts\windows\setup-test-env.bat
```

Environment should be loaded and device detected.

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Setup environment | `scripts\windows\setup-test-env.bat` |
| List connected devices | `adb devices` |
| List emulators | `scripts\windows\setup-test-env.bat --list-emulators` |
| Start emulator | `scripts\windows\setup-test-env.bat --start-emulator Pixel_8_API_34` |
| Build and test | `scripts\windows\run-local-test-android.bat --build welcome` |
| Run tests | `scripts\windows\run-local-test-android.bat welcome` |
| Run all tests | `scripts\windows\run-local-test-android.bat all` |
| Install Appium | `npm install -g appium@3.1.1` |
| Install UiAutomator2 | `appium driver install uiautomator2` |

---

## Troubleshooting

### Java Issues

**"JAVA_HOME is not set"**
```batch
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
```

**"Unsupported class file major version 68"**  
This means you're using Java 24+. Install Java 17 instead.

### Android SDK Issues

**"ANDROID_HOME is not set"**
```batch
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
```

**"ADB not found"**
- Ensure Android SDK Platform-Tools are installed via Android Studio SDK Manager
- Verify path: `%ANDROID_HOME%\platform-tools\adb.exe`

### Emulator Issues

**"No emulators found"**
- Open Android Studio > Tools > Device Manager
- Create a new virtual device

**Emulator won't start on Intel MacBook**
- Intel Macs running Windows may have HAXM issues
- Ensure Intel HAXM is installed: Android Studio > SDK Manager > SDK Tools > Intel x86 Emulator Accelerator (HAXM)
- Check virtualization is enabled in BIOS/EFI

### Appium Issues

**"UiAutomator2 driver not installed"**
```batch
appium driver install uiautomator2
```

---

## Installation Checklist Summary

- [ ] Java 17 JDK installed (NOT Java 24+)
- [ ] JAVA_HOME environment variable set
- [ ] Node.js 20.x LTS installed
- [ ] Android Studio installed
- [ ] Android SDK installed (ANDROID_HOME set)
- [ ] ADB available in PATH
- [ ] Android Emulator created
- [ ] Appium 3.1.1 installed globally
- [ ] UiAutomator2 driver installed
- [ ] vsts-npm-auth configured for @swo packages
- [ ] Project dependencies installed (`npm install`)
- [ ] `.env` file configured with Auth0 credentials
- [ ] App builds and deploys successfully
- [ ] E2E tests run successfully

---

## Related Documentation

- [LOCAL_BUILD_ANDROID.md](../LOCAL_BUILD_ANDROID.md) - Android build guide
- [APPIUM_ANDROID_TESTING.md](../APPIUM_ANDROID_TESTING.md) - Appium testing guide (macOS/Linux focused)
- [README.md](../../README.md) - Project overview and quick setup
