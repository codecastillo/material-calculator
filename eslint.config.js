const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      'node_modules/',
      'backend/node_modules/',
      'backend/data/',
      'frontend/assets/',
      '**/*.min.js',
    ],
  },
  js.configs.recommended,
  {
    // Backend runs on Node with CommonJS modules.
    files: ['backend/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    // Frontend ships as classic scripts loaded via <script> tags, sharing state
    // through globals with no bundler to resolve cross-file references, so
    // no-undef would only flag legitimately shared symbols. The browser catches
    // genuinely missing globals at runtime.
    files: ['frontend/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'script',
      globals: { ...globals.browser, google: 'readonly' },
    },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['frontend/sw.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'script',
      globals: { ...globals.serviceworker },
    },
  },
  {
    rules: {
      'no-unused-vars': 'warn',
    },
  },
  prettier,
];
