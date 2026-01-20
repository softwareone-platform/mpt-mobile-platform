# Zscaler Certificate Setup for Android Emulator

When running the app on an Android emulator behind Zscaler (or other corporate SSL inspection proxies), you may encounter network errors like:

```
ERROR  Failed to fetch portal manifest: {"details": undefined, "message": "Network Error", "name": "API Error", "status": null}
```

Or see `NET::ERR_CERT_AUTHORITY_INVALID` errors in the emulator's browser.

## Root Cause

Zscaler intercepts HTTPS traffic for security inspection, using its own SSL certificate. The Android emulator doesn't trust this certificate by default, causing all HTTPS requests to fail.

## Solution

### Project Configuration (Already Done)

The following has been set up in the project:

1. **Expo Config Plugin**: `app/plugins/withNetworkSecurityConfig.js`
   - Automatically generates `network_security_config.xml` during prebuild
   - Configures AndroidManifest.xml to use the network security config
   - Allows debug builds to trust user-installed certificates (for Zscaler)
   - Allows cleartext traffic for Metro bundler

2. **app.config.js** includes the plugin:
   ```javascript
   plugins: [
     // ... other plugins
     './plugins/withNetworkSecurityConfig',
   ],
   ```

This configuration is applied automatically when running `npx expo prebuild` or `npx expo run:android`.

### Steps to Install Zscaler Certificate on Emulator

#### 1. Export the Zscaler Root Certificate from Windows

**Option A: Using PowerShell (Recommended)**

```powershell
# Find and export the Zscaler root certificate
$cert = Get-ChildItem -Path Cert:\LocalMachine\Root | Where-Object { $_.Subject -like "*Zscaler*" } | Select-Object -First 1
$certPath = "$env:USERPROFILE\Downloads\zscaler_root.cer"
Export-Certificate -Cert $cert -FilePath $certPath -Type CERT
Write-Host "Certificate exported to: $certPath"
```

**Option B: Using GUI**

1. Press `Win + R`, type `certmgr.msc`, press Enter
2. Navigate to: **Trusted Root Certification Authorities** → **Certificates**
3. Find the certificate named **Zscaler Root CA** (or similar)
4. Right-click → **All Tasks** → **Export...**
5. Choose **DER encoded binary X.509 (.CER)**
6. Save as `zscaler_root.cer` in your Downloads folder

#### 2. Push Certificate to Emulator

```powershell
adb push "$env:USERPROFILE\Downloads\zscaler_root.cer" /sdcard/Download/zscaler_root.cer
```

#### 3. Install Certificate on Emulator

1. Open **Settings** on the emulator
2. Go to **Security** (or **Security & Privacy**)
3. Tap **Encryption & credentials**
4. Tap **Install a certificate** → **CA certificate**
5. Tap **Install anyway** when warned
6. Navigate to **Downloads** folder
7. Select **zscaler_root.cer**
8. Confirm installation

#### 4. Rebuild the App

If you made changes to `AndroidManifest.xml` or `network_security_config.xml`, rebuild:

```powershell
cd app
npx expo run:android
```

## Verification

After completing these steps:
- The "No internet connection" banner should disappear
- HTTPS sites should load in the emulator's browser
- The app should successfully fetch the portal manifest

## Troubleshooting

### Certificate not showing in Downloads
- Verify the push succeeded: `adb shell ls /sdcard/Download/`
- Try pushing to a different location: `adb push zscaler_root.cer /sdcard/`

### Still getting certificate errors after installation
- Ensure you exported the **root** CA certificate, not an intermediate one
- Try cold booting the emulator after certificate installation
- Verify the network security config is properly linked in AndroidManifest.xml

### App still shows network errors
- Rebuild the app to apply AndroidManifest changes
- Clear app data: Settings → Apps → [Your App] → Clear Data

## Notes

- This setup is for **development/debug builds only**
- The `debug-overrides` in network security config ensure production builds remain secure
- You may need to repeat the certificate installation if you wipe the emulator data
