import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['text-t.onrender.com'],
  },
  build: {
    rollupOptions: {
      output: {
        // Fix SPA routing - redirect ALL paths to index.html
        manualChunks: undefined,
      },
    },
  },
  // CRITICAL: Base path for sub-routes (Render Static Site)
  base: '/',
})
