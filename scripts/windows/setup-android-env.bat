@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM Android Development Environment Setup Helper for Windows
REM Usage: setup-android-env.bat
REM
REM This script checks your Windows environment for Android
REM development and testing prerequisites.
REM ============================================================

echo.
echo ============================================================
echo   Android Development Environment Setup (Windows)
echo ============================================================
echo.

set ALL_OK=true

REM ============================================================
REM Check 1: Java Installation
REM ============================================================
echo [1/6] Checking Java installation...

where java >nul 2>&1
if errorlevel 1 (
    echo        [MISSING] Java not found in PATH
    echo.
    echo        Please install Java 17:
    echo          1. Download from: https://adoptium.net/
    echo          2. Install the MSI package
    echo          3. Restart your terminal after installation
    echo.
    set ALL_OK=false
) else (
    for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VER=%%v
    echo        [OK] Java version: !JAVA_VER!
    
    REM Check if it's Java 17
    echo !JAVA_VER! | findstr /i "17\." >nul
    if errorlevel 1 (
        echo        [WARNING] Recommended: Java 17.x for Android development
    )
)

REM ============================================================
REM Check 2: JAVA_HOME Environment Variable
REM ============================================================
echo.
echo [2/6] Checking JAVA_HOME...

if not defined JAVA_HOME (
    echo        [MISSING] JAVA_HOME not set
    echo.
    echo        Please set JAVA_HOME to your JDK installation:
    echo          setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
    echo.
    set ALL_OK=false
) else (
    if exist "%JAVA_HOME%\bin\java.exe" (
        echo        [OK] JAVA_HOME: %JAVA_HOME%
    ) else (
        echo        [INVALID] JAVA_HOME points to non-existent path: %JAVA_HOME%
        set ALL_OK=false
    )
)

REM ============================================================
REM Check 3: Android SDK
REM ============================================================
echo.
echo [3/6] Checking Android SDK...

if not defined ANDROID_HOME (
    if not defined ANDROID_SDK_ROOT (
        echo        [MISSING] ANDROID_HOME or ANDROID_SDK_ROOT not set
        echo.
        echo        Please set ANDROID_HOME:
        echo          setx ANDROID_HOME "%%LOCALAPPDATA%%\Android\Sdk"
        echo.
        echo        Common Android SDK locations:
        echo          %%LOCALAPPDATA%%\Android\Sdk  (Android Studio default)
        echo          C:\Android\Sdk               (Custom installation)
        echo.
        set ALL_OK=false
        set ANDROID_SDK=
    ) else (
        set ANDROID_SDK=!ANDROID_SDK_ROOT!
        echo        [OK] ANDROID_SDK_ROOT: !ANDROID_SDK!
    )
) else (
    set ANDROID_SDK=!ANDROID_HOME!
    if exist "!ANDROID_SDK!" (
        echo        [OK] ANDROID_HOME: !ANDROID_SDK!
    ) else (
        echo        [INVALID] ANDROID_HOME points to non-existent path: !ANDROID_SDK!
        set ALL_OK=false
    )
)

REM ============================================================
REM Check 4: ADB (Android Debug Bridge)
REM ============================================================
echo.
echo [4/6] Checking ADB (Android Debug Bridge)...

if defined ANDROID_SDK (
    if exist "!ANDROID_SDK!\platform-tools\adb.exe" (
        for /f "tokens=*" %%v in ('"!ANDROID_SDK!\platform-tools\adb.exe" version 2^>^&1 ^| findstr /i "Android Debug Bridge"') do (
            echo        [OK] %%v
        )
    ) else (
        echo        [MISSING] ADB not found at !ANDROID_SDK!\platform-tools\adb.exe
        echo.
        echo        Install platform-tools via Android Studio SDK Manager
        echo        or download from: https://developer.android.com/tools/releases/platform-tools
        set ALL_OK=false
    )
) else (
    echo        [SKIP] Cannot check ADB without Android SDK
)

REM ============================================================
REM Check 5: Node.js
REM ============================================================
echo.
echo [5/6] Checking Node.js...

where node >nul 2>&1
if errorlevel 1 (
    echo        [MISSING] Node.js not found
    echo.
    echo        Please install Node.js from: https://nodejs.org/
    echo        Recommended: Version 20.x LTS
    echo.
    set ALL_OK=false
) else (
    for /f %%v in ('node --version') do set NODE_VER=%%v
    echo        [OK] Node.js version: !NODE_VER!
    
    REM Check npm as well
    for /f %%v in ('npm --version') do set NPM_VER=%%v
    echo        [OK] npm version: !NPM_VER!
)

REM ============================================================
REM Check 6: Appium
REM ============================================================
echo.
echo [6/6] Checking Appium...

where appium >nul 2>&1
if errorlevel 1 (
    echo        [MISSING] Appium not installed globally
    echo.
    echo        Install Appium:
    echo          npm install -g appium@3.1.1
    echo.
    set ALL_OK=false
) else (
    for /f %%v in ('appium --version 2^>nul') do set APPIUM_VER=%%v
    echo        [OK] Appium version: !APPIUM_VER!
    
    REM Check for UiAutomator2 driver
    echo.
    echo        Checking Appium drivers...
    appium driver list --installed 2>nul | findstr /i "uiautomator2" >nul
    if errorlevel 1 (
        echo        [MISSING] UiAutomator2 driver not installed
        echo.
        echo        Install with: appium driver install uiautomator2
        set ALL_OK=false
    ) else (
        for /f "tokens=*" %%d in ('appium driver list --installed 2^>nul ^| findstr /i "uiautomator2"') do (
            echo        [OK] %%d
        )
    )
)

REM ============================================================
REM Check Connected Devices
REM ============================================================
echo.
echo ============================================================
echo   Connected Android Devices
echo ============================================================

if defined ANDROID_SDK (
    if exist "!ANDROID_SDK!\platform-tools\adb.exe" (
        echo.
        "!ANDROID_SDK!\platform-tools\adb.exe" devices
        echo.
        
        REM Count devices
        for /f %%c in ('"!ANDROID_SDK!\platform-tools\adb.exe" devices ^| findstr /v "List" ^| findstr "device" ^| find /c /v ""') do set DEVICE_COUNT=%%c
        if "!DEVICE_COUNT!"=="0" (
            echo        No devices connected.
            echo.
            echo        To connect a device:
            echo          1. Enable Developer Options on your Android device
            echo          2. Enable USB Debugging
            echo          3. Connect via USB and accept debugging prompt
            echo.
            echo        To use an emulator:
            echo          1. Open Android Studio ^> Tools ^> Device Manager
            echo          2. Create and start a Virtual Device
        )
    )
) else (
    echo.
    echo        [SKIP] Cannot check devices without Android SDK
)

REM ============================================================
REM Check Available Emulators
REM ============================================================
echo.
echo ============================================================
echo   Available Android Emulators
echo ============================================================
echo.

if defined ANDROID_SDK (
    if exist "!ANDROID_SDK!\emulator\emulator.exe" (
        "!ANDROID_SDK!\emulator\emulator.exe" -list-avds 2>nul
        if errorlevel 1 (
            echo        No emulators found.
        )
    ) else (
        echo        [MISSING] Emulator not found at !ANDROID_SDK!\emulator\emulator.exe
        echo        Install via Android Studio SDK Manager
    )
) else (
    echo        [SKIP] Cannot check emulators without Android SDK
)

REM ============================================================
REM Summary
REM ============================================================
echo.
echo ============================================================
echo   Environment Setup Summary
echo ============================================================
echo.

if "!ALL_OK!"=="true" (
    echo   [OK] All prerequisites are properly configured!
    echo.
    echo   You're ready to run Android tests:
    echo     scripts\run-local-test-android.bat welcome
    echo.
) else (
    echo   [INCOMPLETE] Some prerequisites need attention.
    echo.
    echo   Please fix the issues marked as [MISSING] or [INVALID] above.
    echo.
)

REM ============================================================
REM PATH Recommendations
REM ============================================================
echo ============================================================
echo   Recommended PATH Additions
echo ============================================================
echo.
echo   Add these to your System PATH if not already present:
echo.
echo     %%JAVA_HOME%%\bin
echo     %%ANDROID_HOME%%\platform-tools
echo     %%ANDROID_HOME%%\emulator
echo     %%ANDROID_HOME%%\cmdline-tools\latest\bin
echo.
echo   To add permanently, use System Properties ^> Environment Variables
echo   or run these commands (requires admin for system-wide):
echo.
echo     setx PATH "%%PATH%%;%%JAVA_HOME%%\bin"
echo     setx PATH "%%PATH%%;%%ANDROID_HOME%%\platform-tools"
echo.

REM ============================================================
REM Quick Reference
REM ============================================================
echo ============================================================
echo   Quick Reference Commands
echo ============================================================
echo.
echo   Check connected devices:
echo     adb devices
echo.
echo   List available emulators:
echo     emulator -list-avds
echo.
echo   Start an emulator:
echo     emulator -avd YOUR_AVD_NAME
echo.
echo   Install Appium and driver:
echo     npm install -g appium@3.1.1
echo     appium driver install uiautomator2
echo.
echo   Run tests:
echo     scripts\run-local-test-android.bat welcome
echo     scripts\run-local-test-android.bat --build --env dev --client-id YOUR_ID welcome
echo.

endlocal
pause
