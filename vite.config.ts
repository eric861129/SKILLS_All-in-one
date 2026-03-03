import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // 預設值
  // 我們可以手動把 SKILLS 加進靜態目錄，或者最簡單的是直接搬移到 public 下
  // 既然目前規劃是 SKILLS，我們試著在開發伺服器掛載它
  server: {
    fs: {
      allow: ['..']
    }
  }
})
