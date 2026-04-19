'use strict';

const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'public/js/jquery.min.js',
      'public/js/bootstrap.bundle.min.js',
      'public/js/dataTables.min.js',
      'public/js/dataTables.bootstrap5.min.js',
      'public/js/jquery.js',
      'public/js/bootstrap.min.js',
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'eqeqeq': ['warn', 'smart'],
      'strict': ['error', 'global'],
    },
  },
  {
    files: ['public/js/script.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.jquery,
        bootstrap: 'readonly',
        config: 'readonly',
        routes: 'writable',
        crontabs: 'writable',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-var': 'off',
      'prefer-const': 'off',
      'strict': 'off',
    },
  },
  {
    files: ['config/mailconfig.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-var': 'off',
      'strict': 'off',
    },
  },
];
