#!/bin/bash

# Setup Test Environment Script
# This script loads environment variables from app/.env and exports them for testing
# Supports both iOS and Android platforms
# Can also start iOS simulators or Android emulators by name

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/app/.env"

# Default to iOS platform if not specified
PLATFORM="${PLATFORM:-ios}"
START_EMULATOR=""
EMULATOR_NAME=""
START_APPIUM=""

# Function to display usage
show_usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo -e "  ${GREEN}source ./scripts/setup-test-env.sh [OPTIONS]${NC}"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo -e "  ${GREEN}--platform <ios|android>${NC}     Set the platform (default: ios)"
    echo -e "  ${GREEN}--start-emulator <name>${NC}      Start emulator/simulator by name"
    echo -e "  ${GREEN}--start-appium${NC}               Start Appium server with inspector plugin"
    echo -e "                                 - Runs on port \${APPIUM_PORT:-4723}"
    echo -e "                                 - Inspector UI: http://localhost:4723/inspector"
    echo -e "                                 - Auto-installs inspector plugin if missing"
    echo -e "  ${GREEN}--stop-appium${NC}                Stop all running Appium processes"
    echo -e "  ${GREEN}--list-emulators${NC}             List available emulators/simulators"
    echo -e "  ${GREEN}--help${NC}                       Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --platform ios --start-emulator \"iPhone 16\"${NC}"
    echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --platform android --start-emulator \"Pixel_8_API_34\"${NC}"
    echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --start-appium${NC}"
    echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --stop-appium${NC}"
    echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --list-emulators${NC}"
    echo ""
}

# Function to list available emulators/simulators
list_emulators() {
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}  Available Emulators/Simulators${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""
    
    echo -e "${YELLOW}iOS Simulators:${NC}"
    if command -v xcrun &> /dev/null; then
        xcrun simctl list devices available | grep -E "^\s+.+" | head -20
    else
        echo -e "  ${RED}xcrun not found - iOS simulators unavailable${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Android Emulators:${NC}"
    if command -v emulator &> /dev/null; then
        emulator -list-avds 2>/dev/null || echo -e "  ${RED}No Android emulators found${NC}"
    elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/emulator/emulator" ]; then
        "$ANDROID_HOME/emulator/emulator" -list-avds 2>/dev/null || echo -e "  ${RED}No Android emulators found${NC}"
    else
        echo -e "  ${RED}Android emulator command not found${NC}"
        echo -e "  ${YELLOW}Tip: Set ANDROID_HOME or add emulator to PATH${NC}"
    fi
    echo ""
}

# Function to start iOS simulator by name
start_ios_simulator() {
    local simulator_name="$1"
    echo -e "${YELLOW}🚀 Starting iOS Simulator: $simulator_name${NC}"
    
    if ! command -v xcrun &> /dev/null; then
        echo -e "${RED}❌ Error: xcrun not found. Xcode Command Line Tools required.${NC}"
        return 1
    fi
    
    # Find simulator UDID by name
    local udid=$(xcrun simctl list devices available | grep "$simulator_name" | grep -oE "[A-F0-9-]{36}" | head -1)
    
    if [ -z "$udid" ]; then
        echo -e "${RED}❌ Error: Simulator '$simulator_name' not found.${NC}"
        echo -e "${YELLOW}Available simulators:${NC}"
        xcrun simctl list devices available | grep -E "^\s+.+" | head -10
        return 1
    fi
    
    echo -e "  ${GREEN}✓${NC} Found simulator UDID: $udid"
    
    # Check if simulator is already booted
    local state=$(xcrun simctl list devices | grep "$udid" | grep -o "(Booted)" || true)
    
    if [ -n "$state" ]; then
        echo -e "  ${GREEN}✓${NC} Simulator already running"
    else
        echo -e "  ${YELLOW}⏳${NC} Booting simulator..."
        xcrun simctl boot "$udid" 2>/dev/null || true
        
        # Open Simulator app
        open -a Simulator
        
        # Wait for simulator to boot
        local timeout=60
        local count=0
        while [ $count -lt $timeout ]; do
            state=$(xcrun simctl list devices | grep "$udid" | grep -o "(Booted)" || true)
            if [ -n "$state" ]; then
                break
            fi
            sleep 1
            count=$((count + 1))
        done
        
        if [ -n "$state" ]; then
            echo -e "  ${GREEN}✓${NC} Simulator booted successfully"
        else
            echo -e "${YELLOW}⚠${NC}  Simulator may still be starting..."
        fi
    fi
    
    # Export the UDID for use in tests
    export DEVICE_UDID="$udid"
    export DEVICE_NAME="$simulator_name"
}

# Function to start Android emulator by name
start_android_emulator() {
    local emulator_name="$1"
    echo -e "${YELLOW}🚀 Starting Android Emulator: $emulator_name${NC}"
    
    # Find emulator command
    local emulator_cmd=""
    if command -v emulator &> /dev/null; then
        emulator_cmd="emulator"
    elif [ -n "$ANDROID_HOME" ] && [ -f "$ANDROID_HOME/emulator/emulator" ]; then
        emulator_cmd="$ANDROID_HOME/emulator/emulator"
    else
        echo -e "${RED}❌ Error: Android emulator not found.${NC}"
        echo -e "${YELLOW}Tip: Set ANDROID_HOME or add emulator to PATH${NC}"
        return 1
    fi
    
    # Check if emulator exists
    local avd_exists=$("$emulator_cmd" -list-avds 2>/dev/null | grep -x "$emulator_name" || true)
    
    if [ -z "$avd_exists" ]; then
        echo -e "${RED}❌ Error: Emulator '$emulator_name' not found.${NC}"
        echo -e "${YELLOW}Available emulators:${NC}"
        "$emulator_cmd" -list-avds 2>/dev/null
        return 1
    fi
    
    echo -e "  ${GREEN}✓${NC} Found emulator: $emulator_name"
    
    # Check if emulator is already running
    if command -v adb &> /dev/null; then
        local running=$(adb devices | grep -v "List" | grep "emulator" | grep "device$" || true)
        if [ -n "$running" ]; then
            echo -e "  ${GREEN}✓${NC} An Android emulator is already running"
            local device_id=$(echo "$running" | head -1 | awk '{print $1}')
            export DEVICE_UDID="$device_id"
            export DEVICE_NAME="$emulator_name"
            return 0
        fi
    fi
    
    echo -e "  ${YELLOW}⏳${NC} Starting emulator (this may take a moment)..."
    
    # Start emulator in background with no-snapshot-load for faster boot
    "$emulator_cmd" -avd "$emulator_name" -no-snapshot-load -no-boot-anim &>/dev/null &
    local emulator_pid=$!
    
    # Wait for emulator to boot
    if command -v adb &> /dev/null; then
        echo -e "  ${YELLOW}⏳${NC} Waiting for emulator to boot..."
        local timeout=120
        local count=0
        while [ $count -lt $timeout ]; do
            local device_ready=$(adb devices | grep -v "List" | grep "emulator" | grep "device$" || true)
            if [ -n "$device_ready" ]; then
                # Wait for boot animation to complete
                local boot_complete=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)
                if [ "$boot_complete" = "1" ]; then
                    break
                fi
            fi
            sleep 2
            count=$((count + 2))
            if [ $((count % 10)) -eq 0 ]; then
                echo -e "  ${YELLOW}⏳${NC} Still waiting... ($count seconds)"
            fi
        done
        
        local device_id=$(adb devices | grep -v "List" | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
        if [ -n "$device_id" ]; then
            echo -e "  ${GREEN}✓${NC} Emulator booted successfully: $device_id"
            export DEVICE_UDID="$device_id"
        else
            echo -e "${YELLOW}⚠${NC}  Emulator may still be starting..."
        fi
    fi
    
    export DEVICE_NAME="$emulator_name"
}

# Function to start Appium server with inspector plugin
start_appium_server() {
    echo -e "${YELLOW}🚀 Starting Appium server with inspector plugin...${NC}"
    
    if ! command -v appium &> /dev/null; then
        echo -e "${RED}❌ Error: Appium not found. Please install it with: npm install -g appium${NC}"
        return 1
    fi
    
    # Check if Appium is already running
    if lsof -i:${APPIUM_PORT:-4723} &> /dev/null; then
        echo -e "  ${YELLOW}⚠${NC}  Appium may already be running on port ${APPIUM_PORT:-4723}"
        echo -e "  ${YELLOW}⚠${NC}  Kill existing process with: lsof -ti:${APPIUM_PORT:-4723} | xargs kill -9"
        return 1
    fi
    
    # Check if inspector plugin is installed
    local inspector_installed=$(appium plugin list --installed 2>&1 | grep -c "inspector" || true)
    if [ "$inspector_installed" -eq 0 ]; then
        echo -e "  ${YELLOW}⚠${NC}  Inspector plugin not installed. Installing..."
        appium plugin install inspector
    fi
    
    echo -e "  ${GREEN}✓${NC} Starting Appium on port ${APPIUM_PORT:-4723} with inspector plugin"
    echo -e "  ${BLUE}ℹ${NC}  Inspector URL: http://localhost:${APPIUM_PORT:-4723}/inspector"
    echo ""
    
    # Start Appium in background, redirect output to /dev/null
    appium --use-plugins=inspector --allow-cors --port "${APPIUM_PORT:-4723}" >/dev/null 2>&1 &
    local appium_pid=$!
    
    # Wait a moment for Appium to start
    sleep 2
    
    # Check if Appium started successfully
    if kill -0 $appium_pid 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Appium server started (PID: $appium_pid)"
        export APPIUM_PID=$appium_pid
    else
        echo -e "${RED}❌ Error: Appium failed to start${NC}"
        return 1
    fi
}

# Function to stop all running Appium processes
stop_appium_server() {
    echo -e "${YELLOW}🛑 Stopping Appium server...${NC}"
    
    local killed_count=0
    
    # Kill processes on Appium port
    local port_pids=$(lsof -ti:${APPIUM_PORT:-4723} 2>/dev/null || true)
    if [ -n "$port_pids" ]; then
        echo -e "  ${YELLOW}⏳${NC} Killing processes on port ${APPIUM_PORT:-4723}..."
        echo "$port_pids" | xargs kill -9 2>/dev/null || true
        killed_count=$((killed_count + $(echo "$port_pids" | wc -l)))
    fi
    
    # Kill any remaining Appium node processes
    local appium_pids=$(pgrep -f "appium" 2>/dev/null || true)
    if [ -n "$appium_pids" ]; then
        echo -e "  ${YELLOW}⏳${NC} Killing Appium processes..."
        echo "$appium_pids" | xargs kill -9 2>/dev/null || true
        killed_count=$((killed_count + $(echo "$appium_pids" | wc -l)))
    fi
    
    # Clean up any orphaned node processes running Appium
    local node_appium_pids=$(pgrep -f "node.*appium" 2>/dev/null || true)
    if [ -n "$node_appium_pids" ]; then
        echo -e "  ${YELLOW}⏳${NC} Killing node Appium processes..."
        echo "$node_appium_pids" | xargs kill -9 2>/dev/null || true
        killed_count=$((killed_count + $(echo "$node_appium_pids" | wc -l)))
    fi
    
    # Clear the exported PID if set
    unset APPIUM_PID
    
    if [ $killed_count -gt 0 ]; then
        echo -e "  ${GREEN}✓${NC} Stopped Appium processes"
    else
        echo -e "  ${GREEN}✓${NC} No Appium processes were running"
    fi
    
    # Verify port is free
    sleep 1
    if lsof -i:${APPIUM_PORT:-4723} &> /dev/null; then
        echo -e "  ${YELLOW}⚠${NC}  Port ${APPIUM_PORT:-4723} may still be in use"
    else
        echo -e "  ${GREEN}✓${NC} Port ${APPIUM_PORT:-4723} is now free"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --platform|-p)
            PLATFORM="$2"
            shift 2
            ;;
        --start-emulator|-e)
            START_EMULATOR="true"
            EMULATOR_NAME="$2"
            shift 2
            ;;
        --start-appium|-a)
            START_APPIUM="true"
            shift
            ;;
        --stop-appium)
            stop_appium_server
            return 0 2>/dev/null || exit 0
            ;;
        --list-emulators|-l)
            list_emulators
            return 0 2>/dev/null || exit 0
            ;;
        --help|-h)
            show_usage
            return 0 2>/dev/null || exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_usage
            return 1 2>/dev/null || exit 1
            ;;
    esac
done

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  Test Environment Setup${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: .env file not found at $ENV_FILE${NC}"
    echo ""
    echo "Please create a .env file in the app directory with the following variables:"
    echo "(See app/.env.example for a template)"
    echo ""
    echo "# Auth0 Configuration (Test Environment)"
    echo "AUTH0_DOMAIN=your-domain.auth0.com"
    echo "AUTH0_CLIENT_ID=your_client_id"
    echo "AUTH0_AUDIENCE=your_audience"
    echo "AUTH0_SCOPE=openid profile email offline_access"
    echo "AUTH0_API_URL=your_api_url"
    echo "AUTH0_OTP_DIGITS=6"
    echo "AUTH0_SCHEME=com.softwareone.marketplaceMobile"
    echo ""
    echo "# Tests (Airtable Configuration for OTP testing)"
    echo "AIRTABLE_EMAIL=your_test_email@example.com"
    echo "AIRTABLE_API_TOKEN=your_token"
    echo "AIRTABLE_BASE_ID=your_base_id"
    echo "AIRTABLE_TABLE_NAME=your_table"
    echo "AIRTABLE_FROM_EMAIL=your_from_email@example.com"
    echo ""
    exit 1
fi

# Load and export variables from .env
echo -e "${YELLOW}📦 Loading environment variables from .env file...${NC}"
echo ""

# Export each line that doesn't start with # and contains =
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ "$line" =~ = ]]; then
        # Remove leading/trailing whitespace
        line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
        
        # Export the variable
        export "$line"
        
        # Extract variable name for display
        var_name=$(echo "$line" | cut -d= -f1)
        echo -e "  ${GREEN}✓${NC} Exported: $var_name"
    fi
done < "$ENV_FILE"

echo ""
echo -e "${YELLOW}🔧 Setting up platform-specific configuration...${NC}"
echo ""

# Set platform-specific environment variables
PLATFORM_LOWER=$(echo "$PLATFORM" | tr '[:upper:]' '[:lower:]')

if [ "$PLATFORM_LOWER" = "android" ]; then
    # Android configuration
    export PLATFORM_NAME="Android"
    export AUTOMATION_NAME="UiAutomator2"
    export APP_PACKAGE="${APP_PACKAGE:-com.softwareone.marketplaceMobile}"
    export APP_ACTIVITY="${APP_ACTIVITY:-.MainActivity}"
    
    echo -e "  ${GREEN}✓${NC} Platform: Android"
    echo -e "  ${GREEN}✓${NC} Automation: UiAutomator2"
    echo -e "  ${GREEN}✓${NC} Package: $APP_PACKAGE"
    echo -e "  ${GREEN}✓${NC} Activity: $APP_ACTIVITY"
    
    # Try to detect connected Android devices
    if command -v adb &> /dev/null; then
        DEVICE_UDID=$(adb devices | grep -v "List" | grep "device$" | head -1 | awk '{print $1}')
        if [ -n "$DEVICE_UDID" ]; then
            export DEVICE_UDID
            echo -e "  ${GREEN}✓${NC} Device detected: $DEVICE_UDID"
        else
            echo -e "  ${YELLOW}⚠${NC}  No Android devices detected"
        fi
    fi
    
    export DEVICE_NAME="${DEVICE_NAME:-Pixel 8}"
    export PLATFORM_VERSION="${PLATFORM_VERSION:-14}"
else
    # iOS configuration (default)
    export PLATFORM_NAME="iOS"
    export AUTOMATION_NAME="XCUITest"
    export APP_BUNDLE_ID="${APP_BUNDLE_ID:-com.softwareone.marketplaceMobile}"
    
    echo -e "  ${GREEN}✓${NC} Platform: iOS"
    echo -e "  ${GREEN}✓${NC} Automation: XCUITest"
    echo -e "  ${GREEN}✓${NC} Bundle ID: $APP_BUNDLE_ID"
    
    export DEVICE_UDID="${DEVICE_UDID:-963A992A-A208-4EF4-B7F9-7B2A569EC133}"
    export DEVICE_NAME="${DEVICE_NAME:-iPhone 16}"
    export PLATFORM_VERSION="${PLATFORM_VERSION:-26.0}"
fi

echo -e "  ${GREEN}✓${NC} Device: $DEVICE_NAME"
echo -e "  ${GREEN}✓${NC} Platform Version: $PLATFORM_VERSION"

# Start emulator/simulator if requested
if [ "$START_EMULATOR" = "true" ] && [ -n "$EMULATOR_NAME" ]; then
    echo ""
    if [ "$PLATFORM_LOWER" = "android" ]; then
        start_android_emulator "$EMULATOR_NAME"
    else
        start_ios_simulator "$EMULATOR_NAME"
    fi
fi

# Set common Appium configuration
export APPIUM_HOST="${APPIUM_HOST:-127.0.0.1}"
export APPIUM_PORT="${APPIUM_PORT:-4723}"

# Start Appium server if requested
if [ "$START_APPIUM" = "true" ]; then
    echo ""
    start_appium_server
fi

echo ""
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  Configuration Summary${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

echo -e "${YELLOW}Auth0 Configuration:${NC}"
echo "  Domain:    $AUTH0_DOMAIN"
echo "  Client ID: ${AUTH0_CLIENT_ID:0:20}..."
echo "  Audience:  $AUTH0_AUDIENCE"

if [ -n "$AIRTABLE_API_TOKEN" ]; then
    echo ""
    echo -e "${YELLOW}Airtable Configuration:${NC}"
    echo "  Base ID:   ${AIRTABLE_BASE_ID:0:20}..."
    echo "  Table:     $AIRTABLE_TABLE_NAME"
    echo "  Email:     $AIRTABLE_FROM_EMAIL"
fi

echo ""
echo -e "${YELLOW}Test Platform:${NC}"
echo "  Platform:  $PLATFORM_NAME"
echo "  Device:    $DEVICE_NAME"
echo "  Version:   $PLATFORM_VERSION"

echo ""
echo -e "${YELLOW}Appium Configuration:${NC}"
echo "  Host:      $APPIUM_HOST"
echo "  Port:      $APPIUM_PORT"

echo ""
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "${YELLOW}Usage:${NC}"
echo -e "  ${GREEN}source ./scripts/setup-test-env.sh${NC}                              # Setup for iOS (default)"
echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --platform android${NC}           # Setup for Android"
echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --start-emulator \"iPhone 16\"${NC}  # Start iOS simulator"
echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --start-appium${NC}               # Start Appium with inspector"
echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --platform android --start-emulator \"Pixel_8_API_34\"${NC}"
echo -e "  ${GREEN}source ./scripts/setup-test-env.sh --list-emulators${NC}             # List available emulators"
echo ""
echo -e "${YELLOW}Run Tests:${NC}"
echo -e "  ${GREEN}./scripts/run-local-test.sh --platform ios welcome${NC}"
echo -e "  ${GREEN}./scripts/run-local-test.sh --platform android welcome${NC}"
echo ""
