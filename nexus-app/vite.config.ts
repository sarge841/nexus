import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Nexus Timer',
        short_name: 'Nexus',
        description: 'Modular advanced interval timer with voice feedback.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@dnd-kit/core': path.resolve(__dirname, 'node_modules/@dnd-kit/core/dist/core.esm.js'),
      '@dnd-kit/sortable': path.resolve(__dirname, 'node_modules/@dnd-kit/sortable/dist/sortable.esm.js'),
      '@dnd-kit/utilities': path.resolve(__dirname, 'node_modules/@dnd-kit/utilities/dist/utilities.esm.js'),
      '@dnd-kit/modifiers': path.resolve(__dirname, 'node_modules/@dnd-kit/modifiers/dist/modifiers.esm.js'),
      'clsx': path.resolve(__dirname, 'node_modules/clsx/dist/clsx.mjs'),
    }
  },
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },
  optimizeDeps: {
    include: ['tailwind-merge', 'nanoid'],
  }
})
