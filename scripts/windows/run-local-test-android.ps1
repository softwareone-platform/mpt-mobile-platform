<#
.SYNOPSIS
    Local testing script for Appium Android tests on Windows (PowerShell version)

.DESCRIPTION
    This script provides a PowerShell alternative for running Appium tests on Android.
    It handles building, deploying, and testing Android applications with better
    error handling and modern scripting features compared to batch files.
    
    The build process creates a RELEASE APK (not debug) to avoid the Expo development
    UI appearing during tests. It uses 'expo prebuild' followed by 'gradlew assembleRelease'.

.PARAMETER Build
    Build the app before testing in RELEASE mode. Uses .env file for configuration.

.PARAMETER SkipBuild
    Skip build and install existing app from last build.

.PARAMETER EmulatorName
    Specify Android emulator AVD name to start.

.PARAMETER StartEmulatorOnly
    Start the specified emulator and exit without running tests.

.PARAMETER ListEmulators
    List available Android emulators and exit.

.PARAMETER FeatureFlag
    Override feature flag value for tests. Format: FLAG_NAME=true/false
    These are test-only overrides passed via FEATURE_FLAG_OVERRIDES environment
    variable; the app build uses its original flag values from .env configuration.
    Can be specified multiple times as an array.

.PARAMETER TestTarget
    Suite name, spec file path, or 'all' to run all tests.

.EXAMPLE
    .\run-local-test-android.ps1 welcome
    Run the welcome test suite with currently installed app.

.EXAMPLE
    .\run-local-test-android.ps1 -Build welcome
    Build RELEASE APK using .env configuration and run welcome suite.

.EXAMPLE
    .\run-local-test-android.ps1 -SkipBuild all
    Install last built APK and run all tests.

.EXAMPLE
    .\run-local-test-android.ps1 -EmulatorName "Pixel_8_API_34" welcome
    Start specific emulator and run welcome suite.

.EXAMPLE
    .\run-local-test-android.ps1 -StartEmulatorOnly -EmulatorName "Pixel_8_API_34"
    Start emulator and exit without running tests.

.EXAMPLE
    .\run-local-test-android.ps1 -ListEmulators
    List all available Android emulators.

.EXAMPLE
    .\run-local-test-android.ps1 .\test\specs\welcome.e2e.js
    Run a specific spec file.

.EXAMPLE
    .\run-local-test-android.ps1 -List all
    List all test cases without running them.

.EXAMPLE
    .\run-local-test-android.ps1 -FeatureFlag "FEATURE_ACCOUNT_TABS=false" featureFlags
    Run tests with feature flag override (no rebuild).

.EXAMPLE
    .\run-local-test-android.ps1 -Build -FeatureFlag "FEATURE_ACCOUNT_TABS=false" welcome
    Build app and run tests with feature flag override.

.EXAMPLE
    .\run-local-test-android.ps1 -DryRun spotlight
    List tests in spotlight suite without running them.

.NOTES
    Prerequisites:
    - Windows 10/11 (64-bit)
    - Android SDK with ANDROID_HOME environment variable set
    - Java Development Kit (JDK) 17 (NOT Java 24+ which is incompatible)
    - Node.js (version 20.x or later)
    - Appium with UiAutomator2 driver installed globally
    - .env file in app\ directory with Auth0 configuration
    - Android device or emulator connected
#>

[CmdletBinding(DefaultParameterSetName = 'Test')]
param(
    [Parameter(ParameterSetName = 'Test')]
    [Parameter(ParameterSetName = 'Build')]
    [switch]$Build,
    
    [Parameter(ParameterSetName = 'Test')]
    [Parameter(ParameterSetName = 'Build')]
    [switch]$SkipBuild,
    
    [Parameter(ParameterSetName = 'Test')]
    [Parameter(ParameterSetName = 'Build')]
    [Parameter(ParameterSetName = 'StartEmulator')]
    [Alias('e')]
    [string]$EmulatorName,
    
    [Parameter(ParameterSetName = 'StartEmulator', Mandatory = $true)]
    [switch]$StartEmulatorOnly,
    
    [Parameter(ParameterSetName = 'ListEmulators', Mandatory = $true)]
    [switch]$ListEmulators,
    
    [Parameter(ParameterSetName = 'ListTests', Mandatory = $true)]
    [Alias('DryRun')]
    [switch]$List,
    
    [Parameter(ParameterSetName = 'Test')]
    [Parameter(ParameterSetName = 'Build')]
    [Alias('f')]
    [string[]]$FeatureFlag,
    
    [Parameter(Position = 0, ParameterSetName = 'Test')]
    [Parameter(Position = 0, ParameterSetName = 'Build')]
    [Parameter(Position = 0, ParameterSetName = 'ListTests')]
    [string]$TestTarget
)

$ErrorActionPreference = "Stop"

#region Helper Functions

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-WarningMsg {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Blue
    Write-Host "  $Title" -ForegroundColor Blue
    Write-Host ("=" * 60) -ForegroundColor Blue
    Write-Host ""
}

function Test-AppiumServer {
    param(
        [string]$TestHost = "127.0.0.1",
        [int]$Port = 4723
    )
    
    try {
        Invoke-WebRequest -Uri "http://${TestHost}:${Port}/status" -TimeoutSec 2 -ErrorAction SilentlyContinue
        return $true
    }
    catch {
        return $false
    }
}

function Wait-ForAppium {
    param(
        [string]$TestHost = "127.0.0.1",
        [int]$Port = 4723,
        [int]$TimeoutSeconds = 30
    )
    
    for ($i = 1; $i -le $TimeoutSeconds; $i++) {
        if (Test-AppiumServer -TestHost $TestHost -Port $Port) {
            return $true
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

function Get-AndroidDevice {
    param([string]$AdbPath)
    
    $devices = & $AdbPath devices 2>$null | 
        Select-String "device$" | 
        ForEach-Object { ($_ -split "\s+")[0] }
    
    return $devices | Select-Object -First 1
}

function Import-EnvFile {
    param([string]$EnvFilePath)
    
    if (-not (Test-Path $EnvFilePath)) {
        return $false
    }
    
    $envContent = Get-Content $EnvFilePath
    foreach ($line in $envContent) {
        # Skip comments and empty lines
        if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) {
            continue
        }
        
        # Parse key=value
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            
            # Remove surrounding quotes if present
            if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
                $value = $matches[1]
            }
            
            # Set environment variable
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    return $true
}

function Get-TestList {
    param([string]$Target)
    
    $ProjectRoot = Get-Location
    $SpecsDir = Join-Path $ProjectRoot "app\test\specs"
    $SpecFiles = @()
    
    # Determine which files to scan based on target
    if ($Target -eq "all") {
        $SpecFiles = Get-ChildItem -Path $SpecsDir -Filter "*.e2e.js" -File
    }
    elseif ($Target -match "\.js$") {
        # It's a spec file path
        $filePath = Join-Path $ProjectRoot "app\$Target"
        if (Test-Path $filePath) {
            $SpecFiles = @(Get-Item $filePath)
        }
    }
    else {
        # It's a suite name - map to file
        $suiteMap = @{
            "welcome" = "welcome.e2e.js"
            "home" = "home.e2e.js"
            "navigation" = "navigation.e2e.js"
            "spotlight" = "spotlight-filters.e2e.js"
            "profile" = "profile.e2e.js"
            "personalInformation" = "personal-information.e2e.js"
            "personal" = "personal-information.e2e.js"
            "failing" = "failing.e2e.js"
            "featureFlags" = "feature-flags.e2e.js"
        }
        
        if ($suiteMap.ContainsKey($Target)) {
            $filePath = Join-Path $SpecsDir $suiteMap[$Target]
            if (Test-Path $filePath) {
                $SpecFiles = @(Get-Item $filePath)
            }
        }
        else {
            Write-ErrorMsg "Unknown suite: $Target"
            Write-Host "Available suites: welcome, home, navigation, spotlight, profile, personalInformation, failing, featureFlags" -ForegroundColor Yellow
            return
        }
    }
    
    Write-Host ""
    Write-Host ("=" * 72) -ForegroundColor Blue
    Write-Host "                      TEST DISCOVERY (DRY RUN)" -ForegroundColor Blue
    Write-Host ("=" * 72) -ForegroundColor Blue
    Write-Host ""
    
    $totalFiles = 0
    $totalDescribes = 0
    $totalTests = 0
    
    foreach ($file in $SpecFiles) {
        if (Test-Path $file.FullName) {
            $totalFiles++
            Write-Host "[FILE] $($file.Name)" -ForegroundColor Cyan
            Write-Host ("─" * 72)
            
            $lineNum = 0
            $content = Get-Content $file.FullName
            
            foreach ($line in $content) {
                $lineNum++
                
                # Check for describe blocks
                if ($line -match '^\s*describe\s*\(\s*[''"]([^''"]+)[''"]') {
                    $name = $matches[1]
                    Write-Host "  [DESCRIBE] $name (L$lineNum)" -ForegroundColor Yellow
                    $totalDescribes++
                }
                
                # Check for it blocks
                if ($line -match '^\s*it\s*\(\s*[''"]([^''"]+)[''"]') {
                    $name = $matches[1]
                    Write-Host "    [TEST] $name (L$lineNum)" -ForegroundColor Green
                    $totalTests++
                }
            }
            Write-Host ""
        }
        else {
            Write-WarningMsg "File not found: $($file.FullName)"
        }
    }
    
    Write-Host ("=" * 72) -ForegroundColor Blue
    Write-Host "Summary: $totalTests test(s) in $totalDescribes describe block(s) across $totalFiles file(s)" -ForegroundColor Cyan
    Write-Host ("=" * 72) -ForegroundColor Blue
    Write-Host ""
}

#endregion

#region Main Script

Write-Header "Android Local Test Runner (PowerShell)"

# Check for Android SDK first (needed for list-emulators and start-emulator)
$AndroidSdk = $env:ANDROID_HOME
if (-not $AndroidSdk) {
    $AndroidSdk = $env:ANDROID_SDK_ROOT
}
if (-not $AndroidSdk) {
    Write-ErrorMsg "ANDROID_HOME or ANDROID_SDK_ROOT not set"
    Write-Host ""
    Write-Host "Please set the environment variable:" -ForegroundColor Yellow
    Write-Host '  $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"'
    Write-Host ""
    exit 1
}

if (-not (Test-Path $AndroidSdk)) {
    Write-ErrorMsg "Android SDK not found at: $AndroidSdk"
    exit 1
}

# Set up paths
$AdbPath = Join-Path $AndroidSdk "platform-tools\adb.exe"
$EmulatorPath = Join-Path $AndroidSdk "emulator\emulator.exe"

if (-not (Test-Path $AdbPath)) {
    Write-ErrorMsg "ADB not found at: $AdbPath"
    exit 1
}

Write-Info "Using Android SDK: $AndroidSdk"

# Handle -List / -DryRun option
if ($List) {
    if (-not $TestTarget) {
        Write-ErrorMsg "Test target is required with -List option (suite name, spec file, or 'all')"
        Write-Host "Example: .\run-local-test-android.ps1 -List all" -ForegroundColor Yellow
        exit 1
    }
    Get-TestList -Target $TestTarget
    exit 0
}

# Handle -ListEmulators option
if ($ListEmulators) {
    Write-Host ""
    Write-Info "Available Android Emulators:"
    Write-Host ""
    
    if (Test-Path $EmulatorPath) {
        $avdList = & $EmulatorPath -list-avds 2>$null
        if ($avdList) {
            $avdList | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }
        } else {
            Write-Host "  No emulators found. Create one in Android Studio." -ForegroundColor Yellow
        }
    } else {
        Write-ErrorMsg "Emulator not found at: $EmulatorPath"
    }
    Write-Host ""
    exit 0
}

# Handle -StartEmulatorOnly option
if ($StartEmulatorOnly) {
    if (-not $EmulatorName) {
        Write-ErrorMsg "Emulator name required with -StartEmulatorOnly"
        Write-Host ""
        Write-Host "Available emulators:" -ForegroundColor Yellow
        & $EmulatorPath -list-avds 2>$null | ForEach-Object { Write-Host "  $_" }
        exit 1
    }
    
    Write-Info "Starting emulator: $EmulatorName"
    Write-Host ""
    
    # Check if device already connected
    $existingDevice = Get-AndroidDevice -AdbPath $AdbPath
    if ($existingDevice) {
        Write-Success "Device already connected: $existingDevice"
        & $AdbPath devices
        exit 0
    }
    
    # Start emulator with software GPU rendering to avoid driver issues
    Write-Info "Starting emulator process..."
    Start-Process -FilePath $EmulatorPath -ArgumentList "-avd", $EmulatorName, "-gpu", "swiftshader_indirect" -WindowStyle Normal
    
    Write-Info "Waiting for emulator to boot..."
    & $AdbPath wait-for-device
    
    Write-Info "Waiting for boot to complete..."
    $bootTimeout = 120
    $bootTimer = 0
    while ($bootTimer -lt $bootTimeout) {
        $bootComplete = & $AdbPath shell getprop sys.boot_completed 2>$null
        if ($bootComplete -eq "1") {
            Write-Success "Emulator started and ready!"
            Write-Host ""
            & $AdbPath devices
            exit 0
        }
        Start-Sleep -Seconds 2
        $bootTimer += 2
    }
    
    Write-ErrorMsg "Emulator boot timeout after $bootTimeout seconds"
    exit 1
}

# Load environment variables from .env file
$ProjectRoot = Get-Location
$EnvFile = Join-Path $ProjectRoot "app\.env"

if (Test-Path $EnvFile) {
    Write-Info "Loading environment variables from .env file..."
    if (Import-EnvFile -EnvFilePath $EnvFile) {
        Write-Success "Environment variables loaded"
    }
    Write-Host ""
}

# Validate test target
if (-not $TestTarget) {
    Write-ErrorMsg "Test target is required (suite name, spec file, or 'all')"
    Write-Host ""
    Write-Host "Usage: .\run-local-test-android.ps1 [options] <test_target>" -ForegroundColor Yellow
    Write-Host "Use Get-Help .\run-local-test-android.ps1 for more information" -ForegroundColor Yellow
    exit 1
}

# Set environment variables
$env:PLATFORM_NAME = "Android"
$env:AUTOMATION_NAME = "UiAutomator2"
$env:APP_PACKAGE = "com.softwareone.marketplaceMobile"
$env:APP_ACTIVITY = ".MainActivity"
$env:APPIUM_HOST = "127.0.0.1"
$env:APPIUM_PORT = "4723"

# Validate build parameters
if ($Build -and $SkipBuild) {
    Write-ErrorMsg "-Build and -SkipBuild cannot be used together"
    exit 1
}

# Note: -Environment and -ClientId are no longer required for -Build
# The build now uses .env file like the bash script does

# Start emulator if specified
if ($EmulatorName) {
    Write-Info "Checking for running devices..."
    
    $existingDevice = Get-AndroidDevice -AdbPath $AdbPath
    
    if ($existingDevice) {
        Write-Info "Device already connected: $existingDevice"
    }
    else {
        Write-Info "Starting emulator: $EmulatorName"
        
        # Check if emulator exists
        $avdList = & $EmulatorPath -list-avds 2>$null
        if ($avdList -notcontains $EmulatorName) {
            Write-ErrorMsg "Emulator '$EmulatorName' not found"
            Write-Host ""
            Write-Host "Available emulators:" -ForegroundColor Yellow
            $avdList | ForEach-Object { Write-Host "  $_" }
            exit 1
        }
        
        # Start emulator with software GPU to avoid driver issues
        Start-Process -FilePath $EmulatorPath -ArgumentList "-avd", $EmulatorName, "-gpu", "swiftshader_indirect" -WindowStyle Minimized
        
        Write-Info "Waiting for emulator to boot..."
        & $AdbPath wait-for-device
        
        # Wait for boot to complete
        $bootTimeout = 120
        $bootTimer = 0
        while ($bootTimer -lt $bootTimeout) {
            $bootComplete = & $AdbPath shell getprop sys.boot_completed 2>$null
            if ($bootComplete -eq "1") {
                Write-Success "Emulator boot complete!"
                break
            }
            Start-Sleep -Seconds 2
            $bootTimer += 2
        }
        
        if ($bootTimer -ge $bootTimeout) {
            Write-ErrorMsg "Emulator boot timeout after $bootTimeout seconds"
            exit 1
        }
    }
}

# Get connected device
$env:DEVICE_UDID = Get-AndroidDevice -AdbPath $AdbPath

if (-not $env:DEVICE_UDID) {
    Write-ErrorMsg "No connected Android device found"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  1. Connect physical device with USB debugging enabled"
    Write-Host "  2. Use -EmulatorName parameter to start an emulator"
    Write-Host "  3. Start emulator manually from Android Studio"
    Write-Host ""
    Write-Host "Available emulators:" -ForegroundColor Yellow
    & $EmulatorPath -list-avds 2>$null | ForEach-Object { Write-Host "  $_" }
    exit 1
}

$env:DEVICE_NAME = "Android Device"

Write-Host ""
Write-Info "Environment Configuration:"
Write-Host "       PLATFORM_NAME: $env:PLATFORM_NAME"
Write-Host "       DEVICE_UDID: $env:DEVICE_UDID"
Write-Host "       APP_PACKAGE: $env:APP_PACKAGE"
Write-Host "       APPIUM_HOST: $env:APPIUM_HOST"
Write-Host "       APPIUM_PORT: $env:APPIUM_PORT"
Write-Host ""

# Get project directories
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$AppDir = Join-Path $ProjectRoot "app"

if (-not (Test-Path $AppDir)) {
    Write-ErrorMsg "App directory not found at $AppDir"
    exit 1
}

Set-Location $AppDir

# Handle build options
if ($Build) {
    Write-Info "Building standalone Android APK for testing in RELEASE mode..."
    Write-Host ""
    
    # Validate .env file exists
    if (-not (Test-Path ".env")) {
        Write-ErrorMsg "No .env file found"
        Write-Host "Please create a .env file in app directory with required configuration" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Info "Using .env file for standalone build..."
    
    # Check for node_modules
    if (-not (Test-Path "node_modules")) {
        Write-Info "Installing Node.js dependencies..."
        & npm ci
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "npm ci failed"
            exit 1
        }
    }
    
    # Uninstall existing app
    Write-Info "Uninstalling existing app if present..."
    & $AdbPath -s $env:DEVICE_UDID uninstall "com.softwareone.marketplaceMobile" 2>$null
    
    # Clean previous builds
    Write-Info "Cleaning previous builds..."
    if (Test-Path "android\app\build\outputs\apk") {
        Remove-Item -Path "android\app\build\outputs\apk" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Prebuild native Android project (like bash script does)
    Write-Info "Generating native Android project with Expo prebuild..."
    # Use cmd to run expo prebuild to avoid PowerShell treating warnings as errors
    $prebuildResult = cmd /c "npx expo prebuild --platform android --clean 2>&1"
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Expo prebuild failed"
        Write-Host $prebuildResult
        exit 1
    }
    Write-Success "Native Android project generated"
    
    # Build standalone APK using Gradle (Release mode - no Expo dev server)
    Write-Info "Building standalone APK in Release mode..."
    Set-Location android
    
    # Temporarily disable error action for Gradle (it outputs warnings to stderr)
    $oldErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    
    & .\gradlew.bat assembleRelease 2>&1 | ForEach-Object {
        if ($_ -match "BUILD|SUCCESS|FAILURE|ERROR") { Write-Host $_ }
    }
    $gradleExitCode = $LASTEXITCODE
    
    $ErrorActionPreference = $oldErrorAction
    
    if ($gradleExitCode -ne 0) {
        Write-ErrorMsg "Gradle build failed"
        Set-Location $AppDir
        exit 1
    }
    
    Set-Location $AppDir
    
    # Verify APK was created
    $apkPath = "android\app\build\outputs\apk\release\app-release.apk"
    if (-not (Test-Path $apkPath)) {
        Write-ErrorMsg "APK not found at $apkPath"
        Write-Host "Build may have failed. Check the output above." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Success "APK built successfully: $apkPath"
    
    # Install the APK
    Write-Info "Installing APK on device $env:DEVICE_UDID..."
    $installResult = & $AdbPath -s $env:DEVICE_UDID install -r $apkPath 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-WarningMsg "Install failed, trying with -t flag..."
        $installResult = & $AdbPath -s $env:DEVICE_UDID install -r -t $apkPath 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "APK installation failed"
            Write-Host $installResult
            exit 1
        }
    }
    
    Write-Success "APK installed successfully"
    
    # Launch the app
    Write-Info "Launching app..."
    & $AdbPath -s $env:DEVICE_UDID shell am start -n "com.softwareone.marketplaceMobile/.MainActivity"
    Start-Sleep -Seconds 2
    
    Write-Success "Android app built and deployed in Release mode"
    Write-Host ""
}

if ($SkipBuild) {
    Write-Info "Installing existing APK from last build..."
    
    # Try debug first, then release
    $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
    if (-not (Test-Path $apkPath)) {
        $apkPath = "android\app\build\outputs\apk\release\app-release.apk"
    }
    if (-not (Test-Path $apkPath)) {
        Write-ErrorMsg "No existing APK found"
        Write-Host ""
        Write-Host "Run with -Build first to create an APK:" -ForegroundColor Yellow
        Write-Host "  .\run-local-test-android.ps1 -Build -Environment dev -ClientId YOUR_ID welcome"
        exit 1
    }
    
    Write-Info "Installing: $apkPath"
    $installResult = & $AdbPath install -r $apkPath 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-WarningMsg "Install failed, trying with -t flag..."
        $installResult = & $AdbPath install -r -t $apkPath 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "APK installation failed"
            Write-Host $installResult
            exit 1
        }
    }
    
    Write-Success "APK installed successfully"
    Write-Host ""
}

# Check if Appium is running
Write-Info "Checking Appium server status..."

$appiumStartedByScript = $false

if (-not (Test-AppiumServer -Host $env:APPIUM_HOST -Port $env:APPIUM_PORT)) {
    Write-Info "Appium server not running. Starting Appium..."
    
    # Check if Appium is installed
    $appiumPath = Get-Command appium -ErrorAction SilentlyContinue
    if (-not $appiumPath) {
        Write-ErrorMsg "Appium not found in PATH"
        Write-Host ""
        Write-Host "Please install Appium:" -ForegroundColor Yellow
        Write-Host "  npm install -g appium@3.1.1"
        Write-Host "  appium driver install uiautomator2"
        exit 1
    }
    
    # Start Appium
    Start-Process -FilePath "appium" -ArgumentList "--address", $env:APPIUM_HOST, "--port", $env:APPIUM_PORT, "--log-level", "warn" -WindowStyle Minimized
    $appiumStartedByScript = $true
    
    Write-Info "Waiting for Appium to start..."
    
    if (-not (Wait-ForAppium -Host $env:APPIUM_HOST -Port $env:APPIUM_PORT -TimeoutSeconds 30)) {
        Write-ErrorMsg "Appium failed to start after 30 seconds"
        Write-Host ""
        Write-Host "Try starting Appium manually:" -ForegroundColor Yellow
        Write-Host "  appium --address 127.0.0.1 --port 4723"
        exit 1
    }
}
else {
    Write-Info "Appium server is already running"
}

Write-Success "Appium server is ready!"
Write-Host ""

# Export feature flag overrides to test environment (even without build)
# This allows tests to know which flags to check/skip
if ($FeatureFlag -and $FeatureFlag.Count -gt 0) {
    $overridesStr = ($FeatureFlag -join ",")
    $env:FEATURE_FLAG_OVERRIDES = $overridesStr
    Write-Host ""
    Write-Info "Feature flag overrides exported to tests: $overridesStr"
    Write-Host "         (These are test-only overrides; app uses original .env flag values)" -ForegroundColor Yellow
}

# Determine test arguments
if ($TestTarget -eq "all") {
    $testArgs = ""
    Write-Info "Running ALL tests"
}
elseif ($TestTarget -match "\.js$") {
    $testArgs = "--spec $TestTarget"
    Write-Info "Running spec file: $TestTarget"
}
else {
    $testArgs = "--suite $TestTarget"
    Write-Info "Running suite: $TestTarget"
}

Write-Header "Starting WebDriverIO Tests"

# Run tests
$testCommand = "npx wdio run wdio.conf.js $testArgs"
Write-Host "Executing: $testCommand" -ForegroundColor Gray
Write-Host ""

$testProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", $testCommand -NoNewWindow -PassThru -Wait
$testExitCode = $testProcess.ExitCode

Write-Host ""
Write-Host ("=" * 60)

if ($testExitCode -eq 0) {
    Write-Success "Tests completed successfully!"
}
else {
    Write-ErrorMsg "Tests failed with exit code: $testExitCode"
}

Write-Host ("=" * 60)
Write-Host ""

# Provide next steps
if ($testExitCode -eq 0) {
    Write-Host "Test results available in: app\test-results\" -ForegroundColor Gray
    Write-Host "Screenshots available in: screenshots\" -ForegroundColor Gray
}
else {
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check test-results folder for detailed logs"
    Write-Host "  2. Review screenshots for visual debugging"
    Write-Host "  3. Check Appium server logs"
    Write-Host "  4. Verify device is still connected: adb devices"
}

Write-Host ""
exit $testExitCode

#endregion
