# SKILLS_All-in-one Project Context

## Project Overview
**SKILLS_All-in-one** 是一個展示與下載 AI Skill 的整合平台。

### 核心架構 (Tech Stack)
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons.
- **Backend Bridge**: Cloudflare Workers (CORS: huangchiyu.com, eric861129.github.io).
- **Database**: SQLite (Turso).
- **Hosting**: GitHub Pages + Custom Domain (huangchiyu.com).

## 介面與功能規劃
### 1. 頁面結構
- **Home**: 站台介紹與全域搜尋。
- **Popular**: 依下載量排序的熱門技能。
- **Latest**: 依建立時間排序的新進技能。
- **Category**: 依功能分類 (工具、開發、創意、分析)。
- **Special**: 榮譽牆 (得獎者/知名專案推薦)。

### 2. 搜尋功能
- 採用 **Fuse.js** 實作前端模糊搜尋，支援「名稱」與「說明」檢索。

## 資料庫設計擴充 (TODO)
- [ ] 執行 SQL 增加 `category` 與 `tags` 欄位。
- [ ] 初始化基礎資料集。

## 實作進度 (TODO)
- [x] `Phase 1`: 初始化 Vite 專案並設定 Tailwind CSS。
- [x] `Phase 2`: 實作 API 串接與 Skill 卡片組件。
- [ ] `Phase 3`: 實作搜尋與分類過濾邏輯。
- [ ] `Phase 4`: 整合下載計數功能。
- [ ] `Phase 5`: 設定 GitHub Actions 自動化部署。
