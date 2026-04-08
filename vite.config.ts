import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/digital/', // 🔥 TAMBAH DI SINI
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'assets/audio/adan.mp3', 'assets/audio/azan_subuh.mp3', 'assets/audio/doa.mp3'],
      manifest: {
        name: 'Analog Prayer Clock',
        short_name: 'Analog',
        description: 'Jam sholat analog premium dengan mode Ramadhan',
        theme_color: '#0a0f1e',
        background_color: '#0a0f1e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ],
        categories: ['utilities', 'lifestyle'],
        lang: 'id'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,mp3,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 🔥 TAMBAH DI SINI
        runtimeCaching: [
          {
            // Cache prayer time API responses (1 day)
            urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'prayer-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 1 hari
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache weather API responses (30 min)
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 30 // 30 menit
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 tahun
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // disable SW di dev mode agar tidak blocking HMR
      }
    })
  ],
})
