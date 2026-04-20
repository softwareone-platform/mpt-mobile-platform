/**
 * Injects release signing configuration into the Expo-generated build.gradle.
 *
 * Run after `expo prebuild --platform android` to enable release signing.
 *
 * Usage:
 *   node configure-android-signing.js <path-to-build.gradle>
 */
const fs = require('fs');

const gradlePath = process.argv[2] || 'android/app/build.gradle';

if (!fs.existsSync(gradlePath)) {
  console.error(`build.gradle not found at: ${gradlePath}`);
  process.exit(1);
}

let content = fs.readFileSync(gradlePath, 'utf8');

// Add release signing config inside signingConfigs block
const releaseConfig = `
        release {
            if (project.hasProperty('UPLOAD_STORE_FILE')) {
                storeFile file(UPLOAD_STORE_FILE)
                storePassword UPLOAD_STORE_PASSWORD
                keyAlias UPLOAD_KEY_ALIAS
                keyPassword UPLOAD_KEY_PASSWORD
            }
        }`;

// Insert after the opening of signingConfigs {
content = content.replace(
  /(signingConfigs\s*\{)/,
  '$1' + releaseConfig,
);

// Point release buildType to our release signing config
content = content.replace(
  /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.\w+/,
  '$1signingConfig signingConfigs.release',
);

fs.writeFileSync(gradlePath, content);
console.log('Release signing config injected into build.gradle');
