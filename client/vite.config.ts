import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/generatePalette': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
      '/palette': {
        target: 'http://localhost:3000',
        bypass(req) {
          // Only proxy /palette/*/data requests to Express
          if (req.url?.endsWith('/data')) return undefined;
          // Let Vite handle SPA routes like /palette/:permalink
          return '/index.html';
        },
      },
    },
  },
})
