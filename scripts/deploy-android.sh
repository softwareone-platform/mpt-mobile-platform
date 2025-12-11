#!/bin/bash
# Android deployment script for Appium testing
# Usage: ./scripts/deploy-android.sh [options]

set -e

# Configuration
BUILD_TYPE="debug"
EMULATOR_NAME=""
VERBOSE=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_info() { echo -e "${BLUE}ℹ ${1}${NC}"; }
print_success() { echo -e "${GREEN}✅ ${1}${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  ${1}${NC}"; }
print_error() { echo -e "${RED}❌ ${1}${NC}"; }

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --release|-r)
            BUILD_TYPE="release"
            shift
            ;;
        --debug|-d)
            BUILD_TYPE="debug"
            shift
            ;;
        --emulator)
            EMULATOR_NAME="$2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "Android Deployment Script for Appium Testing"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "This script builds and deploys the React Native app to Android."
            echo "Prerequisites:"
            echo "  - .env file must exist in app/ directory with Auth0 configuration"
            echo "  - Android SDK and emulator/device must be set up"
            echo ""
            echo "Options:"
            echo "  --release, -r      Build release version"
            echo "  --debug, -d        Build debug version (default)"
            echo "  --emulator         Specify emulator AVD name to start"
            echo "  --verbose, -v      Enable verbose output"
            echo "  --help, -h         Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Deploy with defaults"
            echo "  $0 --release --emulator Pixel_8_API_34"
            echo "  $0 --debug --verbose"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_info "Starting Android deployment..."

# Check for Android SDK
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    print_error "ANDROID_HOME or ANDROID_SDK_ROOT not set"
    print_info "Please set one of these environment variables to your Android SDK path"
    print_info "Example: export ANDROID_HOME=\$HOME/Library/Android/sdk"
    exit 1
fi

ANDROID_SDK="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
print_success "Android SDK found at: $ANDROID_SDK"

# Verify ADB is available
if ! command -v adb &> /dev/null; then
    print_error "ADB not found in PATH"
    print_info "Please ensure Android SDK platform-tools are in your PATH"
    print_info "Add to PATH: export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    exit 1
fi

print_success "ADB found: $(adb --version | head -1)"

# Start emulator if specified
if [ -n "$EMULATOR_NAME" ]; then
    print_info "Checking emulator status: $EMULATOR_NAME"
    
    # Check if emulator exists
    if ! $ANDROID_SDK/emulator/emulator -list-avds | grep -q "^${EMULATOR_NAME}$"; then
        print_error "Emulator '$EMULATOR_NAME' not found"
        print_info "Available emulators:"
        $ANDROID_SDK/emulator/emulator -list-avds
        exit 1
    fi
    
    # Check if emulator is already running
    if adb devices | grep -q "emulator"; then
        print_warning "An emulator is already running"
    else
        print_info "Starting emulator: $EMULATOR_NAME"
        $ANDROID_SDK/emulator/emulator -avd "$EMULATOR_NAME" -no-snapshot -no-audio &
        
        print_info "Waiting for emulator to boot..."
        adb wait-for-device
        
        # Wait for boot to complete (5 minute timeout)
        BOOT_TIMEOUT=300
        BOOT_START=$(date +%s)
        while true; do
            BOOT_COMPLETED=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
            if [ "$BOOT_COMPLETED" = "1" ]; then
                break
            fi
            
            BOOT_ELAPSED=$(($(date +%s) - BOOT_START))
            if [ $BOOT_ELAPSED -ge $BOOT_TIMEOUT ]; then
                print_error "Emulator failed to boot within 5 minutes"
                exit 1
            fi
            
            sleep 1
        done
        
        print_success "Emulator is ready!"
        sleep 5
    fi
fi

# Check for connected devices
DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device$" | wc -l | tr -d ' ')
if [ "$DEVICE_COUNT" -eq 0 ]; then
    print_error "No Android devices or emulators connected"
    print_info "Please connect a device or start an emulator"
    print_info "To list available emulators: emulator -list-avds"
    print_info "To start an emulator: emulator -avd <avd-name>"
    exit 1
fi

print_success "Found $DEVICE_COUNT connected device(s)"

# Navigate to app directory
cd "$PROJECT_ROOT/app"

# Validate .env file exists
if [ ! -f ".env" ]; then
    print_error "No .env file found"
    print_info "Please create a .env file in app directory with required configuration"
    exit 1
fi

print_success "Using .env configuration"

# Build the app with Expo (like iOS deploy script)
print_info "Building Android app in $BUILD_TYPE mode with Expo..."

if [ "$VERBOSE" = true ]; then
    if [ "$BUILD_TYPE" = "release" ]; then
        print_info "Running: npx expo run:android --variant release"
        npx expo run:android --variant release
    else
        print_info "Running: npx expo run:android"
        npx expo run:android
    fi
else
    if [ "$BUILD_TYPE" = "release" ]; then
        npx expo run:android --variant release 2>&1 | grep -E "(BUILD|INSTALL|SUCCESS|FAILURE|WARNING|Error|Failed)" || true
    else
        npx expo run:android 2>&1 | grep -E "(BUILD|INSTALL|SUCCESS|FAILURE|WARNING|Error|Failed)" || true
    fi
fi

if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "Build completed successfully!"

# Get device UDID
DEVICE_UDID=$(adb devices | grep -v "List" | grep "device$" | head -1 | awk '{print $1}')
export DEVICE_UDID

print_success "App deployed to device: $DEVICE_UDID"

# Verify app is installed
PACKAGE_NAME="com.softwareone.marketplaceMobile"
if adb -s "$DEVICE_UDID" shell pm list packages | grep -q "$PACKAGE_NAME"; then
    print_success "App package verified: $PACKAGE_NAME"
else
    print_warning "App package not found, installation may have failed"
fi

print_success "Android deployment complete!"
print_info "Device UDID: $DEVICE_UDID"
print_info "Package: $PACKAGE_NAME"
print_info ""
print_info "To run tests, use:"
print_info "  ./scripts/run-local-test.sh --platform android [suite-name]"

