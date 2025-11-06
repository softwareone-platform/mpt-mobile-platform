# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MPT Mobile Platform is a React Native Expo mobile application for iOS and Android, featuring Auth0 authentication and cross-platform navigation. The project is in early development stages with foundational infrastructure in place.

**Tech Stack:**
- React Native 0.81.4 with Expo SDK 54
- React 19.1.0 with New Architecture enabled
- TypeScript 5.9.2 (strict mode)
- Jest for testing

## Project Structure

All source code lives in the `app/` directory:

```
app/
├── src/
│   ├── config/feature-flags/    # Feature flag system (JSON-based, type-safe)
│   ├── utils/                   # Utility functions
│   └── __tests__/               # Test files (colocated with source)
├── assets/                      # Static assets (icons, splash screens)
├── App.tsx                      # Root component
├── index.ts                     # Expo entry point
└── [config files]               # babel, jest, eslint, tsconfig, metro
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

**Available Options:**
- `-c, --client-id ID`: Auth0 client ID (if not in .env)
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
- **Automatically builds iOS app** after validation succeeds
- Ensures main branch always has working iOS build
- Creates iOS .app artifact (7-day retention)
- Uses Ubuntu for validation, macOS-14 for iOS build

**iOS Build Workflow** (`.github/workflows/ios-build.yml`)
- **Triggers:** Manual dispatch OR called by main-ci.yml
- Uses macOS-14 runners
- **Purpose:** Build verification WITHOUT TestFlight deployment
- Builds iOS app in Debug or Release mode
- Creates unsigned build for verification
- Uploads .app artifact (7-day retention)
- Does NOT deploy to TestFlight
- Does NOT increment version numbers
- **Automatically runs on main branch** after validation passes
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

### Running iOS Builds

**When iOS Build runs automatically:**
- **Every push to `main` branch** (after validation passes)
- Ensures main branch always has working iOS build
- Creates .app artifact for every main branch commit

**When to trigger iOS Build manually:**
- Testing if code compiles for iOS on feature branches
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

**Key Differences:**

| Feature | iOS Build | iOS TestFlight |
|---------|-----------|----------------|
| **Trigger** | Auto on `main` + Manual | Manual only |
| **Purpose** | Verification only | Full deployment |
| **Code Signing** | No (unsigned) | Yes (App Store) |
| **TestFlight Upload** | No | Yes |
| **Version Bump** | No | Yes |
| **Git Tag** | No | Yes |
| **Artifact Retention** | 7 days | 30 days |
| **Requires Secrets** | No | Yes (TestFlight env) |
| **Duration** | ~20-30 min | ~30-45 min |
| **Runs on Main** | ✅ Always | ❌ Never |

### Caching Strategy

**npm dependencies:**
- Cache key: `${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}`
- Cached paths: `node_modules`, `~/.npm`
- Speeds up builds significantly

**CocoaPods (iOS builds):**
- Cache key: `${{ runner.os }}-pods-${{ hashFiles('**/Podfile.lock') }}`
- Cached paths: `ios/Pods`, `~/Library/Caches/CocoaPods`
- Reduces iOS build time

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

### Future: SonarCloud Integration

Test coverage thresholds will be enforced via SonarCloud (planned).

## Architecture

### Module Aliases

Use path aliases for cleaner imports (configured in `babel.config.js` and `tsconfig.json`):

```typescript
// Available aliases
import { featureFlags } from '@featureFlags';  // src/config/feature-flags/featureFlags
import something from '@config';                // src/config
import '@env';                                  // .env file access
```

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

### State Management (Planned)

React Context API will be used for global state:
- **AuthContext**: Authentication state, tokens, user profile
- **AppContext**: App-wide settings (theme, language)

No Redux/MobX - keeping it simple with built-in Context.

### Navigation (Planned)

React Navigation v7 with tab-based structure:
- 5 main tabs: Spotlight, Search, Chat, Service Desk, Analytics
- Stack navigators within tabs for nested screens
- Auth flow guards (logged-out vs. logged-in screens)

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

### Import Order
1. React/React Native imports
2. Third-party libraries
3. Local imports (use aliases)
4. Types/interfaces
5. Styles

### ESLint Rules
- No unused variables (warning)
- React hooks rules enforced
- No inline styles (warning) - prefer StyleSheet
- No color literals (warning) - use design tokens/constants
- TypeScript over PropTypes

## Bundle Identifiers

**iOS:** `com.softwareone.marketplaceMobile`
**Android:** `com.softwareone.marketplaceMobile`

These must match Auth0 dashboard configuration.

## Important Notes

1. **New Architecture Enabled**: React 19 with New Architecture (`newArchEnabled: true` in `app.json`)
3. **Zscaler Users**: Ensure Zscaler policies are up-to-date for corporate environments
4. **Node Version**: Use Node.js LTS (20.19.4+)
5. **Android Emulator**: Must be running before `npm run android`
6. **iOS Builds**: Require Xcode and iOS Simulator

## Git Workflow

- Main branch: `main`
- Feature branches: `feature/MPT-XXXX/description`
- Infrastructure branches: `infra/mpt-XXXX-description`

See `.github/CODEOWNERS` for code review assignments.

## Documentation

- **iOS Build Guide**: `documents/LOCAL_BUILD_IOS.md`
- **Android Build Guide**: `documents/LOCAL_BUILD_ANDROID.md`
- **Main README**: `README.md`

## Current Development Status

**Completed:**
- Project foundation with Expo & React Native
- TypeScript, ESLint, Jest configuration
- Feature flag system
- Environment setup
- Path aliases and module resolution
- Local development scripts (deploy-ios.sh, hot-reload.sh, cleanup.sh)
- CI/CD workflows (PR build, main branch CI, iOS build)
- Dependency caching for npm and CocoaPods

**In Progress:**
- Auth0 integration
- Navigation implementation
- Core screens and components

**Planned:**
- State management (Context API)
- API service layer
- Multi-account support
- Real-time data sync
- SonarCloud integration
- App Store Connect deployment automation
