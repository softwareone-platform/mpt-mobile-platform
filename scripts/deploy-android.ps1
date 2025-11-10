# SoftwareONE Marketplace Platform Mobile - Android Deploy Script (PowerShell)
# This script performs a complete cycle: uninstall -> clean -> build -> deploy -> launch

param(
    [string]$ClientId = "",
    [switch]$Release = $false,
    [string]$Device = "emulator",
    [switch]$ForceDevice = $false,
    [switch]$Logs = $false,
    [switch]$Verbose = $false,
    [switch]$Help = $false
)

# Configuration
$AppName = "SoftwareOne"
$PackageName = "com.softwareone.marketplaceMobile"
$BuildMode = if ($Release) { "release" } else { "debug" }

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    White = "White"
}

function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

function Write-Log {
    param([string]$Message, [string]$Color = "White", [switch]$VerboseOnly = $false)
    if (-not $VerboseOnly -or $Verbose) {
        Write-ColorText $Message $Color
    }
}

# Show help
if ($Help) {
    Write-Host @"
Usage: .\deploy-android.ps1 [options]

This script performs a complete React Native app deployment cycle:
1. Configures Auth0 test environment (if client-id provided)
2. Uninstalls existing app from Android device/emulator
3. Cleans React Native build cache
4. Builds fresh React Native app with Expo
5. Deploys to Android device/emulator
6. Launches the app

Options:
  -ClientId <ID>        Auth0 client ID (required if .env not configured)
  -Release              Build in release mode (default: debug)
  -Device <NAME>        Specify device name or use 'emulator' (default: emulator)
  -ForceDevice          Force restart device/emulator
  -Logs                 Show app logs after launch
  -Verbose              Show verbose output
  -Help                 Show this help message

Examples:
  .\deploy-android.ps1 -ClientId "YOUR_CLIENT_ID"
  .\deploy-android.ps1 -ClientId "YOUR_CLIENT_ID" -Release -Logs
  .\deploy-android.ps1 -Device "emulator" -Verbose
"@
    exit 0
}

# Main deployment pipeline
try {
    Write-Log "" "Blue"
    Write-Log "==========================================" "Blue"
    Write-Log " $AppName - Complete Deployment Pipeline " "Blue"
    Write-Log "==========================================" "Blue"
    Write-Log "Build Mode: $BuildMode" "Yellow"
    Write-Log "Target Device: $Device" "Yellow"
    Write-Log "Package Name: $PackageName" "Yellow"
    Write-Log "==========================================" "Blue"
    Write-Log "" "Blue"

    # Get project paths
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $ProjectRoot = Split-Path -Parent $ScriptDir
    $AppDir = Join-Path $ProjectRoot "app"

    # Step 1: Validate environment
    Write-Log "Step 1: Validating environment..." "Yellow"

    # Check Node.js
    if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
        throw "Node.js is not installed or not in PATH. Please install Node.js from https://nodejs.org"
    }
    $NodeVersion = node --version
    Write-Log "Found Node.js $NodeVersion" "Green" -VerboseOnly

    # Check npm
    if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
        throw "npm is not installed"
    }
    $NpmVersion = npm --version
    Write-Log "Found npm $NpmVersion" "Green" -VerboseOnly

    # Check Android SDK
    if (-not (Get-Command "adb" -ErrorAction SilentlyContinue)) {
        # Try to find Android SDK in common locations
        $CommonAndroidPaths = @(
            "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools",
            "$env:LOCALAPPDATA\Android\Sdk\platform-tools",
            "C:\Android\Sdk\platform-tools",
            "${env:ProgramFiles(x86)}\Android\android-sdk\platform-tools"
        )
        
        $AdbPath = $null
        foreach ($Path in $CommonAndroidPaths) {
            $AdbExe = Join-Path $Path "adb.exe"
            if (Test-Path $AdbExe) {
                $AdbPath = $Path
                break
            }
        }
        
        if ($AdbPath) {
            Write-Log "Found Android SDK at: $AdbPath" "Yellow" -VerboseOnly
            Write-Log "Adding to PATH for this session..." "Yellow" -VerboseOnly
            $env:PATH = "$AdbPath;$env:PATH"
        } else {
            throw "Android SDK (adb) not found in PATH or common locations. Please install Android Studio and add platform-tools to PATH"
        }
    }
    Write-Log "Android SDK tools available" "Green" -VerboseOnly

    # Check project structure
    if (-not (Test-Path $AppDir)) {
        throw "Not in the correct project directory. Please run this script from the project root (where app folder is)"
    }

    Set-Location $AppDir

    if (-not (Test-Path "package.json")) {
        throw "package.json not found in app directory"
    }

    Write-Log "Environment validated" "Green"

    # Step 1.5: Configure Auth0 environment
    Write-Log ""
    Write-Log "Step 1.5: Configuring Auth0 environment..." "Yellow"

    if ($ClientId) {
        Write-Log "Creating .env file with test environment configuration..." "White" -VerboseOnly
        $EnvContent = @"
# Auth0 Configuration (Test Environment)
AUTH0_DOMAIN=login-test.pyracloud.com
AUTH0_CLIENT_ID=$ClientId
AUTH0_AUDIENCE=https://api-test.pyracloud.com/
AUTH0_SCOPE=openid profile email offline_access
AUTH0_API_URL=https://api.s1.show/public/
AUTH0_OTP_DIGITS=6
AUTH0_SCHEME=com.softwareone.marketplaceMobile
TEMPORARY_AUTH0_TOKEN=
"@
        $EnvContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Log ".env file configured with test environment" "Green"
    } else {
        if (-not (Test-Path ".env")) {
            throw @"
No .env file found and no -ClientId provided
Please either:
  1. Provide -ClientId: .\deploy-android.ps1 -ClientId YOUR_CLIENT_ID
  2. Or create a .env file manually in app directory
"@
        }

        $EnvContent = Get-Content ".env" -Raw
        if (-not ($EnvContent -match "AUTH0_CLIENT_ID=.+")) {
            throw @"
AUTH0_CLIENT_ID not configured in .env file
Please either:
  1. Provide -ClientId: .\deploy-android.ps1 -ClientId YOUR_CLIENT_ID
  2. Or set AUTH0_CLIENT_ID in your .env file
"@
        }

        Write-Log "Using existing .env configuration" "Green"
    }

    # Step 2: Prepare Android device/emulator
    Write-Log ""
    Write-Log "Step 2: Preparing Android device/emulator..." "Yellow"

    $AdbDevicesOutput = adb devices | Where-Object { $_ -match "^\w+\s+device$" }
    $DeviceId = $null

    if ($AdbDevicesOutput.Count -gt 0) {
        # Extract device ID from the first line (format: "DEVICEID    device")
        if ($AdbDevicesOutput[0] -match "^(\S+)\s+device$") {
            $DeviceId = $matches[1]
        }
        Write-Log "Found device: $DeviceId" "Green"
    } elseif ($Device -eq "emulator") {
        Write-Log "No devices found, checking for available AVDs..." "White"
        
        # Ensure emulator command is available
        if (-not (Get-Command "emulator" -ErrorAction SilentlyContinue)) {
            # Try to find emulator in Android SDK
            $CommonEmulatorPaths = @(
                "$env:USERPROFILE\AppData\Local\Android\Sdk\emulator",
                "$env:LOCALAPPDATA\Android\Sdk\emulator",
                "C:\Android\Sdk\emulator",
                "${env:ProgramFiles(x86)}\Android\android-sdk\emulator"
            )
            
            $EmulatorPath = $null
            foreach ($Path in $CommonEmulatorPaths) {
                $EmulatorExe = Join-Path $Path "emulator.exe"
                if (Test-Path $EmulatorExe) {
                    $EmulatorPath = $Path
                    break
                }
            }
            
            if ($EmulatorPath) {
                Write-Log "Found Android Emulator at: $EmulatorPath" "Yellow" -VerboseOnly
                $env:PATH = "$EmulatorPath;$env:PATH"
            } else {
                throw "Android Emulator not found. Please install Android Studio with emulator support"
            }
        }
        
        $AvdList = emulator -list-avds | Where-Object { $_.Trim() -ne "" }
        if ($AvdList.Count -eq 0) {
            throw "No Android Virtual Devices found. Please create an AVD using Android Studio or connect a physical device"
        }

        $AvdName = $AvdList[0]
        Write-Log "Starting emulator: $AvdName" "White"
        Start-Process "emulator" -ArgumentList "-avd", $AvdName -WindowStyle Hidden

        Write-Log "Waiting for emulator to boot..." "White"
        do {
            Start-Sleep 5
            $BootComplete = adb shell getprop sys.boot_completed 2>$null
        } while ($BootComplete -ne "1")
        
        Write-Log "Emulator booted successfully" "Green"
        
        $AdbDevicesOutput = adb devices | Where-Object { $_ -match "^\w+\s+device$" }
        if ($AdbDevicesOutput.Count -gt 0) {
            if ($AdbDevicesOutput[0] -match "^(\S+)\s+device$") {
                $DeviceId = $matches[1]
            }
        }
    } else {
        throw "No Android devices connected. Please connect a device or use -Device emulator"
    }

    Write-Log "Target device: $DeviceId" "Green"

    # Step 3: Uninstall existing app
    Write-Log ""
    Write-Log "Step 3: Uninstalling existing app..." "Yellow"

    $InstalledPackages = adb shell pm list packages | Select-String $PackageName
    if ($InstalledPackages) {
        Write-Log "Found existing app, uninstalling..." "White" -VerboseOnly
        adb uninstall $PackageName | Out-Null
        Write-Log "Previous version removed" "Green"
    } else {
        Write-Log "No previous version found" "Green"
    }

    # Step 4: Clean and prepare build
    Write-Log ""
    Write-Log "Step 4: Cleaning build cache..." "Yellow"

    Write-Log "Cleaning Android build cache..." "White" -VerboseOnly
    if (Test-Path "android\app\build") { Remove-Item "android\app\build" -Recurse -Force }
    if (Test-Path "android\build") { Remove-Item "android\build" -Recurse -Force }

    Write-Log "Cleaning Expo cache..." "White" -VerboseOnly
    $ExpoProcess = Start-Process "npx" -ArgumentList "expo", "start", "--clear" -WindowStyle Hidden -PassThru
    Start-Sleep 2
    Stop-Process -Id $ExpoProcess.Id -Force -ErrorAction SilentlyContinue

    Write-Log "Build cache cleaned" "Green"

    # Step 5: Install dependencies
    Write-Log ""
    Write-Log "Step 5: Installing dependencies..." "Yellow"

    Write-Log "Installing npm dependencies..." "White" -VerboseOnly
    if ($Verbose) {
        npm install
    } else {
        npm install 2>&1 | Out-Null
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install npm dependencies"
    }

    Write-Log "npm dependencies installed" "Green"

    # Step 5.5: Prebuild native Android project
    Write-Log ""
    Write-Log "Step 5.5: Rebuilding native Android project with Expo..." "Yellow"

    Write-Log "Running expo prebuild for Android..." "White" -VerboseOnly
    if ($Verbose) {
        npx expo prebuild --platform android --clean
    } else {
        npx expo prebuild --platform android --clean 2>&1 | Out-Null
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to prebuild Android project"
    }

    Write-Log "Native Android project rebuilt" "Green"

    # Step 6: Build and run with Expo
    Write-Log ""
    Write-Log "Step 6: Building and deploying React Native app..." "Yellow"

    Write-Log "Building for Android in $BuildMode mode..." "White" -VerboseOnly

    $BuildArgs = @("expo", "run:android", "--device", $DeviceId)
    if ($Release) {
        $BuildArgs += "--variant", "release"
    }

    Write-Log "Running: npx $($BuildArgs -join ' ')" "White" -VerboseOnly

    if ($Verbose) {
        & npx @BuildArgs
    } else {
        & npx @BuildArgs 2>&1 | Select-String -Pattern "(Building|Installing|Opening|Success|Error|Failed|Warning)"
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Build and deployment failed. Run with -Verbose flag to see detailed output"
    }

    Write-Log "App deployed successfully" "Green"

    # Step 7: Launch the app
    Write-Log ""
    Write-Log "Step 7: Launching application..." "Yellow"

    adb shell monkey -p $PackageName -c android.intent.category.LAUNCHER 1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Log "App launched successfully" "Green"
    } else {
        Write-Log "Could not launch app automatically" "Yellow"
    }

    # Final success message
    Write-Log ""
    Write-Log "==========================================" "Green"
    Write-Log " Deployment Pipeline Complete! " "Green"
    Write-Log "==========================================" "Green"
    Write-Log "App Name: $AppName" "Green"
    Write-Log "Device: $DeviceId" "Green"
    Write-Log "Package: $PackageName" "Green"
    Write-Log "Build Mode: $BuildMode" "Green"
    Write-Log "==========================================" "Green"

    # Step 8: Show logs if requested
    if ($Logs) {
        Write-Log ""
        Write-Log "App Console Logs (Press Ctrl+C to exit):" "Yellow"
        Write-Log "==========================================" "Blue"
        Start-Sleep 2
        try {
            adb logcat -s $AppName
        } catch {
            Write-Log "Log streaming not available or app not found in logs" "Yellow"
            Write-Log "Try: adb logcat | findstr `"$PackageName`"" "White"
        }
    } else {
        Write-Log ""
        Write-Log "Tips:" "Blue"
        Write-Log "- To view console logs: .\deploy-android.ps1 -Logs" "White"
        Write-Log "- To rebuild in release mode: .\deploy-android.ps1 -Release" "White"
        Write-Log "- To use different device: .\deploy-android.ps1 -Device DEVICE_NAME" "White"
        Write-Log "- For verbose output: .\deploy-android.ps1 -Verbose" "White"
        Write-Log "- For faster iterations: .\scripts\hot-reload.sh (with hot reload)" "White"
    }

    Set-Location $ProjectRoot
    Write-Log ""
    Write-Log "$AppName is now running on $DeviceId!" "Green"

} catch {
    Write-Log ""
    Write-Log "Error: $($_.Exception.Message)" "Red"
    Set-Location $ProjectRoot -ErrorAction SilentlyContinue
    exit 1
}