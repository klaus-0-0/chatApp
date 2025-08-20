import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    host: true,
<<<<<<< HEAD
    allowedHosts: ['whatsapp-32fo.onrender.com'], 
=======
    allowedHosts: ['whatsapp-32fo.onrender.com'], // add your domain here
>>>>>>> c315ded58e0c915638eb4fee23844812234ec90d
  },
})
