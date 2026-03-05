# Specification: 教育引導與「什麼是技能？」 (Phase 2)

## 1. 概述 (Overview)
本 Track 旨在消除使用者對「AI Agent 技能」的疑惑，並透過互動式的教學引導與完整的知識庫，將 SKILLS All-in-one 定位為 AI Agent 領域的領先知識庫。

## 2. 功能需求 (Functional Requirements)

### 2.1 互動式運作原理展示 (Hero Section)
- **設計：** 結合「三步驟進度條」與「動態插畫」，視覺化展示「連結、選擇、注入」的完整流程。
- **動效：** 展示技能如何從平台傳輸並應用至 AI Agent。

### 2.2 多頁面知識庫 (Wiki / Docs)
- **結構：** 建立獨立的 `/docs` 路由，提供側邊導覽列。
- **內容：** 涵蓋「什麼是技能？」、「支援哪些 Agent？」及「安全性審計規範」。
- **管理：** 內容統一由 `src/data/doc/` 下的 Markdown 檔案驅動。

### 2.3 「新增至 Agent」引導精靈 (Wizards)
- **平台支援：** 提供針對 Claude Desktop, ChatGPT (Custom GPTs), 通用 MCP, Gemini CLI, Google Antigravity, 及 Claude Code 的分步引導介面。
- **體驗：** 使用者選取特定工具後，顯示對應的設定指令或路徑。

## 3. 非功能需求 (Non-Functional Requirements)
- **響應式設計：** Wiki 側邊欄在行動端應轉換為抽屜式導覽或折疊選單。
- **可擴展性：** 系統應能輕易透過新增 Markdown 檔案來擴充新的 Agent 教學。

## 4. 驗收標準 (Acceptance Criteria)
- 點擊 Hero 區塊的「運作原理」能觸發完整的動畫展示。
- 使用者能流暢在 `/docs` 下的不同章節間切換。
- 引導精靈能正確顯示所有指定平台（如 Gemini CLI）的特定設定步驟。
- Markdown 檔案內容能正確渲染並保持樣式一致。
