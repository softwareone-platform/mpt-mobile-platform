#!/bin/bash

# Local testing script for Appium tests
# Usage: ./scripts/run-local-test.sh [suite_name|spec_file]
# Examples:
#   ./scripts/run-local-test.sh welcome
#   ./scripts/run-local-test.sh ./test/specs/welcome.e2e.js

# Parse command line arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [suite_name|spec_file]"
    echo "Examples:"
    echo "  $0 welcome                          # Run welcome suite"
    echo "  $0 ./test/specs/welcome.e2e.js     # Run specific spec file"
    exit 1
fi

TEST_TARGET="$1"

# Set required environment variables for local testing
export DEVICE_UDID="6AF2014D-BAB3-4E5E-821B-1D908B9BDCA8"  # Use your actual simulator UDID
export DEVICE_NAME="iPhone 16"
export PLATFORM_VERSION="26.0" 
export APP_BUNDLE_ID="com.softwareone.marketplaceMobile"
export APPIUM_HOST="127.0.0.1"
export APPIUM_PORT="4723"

# Debug output
echo "🔍 Environment variables for WebDriverIO:"
echo "   DEVICE_UDID: $DEVICE_UDID"
echo "   DEVICE_NAME: $DEVICE_NAME" 
echo "   PLATFORM_VERSION: $PLATFORM_VERSION"
echo "   APP_BUNDLE_ID: $APP_BUNDLE_ID"
echo "   APPIUM_HOST: $APPIUM_HOST"
echo "   APPIUM_PORT: $APPIUM_PORT"

# Get available simulators
echo ""
echo "📱 Available simulators:"
xcrun simctl list devices | grep iPhone | grep Booted || echo "No booted simulators found"

# Determine if target is a suite or spec file
if [[ "$TEST_TARGET" == *.js ]]; then
    TEST_ARGS="--spec $TEST_TARGET"
    echo ""
    echo "🚀 Starting WebDriver tests with spec: $TEST_TARGET"
else
    TEST_ARGS="--suite $TEST_TARGET"
    echo ""
    echo "🚀 Starting WebDriver tests with suite: $TEST_TARGET"
fi

# Change to app directory and run the test
cd app
npx wdio run wdio.conf.js $TEST_ARGS