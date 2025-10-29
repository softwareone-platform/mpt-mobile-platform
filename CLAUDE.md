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
2. **Biometrics in Expo Go**: Disabled during Expo Go development, enabled in production builds
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

**In Progress:**
- Auth0 integration
- Navigation implementation
- Core screens and components

**Planned:**
- State management (Context API)
- API service layer
- Multi-account support
- Real-time data sync
