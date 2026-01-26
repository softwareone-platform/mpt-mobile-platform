<#
.SYNOPSIS
    Setup Test Environment Script for Windows (PowerShell version)

.DESCRIPTION
    This script loads environment variables from app\.env and exports them for testing.
    Supports both Android (and future iOS) platforms.
    Can also list and start Android emulators.

.PARAMETER Platform
    Target platform: android or ios (default: android)

.PARAMETER ListEmulators
    List available Android emulators and exit.

.PARAMETER StartEmulator
    Start Android emulator by AVD name.

.EXAMPLE
    .\setup-test-env.ps1
    Setup for Android (default)

.EXAMPLE
    .\setup-test-env.ps1 -Platform android
    Setup for Android

.EXAMPLE
    .\setup-test-env.ps1 -ListEmulators
    List available Android emulators

.EXAMPLE
    .\setup-test-env.ps1 -StartEmulator "Pixel_8_API_34"
    Start specific emulator

.EXAMPLE
    .\setup-test-env.ps1 -StartEmulator "Pixel_8_API_34" -Platform android
    Start emulator and setup for Android

.NOTES
    Requires:
    - .env file in app\ directory with Auth0 configuration
    - Android SDK with ANDROID_HOME environment variable set (for Android)
#>

[CmdletBinding(DefaultParameterSetName = 'Setup')]
param(
    [Parameter(ParameterSetName = 'Setup')]
    [Parameter(ParameterSetName = 'StartEmulator')]
    [ValidateSet("android", "ios")]
    [Alias('p')]
    [string]$Platform = "android",

    [Parameter(ParameterSetName = 'ListEmulators', Mandatory = $true)]
    [Alias('l')]
    [switch]$ListEmulators,

    [Parameter(ParameterSetName = 'StartEmulator')]
    [Parameter(ParameterSetName = 'Setup')]
    [Alias('e')]
    [string]$StartEmulator,

    [Parameter(ParameterSetName = 'Setup')]
    [Parameter(ParameterSetName = 'StartEmulator')]
    [Alias('a')]
    [switch]$StartAppium,

    [Parameter(ParameterSetName = 'StopAppium', Mandatory = $true)]
    [switch]$StopAppium
)

#region Helper Functions

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Blue
    Write-Host "  $Title" -ForegroundColor Blue
    Write-Host ("=" * 60) -ForegroundColor Blue
    Write-Host ""
}

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

function Get-AndroidSdkPath {
    $sdk = $env:ANDROID_HOME
    if (-not $sdk) {
        $sdk = $env:ANDROID_SDK_ROOT
    }
    return $sdk
}

function Get-EmulatorPath {
    $sdk = Get-AndroidSdkPath
    if ($sdk) {
        $emulatorPath = Join-Path $sdk "emulator\emulator.exe"
        if (Test-Path $emulatorPath) {
            return $emulatorPath
        }
    }
    # Try PATH
    $emulator = Get-Command emulator -ErrorAction SilentlyContinue
    if ($emulator) {
        return $emulator.Source
    }
    return $null
}

function Get-AdbPath {
    $sdk = Get-AndroidSdkPath
    if ($sdk) {
        $adbPath = Join-Path $sdk "platform-tools\adb.exe"
        if (Test-Path $adbPath) {
            return $adbPath
        }
    }
    # Try PATH
    $adb = Get-Command adb -ErrorAction SilentlyContinue
    if ($adb) {
        return $adb.Source
    }
    return $null
}

function Get-AndroidDevice {
    param([string]$AdbPath)
    
    $devices = & $AdbPath devices 2>$null | 
        Select-String "device$" | 
        ForEach-Object { ($_ -split "\s+")[0] }
    
    return $devices | Select-Object -First 1
}

function Start-AppiumServer {
    Write-Info "Starting Appium server with inspector plugin..."
    
    # Check if Appium is installed
    $appium = Get-Command appium -ErrorAction SilentlyContinue
    if (-not $appium) {
        Write-ErrorMsg "Appium not found. Please install it with: npm install -g appium"
        return $false
    }
    
    $port = if ($env:APPIUM_PORT) { $env:APPIUM_PORT } else { "4723" }
    
    # Check if port is already in use
    $portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-WarningMsg "Appium may already be running on port $port"
        Write-WarningMsg "Stop it with: .\setup-test-env.ps1 -StopAppium"
        return $false
    }
    
    # Check if inspector plugin is installed
    $pluginList = & appium plugin list --installed 2>&1
    if ($pluginList -notmatch "inspector") {
        Write-WarningMsg "Inspector plugin not installed. Installing..."
        & appium plugin install inspector
    }
    
    Write-Host "  [OK] Starting Appium on port $port with inspector plugin" -ForegroundColor Green
    Write-Host "  [INFO] Inspector URL: http://localhost:$port/inspector" -ForegroundColor Cyan
    Write-Host ""
    
    # Start Appium in background (hidden window)
    $appiumProcess = Start-Process -FilePath "appium" -ArgumentList "--use-plugins=inspector", "--allow-cors", "--port", $port -PassThru -WindowStyle Hidden
    
    Start-Sleep -Seconds 2
    
    if ($appiumProcess -and -not $appiumProcess.HasExited) {
        Write-Host "  [OK] Appium server started (PID: $($appiumProcess.Id))" -ForegroundColor Green
        $env:APPIUM_PID = $appiumProcess.Id
        return $true
    } else {
        Write-ErrorMsg "Appium failed to start"
        return $false
    }
}

function Stop-AppiumServer {
    Write-Info "Stopping Appium server..."
    
    $killedCount = 0
    $port = if ($env:APPIUM_PORT) { $env:APPIUM_PORT } else { "4723" }
    
    # Kill processes on Appium port
    $portProcesses = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $portProcesses) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            $killedCount++
        } catch {}
    }
    
    # Kill any Appium node processes
    $appiumProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -match "appium" -or $_.Path -match "appium" }
    
    foreach ($proc in $appiumProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            $killedCount++
        } catch {}
    }
    
    # Also try killing by name pattern
    Get-Process | Where-Object { $_.ProcessName -match "appium" } | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            $killedCount++
        } catch {}
    }
    
    # Clear the exported PID
    $env:APPIUM_PID = $null
    
    if ($killedCount -gt 0) {
        Write-Host "  [OK] Stopped Appium processes" -ForegroundColor Green
    } else {
        Write-Host "  [OK] No Appium processes were running" -ForegroundColor Green
    }
    
    # Verify port is free
    Start-Sleep -Seconds 1
    $portStillInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($portStillInUse) {
        Write-WarningMsg "Port $port may still be in use"
    } else {
        Write-Host "  [OK] Port $port is now free" -ForegroundColor Green
    }
}

function Write-ConfigItem {
    param(
        [string]$Label,
        [string]$Value,
        [switch]$Truncate
    )
    
    if ($Value) {
        $displayValue = if ($Truncate -and $Value.Length -gt 20) { 
            "$($Value.Substring(0, 20))..." 
        } else { 
            $Value 
        }
        Write-Host "  [OK] ${Label}: $displayValue" -ForegroundColor Green
    }
}

#endregion

#region Main Script

Write-Header "Test Environment Setup (Windows)"

# Handle -StopAppium option
if ($StopAppium) {
    Stop-AppiumServer
    exit 0
}

# Handle -ListEmulators option
if ($ListEmulators) {
    Write-Host ""
    Write-Host "[Android Emulators]" -ForegroundColor Yellow
    
    $emulatorPath = Get-EmulatorPath
    if ($emulatorPath) {
        Write-Host ""
        $avdList = & $emulatorPath -list-avds 2>$null
        if ($avdList) {
            $avdList | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }
        } else {
            Write-Host "  No Android emulators found. Create one in Android Studio." -ForegroundColor Yellow
        }
    } else {
        Write-ErrorMsg "Android emulator command not found"
        Write-Host "  Tip: Set ANDROID_HOME or add emulator to PATH" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "[iOS Simulators]" -ForegroundColor Yellow
    Write-Host "  iOS simulators are not available on Windows." -ForegroundColor Gray
    Write-Host "  Use macOS for iOS development and testing." -ForegroundColor Gray
    Write-Host ""
    exit 0
}

# Handle -StartEmulator option
if ($StartEmulator) {
    Write-Info "Starting Android Emulator: $StartEmulator"
    Write-Host ""
    
    $emulatorPath = Get-EmulatorPath
    if (-not $emulatorPath) {
        Write-ErrorMsg "Android emulator not found"
        Write-Host "  Tip: Set ANDROID_HOME or add emulator to PATH" -ForegroundColor Yellow
        exit 1
    }
    
    # Check if emulator exists in the list
    $avdList = & $emulatorPath -list-avds 2>$null
    if ($avdList -notcontains $StartEmulator) {
        Write-ErrorMsg "Emulator '$StartEmulator' not found"
        Write-Host ""
        Write-Host "Available emulators:" -ForegroundColor Yellow
        $avdList | ForEach-Object { Write-Host "  $_" }
        exit 1
    }
    
    Write-Host "  [OK] Found emulator: $StartEmulator" -ForegroundColor Green
    
    # Check if an emulator is already running
    $adbPath = Get-AdbPath
    if ($adbPath) {
        $existingDevice = Get-AndroidDevice -AdbPath $adbPath
        if ($existingDevice -and $existingDevice -match "emulator") {
            Write-Host "  [OK] An Android emulator is already running: $existingDevice" -ForegroundColor Green
            $env:DEVICE_UDID = $existingDevice
        } else {
            Write-Info "Starting emulator (this may take a moment)..."
            
            # Start emulator in background
            Start-Process -FilePath $emulatorPath -ArgumentList "-avd", $StartEmulator, "-no-snapshot-load", "-no-boot-anim" -WindowStyle Normal
            
            Write-Info "Waiting for emulator to boot..."
            
            $timeout = 120
            $timer = 0
            
            while ($timer -lt $timeout) {
                # Check if emulator device appears
                $device = Get-AndroidDevice -AdbPath $adbPath
                if ($device -and $device -match "emulator") {
                    # Check if boot completed
                    $bootComplete = & $adbPath -s $device shell getprop sys.boot_completed 2>$null
                    $bootComplete = $bootComplete -replace '\s',''
                    
                    if ($bootComplete -eq "1") {
                        Write-Host "  [OK] Emulator booted successfully: $device" -ForegroundColor Green
                        $env:DEVICE_UDID = $device
                        break
                    }
                }
                
                Start-Sleep -Seconds 2
                $timer += 2
                
                if ($timer % 10 -eq 0) {
                    Write-Info "Still waiting... ($timer seconds)"
                }
            }
            
            if ($timer -ge $timeout) {
                # One final check
                $device = Get-AndroidDevice -AdbPath $adbPath
                if ($device) {
                    Write-Host "  [OK] Emulator running: $device" -ForegroundColor Green
                    $env:DEVICE_UDID = $device
                } else {
                    Write-WarningMsg "Emulator may still be starting..."
                }
            }
        }
    }
    
    $env:DEVICE_NAME = $StartEmulator
    Write-Host ""
}

# Get project root
$ProjectRoot = Get-Location
$EnvFile = Join-Path $ProjectRoot "app\.env"

# Check if .env file exists
if (-not (Test-Path $EnvFile)) {
    Write-ErrorMsg ".env file not found at $EnvFile"
    Write-Host ""
    Write-Host "Please create a .env file in the app directory with the following variables:" -ForegroundColor Yellow
    Write-Host "(See app\.env.example for a template)"
    Write-Host ""
    Write-Host "# Auth0 Configuration (Test Environment)" -ForegroundColor Gray
    Write-Host "AUTH0_DOMAIN=your-domain.auth0.com"
    Write-Host "AUTH0_CLIENT_ID=your_client_id"
    Write-Host "AUTH0_AUDIENCE=your_audience"
    Write-Host "AUTH0_SCOPE=openid profile email offline_access"
    Write-Host "AUTH0_API_URL=your_api_url"
    Write-Host "AUTH0_OTP_DIGITS=6"
    Write-Host "AUTH0_SCHEME=com.softwareone.marketplaceMobile"
    Write-Host ""
    Write-Host "# Tests (Airtable Configuration for OTP testing)" -ForegroundColor Gray
    Write-Host "AIRTABLE_EMAIL=your_test_email@example.com"
    Write-Host "AIRTABLE_API_TOKEN=your_token"
    Write-Host "AIRTABLE_BASE_ID=your_base_id"
    Write-Host "AIRTABLE_TABLE_NAME=your_table"
    Write-Host "AIRTABLE_FROM_EMAIL=your_from_email@example.com"
    Write-Host ""
    exit 1
}

Write-Info "Loading environment variables from .env file..."
Write-Host ""

# Load and export variables from .env
$envContent = Get-Content $EnvFile
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
        Write-Host "  [OK] Exported: $key" -ForegroundColor Green
    }
}

Write-Host ""
Write-Info "Setting up platform-specific configuration..."
Write-Host ""

# Platform-specific configuration
$Platform = $Platform.ToLower()

if ($Platform -eq "android") {
    # Android configuration
    $env:PLATFORM_NAME = "Android"
    $env:AUTOMATION_NAME = "UiAutomator2"
    $env:APP_PACKAGE = "com.softwareone.marketplaceMobile"
    $env:APP_ACTIVITY = ".MainActivity"
    
    Write-ConfigItem -Label "Platform" -Value "Android"
    Write-ConfigItem -Label "Automation" -Value "UiAutomator2"
    Write-ConfigItem -Label "Package" -Value $env:APP_PACKAGE
    Write-ConfigItem -Label "Activity" -Value $env:APP_ACTIVITY
    
    # Try to detect connected Android devices
    $AndroidSdk = $env:ANDROID_HOME
    if (-not $AndroidSdk) {
        $AndroidSdk = $env:ANDROID_SDK_ROOT
    }
    
    if ($AndroidSdk) {
        $AdbPath = Join-Path $AndroidSdk "platform-tools\adb.exe"
        
        if (Test-Path $AdbPath) {
            $devices = & $AdbPath devices 2>$null | 
                Select-String "device$" | 
                ForEach-Object { ($_ -split "\s+")[0] }
            
            $deviceUdid = $devices | Select-Object -First 1
            
            if ($deviceUdid) {
                $env:DEVICE_UDID = $deviceUdid
                Write-ConfigItem -Label "Device detected" -Value $deviceUdid
            } else {
                Write-WarningMsg "No Android devices detected"
            }
        }
    }
    
    if (-not $env:DEVICE_NAME) { $env:DEVICE_NAME = "Pixel 8" }
    if (-not $env:PLATFORM_VERSION) { $env:PLATFORM_VERSION = "14" }
} else {
    # iOS configuration (for future use)
    $env:PLATFORM_NAME = "iOS"
    $env:AUTOMATION_NAME = "XCUITest"
    $env:APP_BUNDLE_ID = "com.softwareone.marketplaceMobile"
    
    Write-ConfigItem -Label "Platform" -Value "iOS"
    Write-ConfigItem -Label "Automation" -Value "XCUITest"
    Write-ConfigItem -Label "Bundle ID" -Value $env:APP_BUNDLE_ID
    
    if (-not $env:DEVICE_UDID) { $env:DEVICE_UDID = "963A992A-A208-4EF4-B7F9-7B2A569EC133" }
    if (-not $env:DEVICE_NAME) { $env:DEVICE_NAME = "iPhone 16" }
    if (-not $env:PLATFORM_VERSION) { $env:PLATFORM_VERSION = "26.0" }
}

Write-ConfigItem -Label "Device" -Value $env:DEVICE_NAME
Write-ConfigItem -Label "Platform Version" -Value $env:PLATFORM_VERSION

# Set common Appium configuration
if (-not $env:APPIUM_HOST) { $env:APPIUM_HOST = "127.0.0.1" }
if (-not $env:APPIUM_PORT) { $env:APPIUM_PORT = "4723" }

# Start Appium server if requested
if ($StartAppium) {
    Write-Host ""
    Start-AppiumServer
}

Write-Host ""
Write-Success "Environment setup complete!"

Write-Header "Configuration Summary"

Write-Host "Auth0 Configuration:" -ForegroundColor Yellow
Write-Host "  Domain:    $env:AUTH0_DOMAIN"
if ($env:AUTH0_CLIENT_ID) {
    $truncatedClientId = if ($env:AUTH0_CLIENT_ID.Length -gt 20) { "$($env:AUTH0_CLIENT_ID.Substring(0, 20))..." } else { $env:AUTH0_CLIENT_ID }
    Write-Host "  Client ID: $truncatedClientId"
}
Write-Host "  Audience:  $env:AUTH0_AUDIENCE"

if ($env:AIRTABLE_API_TOKEN) {
    Write-Host ""
    Write-Host "Airtable Configuration:" -ForegroundColor Yellow
    if ($env:AIRTABLE_BASE_ID) {
        $truncatedBaseId = if ($env:AIRTABLE_BASE_ID.Length -gt 20) { "$($env:AIRTABLE_BASE_ID.Substring(0, 20))..." } else { $env:AIRTABLE_BASE_ID }
        Write-Host "  Base ID:   $truncatedBaseId"
    }
    Write-Host "  Table:     $env:AIRTABLE_TABLE_NAME"
    Write-Host "  Email:     $env:AIRTABLE_FROM_EMAIL"
}

Write-Host ""
Write-Host "Test Platform:" -ForegroundColor Yellow
Write-Host "  Platform:  $env:PLATFORM_NAME"
Write-Host "  Device:    $env:DEVICE_NAME"
Write-Host "  Version:   $env:PLATFORM_VERSION"

Write-Host ""
Write-Host "Appium Configuration:" -ForegroundColor Yellow
Write-Host "  Host:      $env:APPIUM_HOST"
Write-Host "  Port:      $env:APPIUM_PORT"

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Blue
Write-Host ""
Write-Host "Usage:" -ForegroundColor Yellow
Write-Host "  .\setup-test-env.ps1                              # Setup for Android (default)" -ForegroundColor Green
Write-Host "  .\setup-test-env.ps1 -Platform android            # Setup for Android" -ForegroundColor Green
Write-Host "  .\setup-test-env.ps1 -ListEmulators               # List available emulators" -ForegroundColor Green
Write-Host "  .\setup-test-env.ps1 -StartEmulator Pixel_8_API_34 # Start specific emulator" -ForegroundColor Green
Write-Host "  .\setup-test-env.ps1 -StartAppium                  # Start Appium with inspector" -ForegroundColor Green
Write-Host "  .\setup-test-env.ps1 -StopAppium                   # Stop Appium server" -ForegroundColor Green
Write-Host ""
Write-Host "Run Tests:" -ForegroundColor Yellow
Write-Host "  .\run-local-test-android.ps1 welcome" -ForegroundColor Green
Write-Host "  .\run-local-test-android.ps1 -Build welcome" -ForegroundColor Green
Write-Host ""

#endregion
