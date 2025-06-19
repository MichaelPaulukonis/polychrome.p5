import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    globals: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '~': resolve(__dirname, '.')
    }
  }
})
