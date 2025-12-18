# CI/CD Workflow Alignment Plan

This document outlines the plan for bringing all GitHub Actions workflows in line with the reference implementations (`ios-build-and-test.yml` and `android-build-and-test.yml`), adding ReportPortal integration, and documenting required GitHub secrets.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Workflow Inventory](#current-workflow-inventory)
3. [Reference Architecture](#reference-architecture)
4. [Alignment Plan by Workflow](#alignment-plan-by-workflow)
5. [ReportPortal Integration](#reportportal-integration)
6. [Required GitHub Secrets](#required-github-secrets)
7. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

### Scope

**In Scope (to be updated):**
- `ios-build-and-test.yml` - iOS end-to-end pipeline
- `android-build-and-test.yml` - Android e2e (Ubuntu)
- `android-build-and-test-windows.yml` - Android e2e (Windows)
- Composite actions: `ios-test`, `android-test`, `android-test-windows`

**Out of Scope (no changes):**
- `ios-build.yml` - Build-only, keep as-is
- `android-build.yml` - Build-only, keep as-is
- `ios-expo-and-test.yml` - Different pattern, keep as-is
- `ios-testflight.yml` - Production deployment, keep as-is
- `main-ci.yml` - Orchestration, keep as-is
- `pr-build.yml` - PR validation, keep as-is
- `reusable-build-test.yml` - Shared validation, keep as-is

### Reference Workflows (Gold Standard)

| Workflow | Purpose | Features |
|----------|---------|----------|
| `ios-build-and-test.yml` | iOS end-to-end pipeline | Build → Artifact → Release → Install → Test |
| `android-build-and-test.yml` | Android e2e (Ubuntu) | Build → Artifact → Release → Install → Test |
| `android-build-and-test-windows.yml` | Android e2e (Windows) | Build → Artifact → Release → Install → Test |

### Key Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Build & Test Workflow                      │
├─────────────────────────────────────────────────────────────┤
│  Job 1: Build                                                │
│   ├── Checkout → Setup Node/Java → Install → Test → Build   │
│   ├── Create .env with Auth0 config                          │
│   ├── Upload artifact                                        │
│   └── Create release asset                                   │
├─────────────────────────────────────────────────────────────┤
│  Job 2: Install and Test                                     │
│   ├── Checkout                                               │
│   ├── Composite Action: {platform}-install                   │
│   │    └── Download artifact → Setup emulator → Install app  │
│   └── Composite Action: {platform}-test                      │
│        └── Setup Appium → Run WDIO tests → Upload results    │
└─────────────────────────────────────────────────────────────┘
```

---

## Current Workflow Inventory

### In Scope - Build & Test Workflows

| File | Status | Action Required |
|------|--------|----------------|
| `ios-build-and-test.yml` | ✅ Reference | Add ReportPortal integration |
| `android-build-and-test.yml` | ✅ Reference | Add ReportPortal + remove temp trigger |
| `android-build-and-test-windows.yml` | ✅ Reference | Add ReportPortal + remove temp trigger |

### Out of Scope - No Changes

| File | Status | Reason |
|------|--------|--------|
| `ios-build.yml` | 🔒 Excluded | Build-only workflow, serves different purpose |
| `android-build.yml` | 🔒 Excluded | Build-only workflow, serves different purpose |
| `ios-expo-and-test.yml` | 🔒 Excluded | Uses different approach (deploy-ios.sh) |
| `ios-testflight.yml` | 🔒 Excluded | Production deployment workflow |
| `ios-external-test-example.yml` | 🔒 Excluded | Example/demo workflow |
| `main-ci.yml` | 🔒 Excluded | Orchestration workflow |
| `pr-build.yml` | 🔒 Excluded | PR validation workflow |
| `reusable-build-test.yml` | 🔒 Excluded | Shared validation workflow |

### Composite Actions

| Action | Platform | Purpose |
|--------|----------|---------|
| `ios-install/action.yml` | iOS | Download artifact, setup simulator, install app |
| `ios-test/action.yml` | iOS | Setup Appium, run WDIO tests |
| `android-install/action.yml` | Android/Ubuntu | Download artifact, setup emulator, install APK |
| `android-test/action.yml` | Android/Ubuntu | Setup Appium, run WDIO tests |
| `android-install-windows/action.yml` | Android/Windows | Download artifact, setup emulator, install APK |
| `android-test-windows/action.yml` | Android/Windows | Setup Appium, run WDIO tests |

---

## Reference Architecture

### Input Parameters (Standardized)

All build-and-test workflows should support:

```yaml
inputs:
  environment:
    description: 'Environment (test/staging/production)'
    default: 'test'
  build-mode:
    description: 'Build configuration (Debug/Release)'
    default: 'Release'
  # Platform-specific
  platform-version:      # iOS: '26.0', Android: API level '34'
  device-name:           # iOS: 'iPhone 16', Android: 'pixel_6'
```

### Triggers (Standardized)

```yaml
on:
  workflow_dispatch:     # Manual trigger with inputs
  workflow_call:         # Reusable workflow support
```

### Environment Strategy

- Use `environment: ${{ inputs.environment || 'test' }}` on test jobs
- Secrets are pulled from GitHub Environments (test/staging/prod)
- `.env` file created with Auth0 config from secrets

---

## Alignment Plan by Workflow

### 1. `ios-build-and-test.yml` - HIGH PRIORITY

**Current State:** Complete iOS pipeline with composite actions

**Changes Completed:**
- ✅ Added `report-to-portal` workflow input
- ✅ Pass ReportPortal secrets to `ios-test` composite action

---

### 2. `android-build-and-test.yml` - HIGH PRIORITY

**Current State:** Complete Android pipeline (Ubuntu) with composite actions

**Changes Completed:**
- ✅ Added `report-to-portal` workflow input
- ✅ Pass ReportPortal secrets to `android-test` composite action

**Pending (before merge):**
- ⏳ Remove temporary push trigger for feature branch

---

### 3. `android-build-and-test-windows.yml` - HIGH PRIORITY

**Current State:** Complete Android pipeline (Windows) with composite actions

**Changes Completed:**
- ✅ Added `report-to-portal` workflow input
- ✅ Pass ReportPortal secrets to `android-test-windows` composite action

**Pending (before merge):**
- ⏳ Remove temporary push trigger for feature branch

---

---

## ReportPortal Integration

### Overview

ReportPortal configuration is already implemented in `wdio.conf.js`:

```javascript
reporters: [
  'spec',
  ['junit', { ... }],
  // Conditional ReportPortal reporter
  ...(process.env.REPORT_PORTAL_API_KEY && process.env.REPORT_PORTAL_API_KEY !== 'value not set' ? [
    [Reporter, {
      apiKey: process.env.REPORT_PORTAL_API_KEY,
      endpoint: (process.env.REPORT_PORTAL_ENDPOINT || 'http://localhost:8080') + '/api/v2',
      project: process.env.REPORT_PORTAL_PROJECT || 'default_personal',
      launch: process.env.REPORT_PORTAL_LAUNCH_NAME || 'Appium Tests Launch',
      description: process.env.REPORT_PORTAL_LAUNCH_DESCRIPTION || '...',
      // ... other options
    }]
  ] : [])
]
```

### Required Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `REPORT_PORTAL_API_KEY` | Yes* | API key for authentication | - |
| `REPORT_PORTAL_ENDPOINT` | No | ReportPortal server URL | `http://localhost:8080` |
| `REPORT_PORTAL_PROJECT` | No | Project name in ReportPortal | `default_personal` |
| `REPORT_PORTAL_LAUNCH_NAME` | No | Launch name for test run | `Appium Tests Launch` |
| `REPORT_PORTAL_LAUNCH_DESCRIPTION` | No | Description for launch | Default description |

*If `REPORT_PORTAL_API_KEY` is not set or is `'value not set'`, ReportPortal reporting is disabled.

### Step 1: Update Composite Actions

Add ReportPortal inputs to all test composite actions:

**File: `.github/actions/ios-test/action.yml`**
```yaml
inputs:
  # ... existing inputs ...
  
  # ReportPortal Configuration (Optional)
  report_portal_api_key:
    description: 'ReportPortal API key (leave empty to disable)'
    required: false
    default: ''
  report_portal_endpoint:
    description: 'ReportPortal server endpoint'
    required: false
    default: 'https://reportportal.your-domain.com'
  report_portal_project:
    description: 'ReportPortal project name'
    required: false
    default: 'mpt-mobile'
  report_portal_launch_name:
    description: 'Name for the test launch'
    required: false
    default: 'iOS Appium Tests'
```

**Add to the test execution step:**
```yaml
- name: Run Appium Tests
  shell: bash
  working-directory: ./app
  env:
    # ... existing env vars ...
    
    # ReportPortal Configuration
    REPORT_PORTAL_API_KEY: ${{ inputs.report_portal_api_key }}
    REPORT_PORTAL_ENDPOINT: ${{ inputs.report_portal_endpoint }}
    REPORT_PORTAL_PROJECT: ${{ inputs.report_portal_project }}
    REPORT_PORTAL_LAUNCH_NAME: ${{ inputs.report_portal_launch_name }}
    REPORT_PORTAL_LAUNCH_DESCRIPTION: "iOS ${{ inputs.device_name }} (${{ inputs.ios_version }}) - ${{ github.sha }}"
  run: |
    npx wdio wdio.conf.js --suite welcome
```

### Step 2: Update Workflow Files

**File: `ios-build-and-test.yml`**
```yaml
on:
  workflow_dispatch:
    inputs:
      # ... existing inputs ...
      
      report-to-portal:
        description: 'Send results to ReportPortal'
        required: false
        type: boolean
        default: false

jobs:
  install-and-test-ios:
    steps:
      - name: Test iOS App
        uses: ./.github/actions/ios-test
        with:
          # ... existing inputs ...
          
          # ReportPortal (conditional on input)
          report_portal_api_key: ${{ inputs.report-to-portal && secrets.REPORT_PORTAL_API_KEY || '' }}
          report_portal_endpoint: ${{ secrets.REPORT_PORTAL_ENDPOINT || 'https://reportportal.softwareone.com' }}
          report_portal_project: ${{ secrets.REPORT_PORTAL_PROJECT || 'mpt-mobile' }}
          report_portal_launch_name: 'iOS Appium Tests - ${{ inputs.build-mode }}'
```

### Step 3: Apply Same Pattern to All Test Actions

Apply the same pattern to:
- `.github/actions/android-test/action.yml`
- `.github/actions/android-test-windows/action.yml`

And corresponding workflow files:
- `android-build-and-test.yml`
- `android-build-and-test-windows.yml`

---

## Required GitHub Secrets

### Repository-Level Secrets

These secrets should be configured at the repository level:

| Secret Name | Purpose | Required By |
|-------------|---------|-------------|
| `SONAR_TOKEN` | SonarCloud authentication | PR builds, main CI |
| `REPORT_PORTAL_API_KEY` | ReportPortal authentication | All test workflows |

### Repository-Level Variables

These variables should be configured at the repository level (not secrets):

| Variable Name | Purpose | Example Value |
|---------------|---------|---------------|
| `REPORT_PORTAL_ENDPOINT` | ReportPortal server URL | `https://reportportal.softwareone.com` |
| `REPORT_PORTAL_PROJECT` | ReportPortal project name | `mpt-mobile` |

### Environment-Level Secrets (per environment: test, staging, prod)

These secrets should be configured in GitHub Environments:

| Secret Name | Purpose | Required By |
|-------------|---------|-------------|
| `AUTH0_CLIENT_ID` | Auth0 application ID | All build workflows |
| `AUTH0_CLIENT_ID_TEST` | Auth0 test environment ID | Test builds (legacy) |
| `AIRTABLE_EMAIL` | Email for OTP testing | All test workflows |
| `AIRTABLE_API_TOKEN` | Airtable API authentication | All test workflows |
| `AIRTABLE_BASE_ID` | Airtable database ID | All test workflows |
| `AIRTABLE_TABLE_NAME` | Airtable table for OTP | All test workflows |
| `AIRTABLE_FROM_EMAIL` | Expected sender email | All test workflows |

### iOS Signing Secrets (Repository Level)

| Secret Name | Purpose | Required By |
|-------------|---------|-------------|
| `APPLE_CERTIFICATE` | P12 certificate (base64) | TestFlight deployments |
| `APPLE_CERTIFICATE_PASSWORD` | Certificate password | TestFlight deployments |
| `APPLE_PROVISIONING_PROFILE` | Provisioning profile (base64) | TestFlight deployments |
| `APPLE_API_KEY_ID` | App Store Connect API | TestFlight deployments |
| `APPLE_API_KEY_ISSUER_ID` | App Store Connect issuer | TestFlight deployments |
| `APPLE_API_PRIVATE_KEY` | App Store Connect key | TestFlight deployments |

### Complete Secrets Checklist

```
📁 Repository Secrets
├── SONAR_TOKEN
├── REPORT_PORTAL_API_KEY
├── REPORT_PORTAL_ENDPOINT
├── REPORT_PORTAL_PROJECT
├── APPLE_CERTIFICATE
├── APPLE_CERTIFICATE_PASSWORD
├── APPLE_PROVISIONING_PROFILE
├── APPLE_API_KEY_ID
├── APPLE_API_KEY_ISSUER_ID
└── APPLE_API_PRIVATE_KEY

📁 Environment: test
├── AUTH0_CLIENT_ID (or AUTH0_CLIENT_ID_TEST)
├── AIRTABLE_EMAIL
├── AIRTABLE_API_TOKEN
├── AIRTABLE_BASE_ID
├── AIRTABLE_TABLE_NAME
└── AIRTABLE_FROM_EMAIL

📁 Environment: staging
├── AUTH0_CLIENT_ID
├── AIRTABLE_EMAIL
├── AIRTABLE_API_TOKEN
├── AIRTABLE_BASE_ID
├── AIRTABLE_TABLE_NAME
└── AIRTABLE_FROM_EMAIL

📁 Environment: prod
└── AUTH0_CLIENT_ID
```

---

## Implementation Checklist

### Phase 1: ReportPortal Integration (Priority: HIGH)

- [x] **1.1** Add ReportPortal inputs to `ios-test/action.yml`
- [x] **1.2** Add ReportPortal inputs to `android-test/action.yml`
- [x] **1.3** Add ReportPortal inputs to `android-test-windows/action.yml`
- [x] **1.4** Update `ios-build-and-test.yml` with ReportPortal option
- [x] **1.5** Update `android-build-and-test.yml` with ReportPortal option
- [x] **1.6** Update `android-build-and-test-windows.yml` with ReportPortal option
- [ ] **1.7** Configure GitHub secrets for ReportPortal *(manual step - see below)*
- [ ] **1.8** Test ReportPortal integration end-to-end *(manual step)*

### Phase 2: Pre-Merge Cleanup (Priority: HIGH)

- [ ] **2.1** Remove temporary push trigger from `android-build-and-test.yml` *(kept for now - remove before merge)*
- [ ] **2.2** Remove temporary push trigger from `android-build-and-test-windows.yml` *(kept for now - remove before merge)*

### Phase 3: Documentation (Priority: LOW)

- [ ] **3.1** Update README with workflow usage instructions
- [ ] **3.2** Document secret configuration in team wiki

---

## Manual Steps Required

### GitHub Secrets to Configure

You need to add these secrets in your GitHub repository settings:

**Navigate to:** Repository → Settings → Secrets and variables → Actions

#### Repository Secrets (add these):

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `REPORT_PORTAL_API_KEY` | API key from ReportPortal | `your-api-key-uuid` |
#### Repository Variables (add these):

**Navigate to:** Repository → Settings → Secrets and variables → Actions → Variables tab

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|| `REPORT_PORTAL_ENDPOINT` | ReportPortal server URL | `https://reportportal.your-domain.com` |
| `REPORT_PORTAL_PROJECT` | Project name in ReportPortal | `mpt-mobile` |

#### Verify Existing Secrets:

Ensure these secrets are already configured:

| Secret Name | Where |
|-------------|-------|
| `AUTH0_CLIENT_ID_TEST` | Repository or `test` environment |
| `AIRTABLE_EMAIL` | `test` environment |
| `AIRTABLE_API_TOKEN` | `test` environment |
| `AIRTABLE_BASE_ID` | `test` environment |
| `AIRTABLE_TABLE_NAME` | `test` environment |
| `AIRTABLE_FROM_EMAIL` | `test` environment |
| `SONAR_TOKEN` | Repository |

### How to Get ReportPortal Credentials

1. Log in to your ReportPortal instance
2. Go to **User Profile** → **API Keys**
3. Generate a new API key or copy existing one
4. The endpoint is your ReportPortal URL (e.g., `https://reportportal.softwareone.com`)
5. The project name is visible in the URL when you're in a project

### Testing the Integration

1. Go to **Actions** tab in GitHub
2. Select **iOS Build and Appium Tests** or **Android Build and Appium Tests**
3. Click **Run workflow**
4. Check the **Send test results to ReportPortal** checkbox
5. Run the workflow and verify results appear in ReportPortal

---

## Appendix: Environment Variable Reference

### wdio.conf.js Environment Variables

| Variable | Source | Default |
|----------|--------|---------|
| `PLATFORM_NAME` | Workflow | `iOS` |
| `DEVICE_NAME` | Workflow input | `iPhone 16` / `Pixel 8` |
| `PLATFORM_VERSION` | Workflow input | `26.0` / `14` |
| `DEVICE_UDID` | Install action output | - |
| `APP_BUNDLE_ID` | Build output | `com.softwareone.marketplaceMobile` |
| `APP_PACKAGE` | Build output | `com.softwareone.marketplaceMobile` |
| `APP_ACTIVITY` | Hardcoded | `.MainActivity` |
| `APPIUM_HOST` | Action default | `localhost` / `127.0.0.1` |
| `APPIUM_PORT` | Action default | `4723` |
| `AIRTABLE_EMAIL` | Secret | - |
| `AIRTABLE_API_TOKEN` | Secret | - |
| `AIRTABLE_BASE_ID` | Secret | - |
| `AIRTABLE_TABLE_NAME` | Secret | - |
| `AIRTABLE_FROM_EMAIL` | Secret | - |
| `REPORT_PORTAL_API_KEY` | Secret | - |
| `REPORT_PORTAL_ENDPOINT` | Secret | `http://localhost:8080` |
| `REPORT_PORTAL_PROJECT` | Secret | `default_personal` |
| `REPORT_PORTAL_LAUNCH_NAME` | Workflow | `Appium Tests Launch` |
| `REPORT_PORTAL_LAUNCH_DESCRIPTION` | Workflow | Generated |

---

*Document created: Based on analysis of current workflow structure and wdio.conf.js configuration*
