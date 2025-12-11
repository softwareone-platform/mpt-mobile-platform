#!/bin/bash

# Setup Test Environment Script
# This script loads environment variables from app/.env and exports them for testing
# Supports both iOS and Android platforms

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

# Set common Appium configuration
export APPIUM_HOST="${APPIUM_HOST:-127.0.0.1}"
export APPIUM_PORT="${APPIUM_PORT:-4723}"

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
echo -e "  ${GREEN}source ./scripts/setup-test-env.sh${NC}              # Setup for iOS (default)"
echo -e "  ${GREEN}PLATFORM=android source ./scripts/setup-test-env.sh${NC}  # Setup for Android"
echo -e "  ${GREEN}. ./scripts/setup-test-env.sh${NC}                   # Shorthand"
echo ""
echo -e "${YELLOW}Run Tests:${NC}"
echo -e "  ${GREEN}./scripts/run-local-test.sh --platform ios welcome${NC}"
echo -e "  ${GREEN}./scripts/run-local-test.sh --platform android welcome${NC}"
echo ""
