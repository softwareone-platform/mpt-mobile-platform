#!/bin/bash

# SoftwareONE Marketplace Platform Mobile - iOS Deploy Script
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
BUNDLE_ID="com.softwareone.marketplaceMobile"
DEFAULT_SIMULATOR="iPhone 16 Pro"
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
        --simulator|-s)
            DEFAULT_SIMULATOR="$2"
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
            echo "2. Uninstalls existing app from simulator"
            echo "3. Cleans React Native build cache"
            echo "4. Builds fresh React Native app with Expo"
            echo "5. Deploys to iOS simulator"
            echo "6. Launches the app"
            echo ""
            echo "Options:"
            echo "  -c, --client-id ID    Auth0 client ID (required if .env not configured)"
            echo "  -r, --release         Build in release mode (default: debug)"
            echo "  -s, --simulator NAME  Specify simulator name (default: iPhone 16 Pro)"
            echo "  -f, --force-boot      Force boot simulator even if already running"
            echo "  -l, --logs            Show app logs after launch"
            echo "  -v, --verbose         Show verbose output"
            echo "  -h, --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --client-id YOUR_CLIENT_ID"
            echo "  $0 -c YOUR_CLIENT_ID --release --logs"
            echo "  $0 -s \"iPhone 15 Pro\" -v       # Uses existing .env file"
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
log "Target Simulator: ${YELLOW}$DEFAULT_SIMULATOR${NC}"
log "Bundle ID: ${YELLOW}$BUNDLE_ID${NC}"
log "${BLUE}=======================================================${NC}"

# Function to find simulator ID
find_simulator_id() {
    xcrun simctl list devices | grep "$1" | grep -v "unavailable" | head -1 | grep -E -o '\([A-F0-9\-]+\)' | tr -d '()'
}

# Function to get simulator name by ID
get_simulator_name() {
    xcrun simctl list devices | grep "$1" | sed 's/(.*)//g' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//'
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

# Check Xcode tools
if ! command -v xcrun &> /dev/null; then
    log "${RED}❌ Xcode command line tools not found${NC}"
    log "Please install Xcode and command line tools"
    exit 1
fi

log "${GREEN}✅ Xcode tools available${NC}" "verbose"

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

# Step 2: Find and prepare simulator
log "\n${YELLOW}Step 2: Preparing iOS Simulator...${NC}"

SIMULATOR_ID=$(find_simulator_id "$DEFAULT_SIMULATOR")
if [ -z "$SIMULATOR_ID" ]; then
    log "${YELLOW}⚠️  '$DEFAULT_SIMULATOR' not found${NC}"
    log "Available iOS simulators:" "verbose"
    xcrun simctl list devices | grep -E "iPhone|iPad" | grep -v "unavailable" | head -10

    # Try to find any iPhone simulator
    SIMULATOR_ID=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -1 | grep -E -o '\([A-F0-9\-]+\)' | tr -d '()')
    if [ -z "$SIMULATOR_ID" ]; then
        log "${RED}❌ No iPhone simulators found${NC}"
        log "Please create an iOS simulator using Xcode"
        exit 1
    fi
    DEFAULT_SIMULATOR=$(get_simulator_name "$SIMULATOR_ID")
    log "${YELLOW}⚠️  Using: $DEFAULT_SIMULATOR${NC}"
fi

SIMULATOR_NAME=$(get_simulator_name "$SIMULATOR_ID")
log "${GREEN}✅ Target: $SIMULATOR_NAME ($SIMULATOR_ID)${NC}"

# Step 3: Boot simulator
log "\n${YELLOW}Step 3: Starting iOS Simulator...${NC}"

SIMULATOR_STATE=$(xcrun simctl list devices | grep "$SIMULATOR_ID" | grep -o "(.*)" | tail -1 | tr -d '()')
log "Current state: $SIMULATOR_STATE" "verbose"

if [ "$SIMULATOR_STATE" != "Booted" ] || [ "$FORCE_BOOT" = true ]; then
    if [ "$FORCE_BOOT" = true ]; then
        log "Force booting simulator..." "verbose"
        xcrun simctl shutdown "$SIMULATOR_ID" 2>/dev/null || true
        sleep 2
    fi

    log "Booting simulator..." "verbose"
    xcrun simctl boot "$SIMULATOR_ID" 2>/dev/null || true
    log "${GREEN}✅ Simulator booted${NC}"

    # Wait for full boot
    sleep 3
else
    log "${GREEN}✅ Simulator already running${NC}"
fi

# Open Simulator.app if not already open
if ! pgrep -f "Simulator.app" > /dev/null; then
    log "Opening Simulator app..." "verbose"
    open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app 2>/dev/null || true
    sleep 2
fi

# Step 4: Uninstall existing app
log "\n${YELLOW}Step 4: Uninstalling existing app...${NC}"

# Check if app is installed
INSTALLED_APPS=$(xcrun simctl listapps "$SIMULATOR_ID" | grep -o "\"$BUNDLE_ID\"" | wc -l)
if [ "$INSTALLED_APPS" -gt 0 ]; then
    log "Found existing app, uninstalling..." "verbose"
    xcrun simctl uninstall "$SIMULATOR_ID" "$BUNDLE_ID" 2>/dev/null || true
    log "${GREEN}✅ Previous version removed${NC}"
else
    log "${GREEN}✅ No previous version found${NC}"
fi

# Step 5: Clean and prepare build
log "\n${YELLOW}Step 5: Cleaning build cache...${NC}"

# Clean iOS build artifacts
log "Cleaning iOS build cache..." "verbose"
rm -rf ios/build > /dev/null 2>&1 || true

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

# Step 6.5: Prebuild native iOS project
log "\n${YELLOW}Step 6.5: Rebuilding native iOS project with Expo...${NC}"

log "Running expo prebuild (includes automatic CocoaPods installation)..." "verbose"
if [ "$VERBOSE" = true ]; then
    npx expo prebuild --platform ios --clean
else
    npx expo prebuild --platform ios --clean > /dev/null 2>&1
fi

if [ $? -ne 0 ]; then
    log "${RED}❌ Failed to prebuild iOS project${NC}"
    exit 1
fi

log "${GREEN}✅ Native iOS project rebuilt (CocoaPods installed automatically)${NC}"

# Step 7: Build and run with Expo
log "\n${YELLOW}Step 7: Building and deploying React Native app...${NC}"

log "Building for iOS Simulator in $BUILD_MODE mode..." "verbose"

# Set build configuration
if [ "$BUILD_MODE" = "release" ]; then
    BUILD_CONFIG="Release"
else
    BUILD_CONFIG="Debug"
fi

# Build and deploy using Expo
log "Running: npx expo run:ios --device \"$SIMULATOR_NAME\" --configuration $BUILD_CONFIG" "verbose"

if [ "$VERBOSE" = true ]; then
    npx expo run:ios --device "$SIMULATOR_NAME" --configuration $BUILD_CONFIG
    BUILD_EXIT_CODE=$?
else
    npx expo run:ios --device "$SIMULATOR_NAME" --configuration $BUILD_CONFIG 2>&1 | grep -E "(Building|Installing|Opening|Success|Error|Failed|Warning)" || true
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
APP_PID=$(xcrun simctl spawn "$SIMULATOR_ID" launchctl list | grep "$BUNDLE_ID" | awk '{print $1}' | head -1)

# Final success message
log "\n${BOLD}${GREEN}🎉 Deployment Pipeline Complete!${NC}"
log "${GREEN}=======================================================${NC}"
log "${GREEN}✅ App Name:${NC} $APP_NAME"
log "${GREEN}✅ Simulator:${NC} $SIMULATOR_NAME"
log "${GREEN}✅ Bundle ID:${NC} $BUNDLE_ID"
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
    xcrun simctl spawn "$SIMULATOR_ID" log stream --predicate "subsystem contains \"$BUNDLE_ID\"" --level=info --color=always 2>/dev/null || \
    xcrun simctl spawn "$SIMULATOR_ID" log stream --predicate "process == \"SoftwareOne\"" --level=info --color=always 2>/dev/null || \
    log "${YELLOW}⚠️  Log streaming not available on this system${NC}"
else
    log "\n${BLUE}💡 Tips:${NC}"
    log "• To view console logs: ${YELLOW}$0 --logs${NC}"
    log "• To rebuild in release mode: ${YELLOW}$0 --release${NC}"
    log "• To use different simulator: ${YELLOW}$0 --simulator \"iPhone 15\"${NC}"
    log "• For verbose output: ${YELLOW}$0 --verbose${NC}"
    log "• For faster iterations: ${YELLOW}./scripts/hot-reload.sh${NC} (with hot reload)"
fi

cd "$PROJECT_ROOT"
log "\n${GREEN}🚀 $APP_NAME is now running on $SIMULATOR_NAME!${NC}"
