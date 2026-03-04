---
name: skill-manager
description: Master controller for the entire AI Skill lifecycle. Use this as the primary entry point when adding, importing, or updating skills in the SKILLS_All-in-one platform. It enforces the strict sequence: Import -> Audit -> Onboard.
---

# Skill Manager (Master Controller)

此技能是 `SKILLS_All-in-one` 平台的最高級管控工具，負責協調所有子 SOP 技能，確保技能擴充過程的安全性、完整性與資料一致性。

## 🚀 核心工作流 (Standard Pipeline)

當接到「新增技能」或「從 GitHub 導入技能」的任務時，**必須** 嚴格遵循以下流水線：

### Step 1: 發現與抓取 (Import Phase)
- **調用技能**：`github-skill-importer`
- **目標**：從遠端 Repo 定位並下載「完整技能包」至 `@public/SKILLS/Uncategorized/{FolderName}/`。
- **檢查點**：資料夾內必須包含 `SKILL.md` 且結構完整。

### Step 2: 安全審查 (Audit Phase)
- **調用技能**：`skill-security-auditor`
- **目標**：對 `Uncategorized` 區的新技能進行代碼與提示詞掃描。
- **規則**：
    - **PASS**：進入下一步。
    - **WARNING/REJECT**：立即停止，向使用者報告風險，除非獲得明確授權修復，否則禁止上架。
- **產出**：產出《技能安全審查報告》。

### Step 3: 正式上架 (Onboarding Phase)
- **調用技能**：`skill-onboarding-guide`
- **目標**：
    1. 分類移動 (從 `Uncategorized` 到正確分類)。
    2. 資料庫同步 (`database/init_skills.sql`)。
    3. 前端同步 (`src/data/skills.ts`)。
- **重要**：確保 `id` 遞增且不衝突。

### Step 4: 系統同步 (Manifest Sync)
- **執行指令**：`npm run prebuild`
- **目標**：更新 `public/skills-manifest.json`，確保前端下載功能抓得到新檔案。

---

## 🚦 狀態管控規則 (Guardrails)

1.  **禁止跳過審核**：嚴禁在未執行 `skill-security-auditor` 的情況下將技能寫入 `init_skills.sql` 或 `skills.ts`。
2.  **原子化寫入**：資料庫與前端元數據的寫入應同步進行，避免出現「看得到下載不了」或「下載得到但搜尋不到」的情況。
3.  **編碼保護**：在處理 `init_skills.sql` 與 `skills.ts` 時，必須確保為 **UTF-8 (No BOM)**，防止中文亂碼。

## 📝 任務紀錄範本

每次完成一輪流程，應向使用者回報進度：
- [x] **Import**: [技能名稱] 已抓取。
- [x] **Audit**: 已產出安全報告 (結果: PASS)。
- [x] **Onboard**: 資料夾移動完成，SQL 與 TS 元數據已更新。
- [x] **Sync**: Manifest 已重新生成。
