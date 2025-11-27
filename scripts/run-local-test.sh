#!/bin/bash

# Local testing script for Appium tests with optional build step
# Usage: ./scripts/run-local-test.sh [options] [suite_name|spec_file]
# Examples:
#   ./scripts/run-local-test.sh welcome
#   ./scripts/run-local-test.sh ./test/specs/welcome.e2e.js
#   ./scripts/run-local-test.sh --build welcome                    # Build release app first
#   ./scripts/run-local-test.sh --build --client-id abc123 welcome # Build with Auth0 client ID

# Configuration
BUILD_APP=false
SKIP_BUILD=false
CLIENT_ID=""
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build|-b)
            BUILD_APP=true
            shift
            ;;
        --skip-build|-s)
            SKIP_BUILD=true
            shift
            ;;
        --client-id|-c)
            CLIENT_ID="$2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options] [suite_name|spec_file]"
            echo ""
            echo "Options:"
            echo "  --build, -b           Build release version of the app before testing"
            echo "  --skip-build, -s      Skip build and install existing app from last build"
            echo "  --client-id, -c ID    Set Auth0 client ID for build (required with --build)"
            echo "  --verbose, -v         Enable verbose output"
            echo "  --help, -h            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 welcome                                    # Run welcome suite with existing app"
            echo "  $0 ./test/specs/welcome.e2e.js              # Run specific spec file"
            echo "  $0 --build welcome                          # Build release app first, then run tests"
            echo "  $0 --skip-build welcome                     # Install last build and run tests"
            echo "  $0 --build --client-id abc123 welcome       # Build with Auth0 client ID"
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

# Validate arguments
if [ -z "$TEST_TARGET" ]; then
    echo "Error: Test target (suite name or spec file) is required"
    echo "Usage: $0 [options] [suite_name|spec_file]"
    echo "Use --help for more information"
    exit 1
fi

if [ "$BUILD_APP" = true ] && [ -z "$CLIENT_ID" ]; then
    echo "Error: --client-id is required when using --build option"
    echo "Example: $0 --build --client-id your_auth0_client_id welcome"
    exit 1
fi

if [ "$BUILD_APP" = true ] && [ "$SKIP_BUILD" = true ]; then
    echo "Error: --build and --skip-build cannot be used together"
    echo "Use --build to build fresh, or --skip-build to reuse last build"
    exit 1
fi

# Set required environment variables for local testing
export DEVICE_UDID="963A992A-A208-4EF4-B7F9-7B2A569EC133"  # iPhone 16e (currently booted)
export DEVICE_NAME="iPhone 16"
export PLATFORM_VERSION="26.0" 
export APP_BUNDLE_ID="com.softwareone.marketplaceMobile"
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
    
    # Create .env file for production configuration
    cat > .env << EOF
AUTH0_DOMAIN=softwareone-dev.eu.auth0.com
AUTH0_CLIENT_ID=${CLIENT_ID}
EAS_NO_VCS=1
EXPO_NO_DOTENV=1
EOF
    
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
    build_release_app
elif [ "$SKIP_BUILD" = true ]; then
    install_existing_app
fi

# Debug output
log "🔍 Environment variables for WebDriverIO:"
log "   DEVICE_UDID: $DEVICE_UDID"
log "   DEVICE_NAME: $DEVICE_NAME" 
log "   PLATFORM_VERSION: $PLATFORM_VERSION"
log "   APP_BUNDLE_ID: $APP_BUNDLE_ID"
log "   APPIUM_HOST: $APPIUM_HOST"
log "   APPIUM_PORT: $APPIUM_PORT"

# Get available simulators
log ""
log "📱 Available simulators:"
xcrun simctl list devices | grep iPhone | grep Booted || log "No booted simulators found"

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

# Determine if target is a suite or spec file
if [[ "$TEST_TARGET" == *.js ]]; then
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

# Stop Appium if we started it
if [ ! -z "$APPIUM_PID" ]; then
    log ""
    log "🛑 Stopping Appium server..."
    kill $APPIUM_PID 2>/dev/null || true
fi

exit $TEST_EXIT_CODE