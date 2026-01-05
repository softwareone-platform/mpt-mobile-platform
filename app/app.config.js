import 'dotenv/config';

const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_SCHEME } = process.env;

export default {
  expo: {
    name: 'SoftwareOne',
    slug: 'softwareone-marketplace-mobile',
    version: '1.3.0',
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
    ],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.softwareone.marketplaceMobile',
      buildNumber: '5',
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
      package: 'com.softwareone.marketplaceMobile',
    },
    web: {
      favicon: './assets/favicon.png',
    },
  },
};
