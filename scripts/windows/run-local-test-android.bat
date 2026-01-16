@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM Local Testing Script for Appium Android Tests (Windows)
REM Usage: run-local-test-android.bat [options] [suite_name|spec_file|all]
REM
REM This script automates the process of building, deploying, and
REM running Appium tests on Android devices or emulators.
REM ============================================================
REM
REM CHANGELOG - January 15, 2026:
REM ============================================================
REM Fixed multiple critical issues for Windows batch file execution:
REM
REM 1. PATH RESOLUTION FIX (Line 221):
REM    - Changed from: set "PROJECT_ROOT=%~dp0.."
REM    - Changed to: set "PROJECT_ROOT=%CD%"
REM    - Reason: Script is executed from project root, not from scripts\windows\
REM    - This fixed incorrect path calculations when username contains dots
REM      (e.g., magdalena.komuda) which caused "filename syntax is incorrect" errors
REM
REM 2. EMULATOR SECTION RESTRUCTURE (Lines 159-196):
REM    - Moved :skip_emulator_section label OUTSIDE of if block
REM    - Reason: Labels inside if (...) blocks break batch file context
REM    - Prevents ") was unexpected at this time" syntax errors
REM    - Allows proper goto :skip_emulator_section when device already connected
REM
REM 3. ADB COMMAND FIXES (Lines 168, 190, 195):
REM    - Changed for /f loops to use "call" wrapper
REM    - Example: for /f "delims=" %%a in ('call "!ADB_EXE!" devices ...')
REM    - Reason: Direct execution of quoted paths with dots fails in batch
REM    - The "call" command properly handles paths with special characters
REM
REM 4. HELPER VARIABLES (Lines 163-164):
REM    - Added: set "ADB_EXE=!ANDROID_SDK!\platform-tools\adb.exe"
REM    - Added: set "EMULATOR_EXE=!ANDROID_SDK!\emulator\emulator.exe"
REM    - Reason: Simplifies command execution and improves readability
REM    - Avoids repeated path concatenation in critical sections
REM
REM 5. BOOT WAIT LOOP FIX (Lines 188-193):
REM    - Changed loop label from inside if block to separate structure
REM    - Added explicit BOOT_COMPLETE variable initialization
REM    - Used "call" wrapper for adb shell command
REM    - Reason: Original structure caused loop to never execute properly
REM
REM 6. DEVICE DETECTION FIX (Lines 195-201):
REM    - Updated to use nested for /f loops with call wrapper
REM    - Changed: for /f "delims=" %%d in ('call "!ADB_EXE!" devices ...')
REM    - Added tokens=1 extraction: for /f "tokens=1" %%u in ("%%d")
REM    - Reason: Properly extracts device UDID from adb devices output
REM
REM 7. DEBUG OUTPUT ADDED (Lines 223-225):
REM    - Added: echo [DEBUG] SCRIPT_DIR, PROJECT_ROOT, APP_DIR
REM    - Reason: Helps troubleshoot path resolution issues
REM    - Critical for Windows environments with special characters in paths
REM
REM WINDOWS BATCH FILE GOTCHAS DOCUMENTED:
REM - Labels inside if blocks terminate the block scope
REM - Paths with dots in username require "call" wrapper in for /f loops
REM - %~dp0 gives script location, %CD% gives working directory
REM - for /f with quoted paths needs: for /f "delims=" %%a in ('call "!VAR!"')
REM - goto commands inside if blocks need labels placed outside
REM - Device detection requires nested loops to properly extract UDID
REM
REM These fixes enable Appium Android testing on Windows with usernames
REM containing special characters and ensure proper emulator/device handling.
REM ============================================================

set BUILD_APP=false
set SKIP_BUILD=false
set VERBOSE=false
set TEST_TARGET=
set EMULATOR_NAME=
set APPIUM_PID=

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :validate_args
if /i "%~1"=="--build" (
    set BUILD_APP=true
    shift
    goto :parse_args
)
if /i "%~1"=="-b" (
    set BUILD_APP=true
    shift
    goto :parse_args
)
if /i "%~1"=="--skip-build" (
    set SKIP_BUILD=true
    shift
    goto :parse_args
)
if /i "%~1"=="-s" (
    set SKIP_BUILD=true
    shift
    goto :parse_args
)
if /i "%~1"=="--emulator" (
    set EMULATOR_NAME=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--verbose" (
    set VERBOSE=true
    shift
    goto :parse_args
)
if /i "%~1"=="-v" (
    set VERBOSE=true
    shift
    goto :parse_args
)
if /i "%~1"=="--help" goto :show_help
if /i "%~1"=="-h" goto :show_help

REM If not an option, it's the test target
set TEST_TARGET=%~1
shift
goto :parse_args

:show_help
echo.
echo Android Local Test Runner for Windows
echo ======================================
echo.
echo Usage: run-local-test-android.bat [options] [suite_name^|spec_file^|all]
echo.
echo Prerequisites:
echo   - .env file must exist in app\ directory with Auth0 configuration
echo   - For --build: Android SDK must be installed
echo.
echo Options:
echo   --build, -b           Build the app before testing
echo   --skip-build, -s      Skip build, install existing APK from last build
echo   --emulator NAME       Specify Android emulator AVD name
echo   --verbose, -v         Enable verbose output
echo   --help, -h            Show this help message
echo.
echo Examples:
echo   run-local-test-android.bat welcome                         Run welcome suite
echo   run-local-test-android.bat all                             Run all tests
echo   run-local-test-android.bat .\test\specs\welcome.e2e.js     Run specific spec
echo   run-local-test-android.bat --build welcome                 Build and run tests
echo   run-local-test-android.bat --skip-build all                Reuse last build
echo   run-local-test-android.bat --emulator Pixel_8_API_34 welcome
echo.
echo Workflow:
echo   1. First run: use --build to create fresh APK
echo   2. Subsequent runs: use --skip-build for fast iteration
echo   3. Quick runs: no flags uses currently installed app
echo.
exit /b 0

:validate_args
echo.
echo ============================================================
echo   Android Local Test Runner (Windows)
echo ============================================================
echo.

REM Validate test target
if "%TEST_TARGET%"=="" (
    echo [ERROR] Test target is required ^(suite name, spec file, or 'all'^)
    echo.
    echo Usage: run-local-test-android.bat [options] ^<test_target^>
    echo Use --help for more information
    exit /b 1
)

echo validate line 115
if "%BUILD_APP%"=="true" if "%SKIP_BUILD%"=="true" (
    echo [ERROR] --build and --skip-build cannot be used together
    echo Use --build to create new APK, or --skip-build to reuse existing
    exit /b 1
)

echo validate line 122
REM Check for Android SDK
if not defined ANDROID_HOME (
    if not defined ANDROID_SDK_ROOT (
        echo [ERROR] ANDROID_HOME or ANDROID_SDK_ROOT not set
        echo.
        echo Please set the environment variable:
        echo   setx ANDROID_HOME "%%LOCALAPPDATA%%\Android\Sdk"
        exit /b 1
    ) else (
        set ANDROID_SDK=!ANDROID_SDK_ROOT!
    )
) else (
    set ANDROID_SDK=!ANDROID_HOME!
)

REM Configure environment variables for testing
set PLATFORM_NAME=Android
set AUTOMATION_NAME=UiAutomator2
set APP_PACKAGE=com.softwareone.marketplaceMobile
set APP_ACTIVITY=.MainActivity
set APPIUM_HOST=127.0.0.1
set APPIUM_PORT=4723

REM Get script directory and navigate to app folder
if "%ENVIRONMENT%"=="qa" (
    set AUTH0_DOMAIN=login-qa.pyracloud.com
    set AUTH0_AUDIENCE=https://api-qa.pyracloud.com/
    set AUTH0_SCOPE=openid profile email offline_access
    set AUTH0_API_URL=https://api.s1.live/public/
    set AUTH0_OTP_DIGITS=6
    set AUTH0_SCHEME=com.softwareone.marketplaceMobile
)

REM Start emulator if specified
if "%EMULATOR_NAME%"=="" goto :skip_emulator_section

echo [INFO] Starting emulator: %EMULATOR_NAME%
echo [DEBUG] ANDROID_SDK=!ANDROID_SDK!

set "ADB_EXE=!ANDROID_SDK!\platform-tools\adb.exe"
set "EMULATOR_EXE=!ANDROID_SDK!\emulator\emulator.exe"

REM Check if device already connected
"!ADB_EXE!" devices | findstr /v "List" | findstr "device" >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Device already connected, skipping emulator start
    goto :skip_emulator_section
)

echo [INFO] Starting emulator process...
start "" "!EMULATOR_EXE!" -avd "!EMULATOR_NAME!" -no-snapshot -no-audio

echo [INFO] Waiting for emulator to boot...
"!ADB_EXE!" wait-for-device

REM Wait for boot to complete
echo [INFO] Waiting for boot to complete...
:wait_boot_loop
set BOOT_COMPLETE=
for /f "delims=" %%a in ('call "!ADB_EXE!" shell getprop sys.boot_completed 2^>nul') do set "BOOT_COMPLETE=%%a"
if not "!BOOT_COMPLETE!"=="1" (
    timeout /t 2 /nobreak >nul
    goto :wait_boot_loop    scripts\windows\run-local-test-android.bat --emulator "Pixel8API34" welcome
)
echo [INFO] Emulator boot complete!

:skip_emulator_section
REM Get device UDID
set DEVICE_UDID=
for /f "delims=" %%d in ('call "!ADB_EXE!" devices ^| findstr /v "List" ^| findstr "device"') do (
    for /f "tokens=1" %%u in ("%%d") do set "DEVICE_UDID=%%u"
    goto :found_device
)

echo [ERROR] No connected Android device found
echo.
echo Please connect a device or start an emulator:
echo   1. Connect physical device with USB debugging enabled
echo   2. Or start an emulator: run-local-test-android.bat --emulator YOUR_AVD_NAME welcome
echo   3. Or manually start emulator from Android Studio
echo.
echo Available emulators:
"!ANDROID_SDK!\emulator\emulator.exe" -list-avds 2>nul
exit /b 1

:found_device
set DEVICE_NAME=Android Device

echo [INFO] Environment Configuration:
echo        PLATFORM_NAME: %PLATFORM_NAME%
echo        DEVICE_UDID: !DEVICE_UDID!
echo        APP_PACKAGE: %APP_PACKAGE%
echo        APPIUM_HOST: %APPIUM_HOST%
echo        APPIUM_PORT: %APPIUM_PORT%
echo.

REM Get script and project directories
REM Assuming script is run from project root directory
set "PROJECT_ROOT=%CD%"
set "SCRIPT_DIR=%PROJECT_ROOT%\scripts\windows\"
set "APP_DIR=%PROJECT_ROOT%\app"

echo [DEBUG] SCRIPT_DIR=%SCRIPT_DIR%
echo [DEBUG] PROJECT_ROOT=%PROJECT_ROOT%
echo [DEBUG] APP_DIR=%APP_DIR%

if not exist "%APP_DIR%" (
    echo [ERROR] App directory not found at %APP_DIR%
    exit /b 1
)

cd /d "%APP_DIR%"

REM Handle build options
if "%BUILD_APP%"=="true" (
    echo [INFO] Building Android app...
    echo.
    
    REM Validate .env file exists
    if not exist ".env" (
        echo [ERROR] No .env file found
        echo Please create a .env file in app directory with required configuration
        exit /b 1
    )
    
    call "%SCRIPT_DIR%deploy-android.bat"
    if errorlevel 1 (
        echo [ERROR] Build failed
        exit /b 1
    )
    echo.
)

if "%SKIP_BUILD%"=="true" (
    echo [INFO] Installing existing APK from last build...
    
    REM Try debug first, then release
    set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
    if not exist "!APK_PATH!" (
        set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
    )
    if not exist "!APK_PATH!" (
        echo [ERROR] No existing APK found
        echo.
        echo Run with --build first to create an APK:
        echo   run-local-test-android.bat --build welcome
        exit /b 1
    )
    
    echo [INFO] Installing: !APK_PATH!
    "!ANDROID_SDK!\platform-tools\adb.exe" install -r "!APK_PATH!"
    if errorlevel 1 (
        echo [WARNING] Install failed, trying with -t flag...
        "!ANDROID_SDK!\platform-tools\adb.exe" install -r -t "!APK_PATH!"
        if errorlevel 1 (
            echo [ERROR] APK installation failed
            exit /b 1
        )
    )
    echo [INFO] APK installed successfully
    echo.
)

REM Check if Appium is running
echo [INFO] Checking Appium server status...

curl -s "http://%APPIUM_HOST%:%APPIUM_PORT%/status" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Appium server not running. Starting Appium...
    
    REM Check if Appium is installed
    where appium >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Appium not found in PATH
        echo.
        echo Please install Appium:
        echo   npm install -g appium@3.1.1
        echo   appium driver install uiautomator2
        exit /b 1
    )
    
    REM Start Appium in a new minimized window
    start "Appium Server" /min appium --address %APPIUM_HOST% --port %APPIUM_PORT% --log-level warn
    set APPIUM_STARTED_BY_SCRIPT=true
    
    echo [INFO] Waiting for Appium to start...
    set APPIUM_READY=false
    for /l %%i in (1,1,30) do (
        timeout /t 1 /nobreak >nul
        curl -s "http://%APPIUM_HOST%:%APPIUM_PORT%/status" >nul 2>&1
        if not errorlevel 1 (
            set APPIUM_READY=true
            goto :appium_ready
        )
    )
    
    if "!APPIUM_READY!"=="false" (
        echo [ERROR] Appium failed to start after 30 seconds
        echo.
        echo Try starting Appium manually:
        echo   appium --address 127.0.0.1 --port 4723
        exit /b 1
    )
) else (
    echo [INFO] Appium server is already running
)

:appium_ready
echo [INFO] Appium server is ready!
echo.

REM Determine test arguments
if /i "%TEST_TARGET%"=="all" (
    set TEST_ARGS=
    echo [INFO] Running ALL tests
) else (
    echo %TEST_TARGET% | findstr /i "\.js" >nul
    if not errorlevel 1 (
        set TEST_ARGS=--spec %TEST_TARGET%
        echo [INFO] Running spec file: %TEST_TARGET%
    ) else (
        set TEST_ARGS=--suite %TEST_TARGET%
        echo [INFO] Running suite: %TEST_TARGET%
    )
)

echo.
echo ============================================================
echo   Starting WebDriverIO Tests
echo ============================================================
echo.

REM Run tests
call npx wdio run wdio.conf.js %TEST_ARGS%
set TEST_EXIT_CODE=%errorlevel%

echo.
echo ============================================================
if %TEST_EXIT_CODE%==0 (
    echo   [SUCCESS] Tests completed successfully!
) else (
    echo   [FAILED] Tests failed with exit code: %TEST_EXIT_CODE%
)
echo ============================================================
echo.

REM Provide next steps based on result
if %TEST_EXIT_CODE%==0 (
    echo Test results available in: app\test-results\
    echo Screenshots available in: screenshots\
) else (
    echo Troubleshooting:
    echo   1. Check test-results folder for detailed logs
    echo   2. Review screenshots for visual debugging
    echo   3. Run with --verbose for more output
    echo   4. Check Appium server logs
)
echo.

exit /b %TEST_EXIT_CODE%
