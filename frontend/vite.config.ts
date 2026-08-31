import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Allows any ngrok-free subdomain or pass true to allow all hosts
    allowedHosts: ['.ngrok-free.app'],
  }
})
