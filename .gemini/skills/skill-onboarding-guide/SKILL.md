---
name: Skill Onboarding Guide
description: Skill Onboarding Guide (技能上架 SOP)
---

# Skill Onboarding Guide (技能上架 SOP)

此技能定義了在 SKILLS_All-in-one 平台中新增一個 AI 技能的標準流程。請務必遵循以下步驟以確保系統的一致性與功能的完整性。

## 📥 初始步驟

當下載新的技能檔案後，請先將其放入：
`@public\SKILLS\Uncategorized\**`

## 🛠️ 作業流程

### 1. 分類該 SKILL (Classification)

- 根據技能的功能，從現有的分類中選擇最合適的一個（例如：Development & Code Tools, Data & Analysis 等）。
- 將檔案夾從 `Uncategorized` 移動到 `@public\SKILLS\{Category}\{FolderName}\`。

### 2. 資料庫同步 (Database Update)

- 在 `@database/init_skills.sql` 的最底部新增一段 `INSERT INTO Skill ...` 的 SQL 語法。
- **欄位注意事項**：
  - `id`: 請接續目前最高的 ID。
  - `downloadCount`: 預設為 `0`。
  - `createdAt`: 使用目前的日期 (YYYY-MM-DD)。
  - `folderName`: 必須與實體資料夾名稱一致。

### 3. 前端元資料同步 (Frontend Metadata)

- 在 `@src/data/skills.ts` 中新增該技能的物件。
- 欄位包含 `id`, `name`, `nameZh`, `description`, `descriptionZh`, `category`, `tags`, `downloadCount` (預設為 0) 等。

### 4. 資源清單同步 (Manifest Update)

- 在 `@public/skills-manifest.json` 中新增該技能的檔案結構。
- 格式範例：
  ```json
  "folder-name": {
    "category": "Category Name",
    "files": ["SKILL.md", "references/readme.md"]
  }
  ```

---

## ✅ 最終檢查清單 (Checklist)

- [ ] 實體檔案路徑正確且包含 `SKILL.md`。
- [ ] `init_skills.sql` 已加入該筆資料。
- [ ] `src/data/skills.ts` 已加入該筆資料且 ID 無衝突。
- [ ] `skills-manifest.json` 已更新，確保前端下載功能正常。
- [ ] 執行 `npm run prebuild` (若適用) 以重新生成清單。
