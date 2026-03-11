# TestFlight Deployment Setup Checklist

This document provides step-by-step instructions to complete the TestFlight deployment setup.

## Two Workflows: Build vs Deploy

This project separates iOS building from TestFlight deployment:

### iOS Build Workflow (`.github/workflows/ios-build.yml`)
- **Purpose:** Build verification only, NO deployment
- **Use for:** Testing builds, verifying code compiles, creating test artifacts
- **No secrets required**
- **Faster:** ~20-30 minutes
- **Output:** Unsigned .app file (7-day retention)

### iOS TestFlight Workflow (`.github/workflows/ios-testflight.yml`)
- **Purpose:** Complete deployment to TestFlight
- **Use for:** Deploying to testers, release candidates
- **Requires:** TestFlight environment secrets (see below)
- **Longer:** ~30-45 minutes
- **Output:** Signed IPA + dSYMs (30-day retention) + TestFlight build

## ✅ Completed

- [x] Created `TestFlight` GitHub environment
- [x] Created iOS Build workflow for verification (`.github/workflows/ios-build.yml`)
- [x] Created iOS TestFlight deployment workflow (`.github/workflows/ios-testflight.yml`)
- [x] Configured npm and CocoaPods caching
- [x] Documented all required secrets
- [x] Updated README.md and CLAUDE.md with deployment instructions
- [x] Separated build verification from deployment for cost optimization

## 📋 Required Actions

### 1. Configure Secrets in TestFlight Environment

All secrets must be added to the `TestFlight` GitHub environment (not repository secrets).

**How to add secrets:**
1. Go to: https://github.com/softwareone-platform/mpt-mobile-platform/settings/environments
2. Click on **TestFlight** environment
3. Scroll to **Environment secrets**
4. Click **Add secret** for each secret below

**Important Note on Secrets:**
- GitHub secrets are read-only and cannot be copied between repositories
- All secrets must be recreated in the new TestFlight environment
- The original secret values are available locally (contact team for access)
- Reference PoC repository for secret names: https://github.com/softwareone-platform/mpt-mobile-reactnative-poc/settings/secrets/actions

**Required Secrets List:**

#### App Store Connect API (3 secrets)
```
APP_STORE_CONNECT_API_KEY_ID
APP_STORE_CONNECT_ISSUER_ID
APP_STORE_CONNECT_API_KEY_CONTENT
```

#### iOS Code Signing (4 secrets)
```
IOS_DISTRIBUTION_CERTIFICATE_P12_BASE64
IOS_DISTRIBUTION_CERTIFICATE_PASSWORD
IOS_PROVISIONING_PROFILE_BASE64
PROVISIONING_PROFILE_SPECIFIER
```

#### Auth0 - Test Environment (4 secrets)
```
AUTH0_DOMAIN_TEST
AUTH0_CLIENT_ID_TEST
AUTH0_AUDIENCE_TEST
AUTH0_API_URL_TEST
```

#### Auth0 - Production Environment (4 secrets - Optional)
```
AUTH0_DOMAIN_PROD
AUTH0_CLIENT_ID_PROD
AUTH0_AUDIENCE_PROD
AUTH0_API_URL_PROD
```

#### Reviewer Environment (5 variables/secrets)

These variables support dynamic environment switching for App Store reviewers.
On lower environments (test, qa), `REVIEWER_EMAILS` should be empty.
On prod, set `REVIEWER_EMAILS` to the designated reviewer email(s).
The `REVIEW_ENV_*` values should correspond with the QA environment.

**Variables (public):**
```
REVIEW_ENV_AUTH0_DOMAIN
REVIEW_ENV_AUTH0_AUDIENCE
REVIEW_ENV_AUTH0_API_URL
REVIEWER_EMAILS              # comma-separated list of reviewer email addresses
```

**Secrets (encrypted):**
```
REVIEW_ENV_AUTH0_CLIENT_ID
```

#### Logging Configuration (1 variable per environment)

**Variables (public):**
```
LOG_LEVEL                    # debug, info, warn, or error
```

**Recommended values per environment:**

| Environment | `LOG_LEVEL` | Rationale |
|-------------|-------------|-----------|
| `test`      | `info`      | Standard logging |
| `qa`        | `info`      | Standard logging |
| `prod`      | `info`      | Standard logging |

> **Note:** Can be changed per environment to `debug`, `warn`, or `error` as needed. See `app/.env.example` for all options.

**Keeper Vault reference:**
Store these values in the shared Keeper Vault under the mobile app's environment config:
- `Keeper > Mobile App > test > LOG_LEVEL` → `info`
- `Keeper > Mobile App > qa > LOG_LEVEL` → `info`
- `Keeper > Mobile App > prod > LOG_LEVEL` → `info`

**Total: 21 secrets/variables required**

### 2. (Optional) Configure Environment Protection Rules

To require manual approval before deployment:

1. Go to: https://github.com/softwareone-platform/mpt-mobile-platform/settings/environments
2. Click on **TestFlight** environment
3. Under **Deployment protection rules**:
   - Check **Required reviewers**
   - Add users who should approve deployments (CODEOWNERS)
   - Recommended: Add at least one senior developer or team lead
4. Under **Deployment branches**:
   - Select **Protected branches only** to only allow deployments from `main`
5. Click **Save protection rules**

### 3. Verify Workflow Configuration

Before first deployment, verify these values in `.github/workflows/ios-testflight.yml`:

```yaml
env:
  NODE_VERSION: '20'                                    # ✅ Correct
  XCODE_VERSION: '16.0'                                 # ✅ Update if needed
  APP_BUNDLE_ID: 'com.softwareone.marketplaceMobile'   # ✅ Correct
  DEVELOPMENT_TEAM: '47PY6J2KQC'                        # ✅ Correct
  APP_STORE_APP_ID: '6752612555'                        # ✅ Correct (same as Flutter app)
```

### 4. Test the Workflow

Once secrets are configured:

1. Go to **Actions** tab
2. Select **iOS TestFlight Deployment**
3. Click **Run workflow**
4. Configure:
   - Version bump: `build` (safest for first test)
   - Environment: `test`
5. Click **Run workflow**
6. Monitor the workflow execution (~30-45 minutes)
7. Check for any errors in the logs
8. Verify the build appears in App Store Connect → TestFlight after 10-15 minutes

### 5. Common Issues and Solutions

**Issue: "Failed to create API key file"**
- Solution: Verify `APP_STORE_CONNECT_API_KEY_CONTENT` is correctly base64-encoded

**Issue: "Certificate import failed"**
- Solution: Verify `IOS_DISTRIBUTION_CERTIFICATE_P12_BASE64` is correctly base64-encoded
- Verify `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD` is correct

**Issue: "Provisioning profile not found"**
- Solution: Verify `PROVISIONING_PROFILE_SPECIFIER` exactly matches the profile name
- Verify `IOS_PROVISIONING_PROFILE_BASE64` is correctly base64-encoded

**Issue: "Upload to TestFlight failed"**
- Solution: Check App Store Connect API key permissions (should be Admin or Developer)
- Verify `APP_STORE_CONNECT_ISSUER_ID` is correct

## 📱 After First Successful Deployment

1. **Verify in App Store Connect:**
   - Go to: https://appstoreconnect.apple.com/apps/6752612555/testflight/ios
   - Confirm the build appears
   - Check for any processing errors

2. **Add Internal Testers:**
   - Go to TestFlight → Internal Testing
   - Add testers from your organization
   - Provide release notes

3. **Test the App:**
   - Download TestFlight app on iOS device
   - Install and test the build
   - Report any issues

4. **Monitor Future Deployments:**
   - Each deployment creates a git tag (e.g., `v4.0.0-build123`)
   - Build number auto-increments in `app.json`
   - IPA and dSYMs available as artifacts for 30 days

## 🔗 Useful Links

- **TestFlight Environment:** https://github.com/softwareone-platform/mpt-mobile-platform/settings/environments
- **Actions Tab:** https://github.com/softwareone-platform/mpt-mobile-platform/actions
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6752612555
- **PoC Secrets (for copying):** https://github.com/softwareone-platform/mpt-mobile-reactnative-poc/settings/secrets/actions

## 📚 Documentation

- Deployment guide (test → QA → prod): [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Workflow file: [ios-testflight.yml](workflows/ios-testflight.yml)
- README: [README.md](../README.md#-cicd)

## ✨ Next Steps After Setup

Once TestFlight deployment is working:

1. Consider setting up external testing groups
2. Implement automated release notes from git commits
3. Consider notification integration (Slack, Teams) for successful deployments
4. Document internal testing procedures
5. Plan production App Store submission workflow (separate from TestFlight)
