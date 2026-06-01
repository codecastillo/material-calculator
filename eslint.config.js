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
    rules: {
      // ignoreRestSiblings lets `const { id, ...rest } = row` omit fields without
      // tripping the rule; argsIgnorePattern allows intentionally-unused `_`-prefixed args.
      'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
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
      // Many top-level functions are invoked only from HTML data-on-* attributes
      // via the delegated handler, which eslint cannot trace, so unused reports
      // here are advisory rather than errors.
      'no-unused-vars': 'warn',
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
  prettier,
];
