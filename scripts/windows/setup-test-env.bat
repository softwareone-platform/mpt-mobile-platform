@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM Setup Test Environment Script for Windows
REM This script loads environment variables from app\.env and exports them for testing
REM Supports both Android (and future iOS) platforms
REM Can also start Android emulators by name
REM
REM Usage: setup-test-env.bat [--platform android|ios] [--start-emulator <name>] [--list-emulators]
REM ============================================================

set PLATFORM=android
set START_EMULATOR=
set EMULATOR_NAME=
set LIST_EMULATORS=
set START_APPIUM=
set STOP_APPIUM=

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :check_list_emulators
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
if /i "%~1"=="--start-emulator" (
    set START_EMULATOR=true
    set EMULATOR_NAME=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-e" (
    set START_EMULATOR=true
    set EMULATOR_NAME=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--list-emulators" (
    set LIST_EMULATORS=true
    shift
    goto :parse_args
)
if /i "%~1"=="-l" (
    set LIST_EMULATORS=true
    shift
    goto :parse_args
)
if /i "%~1"=="--start-appium" (
    set START_APPIUM=true
    shift
    goto :parse_args
)
if /i "%~1"=="-a" (
    set START_APPIUM=true
    shift
    goto :parse_args
)
if /i "%~1"=="--stop-appium" (
    set STOP_APPIUM=true
    shift
    goto :parse_args
)
if /i "%~1"=="--help" goto :show_help
if /i "%~1"=="-h" goto :show_help
shift
goto :parse_args

:check_list_emulators
if "%STOP_APPIUM%"=="true" goto :stop_appium
if "%LIST_EMULATORS%"=="true" goto :list_emulators
goto :main

:show_help
echo.
echo Setup Test Environment Script for Windows
echo ==========================================
echo.
echo This script loads environment variables from app\.env and exports them for testing.
echo It can also list and start Android emulators.
echo.
echo Usage: setup-test-env.bat [options]
echo.
echo Options:
echo   --platform, -p PLATFORM       Target platform: android or ios (default: android)
echo   --start-emulator, -e NAME     Start Android emulator by AVD name
echo   --start-appium, -a            Start Appium server with inspector plugin
echo   --stop-appium                 Stop all running Appium processes
echo   --list-emulators, -l          List available Android emulators
echo   --help, -h                    Show this help message
echo.
echo Examples:
echo   setup-test-env.bat                                    Setup for Android (default)
echo   setup-test-env.bat --platform android                 Setup for Android
echo   setup-test-env.bat --list-emulators                   List available emulators
echo   setup-test-env.bat --start-emulator Pixel_8_API_34    Start specific emulator
echo   setup-test-env.bat --start-appium                     Start Appium with inspector
echo   setup-test-env.bat --stop-appium                      Stop Appium server
echo   setup-test-env.bat -e Pixel_8_API_34 -p android       Start emulator and setup
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

REM ============================================================
REM List available emulators
REM ============================================================
:list_emulators
echo.
echo ============================================================
echo   Available Emulators/Simulators
echo ============================================================
echo.

echo [Android Emulators]
call :find_emulator_cmd
if defined EMULATOR_CMD (
    echo.
    "%EMULATOR_CMD%" -list-avds 2>nul
    if errorlevel 1 (
        echo   No Android emulators found
    )
) else (
    echo   Android emulator command not found
    echo   Tip: Set ANDROID_HOME or add emulator to PATH
)

echo.
echo [iOS Simulators]
echo   iOS simulators are not available on Windows.
echo   Use macOS for iOS development and testing.
echo.
exit /b 0

REM ============================================================
REM Stop Appium server
REM ============================================================
:stop_appium
echo.
echo [INFO] Stopping Appium server...
echo.

set KILLED_COUNT=0
if not defined APPIUM_PORT set APPIUM_PORT=4723

REM Kill processes on Appium port using netstat and taskkill
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%APPIUM_PORT%" ^| findstr "LISTENING" 2^>nul') do (
    if not "%%p"=="0" (
        echo   [INFO] Killing process on port %APPIUM_PORT% (PID: %%p)...
        taskkill /F /PID %%p >nul 2>&1
        set /a KILLED_COUNT+=1
    )
)

REM Kill any node processes running appium
for /f "tokens=2" %%p in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST 2^>nul ^| findstr "PID:"') do (
    wmic process where "ProcessId=%%p" get CommandLine 2>nul | findstr /I "appium" >nul 2>&1
    if not errorlevel 1 (
        echo   [INFO] Killing Appium node process (PID: %%p)...
        taskkill /F /PID %%p >nul 2>&1
        set /a KILLED_COUNT+=1
    )
)

REM Also try killing by window title pattern
taskkill /F /FI "WINDOWTITLE eq appium*" >nul 2>&1

if !KILLED_COUNT! gtr 0 (
    echo   [OK] Stopped Appium processes
) else (
    echo   [OK] No Appium processes were running
)

REM Verify port is free
timeout /t 1 /nobreak >nul
netstat -ano | findstr ":%APPIUM_PORT%" | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo   [OK] Port %APPIUM_PORT% is now free
) else (
    echo   [WARNING] Port %APPIUM_PORT% may still be in use
)

echo.
exit /b 0

REM ============================================================
REM Start Appium server with inspector
REM ============================================================
:start_appium_server
echo.
echo [INFO] Starting Appium server with inspector plugin...
echo.

REM Check if Appium is installed
where appium >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Appium not found. Please install it with: npm install -g appium
    exit /b 1
)

if not defined APPIUM_PORT set APPIUM_PORT=4723

REM Check if port is already in use
netstat -ano | findstr ":%APPIUM_PORT%" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo   [WARNING] Appium may already be running on port %APPIUM_PORT%
    echo   [WARNING] Stop it with: setup-test-env.bat --stop-appium
    exit /b 1
)

REM Check if inspector plugin is installed
appium plugin list --installed 2>&1 | findstr /I "inspector" >nul 2>&1
if errorlevel 1 (
    echo   [WARNING] Inspector plugin not installed. Installing...
    appium plugin install inspector
)

echo   [OK] Starting Appium on port %APPIUM_PORT% with inspector plugin
echo   [INFO] Inspector URL: http://localhost:%APPIUM_PORT%/inspector
echo.

REM Start Appium in background (minimized window)
start /MIN "Appium Server" appium --use-plugins=inspector --allow-cors --port %APPIUM_PORT%

timeout /t 2 /nobreak >nul

REM Check if Appium started (port is now listening)
netstat -ano | findstr ":%APPIUM_PORT%" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo   [OK] Appium server started
) else (
    echo   [WARNING] Appium may still be starting...
)

exit /b 0

REM ============================================================
REM Find emulator command
REM ============================================================
:find_emulator_cmd
set "EMULATOR_CMD="
where emulator >nul 2>&1
if not errorlevel 1 (
    for /f "delims=" %%i in ('where emulator 2^>nul') do (
        set "EMULATOR_CMD=%%i"
        goto :emulator_found
    )
)
if defined ANDROID_HOME (
    if exist "%ANDROID_HOME%\emulator\emulator.exe" (
        set "EMULATOR_CMD=%ANDROID_HOME%\emulator\emulator.exe"
        goto :emulator_found
    )
)
if defined ANDROID_SDK_ROOT (
    if exist "%ANDROID_SDK_ROOT%\emulator\emulator.exe" (
        set "EMULATOR_CMD=%ANDROID_SDK_ROOT%\emulator\emulator.exe"
        goto :emulator_found
    )
)
:emulator_found
exit /b 0

REM ============================================================
REM Find ADB command
REM ============================================================
:find_adb_cmd
set "ADB_CMD="
where adb >nul 2>&1
if not errorlevel 1 (
    for /f "delims=" %%i in ('where adb 2^>nul') do (
        set "ADB_CMD=%%i"
        goto :adb_found
    )
)
if defined ANDROID_HOME (
    if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
        set "ADB_CMD=%ANDROID_HOME%\platform-tools\adb.exe"
        goto :adb_found
    )
)
if defined ANDROID_SDK_ROOT (
    if exist "%ANDROID_SDK_ROOT%\platform-tools\adb.exe" (
        set "ADB_CMD=%ANDROID_SDK_ROOT%\platform-tools\adb.exe"
        goto :adb_found
    )
)
:adb_found
exit /b 0

REM ============================================================
REM Start Android emulator
REM ============================================================
:start_android_emulator
echo.
echo [INFO] Starting Android Emulator: %EMULATOR_NAME%
echo.

call :find_emulator_cmd
if not defined EMULATOR_CMD (
    echo [ERROR] Android emulator not found.
    echo         Tip: Set ANDROID_HOME or add emulator to PATH
    exit /b 1
)

REM Check if emulator exists in the list
set "AVD_EXISTS="
for /f "delims=" %%a in ('"%EMULATOR_CMD%" -list-avds 2^>nul') do (
    if "%%a"=="%EMULATOR_NAME%" set "AVD_EXISTS=true"
)

if not defined AVD_EXISTS (
    echo [ERROR] Emulator '%EMULATOR_NAME%' not found.
    echo.
    echo Available emulators:
    "%EMULATOR_CMD%" -list-avds 2>nul
    exit /b 1
)

echo   [OK] Found emulator: %EMULATOR_NAME%

REM Check if an emulator is already running using temp file
call :find_adb_cmd
if defined ADB_CMD (
    "%ADB_CMD%" devices 2>nul > "%TEMP%\adb_devices.tmp"
    findstr /C:"emulator" "%TEMP%\adb_devices.tmp" | findstr /C:"device" >nul 2>&1
    if not errorlevel 1 (
        for /f "tokens=1" %%d in ('findstr /C:"emulator" "%TEMP%\adb_devices.tmp" ^| findstr /C:"device"') do (
            echo   [OK] An Android emulator is already running: %%d
            set "DEVICE_UDID=%%d"
            del "%TEMP%\adb_devices.tmp" 2>nul
            goto :emulator_started
        )
    )
    del "%TEMP%\adb_devices.tmp" 2>nul
)

echo   [INFO] Starting emulator (this may take a moment)...

REM Start emulator in background
start "" /B "%EMULATOR_CMD%" -avd "%EMULATOR_NAME%" -no-snapshot-load -no-boot-anim >nul 2>&1

REM Wait for emulator to boot
if defined ADB_CMD (
    echo   [INFO] Waiting for emulator to boot...
    
    set /a TIMEOUT=120
    set /a COUNT=0
    
    :wait_boot_loop
    if !COUNT! geq !TIMEOUT! goto :boot_timeout
    
    REM Check if emulator device appears using temp file
    "%ADB_CMD%" devices 2>nul > "%TEMP%\adb_devices.tmp"
    findstr /C:"emulator" "%TEMP%\adb_devices.tmp" | findstr /C:"device" >nul 2>&1
    if not errorlevel 1 (
        REM Get the device ID
        for /f "tokens=1" %%d in ('findstr /C:"emulator" "%TEMP%\adb_devices.tmp" ^| findstr /C:"device"') do (
            REM Check if boot completed
            "%ADB_CMD%" -s %%d shell getprop sys.boot_completed 2>nul > "%TEMP%\boot_status.tmp"
            set /p BOOT_STATUS=<"%TEMP%\boot_status.tmp"
            set "BOOT_STATUS=!BOOT_STATUS: =!"
            if "!BOOT_STATUS!"=="1" (
                set "DEVICE_UDID=%%d"
                echo   [OK] Emulator booted successfully: %%d
                del "%TEMP%\adb_devices.tmp" 2>nul
                del "%TEMP%\boot_status.tmp" 2>nul
                goto :emulator_started
            )
            del "%TEMP%\boot_status.tmp" 2>nul
        )
    )
    del "%TEMP%\adb_devices.tmp" 2>nul
    
    timeout /t 2 /nobreak >nul
    set /a COUNT+=2
    set /a MOD=!COUNT! %% 10
    if !MOD!==0 echo   [INFO] Still waiting... ^(!COUNT! seconds^)
    goto :wait_boot_loop
    
    :boot_timeout
    REM One final check
    "%ADB_CMD%" devices 2>nul > "%TEMP%\adb_devices.tmp"
    for /f "tokens=1" %%d in ('findstr /C:"emulator" "%TEMP%\adb_devices.tmp" ^| findstr /C:"device" 2^>nul') do (
        set "DEVICE_UDID=%%d"
        echo   [OK] Emulator running: %%d
        del "%TEMP%\adb_devices.tmp" 2>nul
        goto :emulator_started
    )
    del "%TEMP%\adb_devices.tmp" 2>nul
    echo   [WARNING] Emulator may still be starting...
)

:emulator_started
set "DEVICE_NAME=%EMULATOR_NAME%"
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
REM Read each line and process valid KEY=VALUE pairs
for /f "usebackq delims=" %%L in ("%ENV_FILE%") do (
    set "LINE=%%L"
    REM Skip empty lines and comments (lines starting with #)
    if defined LINE (
        set "FIRST_CHAR=!LINE:~0,1!"
        if not "!FIRST_CHAR!"=="#" (
            REM Check if line contains = (valid assignment)
            echo !LINE! | findstr /C:"=" >nul 2>&1
            if not errorlevel 1 (
                REM Extract variable name (before =)
                for /f "tokens=1 delims==" %%N in ("!LINE!") do (
                    set "VAR_NAME=%%N"
                )
                REM Set the full line as environment variable
                set "!LINE!"
                echo   [OK] Exported: !VAR_NAME!
            )
        )
    )
)

echo.
echo [INFO] Setting up platform-specific configuration...
echo.

REM Normalize platform name and use goto for cleaner flow
if /i "%PLATFORM%"=="android" goto :setup_android
if /i "%PLATFORM%"=="ios" goto :setup_ios
goto :setup_android

:setup_android
REM Android configuration
set PLATFORM_NAME=Android
set AUTOMATION_NAME=UiAutomator2
set APP_PACKAGE=com.softwareone.marketplaceMobile
set APP_ACTIVITY=.MainActivity

echo   [OK] Platform: Android
echo   [OK] Automation: UiAutomator2
echo   [OK] Package: %APP_PACKAGE%
echo   [OK] Activity: %APP_ACTIVITY%

REM Start emulator if requested
if "%START_EMULATOR%"=="true" (
    if defined EMULATOR_NAME (
        call :start_android_emulator
    )
)

REM Try to detect connected Android devices if no device set yet
if not defined DEVICE_UDID (
    REM Find ADB command inline
    set "ADB_CMD="
    where adb >nul 2>&1
    if not errorlevel 1 (
        for /f "delims=" %%i in ('where adb 2^>nul') do set "ADB_CMD=%%i"
    )
    if not defined ADB_CMD if defined ANDROID_HOME (
        if exist "%ANDROID_HOME%\platform-tools\adb.exe" set "ADB_CMD=%ANDROID_HOME%\platform-tools\adb.exe"
    )
    if not defined ADB_CMD if defined ANDROID_SDK_ROOT (
        if exist "%ANDROID_SDK_ROOT%\platform-tools\adb.exe" set "ADB_CMD=%ANDROID_SDK_ROOT%\platform-tools\adb.exe"
    )
    
    if defined ADB_CMD (
        "!ADB_CMD!" devices 2>nul > "%TEMP%\adb_devices.tmp"
        REM Parse devices - filter out header and look for 'device' status
        for /f "tokens=1" %%a in ('findstr /C:"device" "%TEMP%\adb_devices.tmp" ^| findstr /V /C:"List"') do (
            set "DEVICE_UDID=%%a"
            echo   [OK] Device detected: %%a
            del "%TEMP%\adb_devices.tmp" 2>nul
            goto :android_device_done
        )
        del "%TEMP%\adb_devices.tmp" 2>nul
        echo   [WARNING] No Android devices detected
    ) else (
        echo   [WARNING] ADB not found - cannot detect devices
    )
)
:android_device_done

if not defined DEVICE_NAME set DEVICE_NAME=Pixel 8
if not defined PLATFORM_VERSION set PLATFORM_VERSION=14
goto :platform_done

:setup_ios
REM iOS configuration (for future use - not fully supported on Windows)
set PLATFORM_NAME=iOS
set AUTOMATION_NAME=XCUITest
set APP_BUNDLE_ID=com.softwareone.marketplaceMobile

echo   [OK] Platform: iOS
echo   [OK] Automation: XCUITest
echo   [OK] Bundle ID: %APP_BUNDLE_ID%
echo.
echo   [WARNING] iOS testing requires macOS. This configuration is for reference only.

if not defined DEVICE_UDID set DEVICE_UDID=963A992A-A208-4EF4-B7F9-7B2A569EC133
if not defined DEVICE_NAME set DEVICE_NAME=iPhone 16
if not defined PLATFORM_VERSION set PLATFORM_VERSION=26.0
goto :platform_done

:platform_done
echo   [OK] Device: %DEVICE_NAME%
echo   [OK] Platform Version: %PLATFORM_VERSION%
if defined DEVICE_UDID echo   [OK] Device UDID: %DEVICE_UDID%

REM Set common Appium configuration
if not defined APPIUM_HOST set APPIUM_HOST=127.0.0.1
if not defined APPIUM_PORT set APPIUM_PORT=4723

REM Start Appium server if requested
if "%START_APPIUM%"=="true" (
    call :start_appium_server
)

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
echo   scripts\windows\setup-test-env.bat                              Setup for Android (default)
echo   scripts\windows\setup-test-env.bat -p android                   Setup for Android
echo   scripts\windows\setup-test-env.bat --list-emulators             List available emulators
echo   scripts\windows\setup-test-env.bat -e Pixel_8_API_34            Start emulator and setup
echo   scripts\windows\setup-test-env.bat --start-appium               Start Appium with inspector
echo   scripts\windows\setup-test-env.bat --stop-appium                Stop Appium server
echo.
echo Run Tests:
echo   scripts\windows\run-local-test-android.bat welcome
echo   scripts\windows\run-local-test-android.bat --build welcome
echo.

endlocal
