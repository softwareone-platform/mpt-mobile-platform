module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: [
        'react',
        'react-hooks',
        'react-native',
        '@typescript-eslint',
    ],
    rules: {
        // React specific rules
        'react/react-in-jsx-scope': 'off', // Not needed in React 17+
        'react/prop-types': 'off', // Using TypeScript for prop validation
        'react/display-name': 'off',

        // React Hooks rules (manually defined since the preset doesn't work)
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // React Native specific rules
        'react-native/no-unused-styles': 'warn',
        'react-native/split-platform-components': 'warn',
        'react-native/no-inline-styles': 'warn',
        'react-native/no-color-literals': 'warn',
        'react-native/no-raw-text': 'off', // Can be restrictive for simple text

        // TypeScript specific rules (basic ones that work with older plugin)
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-unused-vars': 'off', // Turn off base rule as it conflicts with TypeScript rule

        // General ESLint rules
        'no-console': 'off',
        'no-debugger': 'warn',
        'prefer-const': 'warn',
        'no-var': 'error',
        'no-undef': 'off', // TypeScript handles this
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    env: {
        'react-native/react-native': true,
        es6: true,
        node: true,
        jest: true,
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        '.expo/',
        'web-build/',
    ],
};
