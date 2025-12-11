#!/bin/bash

# Local testing script for Appium tests with optional build step
# Supports both iOS and Android platforms
# Usage: ./scripts/run-local-test.sh [options] [suite_name|spec_file|all]
# Examples:
#   ./scripts/run-local-test.sh welcome
#   ./scripts/run-local-test.sh --platform android welcome
#   ./scripts/run-local-test.sh all
#   ./scripts/run-local-test.sh ./test/specs/welcome.e2e.js
#   ./scripts/run-local-test.sh --build welcome                    # Build release app first
#   ./scripts/run-local-test.sh --platform android --build welcome # Build Android and run tests

# Configuration
BUILD_APP=false
SKIP_BUILD=false
VERBOSE=false
PLATFORM="ios"  # Default platform

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --platform|-p)
            PLATFORM="$2"
            shift 2
            ;;
        --build|-b)
            BUILD_APP=true
            shift
            ;;
        --skip-build|-s)
            SKIP_BUILD=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options] [suite_name|spec_file|all]"
            echo ""
            echo "Prerequisites:"
            echo "  - .env file must exist in app/ directory with Auth0 configuration"
            echo "  - For --build: Xcode (iOS) or Android SDK (Android) must be installed"
            echo ""
            echo "Options:"
            echo "  --platform, -p PLATFORM  Target platform: ios or android (default: ios)"
            echo "  --build, -b              Build release version of the app before testing"
            echo "  --skip-build, -s         Skip build and install existing app from last build"
            echo "  --verbose, -v            Enable verbose output"
            echo "  --help, -h               Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 welcome                                # Run welcome suite on iOS"
            echo "  $0 --platform android welcome             # Run welcome suite on Android"
            echo "  $0 all                                    # Run all tests"
            echo "  $0 ./test/specs/welcome.e2e.js           # Run specific spec file"
            echo "  $0 --build welcome                        # Build iOS and run tests"
            echo "  $0 --platform android --build welcome     # Build Android and run"
            echo "  $0 --skip-build all                       # Install last build and run all tests"
            exit 0
            ;;
        -*)
            echo "Error: Unknown option $1"
            echo "Use --help for usage information"
            exit 1
            ;;
        *)
            TEST_TARGET="$1"
            shift
            ;;
    esac
done

# Normalize platform name
PLATFORM=$(echo "$PLATFORM" | tr '[:upper:]' '[:lower:]')

# Validate platform
if [ "$PLATFORM" != "ios" ] && [ "$PLATFORM" != "android" ]; then
    echo "Error: Invalid platform '$PLATFORM'"
    echo "Supported platforms: ios, android"
    exit 1
fi

# Validate arguments
if [ -z "$TEST_TARGET" ]; then
    echo "Error: Test target (suite name, spec file, or 'all') is required"
    echo "Usage: $0 [options] [suite_name|spec_file|all]"
    echo "Use --help for more information"
    exit 1
fi

if [ "$BUILD_APP" = true ] && [ "$SKIP_BUILD" = true ]; then
    echo "Error: --build and --skip-build cannot be used together"
    echo "Use --build to build fresh, or --skip-build to reuse last build"
    exit 1
fi

# Platform-specific configuration
if [ "$PLATFORM" = "android" ]; then
    # Android configuration
    export PLATFORM_NAME="Android"
    export AUTOMATION_NAME="UiAutomator2"
    export APP_PACKAGE="com.softwareone.marketplaceMobile"
    export APP_ACTIVITY=".MainActivity"
    
    # Get Android device UDID (first connected device/emulator)
    DEVICE_UDID=$(adb devices | grep -v "List" | grep "device$" | head -1 | awk '{print $1}')
    
    if [ -z "$DEVICE_UDID" ]; then
        echo "❌ ERROR: No Android devices or emulators connected"
        echo "Please connect a device or start an emulator"
        echo "To list available emulators: emulator -list-avds"
        echo "To start an emulator: emulator -avd <avd-name>"
        exit 1
    fi
    
    export DEVICE_UDID
    export DEVICE_NAME="${DEVICE_NAME:-Pixel 8}"
    export PLATFORM_VERSION="${PLATFORM_VERSION:-14}"
else
    # iOS configuration (default)
    export PLATFORM_NAME="iOS"
    export AUTOMATION_NAME="XCUITest"
    export APP_BUNDLE_ID="com.softwareone.marketplaceMobile"
    export DEVICE_UDID="${DEVICE_UDID:-963A992A-A208-4EF4-B7F9-7B2A569EC133}"
    export DEVICE_NAME="${DEVICE_NAME:-iPhone 16}"
    export PLATFORM_VERSION="${PLATFORM_VERSION:-26.0}"
fi

# Common Appium configuration
export APPIUM_HOST="127.0.0.1"
export APPIUM_PORT="4723"

# Function to log messages with optional verbose control
log() {
    local message="$1"
    local level="${2:-info}"
    
    case $level in
        verbose)
            if [ "$VERBOSE" = true ]; then
                echo "$message"
            fi
            ;;
        *)
            echo "$message"
            ;;
    esac
}

# Function to build the release version of the app
build_release_app() {
    log "🔨 Building Release version of the iOS app..." "info"
    
    # Get absolute paths at the start
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    APP_DIR="$PROJECT_ROOT/app"
    
    if [ ! -d "$APP_DIR" ]; then
        log "❌ ERROR: App directory not found at $APP_DIR"
        log "Make sure you're running this script from the project root or scripts directory"
        exit 1
    fi
    
    # Store original working directory to return to it later
    ORIGINAL_DIR="$(pwd)"
    
    # Change to app directory for build
    cd "$APP_DIR"
    
    # Verify we have node_modules
    if [ ! -d "node_modules" ]; then
        log "📦 Installing Node.js dependencies..." "info"
        npm ci
    fi
    
    # Set up environment for release build
    log "🎯 Configuring for STANDALONE PRODUCTION app" "verbose"
    
    # Backup existing .env file before modifying
    if [ -f .env ]; then
        log "💾 Backing up existing .env file" "verbose"
        cp .env .env.backup
    fi
    
    # Validate .env file exists
    if [ ! -f ".env" ]; then
        log "❌ No .env file found" "error"
        log "Please create a .env file in app directory with required configuration" "error"
        exit 1
    fi
    
    log "🎯 Using .env configuration" "verbose"
    
    log "📦 Generating native iOS project with Expo (Release mode)..." "info"
    
    # Clean and generate iOS project
    if [ "$VERBOSE" = true ]; then
        npx expo prebuild --platform ios --clean
    else
        npx expo prebuild --platform ios --clean > /dev/null 2>&1
    fi
    
    log "✅ Native iOS project generated" "verbose"
    
    # Build the iOS app for simulator
    log "🔨 Building iOS app for Simulator in Release mode..." "info"
    
    cd ios
    
    # Find workspace and scheme
    WORKSPACE=$(find . -maxdepth 1 -name "*.xcworkspace" -type d | head -1 | xargs basename)
    SCHEME=$(basename "$WORKSPACE" .xcworkspace)
    
    log "Using workspace: $WORKSPACE" "verbose"
    log "Using scheme: $SCHEME" "verbose"
    
    # Build for iOS Simulator
    log "Running xcodebuild for Release configuration..." "verbose"
    
    if [ "$VERBOSE" = true ]; then
        xcodebuild -workspace "$WORKSPACE" \
          -scheme "$SCHEME" \
          -configuration Release \
          -sdk iphonesimulator \
          -destination 'generic/platform=iOS Simulator' \
          -derivedDataPath build/DerivedData \
          CODE_SIGN_IDENTITY="" \
          CODE_SIGNING_REQUIRED=NO \
          CODE_SIGNING_ALLOWED=NO \
          build
    else
        xcodebuild -workspace "$WORKSPACE" \
          -scheme "$SCHEME" \
          -configuration Release \
          -sdk iphonesimulator \
          -destination 'generic/platform=iOS Simulator' \
          -derivedDataPath build/DerivedData \
          CODE_SIGN_IDENTITY="" \
          CODE_SIGNING_REQUIRED=NO \
          CODE_SIGNING_ALLOWED=NO \
          build > /tmp/xcodebuild.log 2>&1
    fi
    
    BUILD_EXIT_CODE=$?
    
    if [ $BUILD_EXIT_CODE -ne 0 ]; then
        log "❌ Build failed. Check logs for details." "info"
        if [ "$VERBOSE" = false ]; then
            log "Build log saved to /tmp/xcodebuild.log" "info"
        fi
        exit $BUILD_EXIT_CODE
    fi
    
    # Find the built .app
    BUILD_DIR="build/DerivedData/Build/Products/Release-iphonesimulator"
    APP_PATH=$(find "$BUILD_DIR" -name "*.app" -type d | head -1)
    
    if [ -z "$APP_PATH" ]; then
        log "❌ Could not find built .app in $BUILD_DIR" "info"
        ls -la "$BUILD_DIR" 2>/dev/null || log "Build directory not found" "info"
        exit 1
    fi
    
    log "✅ Build completed successfully" "info"
    log "📱 Built app: $APP_PATH" "verbose"
    
    # Install the app on simulator
    log "📲 Installing app on simulator..." "info"
    
    # Check if simulator is booted
    SIMULATOR_STATUS=$(xcrun simctl list devices | grep "$DEVICE_UDID" | head -1 || echo "Not found")
    if ! echo "$SIMULATOR_STATUS" | grep -q "(Booted)"; then
        log "🚀 Booting simulator..." "info"
        xcrun simctl boot "$DEVICE_UDID"
        
        # Wait for simulator to boot
        log "⏳ Waiting for simulator to boot..." "verbose"
        for i in {1..30}; do
            if xcrun simctl list devices | grep "$DEVICE_UDID" | grep -q "(Booted)"; then
                log "✅ Simulator booted" "verbose"
                break
            fi
            sleep 1
        done
    fi
    
    # Install the app
    xcrun simctl install "$DEVICE_UDID" "$APP_PATH"
    log "✅ App installed on simulator" "info"
    
    # Return to original directory to avoid path resolution issues
    cd "$ORIGINAL_DIR"
}

# Function to install existing app from last build
install_existing_app() {
    log "📲 Installing existing app from last build..." "info"
    
    # Get absolute paths
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    APP_DIR="$PROJECT_ROOT/app"
    
    if [ ! -d "$APP_DIR" ]; then
        log "❌ ERROR: App directory not found at $APP_DIR"
        exit 1
    fi
    
    # Look for the most recent build
    BUILD_DIR="$APP_DIR/ios/build/DerivedData/Build/Products/Release-iphonesimulator"
    APP_PATH=$(find "$BUILD_DIR" -name "*.app" -type d 2>/dev/null | head -1)
    
    if [ -z "$APP_PATH" ]; then
        log "❌ No existing app build found in $BUILD_DIR"
        log "💡 Run with --build to build the app first, or use the deploy script:"
        log "   ./scripts/deploy-ios.sh --client-id YOUR_CLIENT_ID"
        exit 1
    fi
    
    log "📱 Found existing app: $APP_PATH" "verbose"
    
    # Check if simulator is booted
    SIMULATOR_STATUS=$(xcrun simctl list devices | grep "$DEVICE_UDID" | head -1 || echo "Not found")
    if ! echo "$SIMULATOR_STATUS" | grep -q "(Booted)"; then
        log "🚀 Booting simulator..." "info"
        xcrun simctl boot "$DEVICE_UDID"
        
        # Wait for simulator to boot
        log "⏳ Waiting for simulator to boot..." "verbose"
        for i in {1..30}; do
            if xcrun simctl list devices | grep "$DEVICE_UDID" | grep -q "(Booted)"; then
                log "✅ Simulator booted" "verbose"
                break
            fi
            sleep 1
        done
    fi
    
    # Install the app
    xcrun simctl install "$DEVICE_UDID" "$APP_PATH"
    log "✅ Existing app installed on simulator" "info"
}

# Handle build options
if [ "$BUILD_APP" = true ]; then
    if [ "$PLATFORM" = "android" ]; then
        # Build standalone Android APK for testing
        log "🤖 Building standalone Android APK for testing..." "info"
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
        APP_DIR="$PROJECT_ROOT/app"
        
        cd "$APP_DIR"
        
        # Validate .env file exists
        if [ ! -f ".env" ]; then
            log "❌ No .env file found" "error"
            log "Please create a .env file in app directory with required configuration" "error"
            exit 1
        fi
        
        log "Using .env file for standalone build..." "verbose"
        
        # Uninstall existing app
        PACKAGE_NAME="com.softwareone.marketplaceMobile"
        log "Uninstalling existing app if present..." "verbose"
        adb -s "$DEVICE_UDID" uninstall "$PACKAGE_NAME" > /dev/null 2>&1 || true
        
        # Clean previous builds
        log "Cleaning previous builds..." "verbose"
        rm -rf android/app/build/outputs/apk > /dev/null 2>&1 || true
        
        # Prebuild native Android project
        log "📦 Generating native Android project with Expo prebuild..." "info"
        if [ "$VERBOSE" = true ]; then
            npx expo prebuild --platform android --clean
        else
            npx expo prebuild --platform android --clean > /dev/null 2>&1
        fi
        
        if [ $? -ne 0 ]; then
            log "❌ Prebuild failed" "info"
            exit 1
        fi
        
        log "✅ Native Android project generated" "verbose"
        
        # Build standalone APK using Gradle
        log "🔨 Building standalone APK in Release mode..." "info"
        cd android
        
        GRADLE_TASK="assembleRelease"
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
        
        log "Running: ./gradlew $GRADLE_TASK" "verbose"
        
        if [ "$VERBOSE" = true ]; then
            ./gradlew $GRADLE_TASK
        else
            ./gradlew $GRADLE_TASK 2>&1 | grep -E "(BUILD|SUCCESS|FAILURE|WARNING|Error|Failed)" || true
        fi
        
        if [ $? -ne 0 ]; then
            log "❌ Build failed" "info"
            cd "$PROJECT_ROOT"
            exit 1
        fi
        
        cd ..
        
        # Verify APK was created
        if [ ! -f "android/$APK_PATH" ]; then
            log "❌ APK not found at android/$APK_PATH" "info"
            exit 1
        fi
        
        log "✅ APK built successfully: android/$APK_PATH" "info"
        
        # Install the APK
        log "📲 Installing APK on device $DEVICE_UDID..." "info"
        adb -s "$DEVICE_UDID" install -r "android/$APK_PATH"
        
        if [ $? -ne 0 ]; then
            log "❌ APK installation failed" "info"
            exit 1
        fi
        
        log "✅ APK installed successfully" "info"
        
        # Launch the app
        log "🚀 Launching app..." "verbose"
        adb -s "$DEVICE_UDID" shell am start -n "$PACKAGE_NAME/.MainActivity"
        sleep 2
        
        log "✅ Android app built and deployed" "info"
        
        # Return to project root
        cd "$PROJECT_ROOT"
    else
        # Build iOS app
        build_release_app
    fi
elif [ "$SKIP_BUILD" = true ]; then
    if [ "$PLATFORM" = "android" ]; then
        log "⚠️  --skip-build not implemented for Android yet" "info"
        log "💡 App should already be installed on your device/emulator" "info"
    else
        install_existing_app
    fi
fi

# Debug output
log "🔍 Environment variables for WebDriverIO:" "verbose"
log "   PLATFORM_NAME: $PLATFORM_NAME" "verbose"
log "   AUTOMATION_NAME: $AUTOMATION_NAME" "verbose"
log "   DEVICE_UDID: $DEVICE_UDID" "verbose"
log "   DEVICE_NAME: $DEVICE_NAME" "verbose"
log "   PLATFORM_VERSION: $PLATFORM_VERSION" "verbose"

if [ "$PLATFORM" = "android" ]; then
    log "   APP_PACKAGE: $APP_PACKAGE" "verbose"
    log "   APP_ACTIVITY: $APP_ACTIVITY" "verbose"
else
    log "   APP_BUNDLE_ID: $APP_BUNDLE_ID" "verbose"
fi

log "   APPIUM_HOST: $APPIUM_HOST" "verbose"
log "   APPIUM_PORT: $APPIUM_PORT" "verbose"

# Platform-specific device checks
if [ "$PLATFORM" = "android" ]; then
    log ""
    log "🤖 Connected Android devices:"
    adb devices
else
    # Get available simulators
    log ""
    log "📱 Available simulators:"
    xcrun simctl list devices | grep iPhone | grep Booted || log "No booted simulators found"
fi

# Check if Appium is running
log ""
log "🚀 Checking Appium server status..."
if ! curl -s "http://$APPIUM_HOST:$APPIUM_PORT/status" > /dev/null 2>&1; then
    log "⚠️  Appium server not running. Starting Appium..."
    appium --log-level warn > /tmp/appium.log 2>&1 &
    APPIUM_PID=$!
    log "📝 Appium PID: $APPIUM_PID"
    
    # Wait for Appium to start
    log "⏳ Waiting for Appium to start..."
    for i in {1..30}; do
        if curl -s "http://$APPIUM_HOST:$APPIUM_PORT/status" > /dev/null 2>&1; then
            log "✅ Appium server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            log "❌ Appium failed to start after 30 seconds"
            exit 1
        fi
        sleep 1
    done
else
    log "✅ Appium server is already running"
fi

# Determine if target is a suite, spec file, or all tests
if [[ "$TEST_TARGET" == "all" ]]; then
    TEST_ARGS=""
    log ""
    log "🚀 Starting WebDriver tests - Running ALL tests"
elif [[ "$TEST_TARGET" == *.js ]]; then
    TEST_ARGS="--spec $TEST_TARGET"
    log ""
    log "🚀 Starting WebDriver tests with spec: $TEST_TARGET"
else
    TEST_ARGS="--suite $TEST_TARGET"
    log ""
    log "🚀 Starting WebDriver tests with suite: $TEST_TARGET"
fi

# Change to app directory and run tests
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
APP_DIR="$PROJECT_ROOT/app"

if [ ! -d "$APP_DIR" ]; then
    log "❌ ERROR: App directory not found at $APP_DIR"
    log "Make sure you're running this script from the project root or scripts directory"
    exit 1
fi

cd "$APP_DIR"
npx wdio run wdio.conf.js $TEST_ARGS
TEST_EXIT_CODE=$?

# Restore original .env file if we backed it up
if [ -f .env.backup ]; then
    log "♻️  Restoring original .env file" "verbose"
    mv .env.backup .env
fi

# Stop Appium if we started it
if [ ! -z "$APPIUM_PID" ]; then
    log ""
    log "🛑 Stopping Appium server..."
    kill $APPIUM_PID 2>/dev/null || true
fi

exit $TEST_EXIT_CODE