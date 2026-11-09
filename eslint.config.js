import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '.tmp', '.wrangler', 'vite.config.ts', 'vitest.config.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Prohibir paquetes de Supabase
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@supabase/*'],
              message: 'No se permite usar Supabase en el frontend. Usa el backend.',
            },
          ],
        },
      ],
      // Prohibir fetch fuera de HttpClient
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'No uses fetch directamente. Usa HttpClient en infraestructura/http/',
        },
        {
          name: 'localStorage',
          message: 'No guardes tokens en localStorage. La sesión usa cookies HttpOnly.',
        },
        {
          name: 'sessionStorage',
          message: 'No guardes tokens en sessionStorage. La sesión usa cookies HttpOnly.',
        },
      ],
      // TypeScript strict
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Excepciones: HttpClient SÍ puede usar fetch
  {
    files: ['src/infraestructura/http/HttpClient.ts'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
  // Excepciones: navegador/ SÍ puede usar window.location
  {
    files: ['src/infraestructura/navegador/*.ts'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
  // Excepciones: setup de tests puede usar globals
  {
    files: ['src/test/**/*.ts', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
  // Excepciones: SesionContext exporta tanto provider como hook (patrón común en React)
  {
    files: ['src/compartido/sesion/SesionContext.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
