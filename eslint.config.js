import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const typescriptFiles = ['src/**/*.ts', 'tests/**/*.ts', '*.config.ts'];

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
  { ...eslint.configs.recommended, files: typescriptFiles, rules: { ...eslint.configs.recommended.rules, 'no-undef': 'off' } },
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: typescriptFiles })),
  { files: typescriptFiles, rules: { '@typescript-eslint/no-non-null-assertion': 'off' } }
);
