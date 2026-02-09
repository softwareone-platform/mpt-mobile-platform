#!/bin/bash

# SoftwareONE Marketplace Platform Mobile - Cleanup Script
# Clean all build artifacts, caches, and generated files

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
DEEP_CLEAN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --deep|-d)
            DEEP_CLEAN=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Clean build artifacts and caches."
            echo ""
            echo "Options:"
            echo "  -d, --deep      Deep clean (removes node_modules, reinstalls)"
            echo "  -h, --help      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0              # Standard cleanup"
            echo "  $0 --deep       # Deep clean with npm reinstall"
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

echo -e "${BOLD}${BLUE}🧹 Cleaning Build Artifacts${NC}"
echo -e "${BLUE}=======================================================${NC}"

cd "$PROJECT_ROOT/app"

# Standard cleanup
echo -e "\n${YELLOW}📦 Cleaning build directories...${NC}"

# iOS builds
if [ -d "ios/build" ]; then
    rm -rf ios/build
    echo -e "${GREEN}✅ Removed ios/build${NC}"
fi

# Android builds
if [ -d "android/build" ]; then
    rm -rf android/build
    echo -e "${GREEN}✅ Removed android/build${NC}"
fi

if [ -d "android/app/build" ]; then
    rm -rf android/app/build
    echo -e "${GREEN}✅ Removed android/app/build${NC}"
fi

# Expo cache
echo -e "\n${YELLOW}🗂️  Cleaning Expo cache...${NC}"
if [ -d ".expo" ]; then
    rm -rf .expo
    echo -e "${GREEN}✅ Removed .expo${NC}"
fi

# Metro bundler cache
if [ -d "$HOME/.metro" ]; then
    rm -rf "$HOME/.metro"
    echo -e "${GREEN}✅ Cleared Metro cache${NC}"
fi

# Watchman cache
if command -v watchman &> /dev/null; then
    echo -e "\n${YELLOW}👁️  Clearing Watchman cache...${NC}"
    watchman watch-del-all > /dev/null 2>&1 || true
    echo -e "${GREEN}✅ Watchman cache cleared${NC}"
fi

# React Native cache
if [ -d "$TMPDIR/react-native-packager-cache-*" ]; then
    rm -rf "$TMPDIR/react-native-packager-cache-*"
    echo -e "${GREEN}✅ Cleared React Native packager cache${NC}"
fi

if [ -d "$TMPDIR/metro-cache" ]; then
    rm -rf "$TMPDIR/metro-cache"
    echo -e "${GREEN}✅ Cleared Metro cache${NC}"
fi

# CocoaPods cache (iOS)
if [ -d "ios/Pods" ]; then
    echo -e "\n${YELLOW}🍫 Cleaning CocoaPods...${NC}"
    rm -rf ios/Pods
    echo -e "${GREEN}✅ Removed ios/Pods${NC}"
fi

if [ -f "ios/Podfile.lock" ]; then
    rm -f ios/Podfile.lock
    echo -e "${GREEN}✅ Removed Podfile.lock${NC}"
fi

# Deep clean
if [ "$DEEP_CLEAN" = true ]; then
    echo -e "\n${YELLOW}🔥 Performing deep clean...${NC}"

    # Remove node_modules
    if [ -d "node_modules" ]; then
        echo -e "${YELLOW}Removing node_modules...${NC}"
        rm -rf node_modules
        echo -e "${GREEN}✅ Removed node_modules${NC}"
    fi

    # Remove package-lock
    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
        echo -e "${GREEN}✅ Removed package-lock.json${NC}"
    fi

    # Remove generated iOS project
    if [ -d "ios" ]; then
        echo -e "${YELLOW}Removing generated ios directory...${NC}"
        rm -rf ios
        echo -e "${GREEN}✅ Removed ios directory${NC}"
    fi

    # Remove generated Android project
    if [ -d "android" ]; then
        echo -e "${YELLOW}Removing generated android directory...${NC}"
        rm -rf android
        echo -e "${GREEN}✅ Removed android directory${NC}"
    fi

    # Reinstall dependencies
    # Use --ignore-scripts to avoid edgedriver SIGKILL issue during postinstall
    # (edgedriver downloads large binaries that can timeout/get killed)
    echo -e "\n${YELLOW}📦 Reinstalling dependencies (skipping postinstall scripts)...${NC}"
    npm install --ignore-scripts
    echo -e "${GREEN}✅ Dependencies installed${NC}"

    # Rebuild native packages that need postinstall scripts (excluding edgedriver)
    # Run each rebuild separately to isolate failures
    echo -e "\n${YELLOW}🔧 Rebuilding required native packages...${NC}"
    
    # fsevents (macOS file watcher - needed for Metro bundler)
    if [ -d "node_modules/fsevents" ]; then
        echo -e "${BLUE}  → Rebuilding fsevents...${NC}"
        npm rebuild fsevents 2>/dev/null && echo -e "${GREEN}    ✅ fsevents rebuilt${NC}" || echo -e "${YELLOW}    ⚠️ fsevents rebuild skipped${NC}"
    fi
    
    # sharp (image processing - needed for Expo)
    if [ -d "node_modules/sharp" ]; then
        echo -e "${BLUE}  → Rebuilding sharp...${NC}"
        npm rebuild sharp 2>/dev/null && echo -e "${GREEN}    ✅ sharp rebuilt${NC}" || echo -e "${YELLOW}    ⚠️ sharp rebuild skipped${NC}"
    fi

    # Note: edgedriver is skipped - not needed for mobile testing (iOS/Android)
    echo -e "${BLUE}ℹ️  Skipped edgedriver postinstall (not needed for mobile testing)${NC}"

    # Clear npm cache (optional, don't fail if it doesn't work)
    echo -e "\n${YELLOW}🗑️  Clearing npm cache...${NC}"
    npm cache clean --force > /dev/null 2>&1
    echo -e "${GREEN}✅ npm cache cleared${NC}"
fi

echo -e "\n${BOLD}${GREEN}🎉 Cleanup Complete!${NC}"
echo -e "${GREEN}=======================================================${NC}"

if [ "$DEEP_CLEAN" = true ]; then
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo -e "  • Run ${YELLOW}./scripts/deploy-ios.sh${NC} to rebuild and deploy"
    echo -e "  • Or run ${YELLOW}./scripts/hot-reload.sh${NC} for development"
else
    echo -e "${BLUE}💡 For a deeper clean, run:${NC} ${YELLOW}$0 --deep${NC}"
fi

cd "$PROJECT_ROOT"
