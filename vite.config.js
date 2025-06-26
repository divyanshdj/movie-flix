import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  optimizeDeps: {
    exclude: ['processor.js'] // Prevent processing
  },
  server: {
    proxy: {
      '/v1': {
        target: 'https://cloud.appwrite.io',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/v1/, '/v1')
      }
    }
  }
})
