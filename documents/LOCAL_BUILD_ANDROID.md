# Android Local Deployment Guide

This guide explains how to run local build and deploy your React Native app directly to an Emulator or a physical Android device for local testing and development.

## Prerequisites

- **Mac/Windows/Linux with Android SDK installed**
- **Android device** (phone/tablet)
- **USB cable** for device connection
- **Android Developer options enabled** on device
- **Node.js and npm** installed
- **Java Development Kit (JDK) 17** installed (NOT Java 24+ which is incompatible)

### Installing Watchman (Mac and Linux only)

It is beneficial to install Watchman to detect file changes automatically.

```bash
brew install watchman
```

Watchman is not available on Windows, and for Linux, please, refere to [official documentation](https://facebook.github.io/watchman/docs/install#linux)


### Installing Java 17

#### On macOS (using Homebrew):
It is recommended to install OpenJDK distribution called Azul Zulu for Android development when using Mac.

```bash
brew install --cask zulu@17
```

#### On Windows:
1. Download OpenJDK 17 from [Eclipse Adoptium](https://adoptium.net/)
2. Install the MSI package
3. Set JAVA_HOME in System Environment Variables

#### On Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

#### Verify Installation:
```bash
java -version
# Should show version 17.x.x
```

## Project Setup (One-time)

### 1. Eject from Expo (if using Expo)

If you're starting with an Expo managed app, you need to eject first:

```bash
cd app
npx expo prebuild --platform android
```

This creates the native Android project files in the `android/` directory.

### 2. Build Android project and install dependencies

This will install all dependencies, build and run local build of the project in emulator (without Expo Go)

```bash
npx expo run:android
```

### 3. Fix Dependency Conflicts (if needed)

If you encounter build errors or dependency conflicts, try these commands:

```bash
cd android && ./gradlew clean
```

## Daily Development Workflow

### Step 1: Enable Developer Options on Android Device

1. **Go to Settings → About Phone**
2. **Tap "Build Number" 7 times** until "You are now a developer" appears
3. **Go back to Settings → Developer Options**
4. **Enable "USB Debugging"**
5. **Enable "Install via USB"** (if available)

### Step 2: Connect Your Device

1. **Connect your Android device** to your computer via USB
2. **Select "File Transfer" or "PTP"** when prompted on device
3. **Allow USB Debugging** when the popup appears on your device
4. **Tap "Always allow from this computer"** and then "OK"

### Step 3: Verify Device Connection

```bash
cd app
npx react-native doctor
adb devices
```

You should see your device listed in the output.

### Step 4: Build Release APK

Clean and build the release APK:

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

The APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

**Note:** For production releases, you'll want to sign your APK with a keystore. For development and testing, the unsigned release APK works fine.

### Step 5: Install APK on Device

Verify your device is connected and install the APK:

```bash
# Check device connection
adb devices

# Install the release APK
adb install app/build/outputs/apk/release/app-release.apk
```

### Step 6: Launch the App

The app should appear in your device's app drawer. Tap to launch.

## Release Build Benefits

- **Standalone app** - No need for Metro bundler or computer connection
- **Optimized performance** - JavaScript bundle is compiled and minified
- **Production-ready** - Same configuration used for Play Store builds
- **Offline capable** - Works without any development server
- **Smaller size** - Dead code elimination and optimizations applied

## Keystore Management

### Secure Your Keystore

1. **Backup your keystore file** - Store it securely
2. **Remember your passwords** - Write them down safely
3. **Never commit keystore to version control**

### Add Keystore Configuration

Create `android/gradle.properties` (if not exists):

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

Update `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

## Troubleshooting

### Java Version Issues

#### "Unsupported class file major version 68" Error
This means you're using Java 24+ which is not supported by Gradle.

**Solution:**
1. **Install Java 17** (see Prerequisites section)
2. **Set JAVA_HOME** correctly:
   ```bash
   # macOS (Homebrew)
   export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
   
   # Windows
   set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
   
   # Linux
   export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
   ```
3. **Stop Gradle daemons** and try again:
   ```bash
   cd android
   ./gradlew --stop
   ./gradlew clean
   ```

#### Check Java Version
```bash
java -version
echo $JAVA_HOME  # macOS/Linux
echo %JAVA_HOME% # Windows
```

### Android SDK Issues

#### "SDK location not found" Error
**Solution:**
1. **Set ANDROID_HOME**:
   ```bash
   # macOS
   export ANDROID_HOME=~/Library/Android/sdk
   
   # Windows
   set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
   
   # Linux
   export ANDROID_HOME=~/Android/Sdk
   ```
2. **Add to PATH**:
   ```bash
   export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
   ```

#### Make Environment Variables Permanent
Add these lines to your shell profile:

**macOS/Linux** (`~/.zshrc` or `~/.bashrc`):
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$JAVA_HOME/bin:$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

**Windows** (System Environment Variables):
- `JAVA_HOME`: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`
- `ANDROID_HOME`: `%LOCALAPPDATA%\Android\Sdk`
- Add to `PATH`: `%JAVA_HOME%\bin;%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools`

### Gradle Build Issues

#### General Gradle Troubleshooting
```bash
# Stop all Gradle daemons
./gradlew --stop

# Clean project
./gradlew clean

# Check Gradle status
./gradlew --status

# Build with debug info
./gradlew assembleRelease --info
```

#### Clear Gradle Cache
```bash
# macOS/Linux
rm -rf ~/.gradle/caches/

# Windows
rmdir /s "%USERPROFILE%\.gradle\caches"
```

### Device and Deployment Issues

### Device Not Detected
- **Enable Developer Options** and USB Debugging
- **Try different USB cable** or USB port
- **Install device drivers** (Windows)
- **Revoke USB debugging authorizations** in Developer Options, then reconnect
- **Check**: `adb devices` should list your device

### "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
- **Uninstall existing app** from device first
- **Different signing keys** between debug and release builds
- **Clear app data** before installing

### Build Failed - Gradle Error
- **Clean project**: `cd android && ./gradlew clean`
- **Check Java version**: Ensure JDK 17 is installed and JAVA_HOME is set
- **Stop Gradle daemons**: `./gradlew --stop`
- **Update Android Gradle Plugin** in `android/build.gradle`
- **Check Gradle version compatibility**

### "Could not find tools.jar"
- **Set JAVA_HOME** environment variable correctly
- **Use JDK, not JRE** (Java Development Kit, not Runtime Environment)
- **Verify Android SDK installation**

### APK Installation Failed
- **Enable "Install unknown apps"** for your file manager
- **Check device storage space**
- **Try installing with different ADB flags**: `adb install -r app-release.apk` (replace existing)
- **Check app permissions** in device settings

### App Crashes on Launch
- **Check logs**: `adb logcat | grep ReactNative`
- **Verify all native dependencies** are properly linked
- **Clean and rebuild**: `cd android && ./gradlew clean && ./gradlew assembleRelease`

## Project Structure

```
app/
├── android/                               # Native Android project
│   ├── app/                               # Main application module
│   │   ├── build.gradle                   # App-level build config
│   │   ├── src/main/AndroidManifest.xml   # App manifest
│   │   ├── src/main/java/                 # Java/Kotlin source
│   │   ├── src/main/res/                  # Resources (icons, strings)
│   │   └── build/outputs/apk/             # Generated APK files
│   ├── build.gradle                       # Project-level build config
│   ├── gradle.properties                  # Gradle configuration
│   └── settings.gradle                    # Project settings
├── src/                                   # React Native source code
└── package.json                          # Node.js dependencies
```

## Build Optimization Tips

1. **Always use release builds** for device deployment
2. **Enable ProGuard/R8** for code obfuscation and size reduction
3. **Generate App Bundle** instead of APK for Play Store
4. **Test on multiple devices** with different Android versions
5. **Monitor APK size** - Use command line tools like `aapt` to analyze APK

## Device Requirements

- **Android 5.0+ (API level 21+)** (minimum SDK version)
- **ARM or x86 processor** architecture
- **USB debugging enabled**
- **Sufficient storage space** for app installation

## Useful ADB Commands

```bash
# List connected devices
adb devices

# Install APK
adb install path/to/app.apk

# Install APK replacing existing (if installed)
adb install -r path/to/app.apk

# Uninstall app
adb uninstall com.yourpackage.name

# View logs
adb logcat

# Clear app data
adb shell pm clear com.yourpackage.name

# Take screenshot
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

---

**Note**: This guide focuses on Release builds for standalone deployment. No Metro bundler or Expo required after successful build.
