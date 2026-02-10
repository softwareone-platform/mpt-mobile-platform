const fs = require('fs');
const path = require('path');

const { withDangerousMod } = require('expo/config-plugins');

/**
 * Expo config plugin that adds an explicit ios-marketing entry to the AppIcon asset catalog.
 *
 * Expo SDK 54 generates a single "universal" entry in Contents.json which works for device
 * icons but App Store Connect requires an explicit "ios-marketing" idiom to extract the
 * 1024x1024 marketing icon shown on the Apps listing and Distribution pages.
 */
module.exports = function withAppStoreIcon(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const appIconSetPath = path.join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName,
        'Images.xcassets',
        'AppIcon.appiconset',
      );

      const contentsPath = path.join(appIconSetPath, 'Contents.json');

      if (!fs.existsSync(contentsPath)) {
        console.warn('withAppStoreIcon: Contents.json not found, skipping');
        return config;
      }

      const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));

      const hasMarketingIcon = contents.images.some((img) => img.idiom === 'ios-marketing');

      if (hasMarketingIcon) {
        return config;
      }

      const universalIcon = contents.images.find(
        (img) => img.idiom === 'universal' && img.size === '1024x1024',
      );

      if (!universalIcon || !universalIcon.filename) {
        console.warn('withAppStoreIcon: No universal 1024x1024 icon found, skipping');
        return config;
      }

      contents.images.push({
        filename: universalIcon.filename,
        idiom: 'ios-marketing',
        scale: '1x',
        size: '1024x1024',
      });

      fs.writeFileSync(contentsPath, JSON.stringify(contents, null, 2));

      return config;
    },
  ]);
};
