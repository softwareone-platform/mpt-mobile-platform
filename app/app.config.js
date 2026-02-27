import 'dotenv/config';

const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_SCHEME, APP_BUNDLE_ID, APP_ENVIRONMENT } = process.env;

const bundleId = APP_BUNDLE_ID || 'com.softwareone.marketplaceMobile';

// Determine asset paths based on environment (test, qa, or prod)
const assetPath =
  APP_ENVIRONMENT && APP_ENVIRONMENT !== 'prod' ? `./assets/${APP_ENVIRONMENT}` : './assets';
const iconPath = `${assetPath}/icon.png`;
const androidIconPath = `${assetPath}/android_icon.png`;

export default {
  expo: {
    name: 'SoftwareOne',
    slug: 'softwareone-marketplace-mobile',
    version: '1.4.1',
    orientation: 'portrait',
    icon: iconPath,
    scheme: AUTH0_SCHEME,
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    plugins: [
      [
        'react-native-auth0',
        {
          domain: AUTH0_DOMAIN,
          clientId: AUTH0_CLIENT_ID,
          customScheme: AUTH0_SCHEME,
        },
      ],
      './plugins/withNetworkSecurityConfig',
      './plugins/withAppStoreIcon',
    ],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleId,
      buildNumber: '6',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
      adaptiveIcon: {
        foregroundImage: androidIconPath,
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: bundleId,
    },
    web: {
      favicon: './assets/favicon.png',
    },
  },
};
