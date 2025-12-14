
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

export default [

  js.configs.recommended,


  {
    ignores: [
      '**/node_modules/**',
      ".next/**",
      "dist/**",
      "build/**",
      "public/**",
      "*.lock"
    ],
  },


  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'prettier': prettierPlugin,
      'prefer-arrow': preferArrowPlugin,
      'import': importPlugin,
      'unused-imports': unusedImportsPlugin,
      'unicorn': unicornPlugin,
    },
    rules: {

      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'no-control-regex': 0,
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'import/no-relative-packages': 'off',



      'import/no-useless-path-segments': 'error',
      'import/no-duplicates': ['error', { considerQueryString: true }],


      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },


  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {

      'no-redeclare': 'off', // Turn off base rule for TypeScript

      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { 
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports'
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-empty-interface': [
        'error',
        {
          allowSingleExtends: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },


  {
    files: ['*.{js,jsx}'],
    rules: {

    },
  },


  {
    files: [
      '*.spec.@(ts|tsx|js|jsx)',
      '*.integration-spec.@(ts|tsx|js|jsx)',
      '*.test.@(ts|tsx|js|jsx)',
    ],
    languageOptions: {
      globals: {
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

];
