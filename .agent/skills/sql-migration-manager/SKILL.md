---
name: sql-migration-manager
description: 負責管理資料庫增量更新 (SQL Migrations)。當有新技能上架或現有技能內容異動時，負責產出增量 SQL 指令，不再改動 init_skills.sql。
---

# SQL Migration Manager (資料庫遷移管理)

此技能定義了如何為 `SKILLS_All-in-one` 平台產生增量資料庫更新指令，並將其集中記錄於單一 SQL 檔案中，確保異動軌跡清晰且易於追蹤。

## 🚀 核心工作流 (Migration Workflow)

### Step 1: 判定異動類型 (Identify Action)

1. **INSERT (新增)**：當 `skill-manager` 執行 `Onboard` 階段時。
2. **UPDATE (更新)**：當 `skill-updater` 偵測到版本差異並執行 `Update` 階段時。

### Step 2: 產出 SQL 語法 (Generate SQL)

根據 `database/init_skills.sql` 的資料表結構，生成對應的 SQL。

- **新增技能範本**：

  ```sql
  INSERT INTO Skill (id, name, nameZh, description, descriptionZh, author, category, tags, downloadCount, createdAt, version, githubUrl, folderName)
  VALUES ({id}, '{name}', '{nameZh}', '{description}', '{descriptionZh}', '{author}', '{category}', '{tags}', 0, '{today}', '{version}', '{githubUrl}', '{folderName}');
  ```

- **更新技能範本** (僅針對變更欄位)：
  ```sql
  UPDATE Skill SET
    version = '{new_version}',
    description = '{new_desc}',
    descriptionZh = '{new_desc_zh}',
    updatedAt = '{today}'
  WHERE name = '{name}';
  ```

### Step 3: 更新增量 SQL 檔案 (File Prepend)

1. **目標檔案**：`database/incremental_updates.sql`。
2. **寫入邏輯 (Prepending)**：
   - AI Agent 必須將新的 SQL 指令插入到檔案的 **最頂部 (Top)**。
   - **日期分組**：若當前日期與檔案頂部日期不同，需插入新的日期標籤（如 `--YYYY/MM/DD`）。
   - **排序**：最新的異動日期應出現在檔案最上方。

**範例結構**：

```sql
--2026/03/11
INSERT INTO Skill ... (新異動)

--2026/03/09
INSERT INTO Skill ... (舊異動)
UPDATE Skill SET ...
```

---

## 🚦 規則與限制 (Guardrails)

1. **禁止修改 init_skills.sql**：該檔案目前僅作為「初始環境建立備份」，不應手動或自動修改。
2. **ID 唯一性檢查**：在產出 `INSERT` 語句前，必須讀取 `src/data/skills.ts`，抓取最新的 `id`，並確保 ID 沒有重複。
3. **JSON 轉義**：處理 `tags` 欄位時，必須確保 JSON 字串內的引號已正確轉義。
4. **編碼保護**：寫入 `incremental_updates.sql` 時，必須確保為 **UTF-8 (No BOM)**。

## 📝 執行紀錄範本

- [x] **Migration**: 已將 SQL 異動記錄至 `database/incremental_updates.sql` (日期標籤: --2026/03/09)。
