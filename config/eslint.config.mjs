import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPLuginPrettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  eslintPLuginPrettier,
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // 'no-constant-condition': 'warn',
      // 'no-inner-declarations': 'warn',
      //   'unused-imports/no-unused-imports': 'error',
      'no-unexpected-multiline': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
    },
  },
  {
    ignores: [
      '**/test/',
      '**/test-d/',
      '**/docs/',
      '*.js',
      '*.mjs',
      '**/doc-gen/',
      '**/deno_dist/',
    ],
  }
);
