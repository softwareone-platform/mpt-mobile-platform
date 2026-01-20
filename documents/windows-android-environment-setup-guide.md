# Windows Android Development Environment Setup Guide

> **🤖 AI EXECUTION GUIDE**: This document is designed for AI assistants to read and execute. Each step includes explicit commands, expected outputs, verification steps, and decision logic. Execute steps sequentially unless instructed otherwise.

A step-by-step guide to set up Android development and Appium E2E testing on Windows.

---

## AI Execution Instructions

### How to Use This Guide

1. **Execute commands** using `run_in_terminal` with `isBackground: false` unless marked as background
2. **Verify each step** before proceeding - check the "Expected Output" and "Verification" sections
3. **Handle failures** using the "If Failed" section for each step
4. **Skip steps** if verification shows the component is already installed
5. **Report status** after completing each major section

### Decision Points

Throughout this guide, you'll encounter decision points marked with:
- ✅ **SKIP IF**: Conditions when to skip this step
- ❌ **STOP IF**: Conditions that require user intervention
- 🔄 **RETRY IF**: Conditions that warrant retrying with alternative approach

---

## Prerequisites Overview

| Component | Version | Purpose | Verification Command |
|-----------|---------|---------|---------------------|
| Java JDK | **17** (not 24+) | Android build toolchain | `java -version` |
| Node.js | 20.x LTS or later | React Native & Appium | `node --version` |
| Android SDK | API 34+ | Build & run Android apps | `adb --version` |
| Appium | 3.1.1 | E2E test automation | `appium --version` |
| UiAutomator2 | Latest | Android test driver | `appium driver list --installed` |

---

## Pre-Flight Check

> **🤖 AI**: Run this first to determine which steps can be skipped.

```powershell
# Run all checks and capture results
Write-Host "=== PRE-FLIGHT ENVIRONMENT CHECK ===" -ForegroundColor Cyan

# Check 1: Java
Write-Host "`n[1/5] Java:" -ForegroundColor Yellow
$javaInstalled = $false
try {
    $javaVer = java -version 2>&1 | Select-String "version"
    if ($javaVer -match "17\.") {
        Write-Host "  ✅ Java 17 installed: $javaVer" -ForegroundColor Green
        $javaInstalled = $true
    } elseif ($javaVer -match "24\.|25\.") {
        Write-Host "  ❌ Java $javaVer installed - INCOMPATIBLE (need Java 17)" -ForegroundColor Red
    } else {
        Write-Host "  ⚠️ Java installed but not version 17: $javaVer" -ForegroundColor Yellow
    }
} catch { Write-Host "  ❌ Java not found" -ForegroundColor Red }

# Check 2: JAVA_HOME
Write-Host "`n[2/5] JAVA_HOME:" -ForegroundColor Yellow
if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Write-Host "  ✅ JAVA_HOME set: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "  ❌ JAVA_HOME not set or invalid" -ForegroundColor Red
}

# Check 3: Node.js
Write-Host "`n[3/5] Node.js:" -ForegroundColor Yellow
try {
    $nodeVer = node --version 2>&1
    if ($nodeVer -match "v2[04-9]\.") {
        Write-Host "  ✅ Node.js installed: $nodeVer" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Node.js version may be outdated: $nodeVer" -ForegroundColor Yellow
    }
} catch { Write-Host "  ❌ Node.js not found" -ForegroundColor Red }

# Check 4: Android SDK
Write-Host "`n[4/5] Android SDK:" -ForegroundColor Yellow
$androidSdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { $null }
if ($androidSdk -and (Test-Path "$androidSdk\platform-tools\adb.exe")) {
    Write-Host "  ✅ Android SDK found: $androidSdk" -ForegroundColor Green
    $adbVer = & "$androidSdk\platform-tools\adb.exe" --version 2>&1 | Select-Object -First 1
    Write-Host "  ✅ ADB: $adbVer" -ForegroundColor Green
} else {
    Write-Host "  ❌ Android SDK not found or incomplete" -ForegroundColor Red
}

# Check 5: Appium
Write-Host "`n[5/5] Appium:" -ForegroundColor Yellow
try {
    $appiumVer = appium --version 2>&1
    Write-Host "  ✅ Appium installed: $appiumVer" -ForegroundColor Green
    $drivers = appium driver list --installed 2>&1
    if ($drivers -match "uiautomator2") {
        Write-Host "  ✅ UiAutomator2 driver installed" -ForegroundColor Green
    } else {
        Write-Host "  ❌ UiAutomator2 driver not installed" -ForegroundColor Red
    }
} catch { Write-Host "  ❌ Appium not found" -ForegroundColor Red }

Write-Host "`n=== END PRE-FLIGHT CHECK ===" -ForegroundColor Cyan
```

### Interpreting Results

| Check Result | Action |
|-------------|--------|
| All ✅ | Skip to "Step 7: Verify Environment" |
| Java ❌ | Execute Step 1 |
| JAVA_HOME ❌ | Execute Step 1 (environment variable section) |
| Node.js ❌ | Execute Step 2 |
| Android SDK ❌ | Execute Step 3 |
| Appium ❌ | Execute Step 5 |

---

## Step 1: Install Java 17

> ⚠️ **CRITICAL:** Java 24+ is NOT compatible with Android development. Must use Java 17.

### 1.1 Check Current Java Installation

```powershell
# Check if Java is installed and which version
java -version 2>&1
```

**Expected Output Patterns:**

| Output | Interpretation | Action |
|--------|---------------|--------|
| `openjdk version "17.x.x"` | ✅ Correct version | Skip to Step 1.3 (verify JAVA_HOME) |
| `openjdk version "24.x.x"` or higher | ❌ Incompatible | Must uninstall and install Java 17 |
| `java : The term 'java' is not recognized` | ❌ Not installed | Continue with installation |

### 1.2 Install Java 17

> **✅ SKIP IF**: Java 17.x.x is already installed (verified above)

**Option A: Install via winget (Recommended)**
```powershell
winget install EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements
```

**Expected Output:**
```
Found Eclipse Temurin JDK with Hotspot 17 [EclipseAdoptium.Temurin.17.JDK]
...
Successfully installed
```

**Option B: If winget fails, download manually**
1. Open browser to: https://adoptium.net/temurin/releases/?version=17
2. Download the `.msi` installer for Windows x64
3. Run installer and check "Set JAVA_HOME variable" option

### 1.3 Set JAVA_HOME Environment Variable

```powershell
# Find the Java installation path
$javaPath = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory | 
    Where-Object { $_.Name -match "^jdk-17" } | 
    Select-Object -First 1 -ExpandProperty FullName

if ($javaPath) {
    Write-Host "Found Java at: $javaPath" -ForegroundColor Green
    
    # Set JAVA_HOME permanently for current user
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
    
    # Also set for current session
    $env:JAVA_HOME = $javaPath
    
    Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "ERROR: Java 17 installation not found in expected location" -ForegroundColor Red
    Write-Host "Check: C:\Program Files\Eclipse Adoptium\" -ForegroundColor Yellow
}
```

### 1.4 Verify Java Installation

```powershell
# Verify Java works
java -version

# Verify JAVA_HOME
Write-Host "JAVA_HOME = $env:JAVA_HOME"
Test-Path "$env:JAVA_HOME\bin\java.exe"
```

**Expected Output:**
```
openjdk version "17.0.x" 202x-xx-xx
OpenJDK Runtime Environment Temurin-17.0.x+x (build 17.0.x+x)
OpenJDK 64-Bit Server VM Temurin-17.0.x+x (build 17.0.x+x, mixed mode, sharing)
JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot
True
```

**❌ STOP IF:** Java version shows 24+ or JAVA_HOME verification returns `False`. Retry installation.

---

## Step 2: Install Node.js

### 2.1 Check Current Node.js Installation

```powershell
node --version 2>&1
npm --version 2>&1
```

**Expected Output Patterns:**

| Output | Interpretation | Action |
|--------|---------------|--------|
| `v20.x.x` or `v22.x.x` or higher | ✅ Compatible | Skip to Step 2.3 |
| `v18.x.x` or lower | ⚠️ Outdated | Recommend upgrade |
| `node : The term 'node' is not recognized` | ❌ Not installed | Continue with installation |

### 2.2 Install Node.js LTS

> **✅ SKIP IF**: Node.js 20+ is already installed

```powershell
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

**Expected Output:**
```
Found Node.js LTS [OpenJS.NodeJS.LTS]
...
Successfully installed
```

**🔄 RETRY IF winget fails:**
```powershell
# Alternative: Use Chocolatey
choco install nodejs-lts -y

# Or download from: https://nodejs.org/
```

### 2.3 Fix PowerShell Execution Policy

> **🤖 AI**: This is required for npm scripts to run. Check and fix if needed.

```powershell
# Check current policy
$policy = Get-ExecutionPolicy -Scope CurrentUser
Write-Host "Current ExecutionPolicy: $policy"

if ($policy -eq "Restricted" -or $policy -eq "Undefined") {
    Write-Host "Setting ExecutionPolicy to RemoteSigned..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "ExecutionPolicy updated" -ForegroundColor Green
} else {
    Write-Host "ExecutionPolicy is acceptable: $policy" -ForegroundColor Green
}
```

### 2.4 Verify Node.js Installation

```powershell
# Open a NEW terminal or refresh environment, then:
node --version
npm --version
```

**Expected Output:**
```
v20.x.x  (or v22.x.x, v24.x.x)
10.x.x   (or 11.x.x)
```

**❌ STOP IF:** Node.js version is below 18. The project requires Node.js 20+.

---

## Step 3: Install Android SDK (Lightweight Method)

> **💡 Note:** Instead of the full Android Studio (~1.5GB), this installs just the command-line tools (~150MB).

### 3.1 Check Existing Android SDK

```powershell
# Check if Android SDK already exists
$androidHome = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } 
               elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT }
               elseif (Test-Path "C:\Android") { "C:\Android" }
               elseif (Test-Path "$env:LOCALAPPDATA\Android\Sdk") { "$env:LOCALAPPDATA\Android\Sdk" }
               else { $null }

if ($androidHome -and (Test-Path "$androidHome\platform-tools\adb.exe")) {
    Write-Host "✅ Android SDK found at: $androidHome" -ForegroundColor Green
    & "$androidHome\platform-tools\adb.exe" --version | Select-Object -First 1
    Write-Host "SKIP: Android SDK already installed" -ForegroundColor Cyan
} else {
    Write-Host "❌ Android SDK not found - installation required" -ForegroundColor Yellow
}
```

> **✅ SKIP TO Step 3.6 IF**: Android SDK is already installed with adb.exe present

### 3.2 Create SDK Directory Structure

```powershell
# Create the Android SDK directory
$sdkPath = "C:\Android"
New-Item -Path "$sdkPath\cmdline-tools\latest" -ItemType Directory -Force | Out-Null
Write-Host "Created directory: $sdkPath\cmdline-tools\latest" -ForegroundColor Green
```

### 3.3 Download Command-line Tools

> **🤖 AI**: Download the Android command-line tools. This step requires downloading a file.

```powershell
# Download URL for Android command-line tools
$downloadUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$zipPath = "$env:TEMP\android-cmdline-tools.zip"
$extractPath = "$env:TEMP\android-cmdline-extract"

Write-Host "Downloading Android command-line tools..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing

Write-Host "Extracting..." -ForegroundColor Yellow
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

# Move contents to correct location
$sourcePath = "$extractPath\cmdline-tools\*"
$destPath = "C:\Android\cmdline-tools\latest"
Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force

Write-Host "✅ Command-line tools installed to: $destPath" -ForegroundColor Green

# Cleanup
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $extractPath -Recurse -Force -ErrorAction SilentlyContinue
```

**Expected Directory Structure After:**
```
C:\Android\
└── cmdline-tools\
    └── latest\
        ├── bin\
        │   ├── sdkmanager.bat
        │   ├── avdmanager.bat
        │   └── ...
        ├── lib\
        └── NOTICE.txt
```

### 3.4 Set Environment Variables

```powershell
# Set ANDROID_HOME permanently
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android", "User")

# Set for current session
$env:ANDROID_HOME = "C:\Android"

# Add Android tools to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$androidPaths = @(
    "C:\Android\cmdline-tools\latest\bin",
    "C:\Android\platform-tools",
    "C:\Android\emulator"
)

# Only add paths not already in PATH
$newPaths = $androidPaths | Where-Object { $currentPath -notlike "*$_*" }
if ($newPaths) {
    $newPathString = ($newPaths -join ";") + ";" + $currentPath
    [System.Environment]::SetEnvironmentVariable("Path", $newPathString, "User")
    Write-Host "Added to PATH: $($newPaths -join ', ')" -ForegroundColor Green
}

# Update current session PATH
$env:Path = "C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools;C:\Android\emulator;$env:Path"

Write-Host "✅ Environment variables configured" -ForegroundColor Green
Write-Host "ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Cyan
```

### 3.5 Accept Licenses & Install SDK Components

> **🤖 AI**: This command requires interactive input. Use `-y` flag to auto-accept.

```powershell
# Navigate to ensure we're using the right sdkmanager
$sdkmanager = "C:\Android\cmdline-tools\latest\bin\sdkmanager.bat"

# Accept all licenses automatically
Write-Host "Accepting SDK licenses..." -ForegroundColor Yellow
$acceptLicenses = "y`ny`ny`ny`ny`ny`ny`ny`n"
$acceptLicenses | & $sdkmanager --licenses

# Install required components
Write-Host "`nInstalling SDK components (this may take 5-10 minutes)..." -ForegroundColor Yellow

& $sdkmanager "platform-tools"
& $sdkmanager "emulator"  
& $sdkmanager "platforms;android-34"
& $sdkmanager "build-tools;34.0.0"
& $sdkmanager "system-images;android-34;google_apis;x86_64"

Write-Host "✅ SDK components installed" -ForegroundColor Green
```

**Expected Components After Installation:**
| Component | Size | Purpose |
|-----------|------|---------|
| platform-tools | ~15MB | adb, fastboot |
| emulator | ~400MB | Android emulator |
| platforms;android-34 | ~70MB | Android 14 platform |
| build-tools;34.0.0 | ~60MB | Build tools |
| system-images;android-34;google_apis;x86_64 | ~1.2GB | Emulator image |

### 3.6 Verify Android SDK Installation

```powershell
# Verify ADB
Write-Host "Checking ADB..." -ForegroundColor Yellow
& "$env:ANDROID_HOME\platform-tools\adb.exe" --version

# Verify sdkmanager
Write-Host "`nChecking installed packages..." -ForegroundColor Yellow
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --list_installed

# Verify emulator
Write-Host "`nChecking emulator..." -ForegroundColor Yellow
& "$env:ANDROID_HOME\emulator\emulator.exe" -version | Select-Object -First 3
```

**Expected Output:**
```
Checking ADB...
Android Debug Bridge version 1.0.41
Version 35.0.x-xxxxxxx

Checking installed packages...
Installed packages:
  build-tools;34.0.0    | 34.0.0       | Android SDK Build-Tools 34
  emulator              | 35.x.x       | Android Emulator
  platform-tools        | 35.x.x       | Android SDK Platform-Tools
  platforms;android-34  | 3            | Android SDK Platform 34
  system-images;android-34;google_apis;x86_64 | ...
```

**❌ STOP IF:** adb --version fails or platform-tools not found. Re-run Step 3.5.

---

## Step 4: Create Android Emulator

### 4.1 Check for Existing Emulators

```powershell
# List existing AVDs (Android Virtual Devices)
$emulatorExe = "$env:ANDROID_HOME\emulator\emulator.exe"
$avds = & $emulatorExe -list-avds 2>$null

if ($avds) {
    Write-Host "✅ Existing emulators found:" -ForegroundColor Green
    $avds | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }
    Write-Host "`nSKIP: You can use an existing emulator" -ForegroundColor Yellow
} else {
    Write-Host "❌ No emulators found - creation required" -ForegroundColor Yellow
}
```

> **✅ SKIP TO Step 4.3 IF**: An emulator like `Pixel_8_API_34` already exists

### 4.2 Create New Emulator (AVD)

```powershell
$avdmanager = "$env:ANDROID_HOME\cmdline-tools\latest\bin\avdmanager.bat"

# Create a Pixel 8 emulator with Android 14 (API 34)
Write-Host "Creating Android emulator..." -ForegroundColor Yellow

& $avdmanager create avd `
    -n "Pixel_8_API_34" `
    -k "system-images;android-34;google_apis;x86_64" `
    -d "pixel_8" `
    --force

Write-Host "✅ Emulator created: Pixel_8_API_34" -ForegroundColor Green
```

**Expected Output:**
```
Auto-selecting single ABI x86_64
Do you wish to create a custom hardware profile? [no]
```

> **🤖 AI**: The command auto-accepts defaults. If prompted, answer "no".

### 4.3 Verify Emulator Creation

```powershell
# List emulators to confirm
& "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds
```

**Expected Output:**
```
Pixel_8_API_34
```

### 4.4 Start Emulator (Test)

> **🤖 AI**: Run this as a BACKGROUND process. Set `isBackground: true`.

```powershell
# Start emulator with software rendering (for compatibility)
Start-Process -FilePath "$env:ANDROID_HOME\emulator\emulator.exe" `
    -ArgumentList "-avd", "Pixel_8_API_34", "-gpu", "swiftshader_indirect" `
    -WindowStyle Normal
```

**Or use the project's helper script:**
```powershell
# From project root
.\scripts\windows\run-local-test-android.ps1 -StartEmulatorOnly -EmulatorName "Pixel_8_API_34"
```

### 4.5 Verify Emulator is Running

> **🤖 AI**: Wait 30-60 seconds for emulator to boot, then verify.

```powershell
# Wait for device to be ready
& "$env:ANDROID_HOME\platform-tools\adb.exe" wait-for-device

# Check connected devices
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices
```

**Expected Output:**
```
List of devices attached
emulator-5554   device
```

> **✅ SUCCESS IF**: Output shows `emulator-5554   device` (or similar with "device" status)
> **❌ RETRY IF**: Shows `emulator-5554   offline` - wait longer and retry
> **❌ STOP IF**: No devices listed after 2 minutes - check emulator window for errors

---

## Step 5: Install Appium

### 5.1 Check Existing Appium Installation

```powershell
try {
    $appiumVer = appium --version 2>&1
    Write-Host "✅ Appium installed: $appiumVer" -ForegroundColor Green
    
    # Check for UiAutomator2 driver
    $drivers = appium driver list --installed 2>&1
    if ($drivers -match "uiautomator2") {
        Write-Host "✅ UiAutomator2 driver installed" -ForegroundColor Green
        Write-Host "SKIP: Appium is properly configured" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ UiAutomator2 driver not installed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Appium not found - installation required" -ForegroundColor Yellow
}
```

> **✅ SKIP TO Step 5.4 IF**: Appium 3.x.x and UiAutomator2 are both installed

### 5.2 Install Appium

```powershell
Write-Host "Installing Appium 3.1.1..." -ForegroundColor Yellow
npm install -g appium@3.1.1

# Verify installation
appium --version
```

**Expected Output:**
```
3.1.1
```

**🔄 RETRY IF npm install fails:**
```powershell
# Clear npm cache and retry
npm cache clean --force
npm install -g appium@3.1.1

# If still failing, check npm prefix
npm config get prefix
# Ensure this path is in your PATH environment variable
```

### 5.3 Install UiAutomator2 Driver

```powershell
Write-Host "Installing UiAutomator2 driver..." -ForegroundColor Yellow
appium driver install uiautomator2
```

**Expected Output:**
```
✔ Installing 'uiautomator2' using NPM install spec 'appium-uiautomator2-driver'
Driver uiautomator2@x.x.x successfully installed
```

### 5.4 Verify Appium Installation

```powershell
# Check Appium version
Write-Host "Appium version:" -ForegroundColor Yellow
appium --version

# List installed drivers
Write-Host "`nInstalled drivers:" -ForegroundColor Yellow
appium driver list --installed
```

**Expected Output:**
```
Appium version:
3.1.1

Installed drivers:
- uiautomator2@x.x.x [installed (npm)]
```

### 5.5 Test Appium Server (Optional)

> **🤖 AI**: Run as BACKGROUND process to test server starts correctly.

```powershell
# Start Appium server
$appiumProcess = Start-Process -FilePath "appium" `
    -ArgumentList "--address", "127.0.0.1", "--port", "4723" `
    -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 5

# Test server is responding
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:4723/status" -TimeoutSec 5
    Write-Host "✅ Appium server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Appium server failed to start" -ForegroundColor Red
}

# Stop test server
Stop-Process -Id $appiumProcess.Id -Force -ErrorAction SilentlyContinue
```

---

## Step 6: Project Setup

### 6.1 Navigate to Project Directory

```powershell
# Ensure you're in the project root
Set-Location "c:\work\mpt-mobile-platform"
Get-Location
```

### 6.2 Configure NPM Registry (for @swo packages)

> **🤖 AI**: This step requires Azure DevOps authentication for private packages.

```powershell
Set-Location app

# Check if .npmrc exists with Azure DevOps registry
if (Test-Path ".npmrc") {
    $npmrc = Get-Content ".npmrc" -Raw
    if ($npmrc -match "pkgs.dev.azure.com") {
        Write-Host "✅ .npmrc configured for Azure DevOps" -ForegroundColor Green
    }
}

# Install authentication tool
Write-Host "Installing vsts-npm-auth..." -ForegroundColor Yellow
npm install -g vsts-npm-auth

# Authenticate (will open browser for Azure DevOps login)
Write-Host "Authenticating with Azure DevOps..." -ForegroundColor Yellow
Write-Host "⚠️ A browser window may open for authentication" -ForegroundColor Yellow
vsts-npm-auth -config .npmrc
```

**Expected Output:**
```
vsts-npm-auth v0.x.x
Getting new credentials for: ...pkgs.dev.azure.com...
```

> **❌ STOP IF**: Authentication fails - user must manually authenticate via browser

### 6.3 Install Project Dependencies

```powershell
# Ensure we're in the app directory
Set-Location "c:\work\mpt-mobile-platform\app"

# Install dependencies
Write-Host "Installing project dependencies (this may take 2-5 minutes)..." -ForegroundColor Yellow
npm install
```

**Expected Output:**
```
added XXX packages in Xm
```

**🔄 RETRY IF npm install fails:**
```powershell
# Clear node_modules and retry
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
npm cache clean --force
npm install
```

### 6.4 Configure Environment File

```powershell
# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    # Validate required variables
    $envContent = Get-Content ".env" -Raw
    $requiredVars = @("AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_AUDIENCE")
    $missingVars = $requiredVars | Where-Object { $envContent -notmatch $_ }
    
    if ($missingVars) {
        Write-Host "⚠️ Missing required variables: $($missingVars -join ', ')" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Required Auth0 variables present" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    
    if (Test-Path ".env.example") {
        Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "⚠️ Please edit .env and add Auth0 credentials from Keeper Vault" -ForegroundColor Yellow
    }
}
```

> **❌ STOP IF**: `.env` file is missing required Auth0 credentials. User must provide credentials from Keeper Vault.

**Required `.env` Variables:**
```
AUTH0_DOMAIN=login-test.pyracloud.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_AUDIENCE=https://api-test.pyracloud.com/
AUTH0_SCOPE=openid profile email offline_access
AUTH0_API_URL=https://api.s1.show/public/
AUTH0_OTP_DIGITS=6
AUTH0_SCHEME=com.softwareone.marketplaceMobile
```

---

## Step 7: Verify Environment

> **🤖 AI**: This is the final verification step. All checks should pass before running tests.

### 7.1 Run Built-in Environment Check

```powershell
Set-Location "c:\work\mpt-mobile-platform"
.\scripts\windows\setup-test-env.ps1
```

**Expected Output:**
All items should show `[OK]` in green. Example:
```
============================================================
  Test Environment Setup (Windows)
============================================================

[INFO] Loading environment variables from .env file...
  [OK] Exported: AUTH0_DOMAIN
  [OK] Exported: AUTH0_CLIENT_ID
  ...

[SUCCESS] Environment setup complete!
```

### 7.2 Run Comprehensive Environment Validation

```powershell
# PowerShell version
.\scripts\windows\setup-test-env.ps1

# Or batch file version
scripts\windows\setup-test-env.bat
```

**Expected Output Checklist:**
| Check | Expected Status |
|-------|-----------------|
| [1/6] Java installation | [OK] Java version: "17.x.x" |
| [2/6] JAVA_HOME | [OK] JAVA_HOME: C:\Program Files\... |
| [3/6] Android SDK | [OK] ANDROID_HOME: C:\Android |
| [4/6] ADB | [OK] Android Debug Bridge version ... |
| [5/6] Node.js | [OK] Node.js version: v2x.x.x |
| [6/6] Appium | [OK] Appium version: 3.1.1 |
| Appium drivers | [OK] uiautomator2@x.x.x |

### 7.3 Verify Device/Emulator Connection

```powershell
# Check for connected devices
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices
```

**Expected Output:**
```
List of devices attached
emulator-5554   device
```

> **🔄 IF no devices listed:**
```powershell
# Start emulator
.\scripts\windows\run-local-test-android.ps1 -StartEmulatorOnly -EmulatorName "Pixel_8_API_34"
```

---

## Running Tests

> **🤖 AI**: Ensure emulator is running before executing tests. Tests require a connected device.

### Pre-Test Checklist

```powershell
# Quick verification before running tests
Set-Location "c:\work\mpt-mobile-platform"

Write-Host "=== PRE-TEST CHECKLIST ===" -ForegroundColor Cyan

# 1. Check device
$devices = & "$env:ANDROID_HOME\platform-tools\adb.exe" devices 2>&1
if ($devices -match "device$") {
    Write-Host "✅ Device/Emulator connected" -ForegroundColor Green
} else {
    Write-Host "❌ No device connected - start emulator first" -ForegroundColor Red
    Write-Host "   Run: .\scripts\windows\run-local-test-android.ps1 -ListEmulators" -ForegroundColor Yellow
}

# 2. Check .env
if (Test-Path "app\.env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env file missing" -ForegroundColor Red
}

# 3. Check node_modules
if (Test-Path "app\node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Run 'npm install' in app folder" -ForegroundColor Red
}

Write-Host "=========================" -ForegroundColor Cyan
```

### Start Emulator (if not running)

**Option 1: Using project scripts (Recommended)**
```powershell
# List available emulators
.\scripts\windows\run-local-test-android.ps1 -ListEmulators

# Start emulator
.\scripts\windows\run-local-test-android.ps1 -StartEmulatorOnly -EmulatorName "Pixel_8_API_34"
```

**Option 2: Direct emulator command**
```powershell
# Start with software GPU (for compatibility)
& "$env:ANDROID_HOME\emulator\emulator.exe" -avd Pixel_8_API_34 -gpu swiftshader_indirect
```

> **🤖 AI**: Start emulator as BACKGROUND process. Wait for `adb devices` to show `device` status.

### Run E2E Tests

**Run single test suite:**
```powershell
Set-Location "c:\work\mpt-mobile-platform"

# Run welcome test suite
.\scripts\windows\run-local-test-android.ps1 welcome
```

**Run all tests:**
```powershell
.\scripts\windows\run-local-test-android.ps1 all
```

**Run specific spec file:**
```powershell
.\scripts\windows\run-local-test-android.ps1 ".\test\specs\welcome.e2e.js"
```

**Build app and run tests:**
```powershell
.\scripts\windows\run-local-test-android.ps1 -Build welcome
```

**Expected Test Output:**
```
============================================================
  Android Local Test Runner (PowerShell)
============================================================

[INFO] Using Android SDK: C:\Android
[INFO] Loading environment variables from .env file...
[SUCCESS] Environment variables loaded

[INFO] Environment Configuration:
       PLATFORM_NAME: Android
       DEVICE_UDID: emulator-5554
       ...

[INFO] Appium server is already running
[SUCCESS] Appium server is ready!

============================================================
  Starting WebDriverIO Tests
============================================================

...test output...

============================================================
[SUCCESS] Tests completed successfully!
============================================================
```

### Alternative: Batch File Version

```batch
REM From project root
scripts\windows\run-local-test-android.bat welcome
scripts\windows\run-local-test-android.bat --list-emulators
scripts\windows\run-local-test-android.bat --start-emulator Pixel_8_API_34
```

---

## Quick Reference

> **🤖 AI**: Use these commands for common operations.

### Command Reference Table

| Task | PowerShell Command | Batch Command |
|------|-------------------|---------------|
| Check environment | `.\scripts\windows\setup-test-env.ps1` | `scripts\windows\setup-test-env.bat` |
| List devices | `adb devices` | `adb devices` |
| List emulators | `.\scripts\windows\run-local-test-android.ps1 -ListEmulators` | `scripts\windows\run-local-test-android.bat --list-emulators` |
| Start emulator | `.\scripts\windows\run-local-test-android.ps1 -StartEmulatorOnly -EmulatorName "Pixel_8_API_34"` | `scripts\windows\run-local-test-android.bat --start-emulator Pixel_8_API_34` |
| Run test suite | `.\scripts\windows\run-local-test-android.ps1 welcome` | `scripts\windows\run-local-test-android.bat welcome` |
| Run all tests | `.\scripts\windows\run-local-test-android.ps1 all` | `scripts\windows\run-local-test-android.bat all` |
| Build and test | `.\scripts\windows\run-local-test-android.ps1 -Build welcome` | `scripts\windows\run-local-test-android.bat --build welcome` |

### Environment Variables Reference

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `JAVA_HOME` | JDK location | `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot` |
| `ANDROID_HOME` | Android SDK | `C:\Android` |
| `PATH` additions | Tool access | `%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator` |

### Project Script Options

**PowerShell (`run-local-test-android.ps1`):**
```
-ListEmulators          List available emulators
-StartEmulatorOnly      Start emulator without running tests  
-EmulatorName, -e       Specify emulator AVD name
-Build                  Build app before testing
-SkipBuild              Use existing APK
-Environment            dev|test|qa (with -Build)
-ClientId               Auth0 client ID (with -Build)
```

**Batch (`run-local-test-android.bat`):**
```
--list-emulators        List available emulators
--start-emulator NAME   Start emulator and exit
--emulator, -e NAME     Specify emulator to use
--build, -b             Build app before testing
--skip-build, -s        Use existing APK
--verbose, -v           Verbose output
--help, -h              Show help
```

---

## Troubleshooting

> **🤖 AI**: Use this section to diagnose and resolve common issues.

### Diagnostic Commands

Run these commands to gather diagnostic information:

```powershell
# Full diagnostic dump
Write-Host "=== DIAGNOSTIC INFORMATION ===" -ForegroundColor Cyan

Write-Host "`n[Java]" -ForegroundColor Yellow
java -version 2>&1
Write-Host "JAVA_HOME: $env:JAVA_HOME"

Write-Host "`n[Node.js]" -ForegroundColor Yellow  
node --version
npm --version

Write-Host "`n[Android SDK]" -ForegroundColor Yellow
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
if ($env:ANDROID_HOME) {
    & "$env:ANDROID_HOME\platform-tools\adb.exe" --version 2>&1 | Select-Object -First 1
    & "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds 2>&1
}

Write-Host "`n[Appium]" -ForegroundColor Yellow
appium --version 2>&1
appium driver list --installed 2>&1

Write-Host "`n[Devices]" -ForegroundColor Yellow
adb devices 2>&1

Write-Host "`n=== END DIAGNOSTIC ===" -ForegroundColor Cyan
```

### Java Issues

**Problem: "JAVA_HOME is not set"**

```powershell
# Find Java installation
$javaPath = Get-ChildItem "C:\Program Files\Eclipse Adoptium", "C:\Program Files\Java" -Directory -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -match "jdk-17" } | 
    Select-Object -First 1 -ExpandProperty FullName

if ($javaPath) {
    Write-Host "Found Java at: $javaPath" -ForegroundColor Green
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
    $env:JAVA_HOME = $javaPath
} else {
    Write-Host "Java 17 not found - install it first" -ForegroundColor Red
}
```

**Problem: "Unsupported class file major version 68"**

> This means Java 24+ is installed. You need Java 17.

```powershell
# Uninstall Java 24
winget uninstall --id Oracle.JDK.24 --silent
winget uninstall --id EclipseAdoptium.Temurin.24.JDK --silent

# Install Java 17
winget install EclipseAdoptium.Temurin.17.JDK
```

### Android SDK Issues

**Problem: "ANDROID_HOME is not set"**

```powershell
# Set ANDROID_HOME
$sdkPath = "C:\Android"
if (Test-Path $sdkPath) {
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")
    $env:ANDROID_HOME = $sdkPath
    Write-Host "ANDROID_HOME set to: $sdkPath" -ForegroundColor Green
} else {
    Write-Host "Android SDK not found at $sdkPath" -ForegroundColor Red
    Write-Host "Run Step 3 to install Android SDK" -ForegroundColor Yellow
}
```

**Problem: "adb not found"**

```powershell
# Check if platform-tools is installed
if (Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe") {
    Write-Host "ADB exists but not in PATH" -ForegroundColor Yellow
    $env:Path = "$env:ANDROID_HOME\platform-tools;$env:Path"
} else {
    Write-Host "Installing platform-tools..." -ForegroundColor Yellow
    & "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" "platform-tools"
}
```

### Node.js Issues

**Problem: "npm.ps1 cannot be loaded because running scripts is disabled"**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
Write-Host "ExecutionPolicy updated. Restart your terminal." -ForegroundColor Green
```

**Problem: "npm ERR! code ERESOLVE"**

```powershell
# Force install with legacy peer deps
npm install --legacy-peer-deps
```

### Emulator Issues

**Problem: Emulator won't start / very slow**

```powershell
# Check if WHPX/HAXM is available
Write-Host "Checking virtualization support..." -ForegroundColor Yellow

# Try starting with software rendering
& "$env:ANDROID_HOME\emulator\emulator.exe" -avd Pixel_8_API_34 -gpu swiftshader_indirect
```

> **💡 If still slow**: Enable virtualization in BIOS (Intel VT-x or AMD-V)

**Problem: "No emulators found"**

```powershell
# Create new emulator
$avdmanager = "$env:ANDROID_HOME\cmdline-tools\latest\bin\avdmanager.bat"

# First, ensure system image is installed
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" "system-images;android-34;google_apis;x86_64"

# Create AVD
& $avdmanager create avd -n "Pixel_8_API_34" -k "system-images;android-34;google_apis;x86_64" -d "pixel_8" --force
```

**Problem: Emulator shows but adb shows "offline"**

```powershell
# Restart ADB server
& "$env:ANDROID_HOME\platform-tools\adb.exe" kill-server
Start-Sleep -Seconds 2
& "$env:ANDROID_HOME\platform-tools\adb.exe" start-server
Start-Sleep -Seconds 3
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices
```

### Appium Issues

**Problem: "appium not found"**

```powershell
# Find npm global directory
$npmPrefix = npm config get prefix
Write-Host "NPM prefix: $npmPrefix"

# Add to PATH
$env:Path = "$npmPrefix;$env:Path"

# Verify
appium --version
```

**Problem: "UiAutomator2 not installed"**

```powershell
appium driver install uiautomator2
```

**Problem: Appium server won't start**

```powershell
# Check if port is in use
$portInUse = Get-NetTCPConnection -LocalPort 4723 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "Port 4723 is in use by process: $($portInUse.OwningProcess)" -ForegroundColor Yellow
    # Kill the process
    Stop-Process -Id $portInUse.OwningProcess -Force
}

# Start Appium
appium --address 127.0.0.1 --port 4723
```

### Test Execution Issues

**Problem: Tests fail to connect to device**

```powershell
# Verify device is connected and authorized
adb devices

# If showing "unauthorized", on the emulator/device:
# 1. Go to Settings > Developer Options
# 2. Revoke USB debugging authorizations
# 3. Toggle USB debugging off and on
# 4. Accept the prompt when it appears

# Restart ADB
adb kill-server
adb start-server
adb devices
```

**Problem: App not installed on device**

```powershell
# Build and install the app
.\scripts\windows\run-local-test-android.ps1 -Build welcome
```

---

## Installation Checklist

> **🤖 AI**: Use this checklist to verify all components are properly installed.

### Automated Verification Script

```powershell
# Run this script to verify all installation steps
$results = @()

# Java 17
$javaOk = $false
try {
    $javaVer = java -version 2>&1 | Select-String "version"
    $javaOk = $javaVer -match "17\."
} catch {}
$results += [PSCustomObject]@{Component="Java 17 JDK"; Status=if($javaOk){"✅"}else{"❌"}; Note=if($javaOk){"Installed"}else{"NOT Java 24+"}}

# JAVA_HOME
$javaHomeOk = $env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")
$results += [PSCustomObject]@{Component="JAVA_HOME set"; Status=if($javaHomeOk){"✅"}else{"❌"}; Note=$env:JAVA_HOME}

# Node.js
$nodeOk = $false
try {
    $nodeVer = node --version 2>&1
    $nodeOk = $nodeVer -match "v2[0-9]\."
} catch {}
$results += [PSCustomObject]@{Component="Node.js 20+"; Status=if($nodeOk){"✅"}else{"❌"}; Note=$nodeVer}

# ExecutionPolicy
$policyOk = (Get-ExecutionPolicy -Scope CurrentUser) -in @("RemoteSigned", "Unrestricted", "Bypass")
$results += [PSCustomObject]@{Component="ExecutionPolicy"; Status=if($policyOk){"✅"}else{"❌"}; Note=(Get-ExecutionPolicy -Scope CurrentUser)}

# Android SDK
$androidOk = $env:ANDROID_HOME -and (Test-Path "$env:ANDROID_HOME\cmdline-tools\latest\bin")
$results += [PSCustomObject]@{Component="Android SDK"; Status=if($androidOk){"✅"}else{"❌"}; Note=$env:ANDROID_HOME}

# ANDROID_HOME
$results += [PSCustomObject]@{Component="ANDROID_HOME set"; Status=if($env:ANDROID_HOME){"✅"}else{"❌"}; Note=$env:ANDROID_HOME}

# Platform-tools (ADB)
$adbOk = $env:ANDROID_HOME -and (Test-Path "$env:ANDROID_HOME\platform-tools\adb.exe")
$results += [PSCustomObject]@{Component="ADB installed"; Status=if($adbOk){"✅"}else{"❌"}; Note="platform-tools"}

# Emulator
$emulatorOk = $env:ANDROID_HOME -and (Test-Path "$env:ANDROID_HOME\emulator\emulator.exe")
$results += [PSCustomObject]@{Component="Emulator installed"; Status=if($emulatorOk){"✅"}else{"❌"}; Note=""}

# System image
$sysImgOk = $env:ANDROID_HOME -and (Test-Path "$env:ANDROID_HOME\system-images\android-34")
$results += [PSCustomObject]@{Component="System image"; Status=if($sysImgOk){"✅"}else{"❌"}; Note="android-34"}

# AVD exists
$avdOk = $false
if ($emulatorOk) {
    $avds = & "$env:ANDROID_HOME\emulator\emulator.exe" -list-avds 2>$null
    $avdOk = $avds -and $avds.Length -gt 0
}
$results += [PSCustomObject]@{Component="Emulator AVD created"; Status=if($avdOk){"✅"}else{"❌"}; Note=$avds}

# Appium
$appiumOk = $false
try {
    $appiumVer = appium --version 2>&1
    $appiumOk = $appiumVer -match "3\."
} catch {}
$results += [PSCustomObject]@{Component="Appium 3.x"; Status=if($appiumOk){"✅"}else{"❌"}; Note=$appiumVer}

# UiAutomator2
$uia2Ok = $false
try {
    $drivers = appium driver list --installed 2>&1
    $uia2Ok = $drivers -match "uiautomator2"
} catch {}
$results += [PSCustomObject]@{Component="UiAutomator2 driver"; Status=if($uia2Ok){"✅"}else{"❌"}; Note=""}

# Project dependencies
$depsOk = Test-Path "app\node_modules"
$results += [PSCustomObject]@{Component="npm dependencies"; Status=if($depsOk){"✅"}else{"❌"}; Note="app/node_modules"}

# .env file
$envOk = Test-Path "app\.env"
$results += [PSCustomObject]@{Component=".env configured"; Status=if($envOk){"✅"}else{"❌"}; Note="app/.env"}

# Display results
Write-Host "`n=== INSTALLATION CHECKLIST ===" -ForegroundColor Cyan
$results | Format-Table -AutoSize

$failedCount = ($results | Where-Object { $_.Status -eq "❌" }).Count
if ($failedCount -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED - Ready to run tests!" -ForegroundColor Green
} else {
    Write-Host "❌ $failedCount check(s) failed - see above for details" -ForegroundColor Red
}
```

### Manual Checklist

- [ ] Java 17 JDK installed (NOT Java 24+)
- [ ] JAVA_HOME environment variable set
- [ ] Node.js 20+ installed
- [ ] PowerShell execution policy set to RemoteSigned
- [ ] Android SDK command-line tools extracted to `C:\Android\cmdline-tools\latest\`
- [ ] ANDROID_HOME environment variable set
- [ ] SDK licenses accepted
- [ ] SDK components installed (platform-tools, emulator, android-34, build-tools)
- [ ] System image installed for emulator
- [ ] Android emulator AVD created
- [ ] Appium 3.1.1 installed globally
- [ ] UiAutomator2 driver installed
- [ ] vsts-npm-auth configured (for @swo packages)
- [ ] Project dependencies installed (`npm install` in app folder)
- [ ] `.env` file configured with Auth0 credentials
- [ ] Environment check passes: `scripts\windows\setup-test-env.bat`

---

## AI Execution Summary

> **🤖 AI**: After completing all steps, provide this summary to the user.

### Completion Report Template

```
## Environment Setup Complete

### Installed Components
- Java: [version]
- Node.js: [version]  
- Android SDK: C:\Android
- Appium: [version]
- UiAutomator2: [version]

### Emulator
- Name: Pixel_8_API_34
- Status: [Running/Stopped]

### Project
- Dependencies: [Installed/Missing]
- .env: [Configured/Missing credentials]

### Ready to Run
[Yes/No - list any blocking issues]

### Next Steps
1. [If emulator not running]: Start emulator with `-StartEmulatorOnly`
2. [If .env missing]: Configure Auth0 credentials
3. Run tests: `.\scripts\windows\run-local-test-android.ps1 welcome`
```

---

## Need Help?

- Run `scripts\windows\setup-test-env.bat` to setup environment and load .env
- Run `.\scripts\windows\setup-test-env.ps1` to verify environment variables
- Run `.\scripts\windows\setup-test-env.ps1 -ListEmulators` to see available emulators
- Check [APPIUM_ANDROID_TESTING_WINDOWS.md](../APPIUM_ANDROID_TESTING_WINDOWS.md) for detailed testing guide
- Check [LOCAL_BUILD_ANDROID.md](../LOCAL_BUILD_ANDROID.md) for build instructions

---

## Document Metadata

| Property | Value |
|----------|-------|
| Last Updated | January 2026 |
| Target Audience | AI Assistants, Developers |
| Platform | Windows 10/11 |
| Execution Mode | Sequential with verification |
