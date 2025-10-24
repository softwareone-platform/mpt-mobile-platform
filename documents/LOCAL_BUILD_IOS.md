# iOS Local Deployment Guide

This guide explains how to deploy your React Native app directly to an iOS device for local testing and development.

## Prerequisites

- **Mac with Xcode installed** (latest version recommended)
- **iOS device** (iPhone/iPad)
- **USB cable** for device connection
- **Apple Developer account** (free or paid)
- **Node.js and npm** installed

## Project Setup (One-time)

### 1. Eject from Expo (if using Expo)

Note - This step is optional. The ejected app is already in the ios folder.

If you're starting with an Expo managed app, you need to eject first:

```bash
cd app
npx expo prebuild --platform ios
```

This creates the native iOS project files in the `ios/` directory.

### 2. Build iOS project and install dependencies

This will install all dependencies, build and run local build of the project in emulator (without Expo Go)

```bash
npx expo run:ios
```

You may want to refresh packages, in this case run the following:

```bash
cd ios && rm -rf Pods/ && rm Podfile.lock
cd ..
npx expo run:ios
```

## Daily Development Workflow

### Step 1: Connect Your Device

1. **Connect your iOS device** to your Mac via USB
2. **Unlock your device** and tap "Trust This Computer" if prompted
3. **Enter your device passcode** when requested

### Step 2: Open Project in Xcode

```bash
open ios/SoftwareOnePlayground.xcworkspace
```

### Step 3: Configure Developer Team

In Xcode:

1. Select your project in the navigator (`SoftwareOne`)
2. Select the target (`SoftwareOne`)
3. Go to **"Signing & Capabilities"** tab
4. **Uncheck** "Automatically manage signing" (if checked)
5. Select your **Team** (Apple Developer account)
6. Select appropriate **Provisioning Profile**
7. Verify **Bundle Identifier**: `com.softwareone.marketplaceMobile`

### Step 4: Set Release Configuration

1. In Xcode toolbar, click the **scheme dropdown** (next to stop button)
2. Select **"Edit Scheme..."**
3. In the left sidebar, select **"Run"**
4. Change **Build Configuration** from "Debug" to **"Release"**
5. Click **"Close"**

### Step 5: Select Your Device

1. In Xcode toolbar, click the **device dropdown** (next to the scheme)
2. Select your **connected device** from the list
3. Make sure it shows your device name, not "Any iOS Device" or "Simulator"

### Step 6: Build and Deploy

1. Click the **Play button (▶️)** in Xcode
2. Wait for the build to complete
3. App will automatically install and launch on your device

### Step 7: Trust Developer Certificate (First Time Only)

On your device:

1. Go to **Settings → General → VPN & Device Management**
2. Under **"Developer App"** section, find your Apple ID
3. Tap your Apple ID and select **"Trust [Your Apple ID]"**
4. Confirm by tapping **"Trust"**

### Step 8: Launch the App

The app should launch automatically after deployment. If not, find it on your device home screen and tap to open.

## Release Build Benefits

- **Standalone app** - No need for Metro bundler or computer connection
- **Optimized performance** - JavaScript bundle is compiled and embedded
- **Production-ready** - Same configuration used for App Store builds
- **Offline capable** - Works without any development server

## Alternative: Archive for Distribution

For creating distributable builds:

1. **Product → Archive** in Xcode
2. Wait for archive to complete
3. **Organizer** window will open
4. Select your archive and click **"Distribute App"**
5. Choose distribution method (Ad Hoc, Enterprise, etc.)

## Troubleshooting

### Build Failed - Signing Error
- Verify you're signed into Xcode with your Apple ID
- Check your Apple Developer account has valid certificates
- Ensure Bundle Identifier matches your App ID
- Try: **Product → Clean Build Folder**

### "No Provisioning Profile Found"
- Go to Apple Developer portal and create/download provisioning profiles
- In Xcode: Preferences → Accounts → Download Manual Profiles
- Select the correct profile in Signing & Capabilities

### Device Not Recognized
- Try a different USB cable
- Restart both Mac and iOS device
- Check device appears in **Window → Devices and Simulators**
- Ensure device is in Developer Mode (iOS 16+)

### App Installation Failed
- Check device storage space
- Verify Bundle Identifier is unique
- Try deleting any existing app with same identifier
- Clean build folder and try again

### Build Takes Too Long
- Close unnecessary applications
- Clean build folder: **Product → Clean Build Folder**
- Clear derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/`

## Project Structure

```
app/
├── ios/                            # Native iOS project
│   ├── SoftwareOne.xcworkspace     # Open this in Xcode
│   ├── SoftwareOne/                # iOS app source code
│   │   ├── Info.plist              # App configuration
│   │   ├── AppDelegate.swift       # App entry point
│   │   └── Images.xcassets/        # App icons & images
│   ├── Pods/                       # CocoaPods dependencies
│   └── Podfile                     # iOS dependencies config
├── src/                            # React Native source code
└── package.json                    # Node.js dependencies
```

## Build Optimization Tips

1. **Always use Release configuration** for device deployment
2. **Clean build folder** if encountering issues
3. **Update provisioning profiles** regularly
4. **Test on multiple devices** with different iOS versions
5. **Monitor app size** - Release builds are larger than Debug

## Device Requirements

- **iOS 15.1+** (minimum deployment target)
- **64-bit processor** (iPhone 5s and newer)
- **Developer Mode enabled** (iOS 16+)
- **Sufficient storage space** for app installation

## Xcode Shortcuts

- **⌘ + R** - Build and Run
- **⌘ + ⇧ + K** - Clean Build Folder  
- **⌘ + B** - Build Only
- **⌘ + .** - Stop Build/Run
- **⌘ + ⇧ + O** - Open Quickly

---

**Note**: This guide focuses on Release builds for standalone deployment. No Metro bundler or Expo required after successful build.
