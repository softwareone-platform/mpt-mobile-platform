const fs = require('fs');
const path = require('path');

const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');

// Release build: block all cleartext, trust system certs only
const NETWORK_SECURITY_CONFIG_MAIN = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>`;

// Debug build: allow cleartext (Metro bundler), trust user certs (Zscaler/corporate proxies)
const NETWORK_SECURITY_CONFIG_DEBUG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="user" />
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>`;

/**
 * Creates the network_security_config.xml file in the Android res/xml folder
 */
function withNetworkSecurityConfigFile(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;

      const mainXmlDir = path.join(platformRoot, 'app', 'src', 'main', 'res', 'xml');
      const debugXmlDir = path.join(platformRoot, 'app', 'src', 'debug', 'res', 'xml');

      fs.mkdirSync(mainXmlDir, { recursive: true });
      fs.mkdirSync(debugXmlDir, { recursive: true });

      fs.writeFileSync(
        path.join(mainXmlDir, 'network_security_config.xml'),
        NETWORK_SECURITY_CONFIG_MAIN,
      );
      fs.writeFileSync(
        path.join(debugXmlDir, 'network_security_config.xml'),
        NETWORK_SECURITY_CONFIG_DEBUG,
      );

      return config;
    },
  ]);
}

/**
 * Adds the networkSecurityConfig attribute to the application tag in AndroidManifest.xml
 */
function withNetworkSecurityConfigManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application?.[0];

    if (application) {
      application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
      application.$['android:allowBackup'] = 'false';
    }

    return config;
  });
}

/**
 * Adds network security config: release blocks cleartext, debug allows it (Metro + Zscaler).
 * Uses Android source sets (src/main vs src/debug) so no runtime flag needed.
 */
module.exports = function withNetworkSecurityConfig(config) {
  config = withNetworkSecurityConfigFile(config);
  config = withNetworkSecurityConfigManifest(config);
  return config;
};
