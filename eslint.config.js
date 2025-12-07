// eslint.config.js (Flat Config for ESLint 9.x+)
import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  // Base JS rules
  { files: ['**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['**/*.js'], languageOptions: { globals: globals.es2021 } },
  { files: ['**/*.js'], plugins: { prettier: pluginPrettier } },
  pluginJs.configs.recommended, // Recommended JS rules
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022, // For modern JS (ES modules, etc.)
      sourceType: 'module',
      globals: {
        ...globals.browser, // window, document, etc.
        ...globals.es2021, // Modern ES globals
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      // Your custom rules
      'prettier/prettier': 'error', // Enforce Prettier as ESLint rule
      'no-console': 'off', // Allow console.logs (useful for game dev)
      'no-unused-vars': 'warn', // Warn on unused vars
    },
    ignores: ['node_modules/**', 'playwright-report/**'], // Skip these
  },
];
