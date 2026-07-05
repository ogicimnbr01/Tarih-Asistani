import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000, // API CORS izin listesindeki localhost:8000 ile uyumlu
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'melba-brachydactylous-elwood.ngrok-free.dev', 

    ],

  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin.html',
      },
    },
  },
})