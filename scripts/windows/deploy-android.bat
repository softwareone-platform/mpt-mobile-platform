@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM Android Deployment Script for Windows
REM Usage: deploy-android.bat [options]
REM 
REM This script builds and deploys the Android app to an emulator
REM or connected device for Appium testing.
REM ============================================================

set ENVIRONMENT=
set CLIENT_ID=
set BUILD_TYPE=debug
set EMULATOR_NAME=
set VERBOSE=false

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :validate_args
if /i "%~1"=="--env" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-e" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--client-id" (
    set CLIENT_ID=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-c" (
    set CLIENT_ID=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--release" (
    set BUILD_TYPE=release
    shift
    goto :parse_args
)
if /i "%~1"=="-r" (
    set BUILD_TYPE=release
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

echo Error: Unknown option %~1
goto :show_help

:show_help
echo.
echo Android Deployment Script for Windows
echo ======================================
echo.
echo Usage: deploy-android.bat [options]
echo.
echo Options:
echo   --env, -e ENV         Set environment (dev, test, qa)
echo   --client-id, -c ID    Set Auth0 client ID
echo   --release, -r         Build release version (default: debug)
echo   --emulator NAME       Specify emulator AVD name to start
echo   --verbose, -v         Enable verbose output
echo   --help, -h            Show this help message
echo.
echo Examples:
echo   deploy-android.bat
echo   deploy-android.bat --env dev --client-id abc123
echo   deploy-android.bat --release --emulator Pixel_8_API_34
echo   deploy-android.bat --env test --client-id xyz789 --release
echo.
echo Environment presets:
echo   dev   - Uses login-dev.pyracloud.com
echo   test  - Uses login-test.pyracloud.com
echo   qa    - Uses login-qa.pyracloud.com
echo.
exit /b 0

:validate_args
echo.
echo ============================================================
echo   Android Deployment Script for Windows
echo ============================================================
echo.

REM Check for Android SDK
if not defined ANDROID_HOME (
    if not defined ANDROID_SDK_ROOT (
        echo [ERROR] ANDROID_HOME or ANDROID_SDK_ROOT not set
        echo.
        echo Please set the environment variable to your Android SDK location:
        echo   set ANDROID_HOME=%%LOCALAPPDATA%%\Android\Sdk
        echo.
        echo Or for permanent setting:
        echo   setx ANDROID_HOME "%%LOCALAPPDATA%%\Android\Sdk"
        echo.
        exit /b 1
    ) else (
        set ANDROID_SDK=!ANDROID_SDK_ROOT!
    )
) else (
    set ANDROID_SDK=!ANDROID_HOME!
)

echo [INFO] Using Android SDK: !ANDROID_SDK!

REM Check if Android SDK exists
if not exist "!ANDROID_SDK!" (
    echo [ERROR] Android SDK directory not found: !ANDROID_SDK!
    exit /b 1
)

REM Check for Java
where java >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java not found in PATH
    echo.
    echo Please install Java 17:
    echo   1. Download from: https://adoptium.net/
    echo   2. Install the MSI package
    echo   3. Add to PATH: %%JAVA_HOME%%\bin
    echo.
    exit /b 1
)

REM Verify Java version (should be 17.x)
for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set JAVA_VER=%%v
)
echo [INFO] Java version: !JAVA_VER!

REM Get script directory and navigate to app folder
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set APP_DIR=%PROJECT_ROOT%\app

if not exist "%APP_DIR%" (
    echo [ERROR] App directory not found at %APP_DIR%
    echo Make sure you're running this script from the project root or scripts directory
    exit /b 1
)

echo [INFO] Project root: %PROJECT_ROOT%
echo [INFO] App directory: %APP_DIR%
echo.

cd /d "%APP_DIR%"

REM Check for node_modules
if not exist "node_modules" (
    echo [INFO] Installing Node.js dependencies...
    call npm ci
    if errorlevel 1 (
        echo [ERROR] npm ci failed
        exit /b 1
    )
    echo [INFO] Dependencies installed successfully
    echo.
)

REM Configure environment if specified
if not "%ENVIRONMENT%"=="" (
    echo [INFO] Configuring environment: %ENVIRONMENT%
    
    if "%ENVIRONMENT%"=="dev" (
        set AUTH0_DOMAIN=login-dev.pyracloud.com
        set AUTH0_AUDIENCE=https://api-dev.pyracloud.com/
        set AUTH0_SCOPE=openid profile email offline_access
        set AUTH0_API_URL=https://api.s1.today/public/
        set AUTH0_OTP_DIGITS=6
        set AUTH0_SCHEME=com.softwareone.marketplaceMobile
    )
    if "%ENVIRONMENT%"=="test" (
        set AUTH0_DOMAIN=login-test.pyracloud.com
        set AUTH0_AUDIENCE=https://api-test.pyracloud.com/
        set AUTH0_SCOPE=openid profile email offline_access
        set AUTH0_API_URL=https://api.s1.show/public/
        set AUTH0_OTP_DIGITS=6
        set AUTH0_SCHEME=com.softwareone.marketplaceMobile
    )
    if "%ENVIRONMENT%"=="qa" (
        set AUTH0_DOMAIN=login-qa.pyracloud.com
        set AUTH0_AUDIENCE=https://api-qa.pyracloud.com/
        set AUTH0_SCOPE=openid profile email offline_access
        set AUTH0_API_URL=https://api.s1.live/public/
        set AUTH0_OTP_DIGITS=6
        set AUTH0_SCHEME=com.softwareone.marketplaceMobile
    )
    
    if not "%CLIENT_ID%"=="" (
        set AUTH0_CLIENT_ID=%CLIENT_ID%
    )
    
    echo [INFO] Auth0 Domain: !AUTH0_DOMAIN!
    echo [INFO] Auth0 Client ID: !AUTH0_CLIENT_ID!
    echo.
)

REM Start emulator if specified
if not "%EMULATOR_NAME%"=="" (
    echo [INFO] Starting emulator: %EMULATOR_NAME%
    
    REM Check if emulator exists
    "!ANDROID_SDK!\emulator\emulator.exe" -list-avds | findstr /i "%EMULATOR_NAME%" >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Emulator '%EMULATOR_NAME%' not found
        echo.
        echo Available emulators:
        "!ANDROID_SDK!\emulator\emulator.exe" -list-avds
        echo.
        exit /b 1
    )
    
    REM Start emulator in background
    start "" "!ANDROID_SDK!\emulator\emulator.exe" -avd "%EMULATOR_NAME%" -no-snapshot -no-audio
    
    echo [INFO] Waiting for device to be ready...
    "!ANDROID_SDK!\platform-tools\adb.exe" wait-for-device
    
    REM Wait for boot to complete
    echo [INFO] Waiting for boot to complete...
    set BOOT_TIMEOUT=120
    set BOOT_COUNTER=0
    
    :wait_boot
    if !BOOT_COUNTER! geq !BOOT_TIMEOUT! (
        echo [ERROR] Emulator boot timeout after !BOOT_TIMEOUT! seconds
        exit /b 1
    )
    
    for /f %%a in ('"!ANDROID_SDK!\platform-tools\adb.exe" shell getprop sys.boot_completed 2^>nul') do set BOOT_COMPLETE=%%a
    if not "!BOOT_COMPLETE!"=="1" (
        timeout /t 2 /nobreak >nul
        set /a BOOT_COUNTER+=2
        goto :wait_boot
    )
    
    echo [INFO] Emulator boot complete!
    echo.
)

REM Build the app
echo [INFO] Building Android app (%BUILD_TYPE%)...
echo.

if "%BUILD_TYPE%"=="release" (
    echo [INFO] Building Release APK with Gradle...
    
    cd android
    
    REM Clean first
    echo [INFO] Cleaning previous build...
    call gradlew.bat clean
    if errorlevel 1 (
        echo [WARNING] Clean failed, continuing anyway...
    )
    
    REM Build release
    echo [INFO] Assembling Release APK...
    call gradlew.bat assembleRelease
    if errorlevel 1 (
        echo [ERROR] Release build failed
        echo.
        echo Check the build output above for errors.
        echo Common issues:
        echo   - Missing signing configuration
        echo   - Dependency conflicts
        echo   - Insufficient memory (try: set GRADLE_OPTS=-Xmx4096m)
        exit /b 1
    )
    
    set APK_PATH=app\build\outputs\apk\release\app-release.apk
    cd ..
    
) else (
    echo [INFO] Building Debug APK with Expo...
    
    call npx expo run:android --no-install
    if errorlevel 1 (
        echo [ERROR] Debug build failed
        exit /b 1
    )
    
    set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk
)

REM Verify APK exists
if not exist "!APK_PATH!" (
    echo [ERROR] APK not found at: !APK_PATH!
    echo.
    echo Build may have failed or APK is in a different location.
    exit /b 1
)

echo.
echo [INFO] APK built successfully: !APK_PATH!

REM Get device UDID
echo.
echo [INFO] Checking connected devices...

for /f "tokens=1" %%d in ('"!ANDROID_SDK!\platform-tools\adb.exe" devices ^| findstr /v "List" ^| findstr "device"') do (
    set DEVICE_UDID=%%d
    goto :found_device
)

echo [WARNING] No connected Android device found
echo.
echo To connect a device:
echo   1. Enable USB Debugging on your Android device
echo   2. Connect via USB cable
echo   3. Accept the debugging authorization prompt
echo.
echo To start an emulator:
echo   deploy-android.bat --emulator YOUR_AVD_NAME
echo.
goto :end

:found_device
echo [INFO] Found device: !DEVICE_UDID!

REM Install APK on device
echo.
echo [INFO] Installing APK on device...

"!ANDROID_SDK!\platform-tools\adb.exe" install -r "!APK_PATH!"
if errorlevel 1 (
    echo [WARNING] Install failed, trying with -t flag (allow test APKs)...
    "!ANDROID_SDK!\platform-tools\adb.exe" install -r -t "!APK_PATH!"
    if errorlevel 1 (
        echo [ERROR] APK installation failed
        echo.
        echo Try uninstalling the app first:
        echo   adb uninstall com.softwareone.marketplaceMobile
        exit /b 1
    )
)

echo [INFO] APK installed successfully!

:end
echo.
echo ============================================================
echo   Deployment Complete!
echo ============================================================
echo.
if defined DEVICE_UDID (
    echo Device UDID: !DEVICE_UDID!
)
if defined APK_PATH (
    echo APK Path: !APK_PATH!
)
if not "%BUILD_TYPE%"=="" (
    echo Build Type: %BUILD_TYPE%
)
echo.
echo Next steps:
echo   1. Run tests: scripts\run-local-test-android.bat welcome
echo   2. Or run all tests: scripts\run-local-test-android.bat all
echo.

endlocal
exit /b 0
