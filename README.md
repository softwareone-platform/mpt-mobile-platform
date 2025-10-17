# React Native Expo App - Cross-Platform Development

## Project Overview

A comprehensive React Native mobile application built with Expo, featuring Auth0 authentication, multi-platform navigation, and modern development patterns. Includes a Swift reference implementation for iOS developers.

## 🏗️ Project Structure

### React Native App
- **Platform**: iOS & Android (React Native 0.81 + Expo SDK 54)
- **Authentication**: Auth0 integration with secure token storage
- **Navigation**: React Navigation v7 with tab and stack navigation
- **State Management**: React Context + TypeScript

## ✅ Platform Compatibility

**iOS 17 & iOS 18**: Fully supported  
**Android 14 & Android 15**: Fully supported

> **Note**: Some features (like biometrics) are disabled in Expo Go during development but work properly in production builds.

## 🚀 Key Features

- **Auth0 Authentication**: OAuth2/OIDC with OTP verification
- **Multi-Account Support**: Account switching and profile management  
- **Cross-Platform UI**: Tab navigation with 5 main sections (Spotlight, Search, Chat, Service Desk, Analytics)
- **Secure Storage**: Keychain/Keystore integration with fallbacks
- **Real-time Data**: API integration with search, filtering, and state sync

## 🛠️ Quick Setup

### Prerequisites
- **Node.js**: LTS version (20.19.4 or later)
- **Expo CLI**: `npm install -g @expo/cli`
- **Development Tools**:
  - iOS: Xcode and iOS Simulator
  - Android: Android Studio and Android Emulator
- **Android Emulator**:
   - Start the emulator so it is available for expo

### Installation Steps

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd mpt-mobile-platform
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your Auth0 configuration (see [Auth0 Setup](#auth0-configuration))

3. **Start Development**
   ```bash
   npx expo start --clear
   ```
   
   Then:
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Android**: Press `a` or scan QR code with Expo Go app
   - Press `r` to reload the app when needed
   - Click `Ctrl+C` to shut down the server

### Android Emulator Setup (if needed)

If Android option doesn't work:

```bash
# Navigate to Android SDK emulator directory
cd ~/Library/Android/sdk/emulator
# for Windows
cd %LOCALAPPDATA%\Android\Sdk\emulator

# List available emulators
./emulator -list-avds

# Start specific emulator (replace with your emulator name)
./emulator -avd Pixel_5_API_34
```

### NPM Registry Setup for @swo packages

```bash
# Create .npmrc in project directory
cat > .npmrc << EOF
registry=https://registry.npmjs.org/
@swo:registry=https://softwareone-pc.pkgs.visualstudio.com/_packaging/PyraCloud/npm/registry/
always-auth=true
EOF

# Install and run authentication tool
npm install -g vsts-npm-auth
vsts-npm-auth -config .npmrc

# Install packages
npm install
```

## 🔐 Auth0 Configuration

### Required Environment Variables
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_AUDIENCE=your-api-audience
AUTH0_SCOPE=openid profile email offline_access
AUTH0_API_URL=your-api-url
AUTH0_OTP_DIGITS=6
AUTH0_SCHEME=your-app-scheme
```

Please ask team members to share specifics

### Auth0 Dashboard Settings

**Bundle Configuration:**
- **iOS Bundle ID**: `com.softwareone.marketplaceMobile`
- **Android Package**: `com.softwareone.marketplaceMobile`

**Callback URLs:**
```
# Development (Expo Go)
exp://[YOUR-IP]:8081/--/auth0
exp://localhost:8081/--/auth0

# Production
softwareone.playground-platform-navigation://login-dev.pyracloud.com/ios/com.softwareone.marketplaceMobile/callback
softwareone.playground-platform-navigation://login-dev.pyracloud.com/android/com.softwareone.marketplaceMobile/callback
```

> **Note**: Leave `TEMPORARY_AUTH0_TOKEN` empty unless debugging.

## 🔒 Zscaler Configuration

If you're working in a corporate environment with Zscaler, please make sure that your Zscaller policies are up to date.

## 🎯 Development Workflow

### Development Build (Full Native Features)
```bash
# iOS
npx expo run:ios

# Android  
npx expo run:android
```

### Expo Go (Quick Development)
```bash
npx expo start
```

### Clear Cache
```bash
npx expo start --clear
```
