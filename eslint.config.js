// ESLint configuration (flat config). Run with `npm run lint`.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'src/core/continent-shapes.js'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module' },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
  // The app runs in the browser.
  { files: ['src/**/*.js'], languageOptions: { globals: globals.browser } },
  // The service worker is a classic script with service-worker globals.
  { files: ['sw.js'], languageOptions: { sourceType: 'script', globals: globals.serviceworker } },
  // Tests and tooling run in Node.
  { files: ['tests/**/*.js', 'eslint.config.js'], languageOptions: { globals: globals.node } },
];
