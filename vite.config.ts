/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: process.env.BASE_URL || '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 6070,
  },
  test: {
    setupFiles: ['./src/test-setup.ts'],
  },
})
