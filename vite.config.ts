import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve('./src')
    }
  }
})
