import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  build: {
    // 4KB 미만 소형 이미지는 인라인 처리 (기본값), 대형 이미지는 별도 파일로 분리
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // 이미지 파일을 assets/images/ 에 분류하여 캐시 관리 편의성 향상
        assetFileNames: (assetInfo) => {
          const imgExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif']
          const isImage = imgExtensions.some((ext) => assetInfo.name?.endsWith(ext))
          return isImage ? 'assets/images/[name]-[hash][extname]' : 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'jibsalife-image-cache',
              expiration: {
                maxEntries: 160,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'JIBSALIFE',
        short_name: 'JIBSALIFE',
        description: 'JIBSALIFE',
        start_url: '/',
        display: 'standalone',
        background_color: '#6D59F8',
        theme_color: '#6D59F8',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
