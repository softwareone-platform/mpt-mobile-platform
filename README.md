# React Native Expo App - Cross-Platform Development

## Project Overview

A comprehensive React Native mobile application built with Expo, featuring Auth0 authentication, multi-platform navigation, and modern development patterns. Includes a Swift reference implementation for iOS developers.

## Project Structure

### React Native App
- **Platform**: iOS & Android (React Native 0.81 + Expo SDK 54)
- **Authentication**: Auth0 integration with secure token storage
- **Navigation**: React Navigation v7 with tab and stack navigation
- **State Management**: React Context + TypeScript

## Platform Compatibility

**iOS 17 & iOS 18**: Fully supported  
**Android 14 & Android 15**: Fully supported

## Key Features

- **Auth0 Authentication**: OAuth2/OIDC with OTP verification
- **Multi-Account Support**: Account switching and profile management  
- **Cross-Platform UI**: Tab navigation with 5 main sections (Spotlight, Search, Chat, Service Desk, Analytics)
- **Secure Storage**: Keychain/Keystore integration with fallbacks
- **Real-time Data**: API integration with search, filtering, and state sync

## Quick Setup

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
   - Download `.env` file for this project from [Keeper Vault](https://keepersecurity.eu/vault/)
   - Add all necessary variables from downloaded file to your local `.env` file
   - Add your Auth0 configuration (see [Auth0 Setup](#auth0-configuration))

3. **Start Development**
   ```bash
   npx expo run:ios
   npx expo run:android
   ```

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

## Auth0 Configuration

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
# Production
softwareone.playground-platform-navigation://login-dev.pyracloud.com/ios/com.softwareone.marketplaceMobile/callback
softwareone.playground-platform-navigation://login-dev.pyracloud.com/android/com.softwareone.marketplaceMobile/callback
```

> **Note**: Leave `TEMPORARY_AUTH0_TOKEN` empty unless debugging.

## Zscaler Configuration

If you're working in a corporate environment with Zscaler, please make sure that your Zscaller policies are up to date.

## Development Workflow

### iOS Simulator Deployment (Recommended)

We provide automated scripts for building and deploying to the iOS Simulator. These scripts handle the complete build cycle: cleaning, building, and deploying.

#### Quick Deploy to iOS Simulator
```bash
# Deploy with verbose output
./scripts/deploy-ios.sh --verbose

# Deploy with specific simulator
./scripts/deploy-ios.sh --simulator "iPhone 15 Pro"

# Deploy with logs
./scripts/deploy-ios.sh --logs

# Deploy in release mode
./scripts/deploy-ios.sh --release
```

**Script Options:**
- `-r, --release`: Build in release mode (default: debug)
- `-s, --simulator NAME`: Specify simulator (default: iPhone 16 Pro)
- `-f, --force-boot`: Force boot simulator
- `-l, --logs`: Show app logs after launch
- `-v, --verbose`: Show detailed output
- `-h, --help`: Show help message

**Note:** The script requires a `.env` file with Auth0 configuration. See [Auth0 Configuration](#auth0-configuration) section.

#### Quick Deploy to Android Emulator/Device

We provide automated scripts for building and deploying to Android devices and emulators. These scripts handle the complete build cycle: cleaning, building, and deploying.

```bash
# Deploy with verbose output
./scripts/deploy-android.sh --verbose

# Deploy to specific device/emulator
./scripts/deploy-android.sh --device "emulator-5554"

# Deploy with logs
./scripts/deploy-android.sh --logs

# Deploy in release mode
./scripts/deploy-android.sh --release
```

**Script Options:**
- `-r, --release`: Build in release mode (default: debug)
- `-d, --device NAME`: Specify device/emulator (default: first available)
- `-f, --force-boot`: Force boot emulator
- `-l, --logs`: Show app logs after launch
- `-v, --verbose`: Show detailed output
- `-h, --help`: Show help message

**Note:** The script requires a `.env` file with Auth0 configuration. See [Auth0 Configuration](#auth0-configuration) section.

#### Hot Reload Development (Fastest Iteration)

For rapid development with hot reload:

```bash
# Start development server with hot reload
./scripts/hot-reload.sh

# Clear cache and start
./scripts/hot-reload.sh --clear

# Auto-open iOS Simulator
./scripts/hot-reload.sh --ios

# Auto-open Android Emulator
./scripts/hot-reload.sh --android
```

Once the server starts:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `r` to reload
- Press `Ctrl+C` to stop

#### Cleanup Build Artifacts

```bash
# Standard cleanup
./scripts/cleanup.sh

# Deep clean (removes node_modules, reinstalls)
./scripts/cleanup.sh --deep
```

### Manual Development Build (Alternative)

If you prefer to use Expo commands directly:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Local Build - iOS
For detailed setup and configuration, please refer to [Local Build - iOS](documents/LOCAL_BUILD_IOS.md)

## CI/CD Workflows

This project uses GitHub Actions for continuous integration and deployment.

### Automated Workflows

#### PR Build Workflow
- **Triggers:** Pull requests to `main` branch
- **What it does:**
  - Installs dependencies (with caching)
  - Runs ESLint (`npm run lint:check`)
  - Runs Jest tests (`npm test`)
- **Runner:** Ubuntu (cost-effective)
- **Duration:** ~2-5 minutes
- **Purpose:** Fast validation without expensive iOS builds

#### Main Branch CI Workflow
- **Triggers:** Push to `main` branch
- **What it does:**
  - Runs validation (lint + tests) on Ubuntu runners
  - **Automatically builds iOS app** after validation succeeds
  - Creates iOS .app artifact (7-day retention)
- **Runners:** Ubuntu (validation) + macOS-14 (iOS build)
- **Duration:** ~25-35 minutes total
- **Purpose:** Ensures main branch always passes tests AND has working iOS build

#### iOS Build Workflow (Auto on Main + Manual)
- **Triggers:**
  - **Automatic:** Runs on every push to `main` branch (after validation)
  - **Manual:** Can be triggered manually via GitHub Actions UI
- **What it does:**
  - Runs tests
  - Generates native iOS project with Expo prebuild
  - Builds iOS app (Debug or Release, unsigned)
  - Uploads .app artifact (7-day retention)
  - **Does NOT** deploy to TestFlight
  - **Does NOT** increment version numbers
- **Runner:** macOS-14 (~$0.08/min)
- **Duration:** ~20-30 minutes
- **Purpose:** Build verification, ensures main branch always has working iOS build

#### iOS TestFlight Workflow (Manual - Full Deployment)
- **Triggers:** Manual dispatch only (via GitHub Actions UI)
- **What it does:**
  - Runs tests
  - Auto-increments version/build number
  - Generates native iOS project with Expo prebuild
  - Builds and signs iOS app for App Store
  - Uploads to TestFlight
  - Commits version bump and creates git tag
  - Uploads IPA and dSYMs as artifacts (30-day retention)
- **Runner:** macOS-14 (~$0.08/min)
- **Duration:** ~30-45 minutes
- **Purpose:** Complete deployment to TestFlight for internal/external testing
- **Requires:** TestFlight environment secrets configured

### When to Use Which Workflow

**iOS Build (Automatic on Main):**
- **Runs automatically** on every push to `main` branch
- Verifies iOS build succeeds after merging PRs
- Creates .app artifact from main branch
- Can also be triggered manually for testing

**iOS Build (Manual Trigger):**
- Testing build configuration changes
- Verifying builds before creating PR
- Testing on feature branches

**iOS TestFlight (Always Manual):**
- Deploying to internal/external testers
- Creating release candidates
- Publishing builds for testing
- Only trigger when ready to distribute

### Caching

All workflows use dependency caching to speed up builds:
- **npm dependencies:** Cached based on `package-lock.json`
- **CocoaPods:** Cached based on `Podfile.lock` (iOS builds only)

### TestFlight Deployment

#### Automated TestFlight Workflow

The project includes a complete TestFlight deployment workflow (`.github/workflows/ios-testflight.yml`).

**To deploy to TestFlight:**

1. Navigate to **Actions** tab in GitHub
2. Select **iOS TestFlight Deployment** workflow
3. Click **Run workflow**
4. Configure options:
   - **Version bump type:** Choose build (increment build number) or patch/minor/major (increment version)
   - **Environment:** Choose test or production (affects Auth0 configuration)
5. Click **Run workflow**
6. Wait ~30-45 minutes for complete deployment
7. Check App Store Connect for the new build in TestFlight

**What the workflow does:**

1. Runs all tests to ensure code quality
2. Increments version/build number in `app.json`
3. Generates native iOS project with Expo prebuild
4. Configures code signing with distribution certificate
5. Archives iOS app in Release mode
6. Exports signed IPA for App Store distribution
7. Uploads to TestFlight via App Store Connect API
8. Commits incremented build number back to the repository
9. Creates a git tag for the release (e.g., `v4.0.0-build123`)
10. Uploads IPA and dSYMs as artifacts (30-day retention)

**Build artifacts available:**
- Signed IPA file for App Store distribution
- dSYM files for crash symbolication
- Available for 30 days after deployment

#### Required Secrets

All secrets must be configured in the `TestFlight` GitHub environment:

**To configure secrets:**
1. Go to Settings → Environments → TestFlight
2. Add environment secrets

**Required secrets list:**
- App Store Connect API: `APP_STORE_CONNECT_API_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_API_KEY_CONTENT`
- Code Signing: `IOS_DISTRIBUTION_CERTIFICATE_P12_BASE64`, `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`, `PROVISIONING_PROFILE_SPECIFIER`
- Auth0 (Test): `AUTH0_DOMAIN_TEST`, `AUTH0_CLIENT_ID_TEST`, `AUTH0_AUDIENCE_TEST`, `AUTH0_API_URL_TEST`
- Auth0 (Production): `AUTH0_DOMAIN_PROD`, `AUTH0_CLIENT_ID_PROD`, `AUTH0_AUDIENCE_PROD`, `AUTH0_API_URL_PROD`

**Important Note on Secrets:**
- GitHub secrets are read-only and cannot be copied between repositories
- All secrets must be manually recreated in the TestFlight environment
- Contact team member who has the original secret values locally
- Reference PoC repository for secret names: https://github.com/softwareone-platform/mpt-mobile-reactnative-poc/settings/secrets/actions

For detailed documentation on secrets and deployment process, see:
- [CLAUDE.md - TestFlight Deployment](CLAUDE.md#testflight-deployment)
- [TestFlight Setup Checklist](.github/TESTFLIGHT_SETUP.md)
