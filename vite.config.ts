import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SKILLS_All-in-one/',
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-utils': ['jszip', 'fuse.js', 'react-markdown'],
        }
      }
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
