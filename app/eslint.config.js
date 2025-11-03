const globals = require('globals');
const js = require('@eslint/js');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // Global ignores
  {
    ignores: [
      // Dependencies
      '**/node_modules/**',

      // Build outputs
      '**/dist/**',
      '**/build/**',
      '**/web-build/**',

      // Expo
      '**/.expo/**',
      '**/.expo-shared/**',

      // Metro
      '**/.metro-health-check*',

      // Logs
      '**/*.log',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',

      // Runtime data
      '**/pids',
      '**/*.pid',
      '**/*.seed',

      // Coverage
      '**/coverage/**',

      // Environment variables
      '**/.env',
      '**/.env.local',
      '**/.env.development.local',
      '**/.env.test.local',
      '**/.env.production.local',

      // IDE and editor files
      '**/.vscode/**',
      '**/.idea/**',
      '**/*.swp',
      '**/*.swo',

      // OS generated files
      '**/.DS_Store',
      '**/.DS_Store?',
      '**/._*',
      '**/.Spotlight-V100',
      '**/.Trashes',
      '**/ehthumbs.db',
      '**/Thumbs.db',

      // iOS and Android native folders
      '**/ios/**',
      '**/android/**',
    ],
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // React recommended rules
  {
    files: ['**/*.jsx', '**/*.tsx'],
    ...reactPlugin.configs.flat.recommended,
  },

  // Main configuration for JavaScript/TypeScript files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],

    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.es2020,
        ...globals.node,
        ...globals.jest,
        // React Native globals
        __DEV__: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        XMLHttpRequest: 'readonly',
        navigator: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
      },
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
      '@typescript-eslint': typescriptPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // React specific rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/display-name': 'off',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Native specific rules
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'off', // Can be restrictive for simple text

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off', // Turn off base rule as it conflicts with TypeScript rule

      // General ESLint rules
      'no-console': 'off',
      'no-debugger': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-undef': 'off', // TypeScript handles this
    },
  },
];
