# SKILLS All-in-one

[English README](./README_en.md)

[![線上展示](https://img.shields.io/badge/demo-huangchiyu.com-blue?style=flat-square)](https://huangchiyu.com/SKILLS_All-in-one/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/eric861129/SKILLS_All-in-one?style=flat-square)](https://github.com/eric861129/SKILLS_All-in-one/stargazers)
[![Issues](https://img.shields.io/github/issues/eric861129/SKILLS_All-in-one?style=flat-square)](https://github.com/eric861129/SKILLS_All-in-one/issues)
[![歡迎 PR](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

**SKILLS All-in-one** 是一個開源的 AI Agent 技能庫，聚焦在 Claude Code、ChatGPT 與 MCP 類型工作流。你可以在網站上搜尋技能、預覽內容、檢視檔案結構，再下載到自己的 Agent 環境中使用。

## 專案概覽

- 線上網站：https://huangchiyu.com/SKILLS_All-in-one/
- 支援平台：Claude Code、Claude Desktop、ChatGPT、Gemini CLI
- 技能內容：100+ 可瀏覽、可預覽、可下載的技能

![SKILLS All-in-one 預覽](./public/SKILL_ALL_IN_ONE.jpg)

## 這個專案適合誰

- 想要重用 AI Agent 能力，而不是每次重寫 prompt 與設定的人
- 正在建立 MCP、工具呼叫或 Agent workflow 的開發者與團隊
- 需要先看內容再決定是否下載技能的研究、內容與自動化使用者

## 支援的 Agent

- Claude Code
- Claude Desktop
- ChatGPT
- Gemini CLI
- 其他整合中的 Agent 平台

## 運作方式

1. 在網站上瀏覽技能庫。
2. 進入技能頁查看用途、作者、標籤與檔案內容。
3. 下載技能包並放進你的 Agent 環境。
4. 依照網站上的 setup guide 完成掛載與使用。

## 特色分類

- Development & Code Tools
- Data & Analysis
- Security & Web Testing
- Writing & Research
- Utility & Automation
- Document Skills

## 常見使用情境

- 安裝 Claude Code 技能來做 code review、架構設計、測試與自動化
- 下載 ChatGPT 可用的技能包來加速研究、寫作與工作流程
- 瀏覽 MCP 相關技能來整合外部工具、API 與多步驟任務
- 在下載前先用網站的 deep preview 檢查技能內容

## 快速開始

```bash
git clone https://github.com/eric861129/SKILLS_All-in-one.git
cd SKILLS_All-in-one
npm install
npm run dev
```

## 技術棧

- Frontend: React 19, Vite 7, TypeScript, Tailwind CSS 4
- Search and browsing: Fuse.js, React Router
- Packaging and previews: JSZip, React Markdown, syntax highlighting
- Automation: build-time manifest and SEO asset generators

## 貢獻與提交流程

- 中文貢獻說明：[CONTRIBUTING.md](./CONTRIBUTING.md)
- English contribution guide: [CONTRIBUTING_en.md](./CONTRIBUTING_en.md)
- 提交新技能 Issue：請先閱讀 [提交技能說明](./CONTRIBUTING.md#submit-skill-guide)

## GitHub Repository 建議設定

- About description: `Open-source AI agent skills library for Claude Code, ChatGPT, and MCP workflows.`
- Website: `https://huangchiyu.com/SKILLS_All-in-one/`
- Topics: `ai-agent`, `claude-code`, `chatgpt`, `mcp`, `prompt-engineering`, `ai-tools`, `skills-library`, `open-source`
- Social preview: `public/SKILL_ALL_IN_ONE.jpg`

## 作者

- Website: [huangchiyu.com](https://huangchiyu.com)
- Blog: [ChiYu-Blog](https://huangchiyu.com/ChiYu-Blog/)
- GitHub: [@eric861129](https://github.com/eric861129)

## 授權

本專案採用 [MIT License](LICENSE)。
