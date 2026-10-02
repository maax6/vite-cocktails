import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
   plugins: [
      react(),
      VitePWA({
         registerType: 'autoUpdate',
         includeAssets: ['recipes.json', 'favicon.ico', 'apple-touch-icon.png'],
         manifest: {
            name: 'Cocktails Maison · Speakeasy',
            short_name: 'Cocktails',
            description:
               'Le carnet Maison et Semaine ski, disponible hors ligne.',
            lang: 'fr',
            theme_color: '#070504',
            background_color: '#070504',
            display: 'standalone',
            start_url: '/',
            icons: [
               {
                  src: '/android-chrome-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
               },
               {
                  src: '/android-chrome-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
               },
            ],
         },
         workbox: {
            globPatterns: [
               '**/*.{js,css,html,png,ico,svg,webp,woff,woff2}',
               'recipes.json',
            ],
            cleanupOutdatedCaches: true,
            runtimeCaching: [
               {
                  urlPattern: /^https:\/\/www\.thecocktaildb\.com\//,
                  handler: 'NetworkOnly',
               },
            ],
         },
      }),
   ],
})
