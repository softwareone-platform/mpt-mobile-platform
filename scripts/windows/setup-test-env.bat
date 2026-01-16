@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM Setup Test Environment Script for Windows
REM This script loads environment variables from app\.env and exports them for testing
REM Supports both Android (and future iOS) platforms
REM
REM Usage: setup-test-env.bat [--platform android|ios]
REM ============================================================

set PLATFORM=android

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :main
if /i "%~1"=="--platform" (
    set PLATFORM=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-p" (
    set PLATFORM=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--help" goto :show_help
if /i "%~1"=="-h" goto :show_help
shift
goto :parse_args

:show_help
echo.
echo Setup Test Environment Script for Windows
echo ==========================================
echo.
echo This script loads environment variables from app\.env and exports them for testing.
echo.
echo Usage: setup-test-env.bat [options]
echo.
echo Options:
echo   --platform, -p PLATFORM  Target platform: android or ios (default: android)
echo   --help, -h               Show this help message
echo.
echo Examples:
echo   setup-test-env.bat                      Setup for Android (default)
echo   setup-test-env.bat --platform android   Setup for Android
echo   setup-test-env.bat -p ios               Setup for iOS (future)
echo.
echo Required .env Variables:
echo   AUTH0_DOMAIN              Auth0 domain
echo   AUTH0_CLIENT_ID           Auth0 client ID
echo   AUTH0_AUDIENCE            Auth0 audience
echo   AUTH0_SCOPE               Auth0 scope
echo   AUTH0_API_URL             API URL
echo   AUTH0_OTP_DIGITS          OTP digit count
echo   AUTH0_SCHEME              App scheme
echo.
echo Optional Airtable Variables (for OTP testing):
echo   AIRTABLE_EMAIL            Test email
echo   AIRTABLE_API_TOKEN        Airtable API token
echo   AIRTABLE_BASE_ID          Airtable base ID
echo   AIRTABLE_TABLE_NAME       Airtable table name
echo   AIRTABLE_FROM_EMAIL       From email for OTP
echo.
exit /b 0

:main
echo.
echo ============================================================
echo   Test Environment Setup (Windows)
echo ============================================================
echo.

REM Get project root (assumes script is run from project root)
set "PROJECT_ROOT=%CD%"
set "ENV_FILE=%PROJECT_ROOT%\app\.env"

REM Check if .env file exists
if not exist "%ENV_FILE%" (
    echo [ERROR] .env file not found at %ENV_FILE%
    echo.
    echo Please create a .env file in the app directory with the following variables:
    echo ^(See app\.env.example for a template^)
    echo.
    echo # Auth0 Configuration ^(Test Environment^)
    echo AUTH0_DOMAIN=your-domain.auth0.com
    echo AUTH0_CLIENT_ID=your_client_id
    echo AUTH0_AUDIENCE=your_audience
    echo AUTH0_SCOPE=openid profile email offline_access
    echo AUTH0_API_URL=your_api_url
    echo AUTH0_OTP_DIGITS=6
    echo AUTH0_SCHEME=com.softwareone.marketplaceMobile
    echo.
    echo # Tests ^(Airtable Configuration for OTP testing^)
    echo AIRTABLE_EMAIL=your_test_email@example.com
    echo AIRTABLE_API_TOKEN=your_token
    echo AIRTABLE_BASE_ID=your_base_id
    echo AIRTABLE_TABLE_NAME=your_table
    echo AIRTABLE_FROM_EMAIL=your_from_email@example.com
    echo.
    exit /b 1
)

echo [INFO] Loading environment variables from .env file...
echo.

REM Load and export variables from .env
for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_FILE%") do (
    set "LINE=%%a"
    REM Skip comments and empty lines
    if not "!LINE:~0,1!"=="#" (
        if not "%%a"=="" (
            if not "%%b"=="" (
                set "%%a=%%b"
                echo   [OK] Exported: %%a
            )
        )
    )
)

echo.
echo [INFO] Setting up platform-specific configuration...
echo.

REM Normalize platform name
set PLATFORM_LOWER=%PLATFORM%
for %%a in (a b c d e f g h i j k l m n o p q r s t u v w x y z) do set PLATFORM_LOWER=!PLATFORM_LOWER:%%a=%%a!

if /i "%PLATFORM_LOWER%"=="android" (
    REM Android configuration
    set PLATFORM_NAME=Android
    set AUTOMATION_NAME=UiAutomator2
    set APP_PACKAGE=com.softwareone.marketplaceMobile
    set APP_ACTIVITY=.MainActivity
    
    echo   [OK] Platform: Android
    echo   [OK] Automation: UiAutomator2
    echo   [OK] Package: !APP_PACKAGE!
    echo   [OK] Activity: !APP_ACTIVITY!
    
    REM Try to detect connected Android devices
    if defined ANDROID_HOME (
        set "ADB_EXE=!ANDROID_HOME!\platform-tools\adb.exe"
    ) else if defined ANDROID_SDK_ROOT (
        set "ADB_EXE=!ANDROID_SDK_ROOT!\platform-tools\adb.exe"
    ) else (
        set "ADB_EXE="
    )
    
    if defined ADB_EXE (
        if exist "!ADB_EXE!" (
            for /f "tokens=1" %%d in ('"!ADB_EXE!" devices ^| findstr /v "List" ^| findstr "device"') do (
                set DEVICE_UDID=%%d
                echo   [OK] Device detected: !DEVICE_UDID!
                goto :device_found
            )
            echo   [WARNING] No Android devices detected
            :device_found
        )
    )
    
    if not defined DEVICE_NAME set DEVICE_NAME=Pixel 8
    if not defined PLATFORM_VERSION set PLATFORM_VERSION=14
) else (
    REM iOS configuration (for future use)
    set PLATFORM_NAME=iOS
    set AUTOMATION_NAME=XCUITest
    set APP_BUNDLE_ID=com.softwareone.marketplaceMobile
    
    echo   [OK] Platform: iOS
    echo   [OK] Automation: XCUITest
    echo   [OK] Bundle ID: !APP_BUNDLE_ID!
    
    if not defined DEVICE_UDID set DEVICE_UDID=963A992A-A208-4EF4-B7F9-7B2A569EC133
    if not defined DEVICE_NAME set DEVICE_NAME=iPhone 16
    if not defined PLATFORM_VERSION set PLATFORM_VERSION=26.0
)

echo   [OK] Device: %DEVICE_NAME%
echo   [OK] Platform Version: %PLATFORM_VERSION%

REM Set common Appium configuration
if not defined APPIUM_HOST set APPIUM_HOST=127.0.0.1
if not defined APPIUM_PORT set APPIUM_PORT=4723

echo.
echo [SUCCESS] Environment setup complete!
echo.
echo ============================================================
echo   Configuration Summary
echo ============================================================
echo.

echo Auth0 Configuration:
if defined AUTH0_DOMAIN echo   Domain:    %AUTH0_DOMAIN%
if defined AUTH0_CLIENT_ID echo   Client ID: %AUTH0_CLIENT_ID:~0,20%...
if defined AUTH0_AUDIENCE echo   Audience:  %AUTH0_AUDIENCE%

if defined AIRTABLE_API_TOKEN (
    echo.
    echo Airtable Configuration:
    if defined AIRTABLE_BASE_ID echo   Base ID:   %AIRTABLE_BASE_ID:~0,20%...
    if defined AIRTABLE_TABLE_NAME echo   Table:     %AIRTABLE_TABLE_NAME%
    if defined AIRTABLE_FROM_EMAIL echo   Email:     %AIRTABLE_FROM_EMAIL%
)

echo.
echo Test Platform:
echo   Platform:  %PLATFORM_NAME%
echo   Device:    %DEVICE_NAME%
echo   Version:   %PLATFORM_VERSION%

echo.
echo Appium Configuration:
echo   Host:      %APPIUM_HOST%
echo   Port:      %APPIUM_PORT%

echo.
echo ============================================================
echo.
echo Usage:
echo   scripts\windows\setup-test-env.bat                Setup for Android (default)
echo   scripts\windows\setup-test-env.bat -p android     Setup for Android
echo.
echo Run Tests:
echo   scripts\windows\run-local-test-android.bat welcome
echo   scripts\windows\run-local-test-android.bat --build welcome
echo.

endlocal
