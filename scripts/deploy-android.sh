#!/bin/bash

# SoftwareONE Marketplace Platform Mobile - Android Deploy Script
# This script performs a complete cycle: uninstall -> clean -> build -> deploy -> launch

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="SoftwareOne"
PACKAGE_NAME="com.softwareone.marketplaceMobile"
DEFAULT_DEVICE=""  # Empty means use first available device/emulator
BUILD_MODE="debug"
FORCE_BOOT=false
SHOW_LOGS=false
VERBOSE=false
CLIENT_ID=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --client-id|-c)
            CLIENT_ID="$2"
            shift 2
            ;;
        --release|-r)
            BUILD_MODE="release"
            shift
            ;;
        --device|-d)
            DEFAULT_DEVICE="$2"
            shift 2
            ;;
        --force-boot|-f)
            FORCE_BOOT=true
            shift
            ;;
        --logs|-l)
            SHOW_LOGS=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "This script performs a complete React Native app deployment cycle:"
            echo "1. Configures Auth0 test environment (if client-id provided)"
            echo "2. Uninstalls existing app from device/emulator"
            echo "3. Cleans React Native build cache"
            echo "4. Builds fresh React Native app with Expo"
            echo "5. Deploys to Android device/emulator"
            echo "6. Launches the app"
            echo ""
            echo "Options:"
            echo "  -c, --client-id ID    Auth0 client ID (required if .env not configured)"
            echo "  -r, --release         Build in release mode (default: debug)"
            echo "  -d, --device NAME     Specify device/emulator name (default: first available)"
            echo "  -f, --force-boot      Force boot emulator even if already running"
            echo "  -l, --logs            Show app logs after launch"
            echo "  -v, --verbose         Show verbose output"
            echo "  -h, --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --client-id YOUR_CLIENT_ID"
            echo "  $0 -c YOUR_CLIENT_ID --release --logs"
            echo "  $0 -d \"Pixel_5_API_34\" -v       # Uses existing .env file"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Use --help to see available options"
            exit 1
            ;;
    esac
done

# Logging function
log() {
    if [ "$VERBOSE" = true ] || [ "$2" != "verbose" ]; then
        echo -e "$1"
    fi
}

log "${BOLD}${BLUE}🚀 $APP_NAME - Complete Deployment Pipeline${NC}"
log "${BLUE}=======================================================${NC}"
log "Build Mode: ${YELLOW}$BUILD_MODE${NC}"
log "Package Name: ${YELLOW}$PACKAGE_NAME${NC}"
log "${BLUE}=======================================================${NC}"

# Function to find available emulators
list_emulators() {
    "$ANDROID_HOME/emulator/emulator" -list-avds 2>/dev/null
}

# Function to find connected devices
list_devices() {
    adb devices | grep -v "List" | grep "device$" | awk '{print $1}'
}

# Get the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Step 1: Validate environment
log "\n${YELLOW}Step 1: Validating environment...${NC}"

# Check Node
if ! command -v node &> /dev/null; then
    log "${RED}❌ Node.js is not installed or not in PATH${NC}"
    log "Please install Node.js from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
log "${GREEN}✅ Found Node.js $NODE_VERSION${NC}" "verbose"

# Check npm
if ! command -v npm &> /dev/null; then
    log "${RED}❌ npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
log "${GREEN}✅ Found npm $NPM_VERSION${NC}" "verbose"

# Check ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    log "${RED}❌ ANDROID_HOME environment variable is not set${NC}"
    log "Please set ANDROID_HOME to your Android SDK location"
    log "Example: export ANDROID_HOME=\$HOME/Library/Android/sdk"
    exit 1
fi

if [ ! -d "$ANDROID_HOME" ]; then
    log "${RED}❌ ANDROID_HOME path does not exist: $ANDROID_HOME${NC}"
    exit 1
fi

log "${GREEN}✅ Found Android SDK at $ANDROID_HOME${NC}" "verbose"

# Check adb
if ! command -v adb &> /dev/null; then
    log "${RED}❌ adb not found in PATH${NC}"
    log "Please add Android SDK platform-tools to your PATH"
    log "Example: export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    exit 1
fi

ADB_VERSION=$(adb --version | head -1)
log "${GREEN}✅ Found $ADB_VERSION${NC}" "verbose"

# Check if we're in the correct project directory
if [ ! -d "$PROJECT_ROOT/app" ]; then
    log "${RED}❌ Not in the correct project directory${NC}"
    log "Please run this script from the project root (where app folder is)"
    exit 1
fi

cd "$PROJECT_ROOT/app"

if [ ! -f "package.json" ]; then
    log "${RED}❌ package.json not found in app directory${NC}"
    exit 1
fi

log "${GREEN}✅ Environment validated${NC}"

# Step 1.5: Configure Auth0 environment
log "\n${YELLOW}Step 1.5: Configuring Auth0 environment...${NC}"

# If client-id provided, create/update .env file
if [ -n "$CLIENT_ID" ]; then
    log "Creating .env file with test environment configuration..." "verbose"
    cat > .env <<EOF
# Auth0 Configuration (Test Environment)
AUTH0_DOMAIN=login-test.pyracloud.com
AUTH0_CLIENT_ID=$CLIENT_ID
AUTH0_AUDIENCE=https://api-test.pyracloud.com/
AUTH0_SCOPE=openid profile email offline_access
AUTH0_API_URL=https://api.s1.show/public/
AUTH0_OTP_DIGITS=6
AUTH0_SCHEME=com.softwareone.marketplaceMobile
TEMPORARY_AUTH0_TOKEN=
EOF
    log "${GREEN}✅ .env file configured with test environment${NC}"
else
    # Check if .env exists
    if [ ! -f ".env" ]; then
        log "${RED}❌ No .env file found and no --client-id provided${NC}"
        log "Please either:"
        log "  1. Provide --client-id: ${YELLOW}$0 --client-id YOUR_CLIENT_ID${NC}"
        log "  2. Or create a .env file manually in app directory"
        exit 1
    fi

    # Check if AUTH0_CLIENT_ID is set in .env
    if ! grep -q "^AUTH0_CLIENT_ID=.\\+" .env 2>/dev/null; then
        log "${RED}❌ AUTH0_CLIENT_ID not configured in .env file${NC}"
        log "Please either:"
        log "  1. Provide --client-id: ${YELLOW}$0 --client-id YOUR_CLIENT_ID${NC}"
        log "  2. Or set AUTH0_CLIENT_ID in your .env file"
        exit 1
    fi

    log "${GREEN}✅ Using existing .env configuration${NC}"
fi

# Step 2: Find and prepare device/emulator
log "\n${YELLOW}Step 2: Preparing Android device/emulator...${NC}"

TARGET_DEVICE=""
IS_EMULATOR=false

# Check for connected devices first
CONNECTED_DEVICES=$(list_devices)
if [ -n "$CONNECTED_DEVICES" ]; then
    if [ -n "$DEFAULT_DEVICE" ]; then
        # Check if specified device is connected
        if echo "$CONNECTED_DEVICES" | grep -q "$DEFAULT_DEVICE"; then
            TARGET_DEVICE="$DEFAULT_DEVICE"
            log "${GREEN}✅ Found specified device: $TARGET_DEVICE${NC}"
        else
            log "${YELLOW}⚠️  Specified device '$DEFAULT_DEVICE' not connected${NC}"
        fi
    else
        # Use first connected device
        TARGET_DEVICE=$(echo "$CONNECTED_DEVICES" | head -1)
        log "${GREEN}✅ Found connected device: $TARGET_DEVICE${NC}"
    fi
fi

# If no connected device, try to start an emulator
if [ -z "$TARGET_DEVICE" ]; then
    AVAILABLE_EMULATORS=$(list_emulators)
    
    if [ -z "$AVAILABLE_EMULATORS" ]; then
        log "${RED}❌ No emulators found and no devices connected${NC}"
        log "Please create an Android Virtual Device (AVD) using Android Studio"
        exit 1
    fi

    if [ -n "$DEFAULT_DEVICE" ]; then
        # Check if specified emulator exists
        if echo "$AVAILABLE_EMULATORS" | grep -q "^$DEFAULT_DEVICE$"; then
            EMULATOR_NAME="$DEFAULT_DEVICE"
        else
            log "${YELLOW}⚠️  Emulator '$DEFAULT_DEVICE' not found${NC}"
            log "Available emulators:" "verbose"
            echo "$AVAILABLE_EMULATORS" | head -5
            EMULATOR_NAME=$(echo "$AVAILABLE_EMULATORS" | head -1)
            log "${YELLOW}⚠️  Using: $EMULATOR_NAME${NC}"
        fi
    else
        # Use first available emulator
        EMULATOR_NAME=$(echo "$AVAILABLE_EMULATORS" | head -1)
        log "Using emulator: $EMULATOR_NAME" "verbose"
    fi

    IS_EMULATOR=true
    log "${GREEN}✅ Target emulator: $EMULATOR_NAME${NC}"
fi

# Step 3: Boot emulator if needed
if [ "$IS_EMULATOR" = true ]; then
    log "\n${YELLOW}Step 3: Starting Android emulator...${NC}"
    
    # Check if emulator is already running
    RUNNING_EMULATOR=$(adb devices | grep "emulator" | head -1 | awk '{print $1}')
    
    if [ -n "$RUNNING_EMULATOR" ] && [ "$FORCE_BOOT" = false ]; then
        log "${GREEN}✅ Emulator already running: $RUNNING_EMULATOR${NC}"
        TARGET_DEVICE="$RUNNING_EMULATOR"
    else
        if [ "$FORCE_BOOT" = true ] && [ -n "$RUNNING_EMULATOR" ]; then
            log "Force stopping existing emulator..." "verbose"
            adb -s "$RUNNING_EMULATOR" emu kill 2>/dev/null || true
            sleep 2
        fi

        log "Starting emulator $EMULATOR_NAME..." "verbose"
        "$ANDROID_HOME/emulator/emulator" -avd "$EMULATOR_NAME" -no-snapshot-load > /dev/null 2>&1 &
        EMULATOR_PID=$!
        
        # Wait for emulator to boot
        log "Waiting for emulator to boot..." "verbose"
        adb wait-for-device > /dev/null 2>&1
        
        # Wait for boot to complete
        BOOT_TIMEOUT=120
        ELAPSED=0
        while [ $ELAPSED -lt $BOOT_TIMEOUT ]; do
            BOOT_COMPLETE=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
            if [ "$BOOT_COMPLETE" = "1" ]; then
                break
            fi
            sleep 2
            ELAPSED=$((ELAPSED + 2))
        done
        
        if [ $ELAPSED -ge $BOOT_TIMEOUT ]; then
            log "${RED}❌ Emulator boot timeout${NC}"
            exit 1
        fi
        
        TARGET_DEVICE=$(adb devices | grep "emulator" | head -1 | awk '{print $1}')
        log "${GREEN}✅ Emulator booted: $TARGET_DEVICE${NC}"
        
        # Give emulator a bit more time to stabilize
        sleep 3
    fi
else
    log "\n${YELLOW}Step 3: Using connected device...${NC}"
    log "${GREEN}✅ Device ready: $TARGET_DEVICE${NC}"
fi

# Step 4: Uninstall existing app
log "\n${YELLOW}Step 4: Uninstalling existing app...${NC}"

# Check if app is installed
INSTALLED=$(adb -s "$TARGET_DEVICE" shell pm list packages | grep "$PACKAGE_NAME" || true)
if [ -n "$INSTALLED" ]; then
    log "Found existing app, uninstalling..." "verbose"
    adb -s "$TARGET_DEVICE" uninstall "$PACKAGE_NAME" > /dev/null 2>&1 || true
    log "${GREEN}✅ Previous version removed${NC}"
else
    log "${GREEN}✅ No previous version found${NC}"
fi

# Step 5: Clean and prepare build
log "\n${YELLOW}Step 5: Cleaning build cache...${NC}"

# Clean Android build artifacts
log "Cleaning Android build cache..." "verbose"
rm -rf android/app/build > /dev/null 2>&1 || true
rm -rf android/build > /dev/null 2>&1 || true

# Clean Expo/Metro cache
log "Cleaning Expo cache..." "verbose"
npx expo start --clear > /dev/null 2>&1 &
EXPO_PID=$!
sleep 2
kill $EXPO_PID 2>/dev/null || true

log "${GREEN}✅ Build cache cleaned${NC}"

# Step 6: Get dependencies
log "\n${YELLOW}Step 6: Installing dependencies...${NC}"

log "Installing npm dependencies..." "verbose"
if [ "$VERBOSE" = true ]; then
    npm install
else
    npm install > /dev/null 2>&1
fi

if [ $? -ne 0 ]; then
    log "${RED}❌ Failed to install npm dependencies${NC}"
    exit 1
fi

log "${GREEN}✅ npm dependencies installed${NC}"

# Step 6.5: Prebuild native Android project
log "\n${YELLOW}Step 6.5: Rebuilding native Android project with Expo...${NC}"

log "Running expo prebuild (includes automatic Gradle setup)..." "verbose"
if [ "$VERBOSE" = true ]; then
    npx expo prebuild --platform android --clean
else
    npx expo prebuild --platform android --clean > /dev/null 2>&1
fi

if [ $? -ne 0 ]; then
    log "${RED}❌ Failed to prebuild Android project${NC}"
    exit 1
fi

log "${GREEN}✅ Native Android project rebuilt (Gradle configured automatically)${NC}"

# Step 7: Build and run with Expo
log "\n${YELLOW}Step 7: Building and deploying React Native app...${NC}"

log "Building for Android in $BUILD_MODE mode..." "verbose"

# Set build variant
if [ "$BUILD_MODE" = "release" ]; then
    BUILD_VARIANT="release"
else
    BUILD_VARIANT="debug"
fi

# Build and deploy using Expo
# Note: expo run:android automatically detects and uses connected devices
# We only need to ensure our target device is the only one connected or use adb to select it
log "Running: npx expo run:android --variant $BUILD_VARIANT (targeting $TARGET_DEVICE)" "verbose"

# If multiple devices, set ADB to use our target device
DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device$" | wc -l)
if [ "$DEVICE_COUNT" -gt 1 ]; then
    export ANDROID_SERIAL="$TARGET_DEVICE"
    log "Multiple devices detected, using ANDROID_SERIAL=$TARGET_DEVICE" "verbose"
fi

if [ "$VERBOSE" = true ]; then
    npx expo run:android --variant "$BUILD_VARIANT"
    BUILD_EXIT_CODE=$?
else
    npx expo run:android --variant "$BUILD_VARIANT" 2>&1 | grep -E "(BUILD|Installing|Starting|Success|Error|Failed|Warning)" || true
    BUILD_EXIT_CODE=${PIPESTATUS[0]}
fi

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    log "${RED}❌ Build and deployment failed${NC}"
    log "Run with --verbose flag to see detailed output"
    cd "$PROJECT_ROOT"
    exit 1
fi

log "${GREEN}✅ App deployed successfully${NC}"

# Get app PID
sleep 2
APP_PID=$(adb -s "$TARGET_DEVICE" shell pidof "$PACKAGE_NAME" 2>/dev/null || true)

# Final success message
log "\n${BOLD}${GREEN}🎉 Deployment Pipeline Complete!${NC}"
log "${GREEN}=======================================================${NC}"
log "${GREEN}✅ App Name:${NC} $APP_NAME"
log "${GREEN}✅ Device:${NC} $TARGET_DEVICE"
log "${GREEN}✅ Package:${NC} $PACKAGE_NAME"
if [ -n "$APP_PID" ]; then
    log "${GREEN}✅ Process ID:${NC} $APP_PID"
fi
log "${GREEN}✅ Build Mode:${NC} $BUILD_MODE"
log "${GREEN}=======================================================${NC}"

# Step 8: Show logs if requested
if [ "$SHOW_LOGS" = true ]; then
    log "\n${YELLOW}📱 App Console Logs (Press Ctrl+C to exit):${NC}"
    log "${BLUE}=======================================================${NC}"
    # Wait a moment for app to fully start
    sleep 2
    adb -s "$TARGET_DEVICE" logcat -s ReactNative:V ReactNativeJS:V "$APP_NAME:V" 2>/dev/null || \
    adb -s "$TARGET_DEVICE" logcat | grep -E "$PACKAGE_NAME|ReactNative" 2>/dev/null || \
    log "${YELLOW}⚠️  Log streaming not available${NC}"
else
    log "\n${BLUE}💡 Tips:${NC}"
    log "• To view console logs: ${YELLOW}$0 --logs${NC}"
    log "• To rebuild in release mode: ${YELLOW}$0 --release${NC}"
    log "• To use different device: ${YELLOW}$0 --device \"emulator-5554\"${NC}"
    log "• For verbose output: ${YELLOW}$0 --verbose${NC}"
    log "• For faster iterations: ${YELLOW}./scripts/hot-reload.sh${NC} (with hot reload)"
    log "• List devices/emulators: ${YELLOW}adb devices${NC}"
fi

cd "$PROJECT_ROOT"
log "\n${GREEN}🚀 $APP_NAME is now running on $TARGET_DEVICE!${NC}"
