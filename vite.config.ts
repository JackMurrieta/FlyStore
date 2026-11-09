import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(import.meta.dirname, './src/app'),
      '@modulos': path.resolve(import.meta.dirname, './src/modulos'),
      '@infraestructura': path.resolve(import.meta.dirname, './src/infraestructura'),
      '@compartido': path.resolve(import.meta.dirname, './src/compartido'),
      '@estilos': path.resolve(import.meta.dirname, './src/estilos'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
