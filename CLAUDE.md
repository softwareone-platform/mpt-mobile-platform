# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MPT Mobile Platform is a React Native Expo mobile application for iOS and Android, featuring Auth0 authentication and cross-platform navigation. The project is in early development stages with foundational infrastructure in place.

**Tech Stack:**
- React Native 0.81.4 with Expo SDK 54
- React 19.1.0 with New Architecture enabled
- TypeScript 5.9.2 (strict mode)
- Jest for testing
- React Navigation v7 for navigation
- Axios for API calls
- i18next for internationalization
- Auth0 for authentication

**Key Dependencies:**
- **Navigation**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`
- **Authentication**: `react-native-auth0`, `expo-secure-store`, `jwt-decode`
- **API**: `axios`
- **State Management**: React Context API (built-in)
- **i18n**: `i18next`, `react-i18next`
- **Environment**: `dotenv`, `react-native-dotenv`
- **UI**: `@expo/vector-icons`, `expo-linear-gradient`, `react-native-svg`, `jdenticon`
- **Storage**: `@react-native-async-storage/async-storage`
- **Development**: `@typescript-eslint/*`, `eslint-plugin-react*`, `babel-jest`

## Project Structure

All source code lives in the `app/` directory:

```
app/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── auth/               # Authentication components (AuthButton, OTPInput, etc.)
│   │   ├── navigation/         # Navigation components (stacks, tabs)
│   │   ├── common/             # Common components (DynamicIcon, Avatar, etc.)
│   │   ├── tabs/               # Tab components
│   │   ├── tab-item/           # Tab item components
│   │   ├── navigation-item/    # Navigation item components
│   │   ├── list-item/          # List item components
│   │   ├── avatar/             # Avatar components
│   │   └── account-summary/    # Account summary components
│   ├── config/                 # Configuration files
│   │   ├── feature-flags/      # Feature flag system (JSON-based, type-safe)
│   │   └── env.config.ts       # Environment configuration service
│   ├── context/                # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state management
│   │   └── NavigationContext.tsx # Navigation state management
│   ├── screens/                # Screen components
│   │   ├── auth/               # Auth screens (Welcome, OTP verification)
│   │   ├── account/            # Account screens (Profile, Settings)
│   │   ├── spotlight/          # Spotlight screen
│   │   ├── loading/            # Loading screen
│   │   ├── agreements/         # Agreements screen
│   │   ├── invoices/           # Invoices screen
│   │   ├── orders/             # Orders screen
│   │   ├── credit-memos/       # Credit memos screen
│   │   ├── statements/         # Statements screen
│   │   └── subscriptions/      # Subscriptions screen
│   ├── services/               # API and business logic services
│   │   ├── authService.ts      # Auth0 authentication service
│   │   └── accountService.ts   # Account management service
│   ├── lib/                    # Core libraries
│   │   ├── apiClient.ts        # Axios API client
│   │   └── tokenProvider.ts    # Token management
│   ├── hooks/                  # Custom React hooks
│   │   └── useApi.ts           # API hook for data fetching
│   ├── styles/                 # Design system and styles
│   │   ├── tokens/             # Design tokens (colors, typography, spacing, shadows)
│   │   ├── components/         # Component styles
│   │   └── theme/              # Theme configuration
│   ├── i18n/                   # Internationalization
│   │   ├── en.json             # English translations
│   │   └── index.js            # i18next configuration
│   ├── types/                  # TypeScript type definitions
│   │   ├── navigation.ts       # Navigation types
│   │   └── api.ts              # API types
│   ├── constants/              # App constants
│   │   ├── auth.ts             # Auth constants
│   │   └── api.ts              # API constants
│   ├── utils/                  # Utility functions
│   │   ├── validation.ts       # Input validation
│   │   ├── apiError.ts         # API error handling
│   │   └── image.ts            # Image utilities
│   └── __tests__/              # Test files (colocated with source)
├── assets/                     # Static assets (icons, splash screens)
├── App.tsx                     # Root component
├── index.ts                    # Expo entry point
└── [config files]              # babel, jest, eslint, tsconfig, metro
```

## Development Commands

### iOS Simulator Deployment (Recommended)

**Quick Deploy:**
```bash
# Deploy to iOS Simulator with verbose output
./scripts/deploy-ios.sh --verbose

# Deploy to specific simulator
./scripts/deploy-ios.sh --simulator "iPhone 15 Pro"

# Deploy with logs
./scripts/deploy-ios.sh --logs

# Release build
./scripts/deploy-ios.sh --release
```

**Script Features:**
- Validates environment (Node.js, Xcode, npm)
- Configures Auth0 environment
- Boots iOS Simulator
- Uninstalls previous app version
- Cleans build cache
- Installs dependencies
- Runs Expo prebuild (generates native iOS project)
- Builds and deploys to simulator
- Launches app

**Prerequisites:** .env file must exist in app/ directory with Auth0 configuration

**Available Options:**
- `-r, --release`: Release mode build
- `-s, --simulator NAME`: Target simulator (default: iPhone 16 Pro)
- `-f, --force-boot`: Force boot simulator
- `-l, --logs`: Stream app logs after launch
- `-v, --verbose`: Detailed output
- `-h, --help`: Show help

### Hot Reload Development (Fastest Iteration)

**For rapid development:**
```bash
# Start development server
./scripts/hot-reload.sh

# Clear cache and start
./scripts/hot-reload.sh --clear

# Auto-open iOS
./scripts/hot-reload.sh --ios

# Auto-open Android
./scripts/hot-reload.sh --android
```

Once started, press `i` for iOS, `a` for Android, `r` to reload.

### Cleanup Build Artifacts

```bash
# Standard cleanup
./scripts/cleanup.sh

# Deep clean (removes node_modules, reinstalls)
./scripts/cleanup.sh --deep
```

### Manual Commands (Alternative)

```bash
# Quick development with Expo Go (some native features disabled)
npm start
# Then press 'i' for iOS, 'a' for Android

# Full native build (all features enabled, production-like)
npm run ios       # Build and run on iOS simulator
npm run android   # Build and run on Android emulator
npm run web       # Run in browser

# Clear cache if experiencing issues
npx expo start --clear
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests for specific file
npm test -- path/to/file.test.ts
```

Test files are located in `__tests__` directories alongside source code and use `.test.ts` or `.test.tsx` extensions.

### E2E Testing (Appium)

End-to-end tests use Appium with WebDriverIO. Tests are located in `app/test/specs/`.

**Cross-Platform Testing with Platform Flag:**

The unified test script supports both iOS and Android via the `--platform` flag.

**Prerequisites:** .env file must exist in app/ directory with Auth0 configuration

**iOS Testing (macOS only):**
```bash
# Run tests with existing app
./scripts/run-local-test.sh --platform ios welcome

# Build and run tests
./scripts/run-local-test.sh --platform ios --build welcome

# Run all tests
./scripts/run-local-test.sh --platform ios all

# Run specific spec file
./scripts/run-local-test.sh --platform ios ./test/specs/welcome.e2e.js
```

**Android Testing (macOS/Linux):**
```bash
# Run tests with existing app
./scripts/run-local-test.sh --platform android welcome

# Build and run tests
./scripts/run-local-test.sh --platform android --build welcome

# Run all tests
./scripts/run-local-test.sh --platform android all

# Run specific spec file
./scripts/run-local-test.sh --platform android ./test/specs/welcome.e2e.js
```

**Android Testing (Windows):**
```batch
REM Check environment setup
scripts\windows\setup-android-env.bat

REM Run tests with existing app
scripts\windows\run-local-test-android.bat welcome

REM Build and run tests
scripts\windows\run-local-test-android.bat --build welcome

REM Run all tests
scripts\windows\run-local-test-android.bat all
```

**Using NPM Scripts (from `app` directory):**
```bash
cd app

# Run iOS tests
npm run test:e2e:ios

# Run Android tests
npm run test:e2e:android

# Run specific suite on Android
PLATFORM_NAME=Android npx wdio run wdio.conf.js --suite welcome
```

**Available test suites:** `welcome`, `home`, `navigation`, `failing`

**Documentation:**
- iOS setup: `documents/APPIUM_IOS_TESTING.md`
- Android setup (macOS/Linux): `documents/APPIUM_ANDROID_TESTING.md`
- Android setup (Windows): `documents/APPIUM_ANDROID_TESTING_WINDOWS.md`
- Writing tests: `documents/EXTENDING_TEST_FRAMEWORK.md`

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Check with zero warnings allowed (CI mode)
npm run lint:check
```

## Environment Setup

**Required:** Copy `.env.example` to `.env` and configure Auth0 variables:

```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_AUDIENCE=your-api-audience
AUTH0_SCOPE=openid profile email offline_access
AUTH0_API_URL=your-api-url
AUTH0_OTP_DIGITS=6
AUTH0_SCHEME=your-app-scheme
```

Get values from team or Keeper Vault. Leave `TEMPORARY_AUTH0_TOKEN` empty unless debugging.

### NPM Registry for @swo packages

Private packages require Azure DevOps authentication:

```bash
# Setup .npmrc in project directory
cat > .npmrc << EOF
registry=https://registry.npmjs.org/
@swo:registry=https://softwareone-pc.pkgs.visualstudio.com/_packaging/PyraCloud/npm/registry/
always-auth=true
EOF

# Authenticate
npm install -g vsts-npm-auth
vsts-npm-auth -config .npmrc
```

## CI/CD Workflows

The project uses GitHub Actions for continuous integration and deployment.

### Workflow Overview

**PR Workflow** (`.github/workflows/pr-build.yml`)
- Triggers on pull requests to `main` branch
- Runs linting, tests, and dependency validation
- Uses Ubuntu runners (cost-effective)
- No native iOS/Android builds (cost optimization)
- Required status check for merging

**Main Branch Workflow** (`.github/workflows/main-ci.yml`)
- Triggers on push to `main` branch
- Runs validation (lint + tests) on Ubuntu runners
- **Automatically builds iOS and Android apps in parallel** after validation succeeds
- Ensures main branch always has working builds for both platforms
- Creates iOS .app artifact (7-day retention)
- Creates Android .apk artifact (7-day retention)
- Uses Ubuntu for validation and Android build, macOS-14 for iOS build

**iOS Build Workflow** (`.github/workflows/ios-build.yml`)
- **Triggers:** Manual dispatch OR called by main-ci.yml
- Uses macOS-14 runners
- **Purpose:** Build verification WITHOUT TestFlight deployment
- Builds iOS app in Debug or Release mode
- Creates unsigned build for verification
- Uploads .app artifact (7-day retention)
- Does NOT deploy to TestFlight
- Does NOT increment version numbers
- **Automatically runs on main branch** after validation passes (in parallel with Android)
- Can also be triggered manually for testing

**Android Build Workflow** (`.github/workflows/android-build.yml`)
- **Triggers:** Manual dispatch OR called by main-ci.yml
- Uses Ubuntu runners (cost-effective)
- **Purpose:** Build verification only
- Builds Android APK in Debug mode
- Creates unsigned Debug APK for verification
- Uploads .apk artifact (7-day retention)
- Does NOT build Release or AAB (App Bundle)
- Does NOT sign for production
- **Automatically runs on main branch** after validation passes (in parallel with iOS)
- Can also be triggered manually for testing

**iOS TestFlight Workflow** (`.github/workflows/ios-testflight.yml`)
- **Manual dispatch only** (cost optimization)
- Uses macOS-14 runners
- **Purpose:** Complete deployment to TestFlight
- Builds and deploys to TestFlight
- Caches npm and CocoaPods dependencies
- Uploads signed IPA and dSYMs (30-day retention)
- Auto-increments version/build number
- Creates git tags for releases
- Commits version bump back to repository
- Requires TestFlight environment secrets

**Reusable Workflow** (`.github/workflows/reusable-build-test.yml`)
- Shared build and test logic
- npm dependency caching
- ESLint validation
- Jest tests with coverage
- Coverage artifact upload

### Running Builds

**When builds run automatically:**
- **Every push to `main` branch** (after validation passes)
- iOS and Android builds run **in parallel** to save time
- Ensures main branch always has working builds for both platforms
- Creates .app artifact (iOS) and .apk artifact (Android) for every main branch commit

**When to trigger builds manually:**
- Testing if code compiles for iOS/Android on feature branches
- Verifying build succeeds before creating PR
- Creating test artifacts without deployment
- Testing build configuration changes

**To manually trigger an iOS build:**
1. Go to GitHub Actions tab
2. Select "iOS Build" workflow
3. Click "Run workflow"
4. Choose build mode (Debug or Release)
5. Choose whether to create archive
6. Monitor progress (~20-30 minutes on macOS runners)
7. Download .app artifact from workflow run

**To manually trigger an Android build:**
1. Go to GitHub Actions tab
2. Select "Android Build" workflow
3. Click "Run workflow"
4. Monitor progress (~15-20 minutes on Ubuntu runners)
5. Download .apk artifact from workflow run

**When to use iOS TestFlight workflow (deployment):**
- Ready to deploy to testers
- Creating a release candidate
- Deploying to production TestFlight

**To trigger a TestFlight deployment:**
1. Go to GitHub Actions tab
2. Select "iOS TestFlight Deployment" workflow
3. Click "Run workflow"
4. Choose version bump type (none, build, patch, minor, major)
5. Choose environment (test or production)
6. Monitor progress (~30-45 minutes on macOS runners)
7. Check App Store Connect for the build after 10-15 minutes

**Build Comparison:**

| Feature | iOS Build | Android Build | iOS TestFlight |
|---------|-----------|---------------|----------------|
| **Trigger** | Auto on `main` + Manual | Auto on `main` + Manual | Manual only |
| **Purpose** | Verification only | Verification only | Full deployment |
| **Runner** | macOS-14 | Ubuntu (cost-effective) | macOS-14 |
| **Build Mode** | Debug or Release | Debug only | Release |
| **Code Signing** | No (unsigned) | No (unsigned) | Yes (App Store) |
| **Artifact** | .app file | .apk file | .ipa + dSYMs |
| **Deployment** | No | No | Yes (TestFlight) |
| **Version Bump** | No | No | Yes |
| **Git Tag** | No | No | Yes |
| **Artifact Retention** | 7 days | 7 days | 30 days |
| **Requires Secrets** | No | No | Yes (TestFlight env) |
| **Duration** | ~20-30 min | ~15-20 min | ~30-45 min |
| **Runs on Main** | ✅ Parallel | ✅ Parallel | ❌ Never |

### Caching Strategy

**npm dependencies:**
- Cache key: `${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}`
- Cached paths: `node_modules`, `~/.npm`
- Speeds up builds significantly

**CocoaPods (iOS builds):**
- Cache key: `${{ runner.os }}-pods-${{ hashFiles('**/Podfile.lock') }}`
- Cached paths: `ios/Pods`, `~/Library/Caches/CocoaPods`
- Reduces iOS build time

**Gradle (Android builds):**
- Cache key: `${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}`
- Cached paths: `~/.gradle/caches`, `~/.gradle/wrapper`, `./app/android/.gradle`
- Reduces Android build time significantly

### TestFlight Deployment

**Workflow:** `.github/workflows/ios-testflight.yml`

**Triggers:** Manual dispatch only with options:
- Version bump type: none, build, patch, minor, major
- Environment: test or production

**GitHub Environment:** `TestFlight` (created)
- Can be configured with required reviewers via GitHub UI
- Settings → Environments → TestFlight → Required reviewers

**Required Secrets in TestFlight Environment:**

The following secrets must be configured in the `TestFlight` GitHub environment (Settings → Secrets and variables → Actions → Environment secrets):

**App Store Connect API Keys:**
- `APP_STORE_CONNECT_API_KEY_ID` - API Key ID from App Store Connect
- `APP_STORE_CONNECT_ISSUER_ID` - Issuer ID from App Store Connect
- `APP_STORE_CONNECT_API_KEY_CONTENT` - Base64-encoded .p8 file content

**iOS Code Signing:**
- `IOS_DISTRIBUTION_CERTIFICATE_P12_BASE64` - Base64-encoded distribution certificate (.p12)
- `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD` - Password for the distribution certificate
- `IOS_PROVISIONING_PROFILE_BASE64` - Base64-encoded provisioning profile (.mobileprovision)
- `PROVISIONING_PROFILE_SPECIFIER` - Name of the provisioning profile (e.g., "SoftwareONE Marketplace Mobile App Store")

**Auth0 Configuration (Test Environment):**
- `AUTH0_DOMAIN_TEST` - Test environment domain (e.g., login-test.pyracloud.com)
- `AUTH0_CLIENT_ID_TEST` - Test environment client ID
- `AUTH0_AUDIENCE_TEST` - Test environment audience (e.g., https://api-test.pyracloud.com/)
- `AUTH0_API_URL_TEST` - Test environment API URL (e.g., https://api.s1.show/public/)

**Auth0 Configuration (Production Environment - Optional):**
- `AUTH0_DOMAIN_PROD` - Production environment domain
- `AUTH0_CLIENT_ID_PROD` - Production environment client ID
- `AUTH0_AUDIENCE_PROD` - Production environment audience
- `AUTH0_API_URL_PROD` - Production environment API URL

**App Configuration:**
- Development Team ID: `47PY6J2KQC` (hardcoded in workflow)
- Bundle ID: `com.softwareone.marketplaceMobile` (hardcoded in workflow)
- App Store App ID: `6752612555` (hardcoded in workflow)

**How to Get These Values:**

1. **App Store Connect API Keys:**
   - Go to App Store Connect → Users and Access → Integrations → App Store Connect API
   - Create a new key with Admin or Developer role
   - Download the .p8 file and base64 encode it: `base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy`
   - Save the Key ID and Issuer ID

2. **Distribution Certificate:**
   - Export from Keychain Access as .p12
   - Base64 encode: `base64 -i certificate.p12 | pbcopy`

3. **Provisioning Profile:**
   - Download from Apple Developer Portal → Certificates, IDs & Profiles → Profiles
   - Base64 encode: `base64 -i profile.mobileprovision | pbcopy`

4. **Recreate Secrets in New Environment:**
   - **Important:** GitHub secrets are read-only and cannot be copied between repositories
   - All secrets must be manually recreated in the `TestFlight` environment
   - Original secret values are available locally (contact team member who has them)
   - Reference secret names from PoC repo: https://github.com/softwareone-platform/mpt-mobile-reactnative-poc/settings/secrets/actions
   - See `.github/TESTFLIGHT_SETUP.md` for complete setup checklist

**Workflow Process:**

1. Manual trigger with version bump selection
2. Runs tests
3. Increments version/build number in app.json
4. Generates native iOS project with Expo prebuild
5. Configures Xcode with Team ID
6. Sets up App Store Connect API authentication
7. Imports distribution certificate into temporary keychain
8. Installs provisioning profile
9. Archives iOS app with Release configuration
10. Exports signed IPA for App Store
11. Uploads to TestFlight via `xcrun altool`
12. Commits incremented build number back to repo
13. Creates git tag for the release
14. Uploads IPA and dSYMs as artifacts (30-day retention)

### SonarCloud Integration

SonarCloud is integrated for code quality analysis and test coverage tracking.

**Configuration:**
- **Organization:** `softwareone-pc`
- **Project Key:** `softwareone-pc_mpt-mobile-platform`
- **Dashboard:** https://sonarcloud.io/project/overview?id=softwareone-pc_mpt-mobile-platform

**How It Works:**
- SonarCloud scan runs automatically on every PR and main branch push
- Analysis includes code quality, bugs, vulnerabilities, code smells, and test coverage
- Results are available in the SonarCloud dashboard
- Configuration is defined in `sonar-project.properties` at the repository root

**Required Secrets:**
- `SONAR_TOKEN`: SonarCloud authentication token (already configured in repository secrets)

**Local Analysis (Optional):**
```bash
# Install sonar-scanner CLI
brew install sonar-scanner

# Run local analysis (requires SONAR_TOKEN environment variable)
SONAR_TOKEN=your-token sonar-scanner
```

**Quality Gate:**
- Quality gate status can be configured as a required check for PR merges
- Configure in GitHub branch protection rules after first successful scan

## Architecture

### Module Aliases

Use path aliases for cleaner imports (configured in `babel.config.js` and `tsconfig.json`):

```typescript
// Available aliases
import { featureFlags } from '@featureFlags';  // src/config/feature-flags/featureFlags
import something from '@config';                // src/config
import '@env';                                  // .env file access
```

### Design System

The project uses a comprehensive design system with design tokens and component styles:

**Design Tokens** (`app/src/styles/tokens/`):
- **Colors**: Brand colors, text colors, background colors, status colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, etc.)
- **Shadows**: Elevation shadows for depth
- **Border Radius**: Consistent corner rounding

**Component Styles** (`app/src/styles/components/`):
- Button styles (primary, secondary, disabled states)
- Input styles (text inputs, OTP input)
- Card styles
- Common layout styles
- OTP verification screen styles

**Usage:**
```typescript
import { colors, typography, spacing } from '@/styles';
import { buttonStyles } from '@/styles/components';

// Use design tokens in StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    padding: spacing.md,
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
  },
});
```

See `app/src/styles/README.md` for comprehensive design system documentation.

### Feature Flags

Feature flags are type-safe and JSON-configured:

```typescript
import { isFeatureEnabled } from '@featureFlags';

// Usage in components
if (isFeatureEnabled('FEATURE_TEST')) {
  // Feature-gated code
}
```

Add new flags in `app/src/config/feature-flags/featureFlags.json`.

### State Management

React Context API for global state management:

**AuthContext** (`app/src/context/AuthContext.tsx`):
- Authentication state (logged in/out)
- User credentials and tokens
- Login/logout methods
- Token refresh handling
- Auth0 integration

**NavigationContext** (`app/src/context/NavigationContext.tsx`):
- Current tab state
- Navigation helpers
- Tab switching logic

**Usage:**
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // Use auth state and methods
}
```

No Redux/MobX - keeping it simple with built-in Context API.

### Navigation

React Navigation v7 with stack and tab-based navigation structure:

**AuthStack** (`app/src/components/navigation/AuthStack.tsx`):
- Welcome screen (email input)
- OTP verification screen
- Handles unauthenticated user flow

**MainTabs** (`app/src/components/navigation/MainTabs.tsx`):
- Bottom tab navigation for authenticated users
- Currently: Spotlight tab (more tabs planned)

**SecondaryTabs** (`app/src/components/navigation/SecondaryTabs.tsx`):
- Nested tabs within Spotlight screen
- Tabs: Agreements, Invoices, Orders, Credit Memos, Statements, Subscriptions
- Top tab bar with Material-style design

**ProfileStack** (`app/src/components/navigation/ProfileStack.tsx`):
- Profile screen
- User settings screen
- Account management flow

**Navigation Flow:**
1. Unauthenticated users → AuthStack (Welcome → OTP)
2. Authenticated users → MainTabs → Spotlight → SecondaryTabs
3. Profile access via AccountToolbarButton → ProfileStack

**Type-Safe Navigation:**
```typescript
// Define navigation types in app/src/types/navigation.ts
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Use typed navigation
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation<NavigationProp<RootStackParamList>>();
```

### API Integration

Axios-based API client with authentication and error handling:

**API Client** (`app/src/lib/apiClient.ts`):
- Axios instance with base configuration
- Request/response interceptors
- Automatic token injection
- Error handling and transformation

**Token Provider** (`app/src/lib/tokenProvider.ts`):
- Retrieves access tokens from AuthContext
- Handles token refresh
- Secure token storage

**useApi Hook** (`app/src/hooks/useApi.ts`):
- Custom hook for API calls
- Handles loading states
- Error handling
- Type-safe responses

**API Services** (`app/src/services/`):
- `authService.ts`: Auth0 authentication methods
- `accountService.ts`: Account management API calls

**Usage:**
```typescript
import { useApi } from '@/hooks/useApi';
import { getAccounts } from '@/services/accountService';

function MyComponent() {
  const { data, loading, error } = useApi(getAccounts);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorView error={error} />;

  return <AccountList accounts={data} />;
}
```

**API Types** (`app/src/types/api.ts`):
- Type definitions for API requests/responses
- Error types
- Account types

### Internationalization (i18n)

i18next integration for multi-language support:

**Configuration** (`app/src/i18n/index.js`):
- i18next setup with react-i18next
- Language detection
- Resource loading

**Translations** (`app/src/i18n/`):
- `en.json`: English translations (default)
- Organized by feature/screen

**Usage:**
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <Text>{t('welcome.title')}</Text>
  );
}
```

**Adding Translations:**
1. Add key-value pairs to `app/src/i18n/en.json`
2. Use the `t()` function to access translations
3. Support for interpolation, pluralization, and formatting

### Environment Configuration

Type-safe environment configuration service:

**Config Service** (`app/src/config/env.config.ts`):
- Centralized environment variable access
- Type-safe configuration getters
- Validation of required variables
- Default values for optional variables

**Usage:**
```typescript
import { getAuth0Config, getApiConfig } from '@/config/env.config';

const auth0Config = getAuth0Config();
// { domain, clientId, audience, scope, apiUrl, otpDigits, scheme }

const apiConfig = getApiConfig();
// { baseUrl, timeout }
```

**Environment Variables** (`.env`):
- Auth0 configuration
- API endpoints
- Feature flags
- See `.env.example` for all available variables

### Platform-Specific Code

Use utility functions for platform detection:

```typescript
import { Platform } from 'react-native';

// For platform-specific logic
if (Platform.OS === 'ios') {
  // iOS-specific code
}

// Use utility functions when available
import { isLiquidGlassSupported } from '@/utils/platformUtils';
```

## Key Conventions

### File Naming
- React components: PascalCase (`UserProfile.tsx`)
- Utilities/helpers: camelCase (`platformUtils.ts`)
- Test files: `*.test.ts` or `*.test.tsx`
- Config files: kebab-case (`feature-flags.json`)
- Context files: PascalCase with `Context` suffix (`AuthContext.tsx`)
- Service files: camelCase with `Service` suffix (`authService.ts`)
- Hook files: camelCase with `use` prefix (`useApi.ts`)

### Import Order
1. React/React Native imports
2. Third-party libraries (navigation, i18n, etc.)
3. Local imports using aliases (@config, @components, etc.)
4. Types/interfaces
5. Styles (design tokens and component styles)

Example:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/context/AuthContext';
import { AuthButton } from '@/components/auth';
import { colors, spacing, typography } from '@/styles';

import type { NavigationProp } from '@/types/navigation';
```

### Component Structure

Follow this structure for React components:

```typescript
// 1. Imports
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Types/Interfaces
interface Props {
  title: string;
  onPress: () => void;
}

// 3. Component
export function MyComponent({ title, onPress }: Props) {
  // Hooks
  const { t } = useTranslation();

  // State
  const [loading, setLoading] = React.useState(false);

  // Effects
  React.useEffect(() => {
    // Effect logic
  }, []);

  // Handlers
  const handlePress = () => {
    onPress();
  };

  // Render
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

// 4. Styles
const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    ...typography.heading1,
    color: colors.text.primary,
  },
});
```

### ESLint Rules
- No unused variables (warning)
- React hooks rules enforced
- No inline styles (warning) - prefer StyleSheet with design tokens
- No color literals (warning) - use design tokens from `@/styles`
- No hardcoded strings (warning) - use i18n translations
- TypeScript over PropTypes
- Prefer named exports over default exports

## Bundle Identifiers

**iOS:** `com.softwareone.marketplaceMobile`
**Android:** `com.softwareone.marketplaceMobile`

These must match Auth0 dashboard configuration.

## Important Notes

1. **New Architecture Enabled**: React 19 with New Architecture (`newArchEnabled: true` in `app.json`)
2. **Design System**: Always use design tokens from `@/styles` instead of hardcoded values
3. **Internationalization**: Use i18n translations (`t()` function) instead of hardcoded strings
4. **Environment Variables**: Use the config service (`@/config/env.config`) for type-safe environment access
5. **API Calls**: Use the `useApi` hook or API client from `@/lib/apiClient` for all HTTP requests
6. **Authentication**: Auth0 is fully integrated - use `useAuth` hook for auth state and methods
7. **Navigation**: Use typed navigation helpers from `@/types/navigation` for type safety
8. **Testing**: Write tests for all new components, utilities, and services
9. **Zscaler Users**: Ensure Zscaler policies are up-to-date for corporate environments
10. **Node Version**: Use Node.js LTS (20.19.4+)
11. **Android Emulator**: Must be running before `npm run android`
12. **iOS Builds**: Require Xcode and iOS Simulator
13. **Version**: Current app version is 4.0.0 (see `app/package.json`)

## Git Workflow

- Main branch: `main`
- Feature branches: `feature/MPT-XXXX/description`
- Infrastructure branches: `infra/mpt-XXXX-description`

**Commit Guidelines:**
- Do NOT include Claude/AI attribution in commit messages (no "Generated with Claude Code" or "Co-Authored-By: Claude")
- Write clear, concise commit messages describing the changes
- Use conventional commit format when appropriate

See `.github/CODEOWNERS` for code review assignments.

## Documentation

- **iOS Build Guide**: `documents/LOCAL_BUILD_IOS.md`
- **Android Build Guide**: `documents/LOCAL_BUILD_ANDROID.md`
- **Main README**: `README.md`

## Current Development Status

**Completed:**

*Infrastructure & Tooling:*
- Project foundation with Expo & React Native
- TypeScript, ESLint, Jest configuration with coverage reporting
- Feature flag system (JSON-based, type-safe)
- Environment configuration service
- Path aliases and module resolution
- Local development scripts (deploy-ios.sh, hot-reload.sh, cleanup.sh)
- CI/CD workflows (PR build, main branch CI, iOS build, iOS TestFlight)
- Dependency caching for npm and CocoaPods

*Design System:*
- Design tokens (colors, typography, spacing, shadows, border radius)
- Component styles (buttons, inputs, cards, OTP input)
- Theme system with comprehensive documentation

*Authentication & Authorization:*
- Auth0 integration with passwordless authentication
- OTP verification flow
- Welcome screen with email input
- Loading states for auth flow
- Auth0 error handling and user feedback
- Token management and refresh
- Secure token storage with expo-secure-store

*Navigation:*
- React Navigation v7 setup
- AuthStack (Welcome → OTP verification)
- MainTabs (bottom tab navigation)
- SecondaryTabs (nested tabs in Spotlight)
- ProfileStack (Profile and User Settings)
- NavigationContext for state management
- Type-safe navigation with TypeScript

*State Management:*
- AuthContext (authentication state, tokens, user profile)
- NavigationContext (tab state and helpers)
- Context-based architecture (no Redux/MobX)

*API Integration:*
- Axios-based API client with interceptors
- Token provider for authentication
- useApi custom hook for data fetching
- API error handling utilities
- Account service for account management
- Type-safe API types

*Screens:*
- Authentication: Welcome, OTP Verification, Loading
- Account: Profile, User Settings
- Spotlight: Main screen with nested tabs
- Spotlight Tabs: Agreements, Invoices, Orders, Credit Memos, Statements, Subscriptions

*Components:*
- Auth components: AuthButton, AuthInput, AuthLayout, OTPInput
- Navigation components: MainTabs, SecondaryTabs, stacks, AccountToolbarButton
- Common components: DynamicIcon, JdenticonIcon, LinearGradient, OutlinedIcon, Avatar
- Tab components: Tabs, TabItem
- List components: ListItemWithImage
- Account components: AccountSummary

*Utilities & Services:*
- Input validation utilities
- API error handling utilities
- Image utilities
- Auth service (Auth0 integration)
- Account service (API integration)

*Internationalization:*
- i18next integration
- English translations (en.json)
- Translation utilities and hooks

*Testing:*
- Jest configuration with coverage reporting
- Test utilities and mocks
- Component tests (OTPInput, screens)
- Service tests (API client, token provider, auth service)
- Utility tests (validation, API errors, image utilities)

**In Progress:**
- Additional main tabs (Search, Chat, Service Desk, Analytics)
- API integration for all services
- Enhanced error handling and retry logic
- Deep linking support

**Planned:**
- Multi-account support
- Real-time data sync
- SonarCloud quality gates enforcement
- Additional language translations
- Offline mode support
- Push notifications
- Biometric authentication
- App analytics and monitoring
