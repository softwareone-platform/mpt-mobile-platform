# CLAUDE.md — Project Context for AI Assistants

## Common Mistakes & Confusion Points

The role of this file is to describe common mistakes and confusion points that agents might encounter as they work in this project. If you ever encounter something in the project that surprises you, please alert the developer working with you and indicate that this is the case in this file to help prevent future agents from having the same issue.

**Don't memorize this file — use tools instead:**
- Project structure → `list_dir`, `file_search`
- Dependencies → read `app/package.json`
- Existing patterns → read a similar file in the same directory
- CI/CD details → read `.github/workflows/` files
- TestFlight setup → read `.github/TESTFLIGHT_SETUP.md`
- E2E testing → read `documents/APPIUM_*.md` and `documents/EXTENDING_TEST_FRAMEWORK.md`
- Design system details → read `app/src/styles/README.md`

**Read CONVENTIONS.md before writing or reviewing code.** It is the source of truth for all coding patterns, validated on every PR.

---

## Common Mistakes & Confusion Points

These are non-obvious things that will cause PR failures or broken builds:

### Style System: Two-Layer Rule (Most Common Mistake)
Components must import from `@/styles/components/`, **never** from `@/styles/tokens/` directly. Tokens are only used inside `app/src/styles/components/*.ts` files.
```typescript
// ✅ In a component or screen
import { buttonStyle, screenStyle } from '@/styles/components';

// ❌ WRONG — will fail code review
import { Color, Spacing } from '@/styles/tokens';
```

### Logging: Use `logger.*`, Not `console.*`
`console.log` is banned by ESLint. Use the logger service:
```typescript
import { logger } from '@/services/loggerService';
logger.error('message', error, { operation: 'context' });
logger.warn('message');
logger.info('message');
logger.trace('message');
```
See `documents/LOGGING.md` for full details.

### Hardcoded Fallback Strings
Never use literal `'-'` or similar. Use the shared constant:
```typescript
import { EMPTY_VALUE } from '@/constants/common';
<Text>{data.name || EMPTY_VALUE}</Text>
```

### Import Order Is Enforced by ESLint
Do NOT manually reorder imports. If lint passes, the order is correct. The ESLint `import/order` rule enforces: React → Third-party → Internal (`@/` aliases).

### i18n: No Hardcoded User-Facing Strings
All user-facing text must use `t()` from `react-i18next`. Translation files are split by domain in `app/src/i18n/en/`. Place keys in the most specific file (e.g., billing keys in `billing.json`, not `shared.json`).

### Route Params: Null-Check When Type Is `undefined`
When a screen's param type is `undefined`, always null-check `route.params` before accessing. See CONVENTIONS.md for the full table.

### Backend Returns 404 for Unauthorized Access
The backend masks 401/403 as 404 to prevent resource enumeration. Don't add special handling for 401/403 on resource endpoints — treat 404 as "not found or no permission."

### Feature Flags Are Version-Gated
Feature flags in `app/src/config/feature-flags/featureFlags.json` are controlled by portal version fetched from the backend, not simple booleans. Use `useFeatureFlags()` hook.

### Promises Must Be Handled
ESLint enforces `@typescript-eslint/no-floating-promises`. Every promise needs `await`, `.then()`, or explicit `void`.

### SonarCloud New Code Coverage ≥ 80%
PRs must maintain ≥ 80% coverage on new code. `.tsx` component files are excluded from coverage requirements. See CONVENTIONS.md for full quality gate details.

---

## Architecture Decisions (Non-Obvious)

These are deliberate choices — don't "fix" them:

- **No Redux/MobX** — React Context for client state, TanStack React Query for server state
- **New Architecture enabled** — React 19 with `newArchEnabled: true` in app.config.js
- **Class singletons for non-React services** (e.g., `authService.ts`), hook-based services for anything needing React context (e.g., `useBillingApi`)
- **Path aliases**: `@/*` → `src/*`, `@featureFlags` → feature flags module, `@env` → `.env` access. Configured in both `tsconfig.json` and `babel.config.js` (must stay in sync)
- **Bundle ID**: `com.softwareone.marketplaceMobile` (iOS and Android) — must match Auth0 dashboard

---

## Development Commands

All commands run from the **repository root** unless noted. Prerequisites: `.env` file in `app/` directory.

```bash
# iOS Simulator deploy (full native build)
./scripts/deploy-ios.sh --verbose
./scripts/deploy-ios.sh --simulator "iPhone 15 Pro" --logs

# Hot reload (fastest iteration)
./scripts/hot-reload.sh              # then press i/a/r
./scripts/hot-reload.sh --clear      # clear cache first

# Manual (from app/ directory)
npm run ios                          # full native iOS build
npm run android                      # full native Android build
npm start                            # Expo Go (limited native features)

# Testing
npm test                             # all tests
npm test -- --watch                  # watch mode
npm test -- path/to/file.test.ts     # specific file

# Linting
npm run lint                         # check
npm run lint:fix                     # auto-fix
npm run lint:check                   # zero warnings (CI mode)

# Cleanup
./scripts/cleanup.sh                 # standard
./scripts/cleanup.sh --deep          # removes node_modules

# E2E (Appium)
./scripts/run-local-test.sh --platform ios welcome
./scripts/run-local-test.sh --platform android --build all
```

### Environment Setup

Copy `.env.example` to `app/.env` and configure Auth0 variables. Get values from team or Keeper Vault.

Private `@swo` packages require Azure DevOps auth:
```bash
npm install -g vsts-npm-auth && vsts-npm-auth -config .npmrc
```

---

## Git Workflow

- Branch naming: `feature/MPT-XXXX/description` or `infra/mpt-XXXX-description`
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`, etc.
- **PR titles must follow the convention** — GitHub squash-merge uses the PR title as the commit message
- **No AI attribution** in commits (no "Co-Authored-By: Claude" or similar)
- See CONVENTIONS.md for the full list of allowed types and rules

---

## Key Files to Read on Demand

| When you need...                    | Read this                                        |
| ----------------------------------- | ------------------------------------------------ |
| Coding patterns & conventions       | `CONVENTIONS.md`                                 |
| Design system tokens & styles       | `app/src/styles/README.md`                       |
| Navigation structure                | `app/src/components/navigation/`                 |
| API services & types                | `app/src/services/` and `app/src/types/`         |
| Feature flag definitions            | `app/src/config/feature-flags/featureFlags.json` |
| CI/CD workflows                     | `.github/workflows/`                             |
| TestFlight deployment               | `.github/TESTFLIGHT_SETUP.md`                    |
| iOS local build                     | `documents/LOCAL_BUILD_IOS.md`                   |
| Android local build                 | `documents/LOCAL_BUILD_ANDROID.md`               |
| E2E test setup                      | `documents/APPIUM_*.md`                          |
| Writing E2E tests                   | `documents/EXTENDING_TEST_FRAMEWORK.md`          |
| Logging                             | `documents/LOGGING.md`                           |
