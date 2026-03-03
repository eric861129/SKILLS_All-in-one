# SKILLS All-in-one

[![Live Demo](https://img.shields.io/badge/demo-huangchiyu.com-blue?style=flat-square)](https://huangchiyu.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/eric861129/SKILLS_All-in-one?style=flat-square)](https://github.com/eric861129/SKILLS_All-in-one/stargazers)
[![Issues](https://img.shields.io/github/issues/eric861129/SKILLS_All-in-one?style=flat-square)](https://github.com/eric861129/SKILLS_All-in-one/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

**SKILLS All-in-one** 是一個專為 AI Agent 與開發者打造的高品質技能 (AI Skills) 展示、檢索與下載整合平台。我們致力於建立一個美觀、高效且易於擴展的技能庫，幫助開發者一鍵強化其 AI Agent 的能力。

---

## 🌟 核心特色

- **海量資源**：收錄超過 100 個涵蓋開發、文件處理、數據分析、創意設計等領域的 AI 技能。
- **精準搜索**：整合 `Fuse.js` 模糊搜尋技術，支援對技能名稱、說明與標籤進行加權檢索。
- **靈活過濾**：提供多維度的分類標籤與排序系統（最熱門 / 最新進），快速定位所需工具。
- **一鍵打包**：實作 `JSZip` 技術，支援將多個技能檔案自動打包成 `.zip` 格式，實現無縫下載。
- **極致體驗**：遵循 **OilOil UI/UX Guide**，採用現代極簡美學，拒絕「AI Slop」，提供沉浸式的瀏覽環境。

---

## 🛠️ 技術棧 (Tech Stack)

### 前端 (Frontend)
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (遵循反 Slop 設計規範)
- **Icons**: Lucide Icons (嚴禁 Emoji 作為 UI 圖標)
- **Search**: Fuse.js (前端模糊檢索)
- **Utilities**: JSZip (多檔案打包)

### 後端與資料 (Backend & Data)
- **Backend Bridge**: Cloudflare Workers (處理 CORS、API 路由與資料轉發)
- **Database**: Turso (SQLite) - 儲存技能元資料與下載計數。
- **Hosting**: GitHub Pages + Custom Domain ([huangchiyu.com](https://huangchiyu.com))

---

## 📜 開發規範與哲學

本專案不僅是一個工具庫，更是一套工程實踐的體現：

### 1. 內部能力規範 (Elite 10 Policy)
為了保持開發環境純淨並優化 AI 上下文的使用，`.gemini/skills/` 僅保留 **10+1** 個核心精選技能，確保開發者在與 Agent 協作時能獲得最高效的響應。

### 2. UI/UX 設計原則 (OilOil Guide)
- **極簡主義**：優先使用空白、精緻的邊框與清晰的字體層級（Typography）建立視覺導向。
- **專業感**：嚴禁使用 Emoji 作為功能圖標；避免過度飽和的漸層與通用的預設字體。
- **響應式設計**：針對行動端深度優化，包含可捲動的分類列與緊湊的佈局邏輯。

---

## 📂 目錄結構映射

技能檔案的存放必須與程式碼中的元資料嚴格對應：
- **公共技能路徑**：`public/SKILLS/{Category}/{FolderName}/`
- **對應元資料**：`src/data/skills.ts`

---

## 🚀 快速開始

### 環境要求
- Node.js 18+
- npm 或 pnpm

### 安裝步驟
1. **複製專案**
   ```bash
   git clone https://github.com/eric861129/SKILLS_All-in-one.git
   cd SKILLS_All-in-one
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

---

## 🌐 API 參考

我們使用 Cloudflare Workers 作為後端橋接器：
- **GET** `/skills`：獲取所有技能列表。
- **POST** `/increment-download?id={id}`：更新特定技能的下載計數。

---

## 📈 專案進度 (Roadmap)

- [x] **Phase 1**：基礎建設與內部技能環境搭建。
- [x] **Phase 2**：核心組件實作與 100+ 技能元資料建檔。
- [x] **Phase 3**：Fuse.js 全域搜尋與分類過濾邏輯。
- [x] **Phase 4**：排序系統切換與行動端體驗優化。
- [ ] **Phase 5**：整合下載計數 API 回饋與 GitHub Actions 自動化部署。

---

## 👤 作者
**Eric Huang (黃祈豫)**  
- Website: [huangchiyu.com](https://huangchiyu.com)
- GitHub: [@eric861129](https://github.com/eric861129)

© 2026 SKILLS All-in-one · Built with passion for the AI community.
