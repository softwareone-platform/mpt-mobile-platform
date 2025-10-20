const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path alias support
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@assets': path.resolve(__dirname, 'assets'),
};

module.exports = config;
