const globals = require('globals');
const tseslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const jestPlugin = require('eslint-plugin-jest');

module.exports = [
  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      'infra/node_modules/',
      'infra/cdk.out/',
      'coverage/', // Common directory for test coverage reports
      '.DS_Store',
      '*.lock', // e.g. package-lock.json, pnpm-lock.yaml (though linting them is not typical)
      '.env',
      '.env.*',
      '!.env.example', // Allow .env.example
    ],
  },
  // Base configuration for all TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply to all .ts and .tsx files
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './infra/tsconfig.json'], // Point to both tsconfig files
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Start with ESLint recommended rules
      ...require('@eslint/js').configs.recommended.rules,
      // Add TypeScript-specific recommended rules
      // Using .configs.recommended instead of .configs.recommendedTypeChecked initially
      // to avoid immediate need for all types if some files are not perfectly typed yet.
      // Can switch to recommendedTypeChecked or strictTypeChecked later.
      ...tseslint.configs.recommended.rules,
      // Custom rules
      'no-unused-vars': 'off', // Turn off base ESLint rule, use TS version
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true, // Important for { ...rest } syntax
        },
      ],
    },
  },
  // Specific overrides for CDK code in the infra directory
  {
    files: ['infra/**/*.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off', // CDK apps often use require for cdk.json or context
      '@typescript-eslint/no-empty-function': 'off', // Empty constructors are common in CDK stacks
      // If using type-aware linting and it causes issues with CDK's dynamic nature:
      // '@typescript-eslint/no-unsafe-assignment': 'off',
      // '@typescript-eslint/no-unsafe-member-access': 'off',
      // '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  // Specific overrides for test files (if any naming convention is established)
  // Example:
  // {
  //   files: ['**/*.test.ts', '**/*.spec.ts'],
  //   rules: {
  //     '@typescript-eslint/no-explicit-any': 'off', // Tests might use 'any' more liberally
  //     '@typescript-eslint/no-non-null-assertion': 'off', // Non-null assertions might be used in tests
  //   }
  // },
  // Configuration for Jest test files
  {
    files: [
      '**/*.test.ts',
      '**/*.spec.ts',
      'infra/test/**/*.ts', // Specifically for CDK tests
      // Add other test file patterns if needed, e.g., 'src/**/*.test.ts'
    ],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      // Allow template.hasResourceProperties as an assertion
      'jest/expect-expect': [
        'warn',
        {
          assertFunctionNames: [
            'expect',
            'template.hasResourceProperties',
            'template.resourceCountIs',
          ],
        },
      ],
      // You can override or add more Jest-specific rules here if needed
      // For example, if using TypeScript with Jest and type-checking in tests:
      // '@typescript-eslint/unbound-method': 'off', // jest.spyOn can lead to this
      // 'jest/unbound-method': 'error', // Use the jest-specific version
    },
  },
  // Apply Prettier compatibility rules last
  eslintConfigPrettier,
];
