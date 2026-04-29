# Google Play Deployment Setup Checklist

This document provides step-by-step instructions to set up automated Android deployments to Google Play internal testing.

## Two Workflows: Build vs Deploy

### Android Build Workflow (`.github/workflows/android-build.yml`)
- **Purpose:** Build verification only, NO deployment
- **Use for:** Testing builds, verifying code compiles, creating test artifacts
- **No signing secrets required**
- **Output:** Unsigned Debug APK (7-day retention)

### Android Google Play Workflow (`.github/workflows/android-google-play.yml`)
- **Purpose:** Complete deployment to Google Play internal testing track
- **Use for:** Deploying to testers, release candidates
- **Requires:** Android signing keys + Google Play service account (see below)
- **Output:** Signed AAB (30-day retention) + Google Play internal testing build

---

## Prerequisites

Before starting, ensure:
- [x] Google Play Console account exists (Organization: SoftwareOne, Account ID: `7391522668074010822`)
- [x] Apps created on Google Play Console (one per environment)
- [ ] Organization verification completed (required for publishing and creating 3rd app)

### Google Play Console Apps

| Environment | App Name | Package Name | Play Console App ID | Status |
|-------------|----------|-------------|---------------------|--------|
| `test` | SoftwareOne Marketplace Show | `com.softwareone.marketplaceMobile.show` | `4972295263680711295` | Draft (initial AAB uploaded) |
| `qa` | *(to be created after org verification)* | TBD | — | — |
| `prod` | SoftwareOne Marketplace | `com.softwareone.marketplaceMobile` | `4974790650410287751` | Draft (initial AAB uploaded) |

> **Note:** Each environment maps to a separate app on Google Play with its own package name, just like iOS uses separate apps on App Store Connect.
>
> **Important:** Publishing to any track (including internal testing) is blocked until the organization verification is completed in Google Play Console. The CI/CD workflow will work end-to-end once verification clears.

---

## Step 1: Generate Upload Keystore -- DONE

Each app on Google Play needs a signed upload. Google Play App Signing manages the final signing key — you only need an **upload key**.

A shared upload keystore was generated for all environments. The keystore and credentials are stored as **repository-level** GitHub secrets (shared across all environments, same pattern as iOS signing secrets).

Generate one keystore per app (or share one across environments):

```bash
# Generate upload keystore
keytool -genkeypair \
  -v \
  -storetype JKS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -alias upload \
  -keystore upload-keystore.jks \
  -dname "CN=SoftwareOne, OU=Mobile, O=SoftwareOne, L=Stans, ST=Nidwalden, C=CH"
```

**Important:** Store the keystore file and passwords securely in Keeper Vault. If the upload key is lost, you'll need to contact Google Play support to reset it.

### Base64-encode the keystore for GitHub:

```bash
base64 -i upload-keystore.jks | pbcopy    # macOS (copies to clipboard)
# or
base64 upload-keystore.jks > keystore.b64  # Linux (saves to file)
```

---

## Step 2: Register Upload Key with Google Play -- DONE

> The upload key was automatically registered when the first signed AABs were uploaded to both apps via the Play Console. Google Play App Signing extracted the upload certificate from those AABs.

For **each app** on Google Play Console:

1. Go to **Google Play Console** → Select the app
2. Navigate to **Setup** → **App signing**
3. If prompted, opt in to **Google Play App Signing** (recommended)
4. Under **Upload key**, click **Upload a new upload key**
5. Export the upload certificate from your keystore:
   ```bash
   keytool -export -rfc \
     -keystore upload-keystore.jks \
     -alias upload \
     -file upload-certificate.pem
   ```
6. Upload the `upload-certificate.pem` file

---

## Step 3: Create Google Play Service Account -- DONE

The service account allows the GitHub workflow to upload builds programmatically.

**Current setup:**
- GCP Project: `softwareone-mobile-ci`
- Service account: `play-store-publisher@softwareone-mobile-ci.iam.gserviceaccount.com`
- Service account invited in Google Play Console with release management permissions
- GCP project editors: `halil.karaca@softwareone.com` (owner), `michal.walczak@softwareone.com` (editor)

### 3a. Create a Google Cloud Project (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., `softwareone-mobile-ci`)
3. Enable the **Google Play Android Developer API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Play Android Developer API"
   - Click **Enable**

### 3b. Create Service Account

1. In Google Cloud Console, go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `play-store-publisher` (or similar)
4. Description: "CI/CD service account for publishing to Google Play"
5. Click **Create and Continue**
6. Skip the optional role assignment (permissions are granted in Play Console)
7. Click **Done**

### 3c. Generate Service Account Key

1. Click on the newly created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** format
5. Click **Create** — the JSON file downloads automatically
6. **Store this file securely** — it cannot be re-downloaded

### 3d. Base64-encode the service account JSON:

```bash
base64 -i service-account.json | pbcopy    # macOS
# or
base64 service-account.json > sa.b64       # Linux
```

### 3e. Grant Access in Google Play Console

1. Go to **Google Play Console** → **Users and permissions**
2. Click **Invite new users**
3. Enter the service account email (e.g., `play-store-publisher@softwareone-mobile-ci.iam.gserviceaccount.com`)
4. Under **App permissions**, add each app the service account needs access to
5. For each app, grant these permissions:
   - **Releases** → Manage production and testing track releases
   - **App information** → View app information (read only)
6. Click **Invite user**
7. Click **Send invite**

> **Note:** It may take up to 24 hours for the service account to gain access after invitation.

---

## Step 4: Create Initial AAB Upload (Manual — First Time Only) -- DONE

Google Play requires at least one AAB to be uploaded manually before the API can be used. For each app:

1. Build a signed AAB locally:
   ```bash
   cd app
   npm ci
   cat > .env << 'EOF'
   AUTH0_DOMAIN=login-test.pyracloud.com
   AUTH0_CLIENT_ID=placeholder
   AUTH0_AUDIENCE=https://api-test.pyracloud.com/
   AUTH0_SCOPE=openid profile email offline_access
   AUTH0_API_URL=https://api.s1.show/public/
   AUTH0_OTP_DIGITS=6
   AUTH0_SCHEME=com.softwareone.marketplaceMobile
   LOG_LEVEL=info
   TEMPORARY_AUTH0_TOKEN=
   EOF
   npx expo prebuild --platform android --clean
   ```

2. Configure signing in the generated project (see [LOCAL_BUILD_ANDROID.md](../documents/LOCAL_BUILD_ANDROID.md))

3. Build the AAB:
   ```bash
   cd android && ./gradlew bundleRelease
   ```

4. Go to **Google Play Console** → Select the app → **Internal testing**
5. Click **Create new release**
6. Upload the AAB from `android/app/build/outputs/bundle/release/app-release.aab`
7. Add release notes and click **Save** → **Review release** → **Start rollout**

After this initial manual upload, the automated workflow can handle all subsequent uploads.

---

## Step 5: Configure GitHub Environments -- DONE

### 5a. Create Environments

Environments `test`, `qa`, `prod` already exist (created during iOS setup).

### 5b. Android-Specific Secrets (Repository-Level)

All Android signing and Google Play secrets are stored at the **repository level** (shared across all environments), following the same pattern as iOS signing secrets (`IOS_DISTRIBUTION_CERTIFICATE_*`, `APP_STORE_CONNECT_*`).

#### Android Signing (4 repository secrets)

| Secret | Status |
|--------|--------|
| `ANDROID_KEYSTORE_BASE64` | Configured |
| `ANDROID_KEYSTORE_PASSWORD` | Configured |
| `ANDROID_KEY_ALIAS` | Configured (alias: `upload`) |
| `ANDROID_KEY_PASSWORD` | Configured |

#### Google Play API (1 repository secret)

| Secret | Status |
|--------|--------|
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64` | Configured |

### 5c. Verify Existing Variables

The Android workflow reuses the same environment variables as iOS. Verify these are set for each environment:

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `APP_BUNDLE_ID` | `com.softwareone.marketplaceMobile.show` | **Must match the Google Play app's package name** |
| `AUTH0_DOMAIN` | `login-test.pyracloud.com` | Already set for iOS |
| `AUTH0_AUDIENCE` | `https://api-test.pyracloud.com/` | Already set for iOS |
| `AUTH0_SCOPE` | `openid profile email offline_access` | Already set for iOS |
| `AUTH0_API_URL` | `https://api.s1.show/public/` | Already set for iOS |
| `AUTH0_OTP_DIGITS` | `6` | Already set for iOS |
| `AUTH0_SCHEME` | `com.softwareone.marketplaceMobile.show` | **Must match APP_BUNDLE_ID for Auth0 redirect** |
| `LOG_LEVEL` | `info` | Already set for iOS |

> **Important:** For Android, `APP_BUNDLE_ID` must match the package name of the Google Play app for that environment. If the Android package name differs from the iOS bundle ID, you may need to use a separate variable or adjust the environment configuration.

---

## Step 6: Test the Workflow -- BLOCKED (org verification)

> **Blocker:** Publishing to any track (including internal testing) requires completing the organization verification in Google Play Console. Once verification clears, the workflow can be tested.

Once verification is completed:

1. Go to **Actions** tab
2. Select **Android Google Play Deployment**
3. Click **Run workflow**
4. Configure:
   - Version bump: `none (build)` to test deployment without changing `expo.version`
   - Use `patch`, `minor`, or `major` only when you intentionally want a semantic-version chore PR
   - Environment: `test`
5. Click **Run workflow**
6. Monitor the workflow (~20-30 minutes)
7. Check Google Play Console → Internal testing for the new build

---

## Secrets Summary

### Android-Specific Secrets (repository-level — shared across all environments)

```
ANDROID_KEYSTORE_BASE64                    # Base64-encoded .jks keystore
ANDROID_KEYSTORE_PASSWORD                  # Keystore password
ANDROID_KEY_ALIAS                          # Key alias ("upload")
ANDROID_KEY_PASSWORD                       # Key password
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64    # Base64-encoded service account JSON
```

### Shared with iOS (already configured per environment)

```
AUTH0_CLIENT_ID                            # Auth0 client ID
APPLICATION_INSIGHTS_CONNECTION_STRING     # App Insights (optional)
REVIEW_ENV_AUTH0_CLIENT_ID                 # Reviewer Auth0 client ID
```

**Total new secrets: 5 at repository level**

---

## Common Issues and Solutions

**Issue: "Upload failed 403: The caller does not have permission"**
- The service account may not have been granted access in Google Play Console
- Wait up to 24 hours after inviting the service account
- Verify the service account email in Play Console → Users and permissions

**Issue: "Upload failed 403: APK specifies a version code that has already been used"**
- Android `versionCode` is generated from `github.run_number + ANDROID_VERSION_CODE_OFFSET`
- Confirm the generated value is higher than any versionCode already consumed in Google Play
- If the Play Console floor is higher than the generated value, increase `ANDROID_VERSION_CODE_OFFSET` in `.github/workflows/android-google-play.yml` before retrying

**Issue: "Upload failed 400: The Android App Bundle was not signed"**
- Verify `ANDROID_KEYSTORE_BASE64` is correctly base64-encoded
- Verify `ANDROID_KEY_ALIAS` matches the alias used when generating the keystore
- Verify passwords are correct

**Issue: "Token error 401: invalid_grant"**
- The service account JSON key may be invalid or expired
- Regenerate the key in Google Cloud Console and update the secret

**Issue: "Package not found" or "App not found"**
- The `APP_BUNDLE_ID` in the environment variables must exactly match the package name on Google Play
- The app must have at least one manual AAB upload before the API can be used

**Issue: Build fails with "Keystore was tampered with, or password was incorrect"**
- Verify the base64 encoding is correct (no extra whitespace or newlines)
- Re-encode: `base64 -i upload-keystore.jks` (no line wrapping)

---

## Keeper Vault Reference

Store all credentials in the shared Keeper Vault:

```
Keeper > Mobile App > Android
├── Upload Keystore
│   ├── upload-keystore.jks (file)
│   ├── Keystore Password
│   ├── Key Alias
│   └── Key Password
└── Google Play Service Account
    └── service-account.json (file)

Keeper > Mobile App > test > APP_BUNDLE_ID (Android)
Keeper > Mobile App > qa > APP_BUNDLE_ID (Android)
Keeper > Mobile App > prod > APP_BUNDLE_ID (Android)
```

---

## Related Documentation

- [Deployment Guide (Test/QA/Prod)](DEPLOYMENT_GUIDE.md) — promotion flow for both iOS and Android
- [TestFlight Setup](TESTFLIGHT_SETUP.md) — iOS deployment setup (parallel reference)
- [Android Google Play Workflow](workflows/android-google-play.yml) — the workflow source
- [Local Android Build](../documents/LOCAL_BUILD_ANDROID.md) — local development setup
