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
- **API & Data Fetching**: `axios`, `@tanstack/react-query`
- **State Management**: React Context API + TanStack React Query
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
│   │   ├── common/             # Common components (DynamicIcon, Avatar, EmptyState, etc.)
│   │   ├── filters/            # Filter components for Spotlight
│   │   ├── tabs/               # Tab components
│   │   ├── tab-item/           # Tab item components
│   │   ├── navigation-item/    # Navigation item components
│   │   ├── list-item/          # List item components
│   │   ├── list/               # List components (ListView)
│   │   ├── avatar/             # Avatar components
│   │   ├── account-summary/    # Account summary components
│   │   ├── card/               # Card components
│   │   ├── chip/               # Chip components
│   │   └── details/            # Details components
│   ├── config/                 # Configuration files
│   │   ├── feature-flags/      # Feature flag system (JSON-based, type-safe)
│   │   ├── env.config.ts       # Environment configuration service
│   │   ├── list.ts             # List configuration
│   │   └── queryClient.ts      # TanStack Query client configuration
│   ├── context/                # React Context providers (AuthContext, NavigationContext,
│   │   │                        # AccountContext, InvoicesContext, OrdersContext,
│   │   │                        # SubscriptionsContext, AgreementsContext, StatementsContext,
│   │   │                        # BillingContext, UsersContext, ProgramContext, etc.)
│   ├── screens/                # Screen components
│   │   ├── auth/               # Auth screens (Welcome, OTP verification)
│   │   ├── account/            # Account screens (Profile, Personal Information)
│   │   ├── settings/           # Settings screens
│   │   ├── spotlight/          # Spotlight screen
│   │   ├── loading/            # Loading screen
│   │   ├── agreements/         # Agreements screen
│   │   ├── invoices/           # Invoices screen
│   │   ├── orders/             # Orders screen
│   │   ├── credit-memos/       # Credit memos screen
│   │   ├── statements/         # Statements screen
│   │   ├── subscriptions/      # Subscriptions screen
│   │   ├── programs/           # Programs screen
│   │   └── users/              # Users screen
│   ├── services/               # API and business logic services
│   │   │                        # authService, accountService, billingService,
│   │   │                        # agreementService, orderService, subscriptionService,
│   │   │                        # userService, programService, featureFlagsService, etc.
│   ├── lib/                    # Core libraries
│   │   ├── apiClient.ts        # Axios API client
│   │   └── tokenProvider.ts    # Token management
│   ├── hooks/                  # Custom React hooks
│   │   ├── useApi.ts           # API hook for data fetching
│   │   ├── useFeatureFlags.ts  # Feature flags hook
│   │   └── queries/            # TanStack React Query hooks
│   │       │                    # usePortalVersion, useSpotlightData, useUserData,
│   │       │                    # useInvoicesData, useOrdersData, useAgreementsData,
│   │       │                    # useSubscriptionsData, useStatementsData, usePaginatedQuery, etc.
│   ├── styles/                 # Design system and styles
│   │   ├── tokens/             # Design tokens (colors, typography, spacing, shadows)
│   │   ├── components/         # Component styles
│   │   └── theme/              # Theme configuration
│   ├── i18n/                   # Internationalization
│   │   ├── en/                 # English translations (split by feature)
│   │   └── index.js            # i18next configuration
│   ├── types/                  # TypeScript type definitions
│   │   │                        # navigation, api, billing, agreement, order,
│   │   │                        # subscription, program, spotlight, lists, icons
│   ├── constants/              # App constants
│   │   │                        # auth, api, icons, links, spotlight, status
│   ├── utils/                  # Utility functions
│   │   │                        # validation, apiError, image, formatting,
│   │   │                        # testID, platformUtils, timer, list, account, etc.
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

**Available test suites:** `welcome`, `home`, `navigation`, `spotlight`, `profile`, `personalInformation`, `orders`, `subscriptions`, `agreements`, `logout`

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
- Auto-increments version/build number based on selection
- Creates git tags for releases
- Creates PR for version bump (branch protection friendly)
- Requires TestFlight + target environment secrets

**Reusable Workflow** (`.github/workflows/reusable-build-test.yml`)
- Shared build and test logic
- npm dependency caching
- ESLint validation
- Jest tests with coverage
- Coverage artifact upload

**E2E Testing Workflows:**
- `android-build-and-test.yml` - Build Android + run Appium E2E tests on emulator
- `ios-build-and-test.yml` - Build iOS + run Appium E2E tests on simulator
- `ios-expo-and-test.yml` - Expo-based iOS build + E2E tests
- `*-external-test-example.yml` - Example templates for external test runs

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

**Required Secrets/Variables in Target Environment (test/prod):**

Auth0 configuration is stored in the target environment (test or prod), not in TestFlight:

**Secrets:**
- `AUTH0_CLIENT_ID` - Auth0 client ID for the environment

**Variables:**
- `AUTH0_DOMAIN` - Auth0 domain (e.g., login-test.pyracloud.com)
- `AUTH0_AUDIENCE` - API audience (e.g., https://api-test.pyracloud.com/)
- `AUTH0_API_URL` - API base URL (e.g., https://api.s1.show/public/)
- `AUTH0_SCOPE` - OAuth scopes (e.g., openid profile email offline_access)
- `AUTH0_OTP_DIGITS` - Number of OTP digits (e.g., 6)
- `AUTH0_SCHEME` - URL scheme for Auth0 callback

**Reviewer Environment Variables (per environment):**

Used for dynamic environment switching for App Store reviewers. The `REVIEW_ENV_*` values should correspond with the QA environment. On lower environments (test, qa), `REVIEWER_EMAILS` should be empty. On prod, set it to designated reviewer email(s).

- `REVIEW_ENV_AUTH0_DOMAIN` - Auth0 domain for reviewer environment (variable)
- `REVIEW_ENV_AUTH0_CLIENT_ID` - Auth0 client ID for reviewer environment (secret)
- `REVIEW_ENV_AUTH0_AUDIENCE` - API audience for reviewer environment (variable)
- `REVIEW_ENV_AUTH0_API_URL` - API base URL for reviewer environment (variable)
- `REVIEWER_EMAILS` - Comma-separated list of reviewer email addresses (variable)

**App Configuration (Hardcoded in Workflow):**
- Development Team ID: `47PY6J2KQC`
- Bundle ID: `com.softwareone.marketplaceMobile`
- App Store App ID: `6752612555`
- Provisioning Profile Specifier: `SoftwareONE Marketplace Mobile App Store`

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

1. Manual trigger with version bump selection (none, build, patch, minor, major)
2. Runs tests
3. Increments version/build number in app.config.js based on selection
4. Generates native iOS project with Expo prebuild
5. Configures Xcode with Team ID
6. Sets up App Store Connect API authentication
7. Imports distribution certificate into temporary keychain
8. Installs provisioning profile
9. Archives iOS app with Release configuration
10. Exports signed IPA for App Store
11. Uploads to TestFlight via `xcrun altool`
12. Creates a PR with the version bump (for merging back to main)
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

The project uses a two-layer style architecture (see [CONVENTIONS.md](CONVENTIONS.md#style-patterns) for full details):

```
@/styles/tokens/     →  Design tokens (Color, Spacing, Typography)
        ↓
@/styles/components/ →  Shared component styles (buttonStyle, screenStyle)
        ↓
Components/Screens   →  Import shared styles, never use tokens directly
```

**Design Tokens** (`app/src/styles/tokens/`):
- **Colors**: Brand colors, text colors, background colors, status colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, etc.)
- **Shadows**: Elevation shadows for depth
- **Border Radius**: Consistent corner rounding

**Component Styles** (`app/src/styles/components/`):
- Button styles, Input styles, Card styles
- Screen and layout styles
- List and navigation styles

**Usage in components:**
```typescript
// ✅ Correct - import from shared styles only
import { buttonStyle, screenStyle } from '@/styles/components';

const styles = StyleSheet.create({
  button: buttonStyle.authPrimary,
  container: screenStyle.containerCenterContent,
});

// ❌ Incorrect - don't use design tokens directly in components
import { Color, Spacing } from '@/styles/tokens';  // Don't do this!
```

See `app/src/styles/README.md` for comprehensive design system documentation.

### Feature Flags

Version-aware feature flags controlled by portal version (automatically fetched from backend):

```typescript
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const { isEnabled } = useFeatureFlags();
if (isEnabled('FEATURE_ACCOUNT_TABS')) {
  // Enabled only for portal v5+
}
```

Add new flags in `app/src/config/feature-flags/featureFlags.json`.

### State Management

React Context API for global state + TanStack React Query for server state:

**Contexts** (`app/src/context/`):
- `AuthContext.tsx` - Authentication state, tokens, login/logout, Auth0 integration
- `NavigationContext.tsx` - Tab state, navigation helpers
- `AccountContext.tsx` - Account selection and management
- `AgreementsContext.tsx`, `InvoicesContext.tsx`, `OrdersContext.tsx` - Billing data
- `SubscriptionsContext.tsx`, `StatementsContext.tsx` - Subscription and statement data
- `BuyersContext.tsx`, `LicenseeContext.tsx`, `UsersContext.tsx` - User-related data
- `ProgramContext.tsx`, `EnrollmentContext.tsx`, `BillingContext.tsx` - Program and enrollment data

**TanStack React Query** (`app/src/hooks/queries/`):
- `usePaginatedQuery.ts` - Reusable paginated query hook
- `useUserData.ts`, `useUserAccountsData.ts`, `useUsersData.ts` - User queries
- `useAgreementsData.ts`, `useInvoicesData.ts`, `useOrdersData.ts` - Billing queries
- `useCreditMemosData.ts`, `useCreditMemoDetailsData.ts`, `useStatementsData.ts` - Credit/statement queries
- `useSubscriptionsData.ts`, `useLicenseesData.ts`, `userBuyersData.ts` - Subscription/buyer queries
- `useProgramsData.ts`, `useSpotlightData.ts`, `usePortalVersion.ts` - Program/spotlight queries
- `useSwitchAccount.ts` - Account switching mutation

**Usage:**
```typescript
import { useAuth } from '@/context/AuthContext';
import { useUserData } from '@/hooks/queries/useUserData';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { data, isLoading, error } = useUserData();
  // Use auth state, methods, and server data
}
```

No Redux/MobX - using Context API for client state and TanStack Query for server state.

### Navigation

React Navigation v7 with stack and tab-based navigation structure:

**AuthStack** (`app/src/components/navigation/AuthStack.tsx`):
- Welcome screen (email input)
- OTP verification screen
- Handles unauthenticated user flow

**MainTabs** (`app/src/components/navigation/MainTabs.tsx`):
- Bottom tab navigation for authenticated users
- Tabs: Spotlight, Orders, Subscriptions, More (→ secondary tabs)

**SecondaryTabs** (`app/src/components/navigation/SecondaryTabs.tsx`):
- Nested tabs accessed via "More" tab
- Tabs: Agreements, Credit Memos, Invoices, Statements, Users, Programs, Enrollments, Licensees, Buyers
- Top tab bar with Material-style design

**ProfileStack** (`app/src/components/navigation/ProfileStack.tsx`):
- Profile screen
- User settings screen
- Account management flow

**Navigation Flow:**
1. Unauthenticated users → AuthStack (Welcome → OTP)
2. Authenticated users → MainTabs (Spotlight/Orders/Subscriptions/More)
3. More tab → SecondaryTabs (Agreements, Credit Memos, etc.)
4. Profile access via AccountToolbarButton → ProfileStack

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
- `authService.ts`, `auth0ErrorParsingService.ts` - Auth0 authentication
- `accountService.ts`, `userService.ts` - Account and user management
- `agreementService.ts`, `billingService.ts`, `orderService.ts` - Billing/orders
- `subscriptionService.ts`, `licenseeService.ts`, `buyerService.ts` - Subscriptions/licenses
- `programService.ts`, `enrollmentService.ts` - Programs and enrollment
- `portalVersionService.ts`, `featureFlagsService.ts` - Config services
- `credentialStorageService.ts` - Secure credential storage
- `api/` - Low-level API utilities

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

**Translations** (`app/src/i18n/en/`):
- Split by feature: `auth.json`, `billing.json`, `home.json`, `marketplace.json`, `navigation.json`, `program.json`, `settings.json`, `shared.json`, `status.json`, `details.json`
- `index.ts` - Aggregates all translation files

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
1. Add key-value pairs to appropriate file in `app/src/i18n/en/` (e.g., `billing.json`, `settings.json`)
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

> **📖 Full documentation:** See [CONVENTIONS.md](CONVENTIONS.md) for complete coding standards.

**Quick summary:**
- **File naming:** PascalCase components, camelCase utils/hooks, kebab-case configs
- **Imports:** React → Third-party → Internal (with `@/` aliases)
- **Styles:** Import from `@/styles/components`, never use design tokens directly in components
- **Exports:** Default for components, named for hooks/utils
- **TypeScript:** Interface for props (`ComponentNameProps`), type for unions
- **Console:** Only `console.error()`, `console.warn()`, `console.info()` — `console.log()` is banned
- **Promises:** Must handle all promises (await, .then(), or void)
- **Equality:** Use `===` and `!==`, never `==` or `!=`

## Bundle Identifiers

**iOS:** `com.softwareone.marketplaceMobile`
**Android:** `com.softwareone.marketplaceMobile`

These must match Auth0 dashboard configuration.

## Important Notes

1. **New Architecture Enabled**: React 19 with New Architecture (`newArchEnabled: true` in `app.json`)
2. **Design System**: Import styles from `@/styles/components`, never use design tokens directly in components (see [CONVENTIONS.md](CONVENTIONS.md#style-patterns))
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
13. **Version**: Current app version is 1.3.2 (see `app/app.config.js`)

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
- MainTabs (Spotlight, Orders, Subscriptions, More)
- SecondaryTabs (Agreements, Credit Memos, Invoices, Statements, Users, Programs, Enrollments, Licensees, Buyers)
- ProfileStack (Profile and User Settings)
- NavigationContext for state management
- Type-safe navigation with TypeScript

*State Management:*
- AuthContext (authentication state, tokens, user profile)
- AccountContext (current account, user data, account switching)
- NavigationContext (tab state and helpers)
- Feature contexts: InvoicesContext, OrdersContext, SubscriptionsContext, AgreementsContext, StatementsContext, ProgramContext, UsersContext, BillingContext
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
- Account: Profile, Personal Information
- Settings: Licensees, Buyers
- Programs: Programs, Enrollments
- Spotlight: Main screen with filters
- Secondary Tabs: Agreements, Invoices, Credit Memos, Statements, Users
- Main Tabs: Orders, Subscriptions

*Components:*
- Auth components: AuthButton, AuthInput, AuthLayout, OTPInput, LegalFooter
- Navigation components: MainTabs, SecondaryTabs, stacks, AccountToolbarButton
- Common components: DynamicIcon, JdenticonIcon, LinearGradientHorizontal, OutlinedIcon, AnimatedIcon, EmptyState, EmptyStateHelper
- Filter components: Spotlight filters for data filtering
- Tab components: Tabs, TabItem
- List components: ListView, ListItemWithImage
- Card and Chip components
- Details components for detail screens
- Account components: AccountSummary

*Data Fetching:*
- TanStack React Query integration with usePaginatedQuery
- Query hooks: usePortalVersion, useSpotlightData, useUserData, useUserAccountsData, useSwitchAccount
- Data hooks: useInvoicesData, useOrdersData, useAgreementsData, useSubscriptionsData, useStatementsData, useProgramsData, useUsersData, useCreditMemosData
- Account switching functionality

*Utilities & Services:*
- Input validation, formatting, platformUtils, testID utilities
- API error handling utilities
- Image utilities
- Services: authService, accountService, billingService, agreementService, orderService, subscriptionService, userService, programService, featureFlagsService, portalVersionService

*Internationalization:*
- i18next integration
- English translations (split by feature in en/ folder)
- Translation utilities and hooks

*Testing:*
- Jest configuration with coverage reporting
- Test utilities and mocks
- Component tests (OTPInput, screens)
- Service tests (API client, token provider, auth service)
- Utility tests (validation, API errors, image utilities)
- E2E testing with Appium (iOS and Android)
- Windows testing support for Android

*Legal & Compliance:*
- Terms of use and privacy policy links
- Export compliance (ITSAppUsesNonExemptEncryption)

**In Progress:**
- Enhanced error handling and retry logic
- Deep linking support

**Planned:**
- Real-time data sync
- Additional language translations
- Offline mode support
- Push notifications
- Biometric authentication
- App analytics and monitoring
