const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Debug builds: trust user-installed certificates (for corporate proxies like Zscaler) -->
    <debug-overrides>
        <trust-anchors>
            <certificates src="user" />
            <certificates src="system" />
        </trust-anchors>
    </debug-overrides>
    
    <!-- Allow cleartext for local development (Metro bundler) -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">localhost</domain>
        <domain includeSubdomains="false">127.0.0.1</domain>
        <domain includeSubdomains="false">10.0.2.2</domain>
    </domain-config>
    
    <!-- Base config: allow cleartext in debug for Metro -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
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
      const xmlDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml'
      );

      // Create xml directory if it doesn't exist
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      const filePath = path.join(xmlDir, 'network_security_config.xml');
      fs.writeFileSync(filePath, NETWORK_SECURITY_CONFIG);

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
    }

    return config;
  });
}

/**
 * Combined plugin that adds network security configuration for:
 * - Trusting user-installed certificates (for Zscaler/corporate proxies)
 * - Allowing cleartext traffic for Metro bundler in development
 */
module.exports = function withNetworkSecurityConfig(config) {
  config = withNetworkSecurityConfigFile(config);
  config = withNetworkSecurityConfigManifest(config);
  return config;
};
