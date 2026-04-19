'use strict';

const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.js'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
