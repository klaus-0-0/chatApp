import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
