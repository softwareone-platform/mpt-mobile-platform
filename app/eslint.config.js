const globals = require('globals');
const js = require('@eslint/js');

const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');
const prettierPlugin = require('eslint-plugin-prettier');

const commonGlobals = {
  ...globals.es2020,
  ...globals.node,
  ...globals.jest,
  __DEV__: 'readonly',
  fetch: 'readonly',
  FormData: 'readonly',
  XMLHttpRequest: 'readonly',
  navigator: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
};

const commonPlugins = {
  react: reactPlugin,
  'react-hooks': reactHooksPlugin,
  'react-native': reactNativePlugin,
  import: importPlugin,
  'unused-imports': unusedImportsPlugin,
  prettier: prettierPlugin,
};

const commonRules = {
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  'react/display-name': 'off',
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',

  'react-native/no-unused-styles': 'warn',
  'react-native/no-inline-styles': 'warn',
  'react-native/no-color-literals': 'warn',
  'react-native/no-single-element-style-arrays': 'warn',
  'react-native/no-raw-text': 'off',

  'import/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
  'import/no-duplicates': 'error',
  'unused-imports/no-unused-imports': 'error',
  'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
  eqeqeq: ['error', 'always'],
  'prefer-const': 'warn',
  'no-var': 'error',
  'no-debugger': 'warn',
  'no-undef': 'off',

  'prettier/prettier': 'error',
  'eol-last': ['error', 'always'],
  'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
};

module.exports = [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/web-build/**',
      '**/.expo/**',
      '**/.expo-shared/**',
      '**/.metro-health-check*',
      '**/*.log',
      '**/*.snap',
      '**/.env*',
      '**/.vscode/**',
      '**/.idea/**',
      '**/*.swp',
      '**/*.swo',
      '**/.DS_Store',
      '**/ios/**',
      '**/android/**',
      '**/test/**',
      'wdio.conf.js',
      'assets/icons/**',
      'eslint.config.js',
    ],
  },

  // Base JS/TS rules (type-agnostic)
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: commonGlobals,
    },
    plugins: commonPlugins,
    settings: { react: { version: 'detect' } },
    rules: {
      ...commonRules,
    },
  },

  // TypeScript type-aware rules (optional, only for actual code)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_', // ignore _foo
          args: 'none', // ignore ALL params (interfaces, callbacks, etc)
          argsIgnorePattern: '^_', // also ignore _param explicitly
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true, ignoreIIFE: true }],
    },
  },
];
