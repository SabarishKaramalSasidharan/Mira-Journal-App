import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages project subpath in production; root during local dev.
export default defineConfig(({ command }) => {
  const base = command === 'build' ? '/Mira-Journal-App/' : '/'

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: base,
          name: 'Mira — think out loud',
          short_name: 'Mira',
          description: 'A journal you talk to. Zero blank pages, weekly reflections.',
          theme_color: '#eef4f2',
          background_color: '#eef4f2',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        },
      }),
    ],
  }
})
