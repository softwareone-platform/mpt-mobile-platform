const fs = require('fs');
const path = require('path');

// Load .env file
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        env[key.trim()] = value;
      }
    });
  }
  
  return env;
}

const env = loadEnv();

const expoConfig = {
  expo: {
    name: "SoftwareOne",
    slug: "softwareone-marketplace-mobile",
    version: "4.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: env.AUTH0_SCHEME || "com.softwareone.marketplaceMobile",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.softwareone.marketplaceMobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.softwareone.marketplaceMobile"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "./plugins/withAuth0ManifestPlaceholders.js",
        {
          auth0Domain: env.AUTH0_DOMAIN || "login-test.pyracloud.com",
          auth0Scheme: env.AUTH0_SCHEME || "com.softwareone.marketplaceMobile"
        }
      ]
    ]
  }
};

module.exports = expoConfig;
