import 'dotenv/config';

const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_SCHEME, APP_BUNDLE_ID } = process.env;

const bundleId = APP_BUNDLE_ID || 'com.softwareone.marketplaceMobile';

export default {
  expo: {
    name: 'SoftwareOne',
    slug: 'softwareone-marketplace-mobile',
    version: '1.3.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
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
    ],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleId,
      buildNumber: '1',
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
        foregroundImage: './assets/android_icon.png',
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
