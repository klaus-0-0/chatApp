import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // ✅ Fixes SPA refresh issue in dev mode
  },
  build: {
    outDir: 'dist', // ✅ Ensures build files go into "dist"
  },
  preview: {
    port: 4173, // ✅ Set preview port
  }
});
