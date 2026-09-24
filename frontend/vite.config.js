import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// During development the Vite server proxies /api → backend on :5050.
// In production set VITE_API_BASE to the deployed backend URL.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // Use 127.0.0.1 (IPv4) instead of `localhost` so the proxy doesn't
        // resolve to ::1 first on macOS, which would ECONNREFUSE when the
        // backend is bound to 0.0.0.0 only.
        target: process.env.VITE_API_BASE || 'http://127.0.0.1:5050',
        changeOrigin: true,
      },
    },
  },
})
