# SKILLS All-in-one

[![Live Demo](https://img.shields.io/badge/demo-huangchiyu.com-blue?style=flat-square)](https://huangchiyu.com/SKILLS_All-in-one/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/eric861129/SKILLS_All-in-one?style=flat-square)](https://github.com/eric861129/SKILLS_All-in-one/stargazers)
[![Issues](https://img.shields.io/github/issues/eric861129/SKILLS_All-in-one?style=flat-square)](https://github.com/eric861129/SKILLS_All-in-one/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

**SKILLS All-in-one** 是一個專為 AI Agent 與開發者打造的高品質技能 (AI Skills) 展示、檢索與下載整合平台。我們建立了一個美觀、高效且具備「自我進化機制」的技能庫，幫助開發者一鍵強化其 AI Agent 的專業實戰能力。

---

## 🌟 核心特色

- **海量實戰資源**：精選超過 100 個涵蓋開發、科研、數據分析、自動化等領域的 AI 技能。
- **自我進化機制**：內建 `skill-updater`，支援從 GitHub 來源自動偵測並更新技能版本。
- **安全審計工作流**：所有技能更新均需通過 `skill-security-auditor` 掃描，確保提示詞與代碼安全。
- **精準搜索與過濾**：整合 `Fuse.js` 模糊搜尋，支援多維度標籤篩選與熱門/最新排序。
- **一鍵打包下載**：利用 `JSZip` 技術，將多個技能檔案即時打包，實現無縫整合。
- **集中式資料管理**：採用增量 SQL 遷移機制，確保生產環境資料庫異動清晰可追蹤。
- **雙語美學**：完整中英文介面，遵循 **OilOil UI/UX Guide** 極簡美學，拒絕「AI Slop」。

---

## 🙏 特別鳴謝 (Acknowledgments)

本專案的基礎技能庫主要蒐集並獲取自以下優秀的開源專案，並在此基礎上進行整合與管理：
- [BehiSecc/awesome-claude-skills](https://github.com/BehiSecc/awesome-claude-skills) - 提供社群精選的高品質 AI 技能來源。

---

## 🛠️ 技術棧 (Tech Stack)

### 前端 (Frontend)
- **Framework**: React 19 (Vite 7) + TypeScript
- **Styling**: Tailwind CSS 4 (現代極簡深色系)
- **Search**: Fuse.js (加權模糊檢索)
- **Utilities**: JSZip + Lucide Icons + React Router 7

### 自動化與工具 (Automation)
- **Updater Engine**: `scripts/update-skills.mjs` (GitHub API + Hash 比對)
- **Manifest Sync**: 自動化生成 `skills-manifest.json` 供前端調用。
- **Database**: Turso (SQLite) + 集中式增量 SQL 遷移路徑。

---

## 📜 開發規範與自我管理

本專案採用 **Elite 18 Policy**，在 `.agent/skills/` 中保留 18 個核心管理技能，賦予 AI Agent 自我維護的能力：

1.  **skill-manager**: 總控中心，協調導入、審核與上架流程。
2.  **skill-updater**: 自動檢查 GitHub 來源並執行版本同步。
3.  **sql-migration-manager**: 產出增量 SQL 指令至 `incremental_updates.sql`。
4.  **skill-security-auditor**: 執行自動化安全性掃描。
5.  *(...其餘請參閱專案內部文件)*

---

## 📂 目錄結構

```text
├── .agent/skills/         # Elite 18 核心管理技能 (內部 SOP)
├── public/SKILLS/         # 公共展示技能存放區 (一鍵下載目標)
├── scripts/               # 自動化工具 (更新引擎、Manifest 生成)
├── src/data/skills.ts     # 技能元數據 (唯一事實來源)
└── database/              # 資料庫備份與增量遷移 SQL
```

---

## 🚀 快速開始

### 安裝與啟動
```bash
# 1. 複製專案
git clone https://github.com/eric861129/SKILLS_All-in-one.git

# 2. 安裝依賴
npm install

# 3. 啟動開發環境
npm run dev
```

### 自動更新技能
本專案已將更新機制整合於 AI Agent 的 SOP 中。您只需對 Agent 下達「檢核更新」指令，Agent 便會自動比對 GitHub 原始碼並執行同步：
- **流程**：遠端比對 -> 下載暫存 -> 安全審核 -> 正式覆蓋與 SQL 遷移。
- **優勢**：無需手動執行腳本，確保技能庫具備「自主進化」能力。

---

## 🤝 貢獻指南

我們非常歡迎社群貢獻！若您想提交新的技能，請：
1. 將技能檔案放入 `public/SKILLS/` 對應分類。
2. 在 `src/data/skills.ts` 中登錄元數據。
3. **重要**：調用 `sql-migration-manager` 產出對應的 SQL 指令。
4. 詳細規範請閱讀 [CONTRIBUTING.md](CONTRIBUTING.md)。

其實簡單一點，幫我開一個ISSUE，依據 [SKILL 提交 ISSUE](https://github.com/eric861129/SKILLS_All-in-one/issues/new?template=submit_skill.md)
的格式即可。我會在請AI幫我處理SKILL的新增動作~
---

## 👤 作者
**Eric Huang (黃祈豫)**  
- Website: [huangchiyu.com](https://huangchiyu.com)
- Blog: [ChiYu-Blog](https://huangchiyu.com/ChiYu-Blog/)
- GitHub: [@eric861129](https://github.com/eric861129)

---

## 📄 授權

本專案採用 [MIT License](LICENSE) 開源授權。

© 2026 SKILLS All-in-one · Built with passion for the AI community.
