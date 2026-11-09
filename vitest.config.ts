import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@modulos': path.resolve(__dirname, './src/modulos'),
      '@infraestructura': path.resolve(__dirname, './src/infraestructura'),
      '@compartido': path.resolve(__dirname, './src/compartido'),
      '@estilos': path.resolve(__dirname, './src/estilos'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
