# SKILLS_All-in-one Project Identity

**SKILLS_All-in-one** 是一個專為 AI Agent 設計的高品質技能 (Skill) 展示與下載整合平台。

---

## 🎯 核心目標
建立一個美觀、高效且易於擴展的 AI 技能庫，支援開發者一鍵下載打包好的 Agent 技能，並提供完整的前端檢索與排序功能。

## 🛠️ 技術棧 (Tech Stack)
- **Frontend**: React 18 (Vite) + Tailwind CSS + Lucide Icons.
- **Backend Bridge**: Cloudflare Workers (CORS 處理與資料轉發).
- **Database**: Turso (SQLite) - 儲存技能元資料與下載計數。
- **Hosting**: GitHub Pages + Custom Domain (huangchiyu.com).
- **Logic**: Fuse.js (模糊搜尋) + JSZip (檔案打包).

---

## 📜 核心規範 (Mandates)

### 1. 內部能力規範 (Elite 10+1 Policy)
為了優化開發效率與上下文使用，`.gemini/skills/` 嚴格保留 **11** 個核心開發技能：
1. `using-superpowers`
2. `oiloil-ui-ux-guide`
3. `frontend-design`
4. `react-expert`
5. `typescript-pro`
6. `systematic-debugging`
7. `webapp-testing`
8. `verification-before-completion`
9. `writing-plans`
10. `web-artifacts-builder`
11. `writing-skills` (核心加碼：輔助技能維護)

### 2. UI/UX 設計規範 (OilOil Guide)
- **嚴禁 Emoji**: UI 裝飾與圖標僅限使用 `Lucide` 等向量圖標。
- **極簡主義**: 減少冗餘文案，優先使用空白與字體層級 (Typography) 建立視覺導向。
- **反 Slop 設計**: 避免預設漸層與通用的 Inter 字體；採用深色背景 (`slate-950`) 與細膩的邊框。

---

## 📂 目錄映射 (Directory Mapping)
公共技能存放在 `public/SKILLS/`，結構必須與 `src/data/skills.ts` 嚴格同步。
- **路徑**: `public/SKILLS/{Category}/{FolderName}/`

---

## 🚀 專案進度 (Progress Log)

### `Phase 1-2`: 基礎與資料 (DONE)
- [x] 初始化專案並完成 100 個技能分類與建檔。
- [x] 實作下載與打包邏輯。

### `Phase 3`: 搜尋與過濾 (DONE)
- [x] 整合 `Fuse.js` 模糊搜尋 (支援名稱、說明、標籤)。
- [x] 實作分類標籤互動過濾。

### `Phase 4`: 排序與行動端 (DONE)
- [x] 實作「熱門 (Popular)」與「最新 (Latest)」排序切換。
- [x] 完成行動端響應式佈局優化。

### `Phase 5`: 自動化與部署 (DONE)
- [x] 建立 GitHub Actions 自動化部署流程 (`deploy.yml`)。
- [x] 配置自定義域名支持 (`CNAME`) 與 Vite 基準路徑 (`base`)。
- [x] 優化 API 錯誤處理與載入狀態。

---

## 📝 當前任務
- 執行最後檢查：確保 `public/SKILLS/` 目錄結構與 `src/data/skills.ts` 完美契合。
- 準備正式上線：推送程式碼觸發 GitHub Actions 部署。

