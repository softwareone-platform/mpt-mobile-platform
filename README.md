# SoftwareONE Marketplace Mobile

The mobile companion for [SoftwareONE Marketplace](https://portal.platform.softwareone.com/home) — manage your cloud subscriptions, orders, invoices, and agreements on the go. Built with React Native and Expo for iOS and Android.

## 🌟 Highlights

- **Passwordless sign-in** — Email + OTP, no passwords to remember
- **Your whole Marketplace in your pocket** — Orders, subscriptions, agreements, invoices, credit memos, statements, programs, and more
- **Spotlight dashboard** — See what matters at a glance
- **Multi-account switching** — Jump between accounts without signing out
- **Cross-platform** — One codebase, native experience on both iOS and Android

## ⬇️ Getting Started

You'll need **Node.js 20+** and either **Xcode** (iOS) or **Android Studio** (Android).

```bash
git clone <repository-url>
cd mpt-mobile-platform

# Set up environment
cp app/.env.example app/.env
# Fill in Auth0 credentials — grab them from Keeper Vault or ask a teammate

# Install and run
cd app
npm install
npm run ios       # or: npm run android
```

That's it. The app should launch in your simulator.

> **Using private `@swo` packages?** Run `npm install -g vsts-npm-auth && vsts-npm-auth -config .npmrc` first.

> **Changed `.env` values?** Clear the Metro cache with `npx expo start --clear`, then rebuild.

## 🚀 Usage

Once running, sign in with your SoftwareONE email. You'll receive a one-time code — enter it and you're in.

From there you can browse your Spotlight dashboard, view and search orders, subscriptions, agreements, invoices, and more — everything you'd find on the [web portal](https://portal.platform.softwareone.com/home), optimized for mobile.

## 🏗️ Project Structure

All source code lives under `app/src/`:

```
app/src/
├── components/       # Reusable UI components
├── screens/          # Screen components (one per route)
├── services/         # API and business logic
├── hooks/            # Custom hooks and query hooks
├── context/          # React Context providers
├── styles/           # Design tokens and component styles
├── i18n/             # Internationalization
├── types/            # TypeScript definitions
├── config/           # App configuration and feature flags
├── lib/              # Core libraries (API client, token provider)
├── constants/        # App-wide constants
└── utils/            # Utility functions
```

## 🛠️ Tech Stack

| | |
|---|---|
| **Framework** | React Native 0.81 · Expo SDK 54 · React 19 (New Architecture) |
| **Language** | TypeScript 5.9 (strict mode) |
| **Navigation** | React Navigation v7 |
| **State** | React Context + TanStack React Query |
| **Auth** | Auth0 (passwordless OTP) |
| **API** | Axios |
| **i18n** | i18next |
| **Testing** | Jest · Appium (E2E) |

## 📋 Development Scripts

Run from the **repository root**. npm commands run from `app/`.

```bash
# Quick start
./scripts/hot-reload.sh              # Dev server with hot reload (press i/a/r)
./scripts/deploy-ios.sh --verbose    # Full iOS Simulator build + deploy

# Build
npm run ios                          # iOS Simulator
npm run android                      # Android emulator

# Quality
npm test                             # Unit tests
npm run lint                         # Lint check
npm run lint:fix                     # Auto-fix lint errors

# Cleanup
./scripts/cleanup.sh                 # Clean build artifacts
./scripts/cleanup.sh --deep          # Nuclear option (removes node_modules)

# E2E
./scripts/run-local-test.sh --platform ios welcome
./scripts/run-local-test.sh --platform android --build all
```

## 🔄 CI/CD

GitHub Actions handle validation and builds automatically.

| Workflow | Trigger | Duration |
|----------|---------|----------|
| **PR Build** | Pull request to `main` | ~2–5 min |
| **Main CI** | Push to `main` | ~25–35 min |
| **iOS / Android Build** | Auto on `main` + manual | ~15–30 min |
| **TestFlight** | Manual only | ~30–45 min |

Every push to `main` runs lint + tests, then builds iOS and Android artifacts in parallel. TestFlight deployment is manual — see the [Deployment Guide](.github/DEPLOYMENT_GUIDE.md) for the full test → QA → prod promotion flow, and [TestFlight Setup](.github/TESTFLIGHT_SETUP.md) for secrets and first-time configuration.

## 💬 Contributing

We welcome contributions! Here's the quick version:

1. Branch off `main`: `feature/MPT-XXXX/short-description`
2. Read [CONVENTIONS.md](CONVENTIONS.md) — it's enforced on every PR
3. Write tests for new code
4. Open a PR with a [Conventional Commits](https://www.conventionalcommits.org/) title (e.g., `feat: add biometric login`)
5. Wait for CI to go green (lint, tests, [SonarCloud](https://sonarcloud.io/project/overview?id=softwareone-pc_mpt-mobile-platform) quality gate)

Found a bug or have an idea? [Open an issue](../../issues) — we'd love to hear from you.

## 📖 Documentation

| Topic | Link |
|-------|------|
| Coding conventions | [CONVENTIONS.md](CONVENTIONS.md) |
| Design system | [app/src/styles/README.md](app/src/styles/README.md) |
| iOS local build | [documents/LOCAL_BUILD_IOS.md](documents/LOCAL_BUILD_IOS.md) |
| Android local build | [documents/LOCAL_BUILD_ANDROID.md](documents/LOCAL_BUILD_ANDROID.md) |
| Logging | [documents/LOGGING.md](documents/LOGGING.md) |
| E2E testing (iOS) | [documents/APPIUM_IOS_TESTING.md](documents/APPIUM_IOS_TESTING.md) |
| E2E testing (Android) | [documents/APPIUM_ANDROID_TESTING.md](documents/APPIUM_ANDROID_TESTING.md) |
| Writing E2E tests | [documents/EXTENDING_TEST_FRAMEWORK.md](documents/EXTENDING_TEST_FRAMEWORK.md) |
| Deployment guide (test/QA/prod) | [.github/DEPLOYMENT_GUIDE.md](.github/DEPLOYMENT_GUIDE.md) |
| TestFlight setup | [.github/TESTFLIGHT_SETUP.md](.github/TESTFLIGHT_SETUP.md) |

## ⚖️ License

Licensed under the [Apache License 2.0](LICENSE).

---

Built with ❤️ by the [SoftwareONE](https://www.softwareone.com/) Marketplace team.
