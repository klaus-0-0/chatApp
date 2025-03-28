import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // Ensures correct routing in production
  server: {
    historyApiFallback: true, // Fixes SPA refresh issues in dev mode
  },
  build: {
    outDir: 'dist',
  },
  preview: {
    port: 4173,
  }
});
