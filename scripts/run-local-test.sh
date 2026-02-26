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
ARTIFACT_URL=""  # URL to download pre-built artifact
DRY_RUN=false  # List tests without running
FEATURE_FLAGS=""  # Feature flag overrides (space-separated FLAG_NAME=value pairs)
FORCE_GLOBAL=false

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
        --build-from-artifact)
            ARTIFACT_URL="$2"
            shift 2
            ;;
        --feature-flag|-f)
            # Add feature flag override (format: FLAG_NAME=true/false)
            if [ -z "$2" ] || [[ "$2" == -* ]]; then
                echo "Error: --feature-flag requires a value (e.g., --feature-flag FLAG_NAME=true)"
                echo "Use --help for usage information"
                exit 1
            fi
            FEATURE_FLAGS="$FEATURE_FLAGS $2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --force-global)
            FORCE_GLOBAL=true
            shift
            ;;
        --list|--dry-run)
            DRY_RUN=true
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
            echo "  --platform, -p PLATFORM          Target platform: ios or android (default: ios)"
            echo "  --build, -b                      Build release version of the app before testing"
            echo "  --skip-build, -s                 Skip build and install existing app from last build"
            echo "  --build-from-artifact URL        Download and install app from artifact URL (zip or apk)"
            echo "  --feature-flag, -f FLAG=VALUE    Override feature flag value for tests"
            echo "                                   With --build: bakes flag into app build"
            echo "                                   Without --build: passes to tests only"
            echo "                                   Can be specified multiple times"
            echo "  --list, --dry-run                List all test cases without running them"
            echo "  --verbose, -v                    Enable verbose output"
            echo "  --force-global                   Force using global 'appium' binary even when local or npx options exist"
            echo "  --help, -h                       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 welcome                                # Run welcome suite on iOS"
            echo "  $0 --platform android welcome             # Run welcome suite on Android"
            echo "  $0 all                                    # Run all tests"
            echo "  $0 ./test/specs/welcome.e2e.js           # Run specific spec file"
            echo "  $0 --build welcome                        # Build iOS and run tests"
            echo "  $0 --platform android --build welcome     # Build Android and run"
            echo "  $0 --skip-build all                       # Install last build and run all tests"
            echo "  $0 --build-from-artifact URL welcome      # Download artifact (zip) and run tests"
            echo "  $0 --platform android --build-from-artifact URL.apk welcome  # Download APK directly"
            echo "  $0 --list all                             # List all tests without running"
            echo "  $0 --dry-run spotlight                    # List tests in spotlight suite"
            echo ""
            echo "Feature Flag Testing:"
            echo "  $0 --build -f FEATURE_ACCOUNT_TABS=false welcome"
            echo "                                   Build with FEATURE_ACCOUNT_TABS disabled"
            echo "  $0 --build -f FLAG1=true -f FLAG2=false featureFlags"
            echo "                                   Build with multiple flag overrides"
            echo "  $0 -f FEATURE_ACCOUNT_TABS=false featureFlags"
            echo "                                   Run tests with flag overrides (no rebuild)"
            echo "                                   Tests will use overrides; app uses original flags"
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

if [ -n "$ARTIFACT_URL" ] && [ "$BUILD_APP" = true ]; then
    echo "Error: --build-from-artifact and --build cannot be used together"
    echo "Use --build-from-artifact to download artifact, or --build to build locally"
    exit 1
fi

if [ -n "$ARTIFACT_URL" ] && [ "$SKIP_BUILD" = true ]; then
    echo "Error: --build-from-artifact and --skip-build cannot be used together"
    echo "Use --build-from-artifact to download artifact, or --skip-build to reuse last build"
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

# Start Appium while ensuring version matches package.json when possible
start_appium_with_version_guard() {
    local project_root
    local app_dir
    project_root="$(dirname "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd)")"
    app_dir="$project_root/app"

    # Read requested appium version from app/package.json (devDependencies or dependencies)
    local requested_version
    requested_version=$(node -e "const p=require('${app_dir//\'/\\\'}/package.json'); console.log((p.devDependencies&&p.devDependencies.appium) || (p.dependencies&&p.dependencies.appium) || '');" 2>/dev/null || true)
    # Normalize to simple numeric prefix (strip ^~ and ranges for comparison)
    requested_version_clean=$(echo "$requested_version" | sed -E 's/^[^0-9]*//')

    log "Desired Appium version from package.json: ${requested_version:-(none)}" "verbose"

    # Helper to get version from an executable
    get_version_from_exec() {
        local exe="$1"
        if [ -x "$exe" ]; then
            "$exe" --version 2>/dev/null | head -1 | tr -d '\r' || true
        else
            echo ""
        fi
    }

    # Check local node_modules binary first
    local local_exec="$app_dir/node_modules/.bin/appium"
    local local_version=""
    if [ -x "$local_exec" ]; then
        local_version=$(get_version_from_exec "$local_exec")
        log "Found local appium at $local_exec (version: $local_version)" "verbose"
    fi

    # Check global appium
    local global_exec
    global_exec=$(command -v appium 2>/dev/null || true)
    local global_version=""
    if [ -n "$global_exec" ]; then
        global_version=$(get_version_from_exec "$global_exec")
        log "Found global appium at $global_exec (version: $global_version)" "verbose"
    fi

    # Decide which binary to use
    local chosen_cmd=""
    if [ "$FORCE_GLOBAL" = true ] && [ -n "$global_exec" ]; then
        chosen_cmd="$global_exec"
        log "Using global appium due to --force-global" "info"
    elif [ -n "$local_version" ] && [ -n "$requested_version_clean" ] && echo "$local_version" | grep -q "^${requested_version_clean}"; then
        chosen_cmd="$local_exec"
        log "Using local node_modules appium (matches requested version)" "info"
    elif [ -n "$requested_version_clean" ] && command -v npx >/dev/null 2>&1; then
        # Use npx to run the requested version explicitly (ensures correct version)
        chosen_cmd="npx appium@${requested_version_clean}"
        log "Using npx to run appium@${requested_version_clean}" "info"
    elif [ -n "$global_exec" ]; then
        # Fall back to global appium but warn if versions differ
        chosen_cmd="$global_exec"
        if [ -n "$requested_version_clean" ] && ! echo "$global_version" | grep -q "^${requested_version_clean}"; then
            log "⚠️  Global Appium version ($global_version) does not match requested (${requested_version})." "info"
            log "⚠️  Prefer installing the requested version locally (npm install --save-dev appium@${requested_version_clean}) or ensure npx is available." "info"
        else
            log "Using global appium (version matches requested)" "info"
        fi
    else
        log "❌ No Appium executable found (no local node_modules/.bin/appium, no npx, no global appium)" "info"
        exit 1
    fi

    # Start Appium using chosen command
    log "Starting Appium using: $chosen_cmd" "info"
    if [ "$VERBOSE" = true ]; then
        if [[ "$chosen_cmd" == npx* ]]; then
            eval "$chosen_cmd --log-level debug > /tmp/appium.log 2>&1 &"
        else
            "$chosen_cmd" --log-level debug > /tmp/appium.log 2>&1 &
        fi
    else
        if [[ "$chosen_cmd" == npx* ]]; then
            eval "$chosen_cmd --log-level warn > /tmp/appium.log 2>&1 &"
        else
            "$chosen_cmd" --log-level warn > /tmp/appium.log 2>&1 &
        fi
    fi
    APPIUM_PID=$!
    log "📝 Appium PID: $APPIUM_PID" "info"

    # Wait for Appium to become ready
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
}

# Feature flags can be used in two modes:
# 1. With --build: Modifies featureFlags.json before building (baked into app)
# 2. Without --build: Only exports to tests (tests use these as overrides)
if [ -n "$FEATURE_FLAGS" ] && [ "$BUILD_APP" != true ]; then
    log "ℹ️  Feature flags passed without --build: flags will be passed to tests only" "info"
    log "   (The app build will use its original flag values)" "info"
fi

# Function to apply feature flag overrides to featureFlags.json
apply_feature_flag_overrides() {
    local project_root="$1"
    local flags_path="$project_root/app/src/config/feature-flags/featureFlags.json"
    
    if [ -z "$FEATURE_FLAGS" ]; then
        log "No feature flag overrides specified" "verbose"
        return 0
    fi
    
    if [ ! -f "$flags_path" ]; then
        log "❌ Feature flags file not found at $flags_path" "info"
        return 1
    fi
    
    log "" "info"
    log "╔══════════════════════════════════════════════════════════════════╗" "info"
    log "║                 🚩 APPLYING FEATURE FLAG OVERRIDES               ║" "info"
    log "╠══════════════════════════════════════════════════════════════════╣" "info"
    
    # Backup original feature flags
    cp "$flags_path" "${flags_path}.backup"
    log "║  📋 Original flags backed up to featureFlags.json.backup         ║" "info"
    
    # Export overrides for test framework (so tests know which flags were explicitly set)
    # Format: FLAG1=value1,FLAG2=value2
    # Trim leading/trailing whitespace and collapse multiple spaces before converting to commas
    export FEATURE_FLAG_OVERRIDES=$(echo "$FEATURE_FLAGS" | xargs | tr ' ' ',')
    log "║  📤 Exporting overrides to test framework                        ║" "info"
    
    # Process each flag override
    for FLAG in $FEATURE_FLAGS; do
        FLAG_NAME="${FLAG%%=*}"
        FLAG_VALUE="${FLAG#*=}"
        
        # Validate flag name (must be UPPER_SNAKE_CASE, no special chars that could break Node script)
        if [[ ! "$FLAG_NAME" =~ ^[A-Z][A-Z0-9_]*$ ]]; then
            log "║  ⚠️  Invalid flag name: $FLAG_NAME (must be UPPER_SNAKE_CASE) ║" "info"
            continue
        fi
        
        # Validate flag value
        if [ "$FLAG_VALUE" != "true" ] && [ "$FLAG_VALUE" != "false" ]; then
            log "║  ⚠️  Invalid value for $FLAG_NAME: $FLAG_VALUE (use true/false) ║" "info"
            continue
        fi
        
        # Use node to modify the JSON
        node -e "
            const fs = require('fs');
            const path = '$flags_path';
            const flags = JSON.parse(fs.readFileSync(path, 'utf8'));
            const flagName = '$FLAG_NAME';
            const flagValue = $FLAG_VALUE;
            
            if (flags[flagName] !== undefined) {
                if (typeof flags[flagName] === 'boolean') {
                    flags[flagName] = flagValue;
                } else {
                    flags[flagName].enabled = flagValue;
                }
                console.log('  ✅ ' + flagName + ' = ' + flagValue);
                fs.writeFileSync(path, JSON.stringify(flags, null, 2));
            } else {
                console.log('  ⚠️  Flag not found: ' + flagName);
            }
        "
    done
    
    log "╚══════════════════════════════════════════════════════════════════╝" "info"
    log "" "info"
    
    return 0
}

# Function to restore original feature flags after build
restore_feature_flags() {
    local project_root="$1"
    local flags_path="$project_root/app/src/config/feature-flags/featureFlags.json"
    local backup_path="${flags_path}.backup"
    
    if [ -f "$backup_path" ]; then
        log "🔄 Restoring original feature flags..." "info"
        mv "$backup_path" "$flags_path"
        log "✅ Feature flags restored" "info"
    fi
}

# Cache project root for use in trap handlers (must be set before trap is triggered)
_CACHED_PROJECT_ROOT=""

# Cleanup trap to ensure feature flags are restored on early exit
# Handles EXIT, ERR, INT (Ctrl+C), and TERM signals
cleanup_feature_flags() {
    # Use cached project root if available, otherwise try to determine it
    local project_root="${_CACHED_PROJECT_ROOT:-}"
    if [ -z "$project_root" ]; then
        # Fallback: try to determine from script location
        local script_dir
        script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd)" || return 0
        project_root="$(dirname "$script_dir")"
    fi
    
    local flags_path="$project_root/app/src/config/feature-flags/featureFlags.json"
    local backup_path="${flags_path}.backup"
    
    # Only attempt restore if backup exists or FEATURE_FLAG_OVERRIDES was set
    if [ -f "$backup_path" ] || [ -n "${FEATURE_FLAG_OVERRIDES:-}" ]; then
        restore_feature_flags "$project_root"
    fi
}

# Set trap to clean up on script exit (normal or abnormal)
trap cleanup_feature_flags EXIT ERR INT TERM

# Function to list tests without running them (dry run)
list_tests() {
    local target="$1"
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local project_root="$(dirname "$script_dir")"
    local app_dir="$project_root/app"
    local specs_dir="$app_dir/test/specs"
    local spec_files=()
    
    # Determine which files to scan based on target
    if [ "$target" = "all" ]; then
        spec_files=("$specs_dir"/*.e2e.js)
    elif [[ "$target" == *.js ]]; then
        # It's a spec file path
        if [[ "$target" == /* ]]; then
            spec_files=("$target")
        else
            spec_files=("$app_dir/$target")
        fi
    else
        # It's a suite name - look up in wdio.conf.js suites
        case "$target" in
            welcome) spec_files=("$specs_dir/welcome.e2e.js") ;;
            home) spec_files=("$specs_dir/home.e2e.js") ;;
            navigation) spec_files=("$specs_dir/navigation.e2e.js") ;;
            spotlight) spec_files=("$specs_dir/spotlight-filters.e2e.js") ;;
            profile) spec_files=("$specs_dir/profile.e2e.js") ;;
            personalInformation|personal) spec_files=("$specs_dir/personal-information.e2e.js") ;;
            failing) spec_files=("$specs_dir/failing.e2e.js") ;;
            featureFlags) spec_files=("$specs_dir/feature-flags.e2e.js") ;;
            *) 
                echo "❌ Unknown suite: $target"
                echo "Available suites: welcome, home, navigation, spotlight, profile, personalInformation, failing, featureFlags"
                exit 1
                ;;
        esac
    fi
    
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║                      📋 TEST DISCOVERY (DRY RUN)                     ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    local total_files=0
    local total_describes=0
    local total_tests=0
    
    for file in "${spec_files[@]}"; do
        if [ -f "$file" ]; then
            ((total_files++))
            local filename=$(basename "$file")
            # Process file line by line to extract describe and it blocks
            local line_num=0
            while IFS= read -r line || [ -n "$line" ]; do
                ((line_num++))
                # Check for describe blocks
                if echo "$line" | grep -qE "^\s*describe\s*\("; then
                    # Extract the test name (handle single quotes, allow embedded ")
                    local name=$(echo "$line" | sed -E "s/.*describe\s*\(\s*'([^']*)'.*/\1/")
                    echo "$filename / $name"
                    ((total_describes++))
                fi
                # Check for it blocks
                if echo "$line" | grep -qE "^\s*it\s*\("; then
                    # Extract the test name (handle single quotes, allow embedded ")
                    local name=$(echo "$line" | sed -E "s/.*it\s*\(\s*'([^']*)'.*/\1/")
                    echo "$filename / $name"
                    ((total_tests++))
                fi
            done < "$file"
            echo ""
        else
            echo "⚠️  File not found: $file"
        fi
    done
    
    echo "════════════════════════════════════════════════════════════════════════"
    echo "📊 Summary: $total_tests test(s) in $total_describes describe block(s) across $total_files file(s)"
    echo ""
}

# Function to download and install app from artifact URL
install_from_artifact() {
    local artifact_url="$1"
    
    log "📥 Downloading app from artifact URL..." "info"
    log "URL: $artifact_url" "verbose"
    
    # Create temporary directory for download
    TEMP_DIR=$(mktemp -d)
    log "Using temporary directory: $TEMP_DIR" "verbose"
    
    # Determine file type from URL
    local is_direct_apk=false
    local download_filename="artifact.zip"
    
    if [ "$PLATFORM" = "android" ] && [[ "$artifact_url" == *.apk ]]; then
        is_direct_apk=true
        download_filename="app.apk"
        log "Detected direct APK download" "verbose"
    fi
    
    # Download the artifact
    log "Downloading artifact..." "info"
    if ! curl -L -f -o "$TEMP_DIR/$download_filename" "$artifact_url"; then
        log "❌ Failed to download artifact from $artifact_url" "info"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    # Verify download
    if [ ! -f "$TEMP_DIR/$download_filename" ]; then
        log "❌ Download failed - file not found" "info"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    FILE_SIZE=$(stat -f%z "$TEMP_DIR/$download_filename" 2>/dev/null || stat -c%s "$TEMP_DIR/$download_filename")
    log "✅ Downloaded artifact (${FILE_SIZE} bytes)" "info"
    
    # Extract the artifact if it's a zip file
    if [ "$is_direct_apk" = false ]; then
        log "📦 Extracting artifact..." "info"
        if ! unzip -q "$TEMP_DIR/$download_filename" -d "$TEMP_DIR/"; then
            log "❌ Failed to extract artifact" "info"
            rm -rf "$TEMP_DIR"
            exit 1
        fi
    fi
    
    if [ "$PLATFORM" = "android" ]; then
        # Install Android APK
        log "🤖 Installing Android APK..." "info"
        
        # Find the APK file (either downloaded directly or extracted from zip)
        if [ "$is_direct_apk" = true ]; then
            APK_PATH="$TEMP_DIR/$download_filename"
        else
            APK_PATH=$(find "$TEMP_DIR" -name "*.apk" -type f | head -1)
        fi
        
        if [ -z "$APK_PATH" ] || [ ! -f "$APK_PATH" ]; then
            log "❌ No APK file found in artifact" "info"
            log "Contents of artifact:" "verbose"
            ls -la "$TEMP_DIR/" 2>/dev/null
            rm -rf "$TEMP_DIR"
            exit 1
        fi
        
        log "Found APK: $(basename "$APK_PATH")" "verbose"
        
        # Uninstall existing app
        PACKAGE_NAME="com.softwareone.marketplaceMobile"
        log "Uninstalling existing app if present..." "verbose"
        adb -s "$DEVICE_UDID" uninstall "$PACKAGE_NAME" > /dev/null 2>&1 || true
        
        # Install the APK
        log "Installing APK on device $DEVICE_UDID..." "info"
        if ! adb -s "$DEVICE_UDID" install -r "$APK_PATH"; then
            log "❌ APK installation failed" "info"
            rm -rf "$TEMP_DIR"
            exit 1
        fi
        
        log "✅ APK installed successfully" "info"
        
        # Launch the app
        log "🚀 Launching app..." "verbose"
        adb -s "$DEVICE_UDID" shell am start -n "$PACKAGE_NAME/.MainActivity"
        sleep 2
        
    else
        # Install iOS app
        log "📱 Installing iOS app..." "info"
        
        # Find the .app bundle
        APP_PATH=$(find "$TEMP_DIR" -name "*.app" -type d | head -1)
        
        if [ -z "$APP_PATH" ]; then
            log "❌ No .app bundle found in artifact" "info"
            log "Contents of artifact:" "verbose"
            ls -la "$TEMP_DIR/" 2>/dev/null
            rm -rf "$TEMP_DIR"
            exit 1
        fi
        
        log "Found app bundle: $(basename "$APP_PATH")" "verbose"
        
        # Verify .app bundle
        if [ ! -f "$APP_PATH/Info.plist" ]; then
            log "❌ Invalid .app bundle - missing Info.plist" "info"
            rm -rf "$TEMP_DIR"
            exit 1
        fi
        
        # Extract bundle ID
        BUNDLE_ID=$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$APP_PATH/Info.plist")
        log "Bundle ID: $BUNDLE_ID" "verbose"
        
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
        log "Installing app on simulator..." "info"
        if ! xcrun simctl install "$DEVICE_UDID" "$APP_PATH"; then
            log "❌ App installation failed" "info"
            rm -rf "$TEMP_DIR"
            exit 1
        fi
        
        log "✅ App installed successfully" "info"
    fi
    
    # Cleanup
    log "🧹 Cleaning up temporary files..." "verbose"
    rm -rf "$TEMP_DIR"
    
    log "✅ App from artifact installed and ready for testing" "info"
}

# Function to build the release version of the app
build_release_app() {
    log "🔨 Building Release version of the iOS app..." "info"
    
    # Get absolute paths at the start
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    _CACHED_PROJECT_ROOT="$PROJECT_ROOT"
    APP_DIR="$PROJECT_ROOT/app"
    
    if [ ! -d "$APP_DIR" ]; then
        log "❌ ERROR: App directory not found at $APP_DIR"
        log "Make sure you're running this script from the project root or scripts directory"
        exit 1
    fi
    
    # Apply feature flag overrides before build
    apply_feature_flag_overrides "$PROJECT_ROOT"
    
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
          CODE_SIGN_IDENTITY="-" \
          build
    else
        xcodebuild -workspace "$WORKSPACE" \
          -scheme "$SCHEME" \
          -configuration Release \
          -sdk iphonesimulator \
          -destination 'generic/platform=iOS Simulator' \
          -derivedDataPath build/DerivedData \
          CODE_SIGN_IDENTITY="-" \
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
        # Attempt to launch the app so it's running before Appium session starts
        if [ -n "${BUNDLE_ID:-$APP_BUNDLE_ID}" ]; then
            LAUNCH_BUNDLE_ID="${BUNDLE_ID:-$APP_BUNDLE_ID}"
            log "🚀 Launching app on simulator: $LAUNCH_BUNDLE_ID" "verbose"
            if xcrun simctl launch "$DEVICE_UDID" "$LAUNCH_BUNDLE_ID" > /dev/null 2>&1; then
                log "✅ App launched: $LAUNCH_BUNDLE_ID" "info"
            else
                log "⚠️  Could not launch app ($LAUNCH_BUNDLE_ID) after install" "info"
            fi
        fi
    
    # Note: Feature flags are restored AFTER tests complete to allow tests
    # to read the same flag values that were baked into the build
    
    # Return to original directory to avoid path resolution issues
    cd "$ORIGINAL_DIR"
}

# Function to install existing app from last build
install_existing_app() {
    log "📲 Installing existing app from last build..." "info"
    
    # Get absolute paths
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    _CACHED_PROJECT_ROOT="$PROJECT_ROOT"
    APP_DIR="$PROJECT_ROOT/app"
    
    if [ ! -d "$APP_DIR" ]; then
        log "❌ ERROR: App directory not found at $APP_DIR"
        exit 1
    fi
    
    # Look for the most recent build
    BUILD_DIR="$APP_DIR/ios/build/DerivedData/Build/Products/Release-iphonesimulator"
    APP_PATH=$(find "$BUILD_DIR" -name "*.app" -type d 2>/dev/null | head -1)
    
    if [ -z "$APP_PATH" ]; then
        log "⚠️  No existing .app build found in $BUILD_DIR" "info"
        # If we know the bundle id, try to launch the already-installed app on the simulator
        if [ -n "$APP_BUNDLE_ID" ]; then
            log "ℹ️  Attempting to launch installed app by bundle id: $APP_BUNDLE_ID" "info"

            # Ensure simulator is booted
            SIMULATOR_STATUS=$(xcrun simctl list devices | grep "$DEVICE_UDID" | head -1 || echo "Not found")
            if ! echo "$SIMULATOR_STATUS" | grep -q "(Booted)"; then
                log "🚀 Booting simulator..." "info"
                xcrun simctl boot "$DEVICE_UDID"
                log "⏳ Waiting for simulator to boot..." "verbose"
                for i in {1..30}; do
                    if xcrun simctl list devices | grep "$DEVICE_UDID" | grep -q "(Booted)"; then
                        log "✅ Simulator booted" "verbose"
                        break
                    fi
                    sleep 1
                done
            fi

            # Try launching by bundle id
            if xcrun simctl launch "$DEVICE_UDID" "$APP_BUNDLE_ID" > /dev/null 2>&1; then
                log "✅ Launched app on simulator by bundle id: $APP_BUNDLE_ID" "info"
                return 0
            else
                log "❌ Failed to launch app by bundle id: $APP_BUNDLE_ID" "info"
                log "💡 Run with --build to build and install the app, or create a build using ./scripts/deploy-ios.sh" "info"
                exit 1
            fi
        else
            log "❌ No existing iOS app build found in $BUILD_DIR" "info"
            log "💡 Run with --build to build the app first, or use the deploy script:" "info"
            log "   ./scripts/deploy-ios.sh --client-id YOUR_CLIENT_ID" "info"
            exit 1
        fi
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
    # Try to launch installed app by bundle id so it's running before tests
    if [ -n "$APP_BUNDLE_ID" ]; then
        log "🚀 Launching installed app by bundle id: $APP_BUNDLE_ID" "verbose"
        if xcrun simctl launch "$DEVICE_UDID" "$APP_BUNDLE_ID" > /dev/null 2>&1; then
            log "✅ App launched: $APP_BUNDLE_ID" "info"
        else
            log "⚠️  Could not launch app ($APP_BUNDLE_ID) after install" "info"
        fi
    fi
}

# Handle dry run mode - list tests and exit
if [ "$DRY_RUN" = true ]; then
    list_tests "$TEST_TARGET"
    exit 0
fi

# Handle build options
if [ -n "$ARTIFACT_URL" ]; then
    # Download and install from artifact URL
    install_from_artifact "$ARTIFACT_URL"
elif [ "$BUILD_APP" = true ]; then
    if [ "$PLATFORM" = "android" ]; then
        # Build standalone Android APK for testing
        log "🤖 Building standalone Android APK for testing..." "info"
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
        _CACHED_PROJECT_ROOT="$PROJECT_ROOT"
        APP_DIR="$PROJECT_ROOT/app"
        
        # Apply feature flag overrides before build
        apply_feature_flag_overrides "$PROJECT_ROOT"
        
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
        
        # Note: Feature flags are restored AFTER tests complete to allow tests
        # to read the same flag values that were baked into the build
        
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

# If the user didn't request a build or skip-build, attempt to install an existing app
# This makes the default invocation (e.g. `./scripts/run-local-test.sh welcome`)
# more user-friendly by installing the most recent local build if available.
if [ -z "$ARTIFACT_URL" ] && [ "$BUILD_APP" = false ] && [ "$SKIP_BUILD" = false ]; then
    if [ "$PLATFORM" = "android" ]; then
        log "ℹ️  No build flags provided - assuming Android app already installed" "info"
        log "💡 Use --build to build or --skip-build when app is already present" "info"
    else
        log "ℹ️  No build flags provided - attempting to install existing iOS build" "info"
        # Try to install an existing app build; if none found, print guidance and exit
        if ! install_existing_app; then
            log "❌ No existing iOS app build found to install." "info"
            log "👉 Run with --build to build and install the app, or create a build using ./scripts/deploy-ios.sh" "info"
            exit 1
        fi
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
    start_appium_with_version_guard
else
    log "✅ Appium server is already running"
fi

# Export feature flag overrides to test environment (even without build)
# This allows tests to know which flags to check/skip
if [ -n "$FEATURE_FLAGS" ]; then
    # Format: FLAG1=value1,FLAG2=value2 (comma-separated)
    export FEATURE_FLAG_OVERRIDES=$(echo "$FEATURE_FLAGS" | xargs | tr ' ' ',')
    log "" "info"
    log "🚩 Feature flag overrides exported to tests: $FEATURE_FLAG_OVERRIDES" "info"
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
_CACHED_PROJECT_ROOT="$PROJECT_ROOT"
APP_DIR="$PROJECT_ROOT/app"

if [ ! -d "$APP_DIR" ]; then
    log "❌ ERROR: App directory not found at $APP_DIR"
    log "Make sure you're running this script from the project root or scripts directory"
    exit 1
fi

cd "$APP_DIR"
npx wdio run wdio.conf.js $TEST_ARGS
TEST_EXIT_CODE=$?

# Restore feature flags after tests complete (if they were overridden during build)
# Use the already-known PROJECT_ROOT instead of trying to re-derive it
restore_feature_flags "$PROJECT_ROOT"

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