import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/SKILLS_All-in-one/',
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..']
    }
  }
})
