const { withAppBuildGradle } = require('@expo/config-plugins');

const withAuth0ManifestPlaceholders = (config, { auth0Domain, auth0Scheme }) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('manifestPlaceholders')) {
      // Already added
      return config;
    }

    // Find defaultConfig block and add manifestPlaceholders
    const manifestPlaceholdersCode = `
        manifestPlaceholders = [
            auth0Domain: "${auth0Domain}",
            auth0Scheme: "${auth0Scheme}"
        ]`;

    // Insert after buildConfigField line in defaultConfig
    config.modResults.contents = config.modResults.contents.replace(
      /(buildConfigField "String", "REACT_NATIVE_RELEASE_LEVEL".*\n)/,
      `$1${manifestPlaceholdersCode}\n`
    );

    return config;
  });
};

module.exports = withAuth0ManifestPlaceholders;
