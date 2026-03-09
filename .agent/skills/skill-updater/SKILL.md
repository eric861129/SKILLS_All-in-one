---
name: skill-updater
description: 技能版本更新機制。作為 Master Controller 的延伸，負責現有技能的自動檢查、安全審查與版本同步。遵循與 skill-manager 一致的 Import -> Audit -> Update 流程。
---

# Skill Updater (技能版本更新機制)

此技能定義了如何自動檢查並更新 `SKILLS_All-in-one` 平台中的現有技能，確保其安全性與遠端 GitHub 來源保持同步。

## 🚀 核心工作流 (Standard Update Pipeline)

當接到「檢核更新」或「更新特定技能」的任務時，**必須** 嚴格遵循以下流水線，確保更新過程不引入安全性風險：

### Step 1: 差異檢測與抓取 (Check & Import)

- **觸發動作**：讀取 `@src/data/skills.ts`，比對本地與遠端 `SKILL.md` 的內容哈希值。
- **抓取目標**：若偵測到差異，將遠端「完整技能包」下載至臨時目錄 `@public/SKILLS/Uncategorized/tmp-update-{FolderName}/`。
- **檢查點**：下載後的暫存資料夾必須結構完整，且包含 `SKILL.md`。

### Step 2: 安全審查 (Audit Phase)

- **調用技能**：`skill-security-auditor`
- **目標**：對位於 `Uncategorized/tmp-update-...` 的**新版本**檔案進行代碼與提示詞掃描。
- **規則**：
  - **PASS**：進入下一步。
  - **WARNING/REJECT**：立即停止，向使用者報告新版本的安全風險。除非獲得明確授權，否則禁止覆蓋舊版本。
- **產出**：產出《技能更新安全審查報告》。

### Step 3: 版本覆蓋與上架 (Update & Onboarding)

- **調用技能**：參考 `skill-onboarding-guide` 邏輯。
- **動作**：
  1. **檔案覆蓋**：將通過審核的新檔案從暫存區移動至正式路徑，覆蓋舊版本。
  2. **元數據同步**：更新 `src/data/skills.ts` 中該技能的 `updatedAt` 欄位。
  3. **資料庫遷移**：調用 `sql-migration-manager` 將增量 SQL 記錄於 `database/incremental_updates.sql`。嚴禁修改 `database/init_skills.sql`。

### Step 4: 系統同步 (Manifest Sync)

- **執行指令**：`npm run prebuild` (即 `node scripts/generate-manifest.js`)。
- **目標**：重新生成 `public/skills-manifest.json`，確保前端下載到的 zip 包是最新版本。

---

## 💻 推薦指令 (CLI Usage)

AI Agent 可以調用更新腳本來輔助執行 Step 1 的檢測工作：

- **檢查所有更新 (不寫入)**：
  ```bash
  node scripts/update-skills.mjs --dry-run
  ```
- **執行完整更新流程**：
  ```bash
  node scripts/update-skills.mjs [技能名稱]
  ```

---

## 🚦 狀態管控規則 (Guardrails)

1.  **禁止靜默覆蓋**：嚴禁跳過 `Audit` 階段直接覆蓋本地技能檔案。
2.  **原子化更新**：檔案覆蓋與元數據更新必須視為單一事務，失敗時應能手動或自動還原。
3.  **編碼保護**：確保所有產出的 `SKILL.md` 與程式碼檔案均為 **UTF-8 (No BOM)**。

## 📝 更新任務紀錄範本

- [x] **Check**: [技能名稱] 發現新版本 (Hash: a1b2... -> c3d4...)。
- [x] **Import**: 新版本檔案已下載至暫存區。
- [x] **Audit**: 已產出《更新安全審查報告》(結果: PASS)。
- [x] **Update**: 檔案已覆蓋，元數據已同步。
- [x] **Sync**: Manifest 已重新生成。
