import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { BRAND } from './src/lib/brand.mjs'

const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
   '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]))

export default defineConfig({
   plugins: [
      {
         name: 'cocktail-brand',
         transformIndexHtml: (html) => html
            .replaceAll('__APP_NAME__', escapeHtml(BRAND.name))
            .replaceAll('__APP_DESCRIPTION__', escapeHtml(BRAND.description))
            .replaceAll('__APP_URL__', escapeHtml(BRAND.url)),
      },
      react(),
      VitePWA({
         registerType: 'autoUpdate',
         includeAssets: [
            'recipes.json',
            'ski-guide.json',
            'favicon.ico',
            'apple-touch-icon.png',
         ],
         manifest: {
            name: BRAND.name,
            short_name: BRAND.name,
            description: BRAND.description,
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
               'ski-guide.json',
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
