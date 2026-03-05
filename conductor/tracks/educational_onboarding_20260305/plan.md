# Implementation Plan: 教育引導與「什麼是技能？」 (Phase 2)

## Phase 1: 基礎架構與路由設定 [checkpoint: 977b5cb]
- [x] Task: 設定路由與文檔系統基礎 (d92850b)
    - [x] 新增 `/docs` 相關路由設定 (`src/App.tsx`)。
    - [x] 建立 `src/data/doc/` 目錄並配置 Markdown 載入邏輯。
- [x] Task: 建立 Wiki 共用佈局組件 (7a85bad)
    - [x] 實作包含側邊導覽列的 `DocsLayout`。
    - [x] 實作 Markdown 渲染組件。
- [x] Task: Conductor - User Manual Verification 'Phase 1: 基礎架構與路由設定' (Protocol in workflow.md) (977b5cb)

## Phase 2: 知識庫內容與 Wiki UI 開發 [checkpoint: bd2d140]
- [x] Task: 撰寫核心文檔內容 (303c662)
    - [x] 建立 `what-is-a-skill.md`, `supported-agents.md`, `security.md`。
- [x] Task: 優化 Wiki 閱讀體驗 (d2cb44d)
    - [x] 實作目錄索引 (TOC) 自動生成功能。
    - [x] 確保行動端導覽順暢（抽屜式選單）。
- [x] Task: Conductor - User Manual Verification 'Phase 2: 知識庫內容與 Wiki UI 開發' (Protocol in workflow.md) (bd2d140)

## Phase 3: 互動式 Hero 區塊與動畫 [checkpoint: dbeacf5]
- [x] Task: 實作運作原理 (How it Works) UI (5099cff)
    - [x] 使用 Framer Motion 實作三步驟進度條組件。
    - [x] 開發「連結、選擇、注入」的動態插畫展示。
- [x] Task: 整合至首頁 Hero Section (8f3b89f)
- [x] Task: Conductor - User Manual Verification 'Phase 3: 互動式 Hero 區塊與動畫' (Protocol in workflow.md) (dbeacf5)

## Phase 4: 多平台整合引導精靈 (Wizards)
- [ ] Task: 建立引導精靈框架組件
    - [ ] 實作可切換平台的 Tab 或選單。
    - [ ] 實作分步指令顯示組件（支援程式碼一鍵複製）。
- [ ] Task: 實作各平台特定引導內容
    - [ ] 完成 Claude Desktop, ChatGPT, 通用 MCP 教學。
    - [ ] 完成 Gemini CLI, Google Antigravity, Claude Code 教學。
- [ ] Task: Conductor - User Manual Verification 'Phase 4: 多平台整合引導精靈 (Wizards)' (Protocol in workflow.md)

## Phase 5: 最終整合與拋光
- [ ] Task: 全站內容審計與鏈接校對
- [ ] Task: 確保與現有設計系統（Anti-AI Slop）高度一致
- [ ] Task: Conductor - User Manual Verification 'Phase 5: 最終整合與拋光' (Protocol in workflow.md)
