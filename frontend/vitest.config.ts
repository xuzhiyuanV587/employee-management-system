import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/stores/auth.ts',
        'src/api/auth.ts',
        'src/views/LoginView.vue',
        'src/views/RegisterView.vue',
        'src/views/AccountList.vue',
        'src/views/ResignedList.vue'
      ]
    },
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
