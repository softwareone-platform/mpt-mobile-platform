<#
.SYNOPSIS
    Setup Test Environment Script for Windows (PowerShell version)

.DESCRIPTION
    This script loads environment variables from app\.env and exports them for testing.
    Supports both Android (and future iOS) platforms.

.PARAMETER Platform
    Target platform: android or ios (default: android)

.EXAMPLE
    .\setup-test-env.ps1
    Setup for Android (default)

.EXAMPLE
    .\setup-test-env.ps1 -Platform android
    Setup for Android

.EXAMPLE
    .\setup-test-env.ps1 -Platform ios
    Setup for iOS (future)

.NOTES
    Requires:
    - .env file in app\ directory with Auth0 configuration
    - Android SDK with ANDROID_HOME environment variable set (for Android)
#>

[CmdletBinding()]
param(
    [ValidateSet("android", "ios")]
    [string]$Platform = "android"
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
Write-Host "  .\setup-test-env.ps1                  # Setup for Android (default)" -ForegroundColor Green
Write-Host "  .\setup-test-env.ps1 -Platform android # Setup for Android" -ForegroundColor Green
Write-Host ""
Write-Host "Run Tests:" -ForegroundColor Yellow
Write-Host "  .\run-local-test-android.ps1 welcome" -ForegroundColor Green
Write-Host "  .\run-local-test-android.ps1 -Build -Environment dev -ClientId YOUR_ID welcome" -ForegroundColor Green
Write-Host ""

#endregion
