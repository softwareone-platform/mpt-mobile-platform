<#
.SYNOPSIS
    Local testing script for Appium Android tests on Windows (PowerShell version)

.DESCRIPTION
    This script provides a PowerShell alternative for running Appium tests on Android.
    It handles building, deploying, and testing Android applications with better
    error handling and modern scripting features compared to batch files.

.PARAMETER Build
    Build the app before testing. Requires -Environment and -ClientId.

.PARAMETER SkipBuild
    Skip build and install existing app from last build.

.PARAMETER Environment
    Set environment preset: dev, test, or qa. Required when using -Build.

.PARAMETER ClientId
    Set Auth0 client ID. Required when using -Build.

.PARAMETER EmulatorName
    Specify Android emulator AVD name to start.

.PARAMETER TestTarget
    Suite name, spec file path, or 'all' to run all tests.

.EXAMPLE
    .\run-local-test-android.ps1 welcome
    Run the welcome test suite with currently installed app.

.EXAMPLE
    .\run-local-test-android.ps1 -Build -Environment dev -ClientId abc123 welcome
    Build for dev environment and run welcome suite.

.EXAMPLE
    .\run-local-test-android.ps1 -SkipBuild all
    Install last built APK and run all tests.

.EXAMPLE
    .\run-local-test-android.ps1 -EmulatorName "Pixel_8_API_34" welcome
    Start specific emulator and run welcome suite.

.EXAMPLE
    .\run-local-test-android.ps1 .\test\specs\welcome.e2e.js
    Run a specific spec file.

.NOTES
    Requires:
    - Android SDK with ANDROID_HOME environment variable set
    - Java 17 (JAVA_HOME set)
    - Node.js 20+
    - Appium with UiAutomator2 driver installed globally
#>

[CmdletBinding()]
param(
    [switch]$Build,
    [switch]$SkipBuild,
    
    [ValidateSet("dev", "test", "qa")]
    [string]$Environment,
    
    [string]$ClientId,
    [string]$EmulatorName,
    
    [Parameter(Position = 0, Mandatory = $true)]
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
        [string]$Host = "127.0.0.1",
        [int]$Port = 4723
    )
    
    try {
        $response = Invoke-WebRequest -Uri "http://${Host}:${Port}/status" -TimeoutSec 2 -ErrorAction SilentlyContinue
        return $true
    }
    catch {
        return $false
    }
}

function Wait-ForAppium {
    param(
        [string]$Host = "127.0.0.1",
        [int]$Port = 4723,
        [int]$TimeoutSeconds = 30
    )
    
    for ($i = 1; $i -le $TimeoutSeconds; $i++) {
        if (Test-AppiumServer -Host $Host -Port $Port) {
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

#endregion

#region Main Script

Write-Header "Android Local Test Runner (PowerShell)"

# Validate parameters
if ($Build -and $SkipBuild) {
    Write-ErrorMsg "-Build and -SkipBuild cannot be used together"
    exit 1
}

if ($Build) {
    if (-not $Environment) {
        Write-ErrorMsg "-Environment is required when using -Build"
        Write-Host "Available environments: dev, test, qa" -ForegroundColor Yellow
        exit 1
    }
    if (-not $ClientId) {
        Write-ErrorMsg "-ClientId is required when using -Build"
        exit 1
    }
}

# Check for Android SDK
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

Write-Info "Using Android SDK: $AndroidSdk"

# Set up paths
$AdbPath = Join-Path $AndroidSdk "platform-tools\adb.exe"
$EmulatorPath = Join-Path $AndroidSdk "emulator\emulator.exe"

if (-not (Test-Path $AdbPath)) {
    Write-ErrorMsg "ADB not found at: $AdbPath"
    exit 1
}

# Set environment variables
$env:PLATFORM_NAME = "Android"
$env:AUTOMATION_NAME = "UiAutomator2"
$env:APP_PACKAGE = "com.softwareone.marketplaceMobile"
$env:APP_ACTIVITY = ".MainActivity"
$env:APPIUM_HOST = "127.0.0.1"
$env:APPIUM_PORT = "4723"

# Configure Auth0 based on environment
if ($Environment) {
    $envConfig = @{
        "dev" = @{
            Domain = "login-dev.pyracloud.com"
            Audience = "https://api-dev.pyracloud.com/"
            ApiUrl = "https://api.s1.today/public/"
        }
        "test" = @{
            Domain = "login-test.pyracloud.com"
            Audience = "https://api-test.pyracloud.com/"
            ApiUrl = "https://api.s1.show/public/"
        }
        "qa" = @{
            Domain = "login-qa.pyracloud.com"
            Audience = "https://api-qa.pyracloud.com/"
            ApiUrl = "https://api.s1.live/public/"
        }
    }
    
    $config = $envConfig[$Environment]
    $env:AUTH0_DOMAIN = $config.Domain
    $env:AUTH0_AUDIENCE = $config.Audience
    $env:AUTH0_API_URL = $config.ApiUrl
    $env:AUTH0_SCOPE = "openid profile email offline_access"
    $env:AUTH0_OTP_DIGITS = "6"
    $env:AUTH0_SCHEME = "com.softwareone.marketplaceMobile"
    
    if ($ClientId) {
        $env:AUTH0_CLIENT_ID = $ClientId
    }
}

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
        
        # Start emulator
        Start-Process -FilePath $EmulatorPath -ArgumentList "-avd", $EmulatorName, "-no-snapshot", "-no-audio" -WindowStyle Minimized
        
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
$ProjectRoot = Split-Path -Parent $ScriptDir
$AppDir = Join-Path $ProjectRoot "app"

if (-not (Test-Path $AppDir)) {
    Write-ErrorMsg "App directory not found at $AppDir"
    exit 1
}

Set-Location $AppDir

# Handle build options
if ($Build) {
    Write-Info "Building Android app..."
    Write-Host ""
    
    $deployScript = Join-Path $ScriptDir "deploy-android.bat"
    $deployResult = & cmd /c "$deployScript --env $Environment --client-id $ClientId" 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Build failed"
        Write-Host $deployResult
        exit 1
    }
    
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
    Write-Host "Screenshots available in: app\screenshots\" -ForegroundColor Gray
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
