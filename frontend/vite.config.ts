import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: process.env.ELECTRON_BUILD ? '/' : '/admSystem',
  build: {
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5001,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:6001',
        changeOrigin: true
      }
    }
  }
})
