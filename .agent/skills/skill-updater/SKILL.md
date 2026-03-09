---
name: skill-updater
description: 技能版本更新機制。指示 AI Agent 直接透過工具讀取遠端 GitHub 倉庫，比對 public/SKILLS/ 內技能的差異並執行自動化更新流程。
---

# Skill Updater (技能版本更新機制)

此技能定義了 AI Agent 如何自主檢查並同步 `SKILLS_All-in-one` 平台中位於 `public/SKILLS/` 內的公共技能，確保其安全性與遠端來源保持一致。

## 🚀 核心工作流 (Agent-Driven Update Pipeline)

當接收到「檢核更新」任務時，AI Agent **必須** 執行以下動作：

### Step 1: 遠端探索與內容比對 (Discovery & Diff)
1. **讀取元數據**：從 `@src/data/skills.ts` 取得技能的 `githubUrl`。
2. **定位本地路徑**：僅針對路徑位於 `@public/SKILLS/` 下的技能執行檢查。
3. **獲取遠端內容**：使用 `web_fetch` 讀取遠端路徑下的 `SKILL.md` (原始碼)。
   - *提示*：確保將 GitHub Tree URL 轉換為 `raw.githubusercontent.com` 下載路徑。
4. **執行比對**：將遠端 `SKILL.md` 的內容與本地 `public/SKILLS/` 目錄下的 `SKILL.md` 進行內容比對。
5. **判定異動**：若內容不一致或遠端 YAML 中的 `version` 較新，則標記為「待更新」。

### Step 2: 抓取新版 (Import Phase)
- **調用邏輯**：參考 `github-skill-importer`。
- **目標**：將遠端技能目錄下的所有檔案（含輔助腳本與資源）下載至臨時暫存區 `@public/SKILLS/Uncategorized/tmp-update-{FolderName}/`。

### Step 3: 安全審查 (Audit Phase)
- **調用技能**：`skill-security-auditor`
- **目標**：對暫存區的新檔案執行代碼掃描，產出《更新安全審查報告》。
- **規則**：結果必須為 `PASS` 方可繼續。

### Step 4: 原子化更新與遷移 (Update & SQL)
1. **備份與校驗**：
   - **校驗**：執行覆蓋前，**必須** 使用 `read_file` 讀取暫存區檔案，確保內容非空且未損壞。
   - **備份**：考慮將舊版檔案暫存至 `tmp-bak/`，以利更新失敗時還原。
2. **覆蓋本地檔案**：將通過審核的暫存區檔案移動至 `@public/SKILLS/{Category}/` 下的正式路徑，覆蓋舊版。
3. **元數據同步**：更新 `src/data/skills.ts` 中該技能的 `updatedAt` 或 `version`。
4. **資料庫遷移**：調用 `sql-migration-manager` 將 `UPDATE` 語句記錄於 `database/incremental_updates.sql` 頂部。

### Step 5: 系統同步 (Manifest Sync)
- **執行指令**：`npm run prebuild`。
- **回報**：向使用者呈報更新結果與版本變更摘要。

---

## 🚦 狀態管控規則 (Guardrails)

1. **僅限公共技能**：本更新機制 **僅適用於** `public/SKILLS/` 目錄下的技能。嚴禁將此流程應用於 `.agent/skills/` 內的內部管理技能。
2. **自主性要求**：AI Agent 應直接使用自身工具執行比對，嚴禁依賴外部腳本。
3. **禁止靜默更新**：偵測到差異後，應先列出清單向使用者確認。
4. **防空檔案覆蓋 (Null-Overwrite Prevention)**：嚴禁使用空檔案或未完整下載的檔案覆蓋正式環境。覆蓋前 **必須** 通過內容校驗。
5. **檔案完整性**：更新時必須確保該技能目錄下的所有關聯檔案同步更新。

## 📝 任務紀錄範本
- [x] **Check**: 偵測到內容差異。
- [x] **Import**: 已將新版檔案下載至暫存區。
- [x] **Audit**: 已執行安全掃描 (結果: PASS)。
- [x] **Validation**: 檔案內容校驗通過 (非空)。
- [x] **Update**: 檔案已覆蓋，元數據與 `incremental_updates.sql` 已同步。
- [x] **Sync**: Manifest 已重新生成。
