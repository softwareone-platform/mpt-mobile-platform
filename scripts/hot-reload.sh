#!/bin/bash

# SoftwareONE Marketplace Platform Mobile - Hot Reload Development Script
# Quick start Expo development server with hot reload enabled

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
CLEAR_CACHE=false
TARGET_PLATFORM=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --clear|-c)
            CLEAR_CACHE=true
            shift
            ;;
        --ios|-i)
            TARGET_PLATFORM="ios"
            shift
            ;;
        --android|-a)
            TARGET_PLATFORM="android"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Start Expo development server with hot reload."
            echo "This is the fastest way to iterate during development."
            echo ""
            echo "Options:"
            echo "  -c, --clear     Clear cache before starting"
            echo "  -i, --ios       Auto-open in iOS Simulator"
            echo "  -a, --android   Auto-open in Android Emulator"
            echo "  -h, --help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Start server, choose platform manually"
            echo "  $0 --clear --ios      # Clear cache and auto-open iOS"
            echo "  $0 -c -a              # Clear cache and auto-open Android"
            echo ""
            echo "After starting:"
            echo "  • Press 'i' for iOS Simulator"
            echo "  • Press 'a' for Android Emulator"
            echo "  • Press 'r' to reload"
            echo "  • Press 'Ctrl+C' to stop"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Use --help to see available options"
            exit 1
            ;;
    esac
done

# Get the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo -e "${BOLD}${BLUE}🔥 Starting Hot Reload Development Server${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Navigate to app directory
cd "$PROJECT_ROOT/app"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo -e "Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please configure your .env file before running${NC}"
        exit 1
    else
        echo -e "${RED}❌ No .env.example found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Environment configured${NC}"

# Build the start command
START_CMD="npx expo start"

if [ "$CLEAR_CACHE" = true ]; then
    echo -e "${YELLOW}🧹 Clearing cache...${NC}"
    START_CMD="$START_CMD --clear"
fi

if [ -n "$TARGET_PLATFORM" ]; then
    echo -e "${BLUE}🎯 Target platform: ${YELLOW}$TARGET_PLATFORM${NC}"
fi

echo -e "${BLUE}=======================================================${NC}"
echo -e "${GREEN}🚀 Starting Expo development server...${NC}"
echo -e ""
echo -e "${BLUE}💡 Quick Actions:${NC}"
echo -e "  • Press ${YELLOW}'i'${NC} to open iOS Simulator"
echo -e "  • Press ${YELLOW}'a'${NC} to open Android Emulator"
echo -e "  • Press ${YELLOW}'r'${NC} to reload the app"
echo -e "  • Press ${YELLOW}'m'${NC} to toggle menu"
echo -e "  • Press ${YELLOW}'Ctrl+C'${NC} to stop the server"
echo -e "${BLUE}=======================================================${NC}"
echo -e ""

# Start the development server
eval $START_CMD

# If a platform was specified, auto-open it
if [ "$TARGET_PLATFORM" = "ios" ]; then
    # Wait a moment for server to start
    sleep 3
    echo -e "\n${GREEN}📱 Opening iOS Simulator...${NC}"
    # Expo will handle opening iOS if we send 'i'
elif [ "$TARGET_PLATFORM" = "android" ]; then
    sleep 3
    echo -e "\n${GREEN}🤖 Opening Android Emulator...${NC}"
    # Expo will handle opening Android if we send 'a'
fi
