import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'],
      manifest: {
        name: 'Artdle - Un dibujo al día',
        short_name: 'Artdle',
        description: '¿Cuál será la palabra de hoy? Entra ahora en Artdle.com, descúbrelo y dibuja!',
        theme_color: '#0070f3',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,png,svg,gif,webp,woff2}'],
        runtimeCaching: [
          {
            // Storage images — long cache, network-first to pick up updates.
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/draws\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'artdle-storage-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            // API and Supabase queries — never cache (auth-sensitive).
            urlPattern: /\/api\//,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/(rest|auth|realtime)\//,
            handler: 'NetworkOnly'
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ]
})
