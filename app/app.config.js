import 'dotenv/config';

const {
  AUTH0_DOMAIN,
  AUTH0_SCHEME,
} = process.env;

export default {
  expo: {
    name: "SoftwareOne",
    slug: "softwareone-marketplace-mobile",
    version: "4.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: AUTH0_SCHEME,
    userInterfaceStyle: "light",
    newArchEnabled: true,
    plugins: [
      [
        "react-native-auth0",
        {
          domain: AUTH0_DOMAIN,
          customScheme: AUTH0_SCHEME
        }
      ]
    ],
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: AUTH0_SCHEME
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: AUTH0_SCHEME
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }
};