# Android Build and Test Workflow Implementation Plan

**Created:** December 15, 2025  
**Updated:** December 16, 2025  
**Status:** Phase 1 & 2 Complete - Fixing Architecture Issues  
**Branch:** `feature/android-test-workflows`

## Implementation Status

### ✅ Phase 1: Ubuntu Runner - COMPLETE (Updated from macOS)

**Note:** Switched from macOS to Ubuntu runners due to architecture mismatch. GitHub's macOS runners are now ARM64 (Apple Silicon) which cannot run x86_64 Android emulators.

| File | Status | Description |
|------|--------|-------------|
| `.github/workflows/android-build-and-test.yml` | ✅ Created | Main orchestration workflow (Ubuntu) |
| `.github/actions/android-install/action.yml` | ✅ Created | Emulator setup + APK install (with KVM) |
| `.github/actions/android-test/action.yml` | ✅ Created | Appium + WDIO testing |

### ✅ Phase 2: Windows Runner - COMPLETE

| File | Status | Description |
|------|--------|-------------|
| `.github/workflows/android-build-and-test-windows.yml` | ✅ Created | Windows orchestration |
| `.github/actions/android-install-windows/action.yml` | ✅ Created | Windows emulator setup (PowerShell) |
| `.github/actions/android-test-windows/action.yml` | ✅ Created | Windows Appium testing (PowerShell) |

### 🔧 Architecture Fix Applied

**Problem:** Initial implementation used `macos-latest` which runs on ARM64 (Apple Silicon). The x86_64 Android emulator cannot run on ARM64 hosts without translation.

**Error:** `FATAL | Avd's CPU Architecture 'x86_64' is not supported by the QEMU2 emulator on aarch64 host`

**Solution:** 
- Switched both build and test jobs to `ubuntu-latest` 
- Added KVM acceleration enablement step for Ubuntu
- Ubuntu runners are x86_64, allowing native emulator execution

### Key Windows Adaptations

| Aspect | macOS | Windows |
|--------|-------|---------|
| Shell | bash | PowerShell (pwsh) |
| Path handling | `$ANDROID_HOME/...` | `Join-Path $env:ANDROID_HOME ...` |
| Process background | `&` | `Start-Process -PassThru -NoNewWindow` |
| String parsing | grep/sed | `Select-String`, regex |
| File output | `echo >> file` | `Out-File -Append` |
| HTTP requests | `curl` | `Invoke-WebRequest` |
| Process kill | `kill` | `Stop-Process` |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Lessons Learned from iOS Implementation](#lessons-learned-from-ios-implementation)
3. [Architecture Overview](#architecture-overview)
4. [Phase 1: macOS Runner Implementation](#phase-1-macos-runner-implementation)
5. [Phase 2: Windows Runner Implementation](#phase-2-windows-runner-implementation)
6. [Critical Checkpoints and Validation](#critical-checkpoints-and-validation)
7. [Implementation Checklist](#implementation-checklist)
8. [Risk Mitigation](#risk-mitigation)

---

## Executive Summary

This plan outlines the creation of Android build and test workflows mirroring the iOS implementation. The goal is to create reliable, maintainable CI/CD pipelines that:

1. Build Android APKs (Debug/Release)
2. Install APKs on Android Emulators
3. Run Appium tests with UiAutomator2 driver
4. Support both macOS and Windows runners

### Key Files to Create

```
.github/
├── workflows/
│   ├── android-build-and-test.yml          # Main orchestration (macOS)
│   └── android-build-and-test-windows.yml  # Windows-specific (Phase 2)
├── actions/
│   ├── android-install/
│   │   └── action.yml                      # Emulator setup + APK install
│   ├── android-test/
│   │   └── action.yml                      # Appium + WDIO tests
│   ├── android-install-windows/            # Phase 2
│   │   └── action.yml
│   └── android-test-windows/               # Phase 2
│       └── action.yml
```

---

## Lessons Learned from iOS Implementation

### Critical Issues Encountered (Apply to Android)

#### 1. Build Output Verification ⚠️ HIGH PRIORITY

**iOS Problem:** Build output existed but with wrong contents, zip file structure issues, `.app` bundle not found after unzip.

**Android Mitigation:**
- **Simplification:** APK files are single files, not bundles - **NO ZIP NEEDED**
- Upload APK directly as artifact (no bundling/unbundling complexity)
- Verify APK exists and has correct size before upload
- Verify APK can be parsed (`aapt dump badging` to extract package name)

```yaml
# Verification step - MUST include
- name: Verify APK artifact
  run: |
    APK_PATH=$(find android/app/build/outputs/apk -name "*.apk" | head -1)
    if [ ! -f "$APK_PATH" ]; then
      echo "❌ APK not found"
      exit 1
    fi
    
    # Verify APK is valid and extract package info
    $ANDROID_HOME/build-tools/*/aapt dump badging "$APK_PATH" | head -5
    
    # Verify minimum size (should be at least few MB)
    SIZE=$(stat -f%z "$APK_PATH" 2>/dev/null || stat -c%s "$APK_PATH")
    if [ "$SIZE" -lt 1000000 ]; then
      echo "❌ APK suspiciously small: $SIZE bytes"
      exit 1
    fi
    echo "✅ APK verified: $APK_PATH ($SIZE bytes)"
```

#### 2. Simulator/Emulator State Management ⚠️ HIGH PRIORITY

**iOS Problem:** Simulator boot timing issues, boot reported complete but UI services not ready, xcrun simctl reporting wrong states.

**Android Mitigation:**
- Use multiple readiness indicators (not just `boot_completed`)
- Explicit wait between state transitions
- State verification after EACH step

```yaml
# Emulator boot verification - CRITICAL sequence
BOOT_CHECKS:
  1. adb wait-for-device                    # Device visible to ADB
  2. getprop sys.boot_completed == 1        # System boot done
  3. getprop init.svc.bootanim == stopped   # Boot animation finished
  4. pm list packages (succeeds)            # Package manager ready
  5. input keyevent 82 (unlock screen)      # UI responsive
```

**State verification after each step:**
```bash
# After AVD creation
avdmanager list avd | grep "Name:"  # Verify AVD exists

# After emulator start
adb devices | grep "emulator-"      # Verify device visible

# After boot
adb shell getprop sys.boot_completed  # Must return "1"

# After APK install
adb shell pm list packages | grep "$PACKAGE_NAME"  # Verify installed

# After app launch
adb shell dumpsys activity activities | grep "$PACKAGE_NAME"  # Verify running
```

#### 3. Appium Connection Issues ⚠️ HIGH PRIORITY

**iOS Problem:** Appium server started but WDIO couldn't connect, URL mismatch between what Appium reported and what WDIO used.

**Android Mitigation:**
- Extract ACTUAL listening URL from Appium logs
- Pass verified URL to WDIO via environment variables
- Test connection BEFORE running tests

```yaml
# Appium startup with URL verification
- name: Start Appium Server
  run: |
    appium --log-level info --log appium.log &
    sleep 10
    
    # Extract the actual URL Appium is listening on
    APPIUM_URL=$(grep -E "Appium REST http interface listener started on" appium.log | \
                 sed 's/.*started on //' | head -1)
    
    if [ -z "$APPIUM_URL" ]; then
      APPIUM_URL="http://127.0.0.1:4723"
    fi
    
    echo "VERIFIED_APPIUM_URL=$APPIUM_URL" >> $GITHUB_ENV
    
    # Test the connection
    curl -f "$APPIUM_URL/status" || exit 1
    echo "✅ Appium verified at: $APPIUM_URL"

- name: Run Tests
  env:
    APPIUM_HOST: ${{ env.VERIFIED_APPIUM_HOST }}
    APPIUM_PORT: ${{ env.VERIFIED_APPIUM_PORT }}
  run: |
    npx wdio run wdio.conf.js --suite welcome
```

#### 4. Timing and Timeouts

**iOS Problem:** Operations timing out or completing before system was actually ready.

**Android Mitigation:**
- Conservative timeouts for emulator operations
- Explicit sleeps between state transitions
- Progress indicators for long operations

```yaml
RECOMMENDED_TIMEOUTS:
  - Emulator boot: 180 seconds (with retry)
  - APK install: 120 seconds
  - App launch: 60 seconds
  - Appium startup: 65 seconds
  - WDIO connection: 300 seconds (connectionRetryTimeout in config)
```

---

## Architecture Overview

### Workflow Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                 android-build-and-test.yml                       │
├─────────────────────────────────────────────────────────────────┤
│  Job 1: build-android                                            │
│  ├── Checkout code                                               │
│  ├── Setup Node.js + Java                                        │
│  ├── npm ci                                                      │
│  ├── Create .env                                                 │
│  ├── Expo prebuild --platform android                            │
│  ├── ./gradlew assembleDebug (or assembleRelease)                │
│  ├── ✓ VERIFY: APK exists, valid, correct size                   │
│  ├── Upload APK artifact (NO ZIP - direct APK)                   │
│  └── Create release asset                                        │
│                                                                  │
│  Job 2: install-and-test-android (needs: build-android)          │
│  ├── uses: ./.github/actions/android-install                     │
│  │   ├── Download APK artifact                                   │
│  │   ├── ✓ VERIFY: APK downloaded, valid                         │
│  │   ├── Setup Android SDK + Emulator                            │
│  │   ├── Create AVD                                              │
│  │   ├── ✓ VERIFY: AVD exists                                    │
│  │   ├── Boot emulator                                           │
│  │   ├── ✓ VERIFY: Emulator booted (multi-check)                 │
│  │   ├── Install APK                                             │
│  │   ├── ✓ VERIFY: Package installed                             │
│  │   ├── Launch app                                              │
│  │   └── ✓ VERIFY: App running                                   │
│  │                                                               │
│  └── uses: ./.github/actions/android-test                        │
│      ├── Setup Node.js                                           │
│      ├── Install Appium + UiAutomator2                           │
│      ├── Start Appium                                            │
│      ├── ✓ VERIFY: Appium responding at known URL                │
│      ├── Run WDIO tests                                          │
│      └── Collect artifacts (logs, screenshots)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Differences from iOS

| Aspect | iOS | Android |
|--------|-----|---------|
| Build output | `.app` bundle (directory) | `.apk` file (single file) |
| Artifact handling | Zip required | **Direct upload (simpler)** |
| Simulator/Emulator | xcrun simctl | avdmanager + emulator + adb |
| Appium driver | XCUITest | UiAutomator2 |
| Boot verification | sys.boot_completed via simctl | adb shell getprop |
| App identifier | Bundle ID | Package name |
| Runner | macOS only | macOS or Ubuntu |

---

## Phase 1: macOS Runner Implementation

### 1.1 Main Workflow: `android-build-and-test.yml`

```yaml
name: Android Build and Appium Tests

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment'
        type: choice
        options: [test]
        default: 'test'
      build-mode:
        description: 'Build configuration'
        type: choice
        options: [Debug, Release]
        default: 'Debug'
      api-level:
        description: 'Android API level'
        type: string
        default: '34'
      device-profile:
        description: 'Emulator device profile'
        type: string
        default: 'pixel_6'
        
  workflow_call:
    inputs:
      # Same as above with defaults
```

### 1.2 Composite Action: `android-install/action.yml`

**Inputs:**
```yaml
inputs:
  artifact_name:
    description: 'Name of the APK artifact'
    required: false
  download_url:
    description: 'Direct download URL for APK'
    required: false
  api_level:
    description: 'Android API level'
    default: '34'
  device_profile:
    description: 'AVD device profile'
    default: 'pixel_6'
  arch:
    description: 'System image architecture'
    default: 'x86_64'
```

**Outputs:**
```yaml
outputs:
  emulator_name:
    description: 'AVD name'
  device_serial:
    description: 'ADB device serial (e.g., emulator-5554)'
  package_name:
    description: 'Android package name'
  apk_path:
    description: 'Path to APK file'
```

**Critical Steps with Verification:**

```yaml
steps:
  # Step 1: Download APK
  - name: Download APK artifact
    uses: actions/download-artifact@v4
    with:
      name: ${{ inputs.artifact_name }}
      path: ./downloaded-apk

  # Step 2: VERIFY APK
  - name: Verify APK artifact
    id: verify-apk
    shell: bash
    run: |
      APK_PATH=$(find ./downloaded-apk -name "*.apk" | head -1)
      
      if [ ! -f "$APK_PATH" ]; then
        echo "❌ APK file not found"
        ls -la ./downloaded-apk/
        exit 1
      fi
      
      # Extract package name using aapt
      PACKAGE_NAME=$($ANDROID_HOME/build-tools/*/aapt dump badging "$APK_PATH" | \
                     grep "package: name=" | sed "s/.*name='\([^']*\)'.*/\1/")
      
      if [ -z "$PACKAGE_NAME" ]; then
        echo "❌ Could not extract package name - APK may be invalid"
        exit 1
      fi
      
      echo "✅ APK verified: $APK_PATH"
      echo "📦 Package: $PACKAGE_NAME"
      
      echo "apk_path=$APK_PATH" >> $GITHUB_OUTPUT
      echo "package_name=$PACKAGE_NAME" >> $GITHUB_OUTPUT

  # Step 3: Setup Android SDK
  - name: Setup Android SDK
    uses: android-actions/setup-android@v3
    
  - name: Install SDK components
    shell: bash
    run: |
      sdkmanager --install "system-images;android-${{ inputs.api_level }};google_apis;${{ inputs.arch }}"
      sdkmanager --install "emulator"
      sdkmanager --install "platform-tools"

  # Step 4: Create AVD
  - name: Create Android Virtual Device
    id: create-avd
    shell: bash
    run: |
      AVD_NAME="test_device_${{ inputs.api_level }}"
      
      echo "no" | avdmanager create avd \
        --name "$AVD_NAME" \
        --package "system-images;android-${{ inputs.api_level }};google_apis;${{ inputs.arch }}" \
        --device "${{ inputs.device_profile }}" \
        --force
      
      echo "avd_name=$AVD_NAME" >> $GITHUB_OUTPUT

  # Step 5: VERIFY AVD created
  - name: Verify AVD created
    shell: bash
    run: |
      AVD_NAME="${{ steps.create-avd.outputs.avd_name }}"
      
      if ! avdmanager list avd | grep -q "$AVD_NAME"; then
        echo "❌ AVD not found: $AVD_NAME"
        avdmanager list avd
        exit 1
      fi
      
      echo "✅ AVD verified: $AVD_NAME"

  # Step 6: Boot Emulator
  - name: Boot Android Emulator
    id: boot-emulator
    shell: bash
    run: |
      AVD_NAME="${{ steps.create-avd.outputs.avd_name }}"
      
      echo "🚀 Starting emulator: $AVD_NAME"
      
      # Start emulator in background
      $ANDROID_HOME/emulator/emulator \
        -avd "$AVD_NAME" \
        -no-window \
        -no-audio \
        -no-boot-anim \
        -gpu swiftshader_indirect \
        -no-snapshot \
        &
      
      EMULATOR_PID=$!
      echo $EMULATOR_PID > emulator.pid
      
      # Wait for device to appear
      echo "⏳ Waiting for emulator to appear..."
      adb wait-for-device
      
      # Get device serial
      DEVICE_SERIAL=$(adb devices | grep "emulator-" | cut -f1 | head -1)
      echo "device_serial=$DEVICE_SERIAL" >> $GITHUB_OUTPUT

  # Step 7: VERIFY Emulator booted (CRITICAL - multiple checks)
  - name: Verify Emulator Boot Complete
    shell: bash
    env:
      DEVICE_SERIAL: ${{ steps.boot-emulator.outputs.device_serial }}
    run: |
      echo "⏳ Waiting for emulator boot to complete..."
      
      BOOT_TIMEOUT=180
      BOOT_SUCCESS=false
      
      for i in $(seq 1 $BOOT_TIMEOUT); do
        # Check 1: sys.boot_completed
        BOOT_COMPLETED=$(adb -s $DEVICE_SERIAL shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
        
        # Check 2: Boot animation stopped
        BOOT_ANIM=$(adb -s $DEVICE_SERIAL shell getprop init.svc.bootanim 2>/dev/null | tr -d '\r')
        
        if [ "$BOOT_COMPLETED" = "1" ] && [ "$BOOT_ANIM" = "stopped" ]; then
          echo "✅ Boot completed after ${i} seconds"
          BOOT_SUCCESS=true
          break
        fi
        
        if [ $((i % 15)) -eq 0 ]; then
          echo "⏳ Boot progress: boot_completed=$BOOT_COMPLETED, bootanim=$BOOT_ANIM (${i}/${BOOT_TIMEOUT}s)"
        fi
        
        sleep 1
      done
      
      if [ "$BOOT_SUCCESS" = false ]; then
        echo "❌ Emulator failed to boot within $BOOT_TIMEOUT seconds"
        exit 1
      fi
      
      # Additional stability wait
      echo "⏳ Waiting for system stability..."
      sleep 10
      
      # Verify package manager is responsive
      if ! adb -s $DEVICE_SERIAL shell pm list packages > /dev/null 2>&1; then
        echo "❌ Package manager not responsive"
        exit 1
      fi
      
      echo "✅ Emulator fully operational"

  # Step 8: Install APK
  - name: Install APK on Emulator
    id: install-apk
    shell: bash
    env:
      DEVICE_SERIAL: ${{ steps.boot-emulator.outputs.device_serial }}
      APK_PATH: ${{ steps.verify-apk.outputs.apk_path }}
    run: |
      echo "📲 Installing APK..."
      
      adb -s $DEVICE_SERIAL install -r "$APK_PATH"
      
      if [ $? -ne 0 ]; then
        echo "❌ APK installation failed"
        exit 1
      fi
      
      echo "✅ APK installed"

  # Step 9: VERIFY APK installed
  - name: Verify APK Installation
    shell: bash
    env:
      DEVICE_SERIAL: ${{ steps.boot-emulator.outputs.device_serial }}
      PACKAGE_NAME: ${{ steps.verify-apk.outputs.package_name }}
    run: |
      echo "🔍 Verifying installation..."
      
      if ! adb -s $DEVICE_SERIAL shell pm list packages | grep -q "$PACKAGE_NAME"; then
        echo "❌ Package not found after installation: $PACKAGE_NAME"
        echo "Installed packages:"
        adb -s $DEVICE_SERIAL shell pm list packages | head -20
        exit 1
      fi
      
      echo "✅ Package verified: $PACKAGE_NAME"

  # Step 10: Launch App
  - name: Launch Application
    shell: bash
    env:
      DEVICE_SERIAL: ${{ steps.boot-emulator.outputs.device_serial }}
      PACKAGE_NAME: ${{ steps.verify-apk.outputs.package_name }}
    run: |
      echo "🚀 Launching app..."
      
      # Get main activity
      MAIN_ACTIVITY=$(adb -s $DEVICE_SERIAL shell pm dump "$PACKAGE_NAME" | \
                      grep -A1 "android.intent.action.MAIN" | \
                      grep -oP '[\w.]+/[\w.]+' | head -1)
      
      if [ -z "$MAIN_ACTIVITY" ]; then
        MAIN_ACTIVITY="$PACKAGE_NAME/.MainActivity"
      fi
      
      adb -s $DEVICE_SERIAL shell am start -n "$MAIN_ACTIVITY"
      
      sleep 5
      
      # Verify app is in foreground
      CURRENT_FOCUS=$(adb -s $DEVICE_SERIAL shell dumpsys activity activities | \
                      grep "mResumedActivity" | head -1)
      
      if echo "$CURRENT_FOCUS" | grep -q "$PACKAGE_NAME"; then
        echo "✅ App launched and in foreground"
      else
        echo "⚠️ App may not be in foreground: $CURRENT_FOCUS"
        # Don't fail - Appium can handle app launch
      fi
```

### 1.3 Composite Action: `android-test/action.yml`

**Inputs:**
```yaml
inputs:
  device_serial:
    description: 'ADB device serial'
    required: true
  package_name:
    description: 'Android package name'
    required: true
  api_level:
    description: 'Android API level'
    default: '34'
  device_name:
    description: 'Device name for WDIO'
    default: 'Android Emulator'
  node_version:
    description: 'Node.js version'
    default: '20'
  appium_version:
    description: 'Appium version'
    default: '3.1.1'
  appium_host:
    description: 'Appium host'
    default: 'localhost'
  appium_port:
    description: 'Appium port'
    default: '4723'
  airtable_email:
    required: true
  airtable_api_token:
    required: true
  airtable_base_id:
    required: true
  airtable_table_name:
    required: true
  airtable_from_email:
    required: true
```

**Critical Steps:**

```yaml
steps:
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ inputs.node_version }}

  - name: Install dependencies
    shell: bash
    working-directory: ./app
    run: npm ci

  - name: Install Appium
    shell: bash
    run: |
      npm install -g appium@${{ inputs.appium_version }}
      appium --version

  - name: Install UiAutomator2 Driver
    shell: bash
    run: |
      appium driver install uiautomator2 || echo "Driver may already be installed"
      appium driver list --installed

  - name: Start Appium Server
    id: start-appium
    shell: bash
    run: |
      echo "🚀 Starting Appium server..."
      
      appium --log-level info \
             --log appium.log \
             --port ${{ inputs.appium_port }} \
             --address 0.0.0.0 &
      
      APPIUM_PID=$!
      echo $APPIUM_PID > appium.pid
      echo "Appium PID: $APPIUM_PID"
      
      # Wait for Appium with verification
      APPIUM_TIMEOUT=65
      APPIUM_READY=false
      
      for i in $(seq 1 $APPIUM_TIMEOUT); do
        if curl -s "http://127.0.0.1:${{ inputs.appium_port }}/status" > /dev/null; then
          echo "✅ Appium ready after ${i} seconds"
          APPIUM_READY=true
          break
        fi
        
        if [ $((i % 10)) -eq 0 ]; then
          echo "⏳ Waiting for Appium... (${i}/${APPIUM_TIMEOUT}s)"
        fi
        
        sleep 1
      done
      
      if [ "$APPIUM_READY" = false ]; then
        echo "❌ Appium failed to start"
        cat appium.log
        exit 1
      fi

  # CRITICAL: Verify Appium URL and extract actual endpoint
  - name: Verify Appium Connection
    id: verify-appium
    shell: bash
    run: |
      # Extract actual URL from Appium logs
      APPIUM_URL=$(grep -E "http://[0-9.]+:${{ inputs.appium_port }}" appium.log | head -1 | \
                   grep -oE "http://[0-9.]+:${{ inputs.appium_port }}")
      
      if [ -z "$APPIUM_URL" ]; then
        APPIUM_URL="http://127.0.0.1:${{ inputs.appium_port }}"
      fi
      
      # Test connection
      STATUS=$(curl -s "$APPIUM_URL/status")
      
      if [ -z "$STATUS" ]; then
        echo "❌ Cannot connect to Appium at $APPIUM_URL"
        exit 1
      fi
      
      echo "✅ Appium verified at: $APPIUM_URL"
      echo "$STATUS" | jq '.'
      
      # Extract host and port for WDIO
      APPIUM_HOST=$(echo "$APPIUM_URL" | sed 's|http://\([^:]*\):.*|\1|')
      APPIUM_PORT=$(echo "$APPIUM_URL" | sed 's|.*:\([0-9]*\)|\1|')
      
      echo "VERIFIED_APPIUM_HOST=$APPIUM_HOST" >> $GITHUB_ENV
      echo "VERIFIED_APPIUM_PORT=$APPIUM_PORT" >> $GITHUB_ENV
      echo "appium_url=$APPIUM_URL" >> $GITHUB_OUTPUT

  - name: Pre-test Debug Info
    shell: bash
    env:
      DEVICE_SERIAL: ${{ inputs.device_serial }}
      PACKAGE_NAME: ${{ inputs.package_name }}
    run: |
      echo "=== Pre-test Debug Information ==="
      echo "Device Serial: $DEVICE_SERIAL"
      echo "Package Name: $PACKAGE_NAME"
      echo "Appium URL: ${VERIFIED_APPIUM_HOST}:${VERIFIED_APPIUM_PORT}"
      echo ""
      echo "ADB Devices:"
      adb devices
      echo ""
      echo "Package Status:"
      adb -s $DEVICE_SERIAL shell pm list packages | grep -i softwareone || echo "Package check"

  - name: Run Appium Tests
    shell: bash
    working-directory: ./app
    env:
      PLATFORM_NAME: Android
      DEVICE_UDID: ${{ inputs.device_serial }}
      DEVICE_NAME: ${{ inputs.device_name }}
      PLATFORM_VERSION: ${{ inputs.api_level }}
      APP_PACKAGE: ${{ inputs.package_name }}
      APP_ACTIVITY: .MainActivity
      APPIUM_HOST: ${{ env.VERIFIED_APPIUM_HOST }}
      APPIUM_PORT: ${{ env.VERIFIED_APPIUM_PORT }}
      AIRTABLE_EMAIL: ${{ inputs.airtable_email }}
      AIRTABLE_API_TOKEN: ${{ inputs.airtable_api_token }}
      AIRTABLE_BASE_ID: ${{ inputs.airtable_base_id }}
      AIRTABLE_TABLE_NAME: ${{ inputs.airtable_table_name }}
      AIRTABLE_FROM_EMAIL: ${{ inputs.airtable_from_email }}
    run: |
      echo "🧪 Running tests with Android configuration"
      echo "APPIUM_HOST=$APPIUM_HOST"
      echo "APPIUM_PORT=$APPIUM_PORT"
      
      npx wdio run wdio.conf.js --suite welcome

  # Cleanup and artifact collection...
```

---

## Phase 2: Windows Runner Implementation

### Key Differences for Windows

| Aspect | macOS | Windows |
|--------|-------|---------|
| Shell | bash | PowerShell |
| Android SDK path | `$ANDROID_HOME` | `$env:ANDROID_HOME` |
| Path separator | `/` | `\` |
| Process background | `&` | `Start-Process` |
| grep/sed/awk | Native | Requires alternatives |
| Hardware accel | HVF | WHPX or HAXM |

### Windows-specific Considerations

1. **Use PowerShell Core (pwsh)** for cross-platform compatibility
2. **Android Emulator acceleration:** Use WHPX (Windows Hypervisor Platform)
3. **Path handling:** Use `Join-Path` and `[System.IO.Path]` methods
4. **Process management:** Use `Start-Process -NoNewWindow`
5. **String parsing:** Use PowerShell's `-match` and `Select-String`

### Workflow: `android-build-and-test-windows.yml`

```yaml
name: Android Build and Tests (Windows)

on:
  workflow_dispatch:
    inputs:
      # Same inputs as macOS version

jobs:
  build-android:
    runs-on: windows-latest
    # Build job - same as macOS but with PowerShell
    
  install-and-test-android:
    needs: build-android
    runs-on: windows-latest
    steps:
      - uses: ./.github/actions/android-install-windows
      - uses: ./.github/actions/android-test-windows
```

### Windows Composite Actions

Will mirror macOS actions with PowerShell equivalents. Key adaptations:

```powershell
# Example: Boot verification in PowerShell
$timeout = 180
$bootComplete = $false

for ($i = 1; $i -le $timeout; $i++) {
    $status = adb -s $env:DEVICE_SERIAL shell getprop sys.boot_completed 2>$null
    $bootAnim = adb -s $env:DEVICE_SERIAL shell getprop init.svc.bootanim 2>$null
    
    if ($status -eq "1" -and $bootAnim -eq "stopped") {
        Write-Host "✅ Boot completed after $i seconds"
        $bootComplete = $true
        break
    }
    
    Start-Sleep -Seconds 1
}

if (-not $bootComplete) {
    Write-Error "❌ Emulator failed to boot"
    exit 1
}
```

---

## Critical Checkpoints and Validation

### Checkpoint Summary

| Phase | Checkpoint | Validation Command | Expected Result |
|-------|------------|-------------------|-----------------|
| Build | APK exists | `find ... -name "*.apk"` | File path returned |
| Build | APK valid | `aapt dump badging` | Package name extracted |
| Build | APK size | `stat -f%z` | > 1MB |
| Install | APK downloaded | `ls -la ./downloaded-apk/` | APK file present |
| Install | AVD created | `avdmanager list avd` | AVD name in list |
| Install | Emulator visible | `adb devices` | `emulator-XXXX device` |
| Install | Boot complete | `getprop sys.boot_completed` | `1` |
| Install | Boot anim stopped | `getprop init.svc.bootanim` | `stopped` |
| Install | PM responsive | `pm list packages` | List returned |
| Install | APK installed | `pm list packages \| grep PKG` | Package found |
| Install | App launched | `dumpsys activity` | Package in resumed |
| Test | Appium started | `curl /status` | JSON response |
| Test | Appium URL verified | Log extraction | URL confirmed |
| Test | Tests pass | `npx wdio` exit code | 0 |

### Failure Recovery Strategies

1. **Emulator boot timeout:** Shutdown, wait 5s, reboot with extended timeout
2. **APK install failure:** Uninstall existing, retry install
3. **Appium connection failure:** Restart Appium, extract new URL
4. **Test flakiness:** Add retry logic in WDIO config

---

## Implementation Checklist

### Phase 1: macOS (Priority)

- [x] Create `android-build-and-test.yml` workflow
- [x] Create `android-install/action.yml`
- [x] Create `android-test/action.yml`
- [ ] Test workflow on GitHub Actions
- [ ] Document any issues and solutions

### Phase 2: Windows

- [x] Create `android-build-and-test-windows.yml`
- [x] Create `android-install-windows/action.yml`
- [x] Create `android-test-windows/action.yml`
- [ ] Test on Windows runner
- [ ] Document Windows-specific issues

### Verification

- [ ] APK build verification works
- [ ] Emulator boots reliably
- [ ] APK installs successfully
- [ ] App launches correctly
- [ ] Appium connects properly
- [ ] WDIO tests execute
- [ ] Artifacts collected on success/failure

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Emulator boot flaky | Medium | High | Multi-check boot verification, retry logic |
| APK install fails | Low | High | Verify APK validity before upload |
| Appium URL mismatch | Medium | High | Extract URL from logs, test before use |
| Hardware accel unavailable | Low | Medium | Use software rendering fallback |
| Timeout too short | Medium | Medium | Conservative timeouts, progress logs |
| Windows path issues | Medium | Medium | Use platform-agnostic path handling |

---

## References

- [iOS Build and Test Workflow](.github/workflows/ios-build-and-test.yml) - Reference implementation
- [iOS Install Action](.github/actions/ios-install/action.yml) - Pattern for install action
- [iOS Test Action](.github/actions/ios-test/action.yml) - Pattern for test action
- [Existing Android Build](.github/workflows/android-build.yml) - Base for enhancement
- [WDIO Config](app/wdio.conf.js) - Already supports Android
- [Appium Android Testing Guide](documents/APPIUM_ANDROID_TESTING.md) - Local testing reference
