---
name: github-skill-importer
description: Github Skill Importer (從 GitHub 導入技能 SOP)
---

# Github Skill Importer (從 GitHub 導入技能 SOP)

此技能定義了如何從外部 GitHub Repository 尋找、驗證並抓取 AI 技能，將其導入至 SKILLS_All-in-one 平台的標準作業流程。

## 🔍 第一階段：搜尋與定位 (Discovery)

當使用者提供一個 GitHub URL 時，請執行以下步驟：

1.  **進入技能根目錄**：在 Repo 中尋找名為 `skills/` 或 `.claude/skills/` (或其他可能的技能存放路徑) 的資料夾。
2.  **列出子資料夾**：每個子資料夾通常代表一個獨立的技能。
3.  **定位目標**：根據使用者的需求，定位到特定的技能資料夾（例如 `skills/my-awesome-skill/`）。

## ✅ 第二階段：格式驗證 (Validation)

在導入之前，必須確認該目錄符合 **「正確的技能形式」**：

1.  **必要檔案**：目錄內必須包含 `SKILL.md`。
2.  **元數據檢查**：`SKILL.md` 的頂部必須包含 YAML Frontmatter，例如：
    ```yaml
    ---
    name: skill-name
    description: brief description
    ---
    ```
3.  **結構檢查**：檢查是否有 `references/`、`scripts/` 或 `examples/` 等輔助資料夾，這些也應一併導入。

## 📥 第三階段：下載與存放 (Import)

1.  **建立暫存區**：在 `@public\SKILLS\Uncategorized\` 下建立與 Repo 中相同的資料夾名稱。
2.  **抓取檔案**：使用 `web_fetch` 讀取並使用 `write_file` 寫入所有相關檔案。
    - 路徑：`@public\SKILLS\Uncategorized\{FolderName}\SKILL.md`
    - 路徑：`@public\SKILLS\Uncategorized\{FolderName}\references\**` (若有)

## 🛠️ 第四階段：銜接上架流程 (Onboarding)

完成導入後，請立即切換至 `Skill Onboarding Guide (技能上架 SOP)` 執行後續動作：

1.  **分類 (Classification)**：決定該技能屬於哪個分類並搬移資料夾。
2.  **資料庫同步**：更新 `database/init_skills.sql`。
3.  **前端同步**：更新 `src/data/skills.ts`。
4.  **清單同步**：執行 `npm run prebuild` 更新 `skills-manifest.json`。

---

## 💡 技巧：如何有效獲取 GitHub 內容

- 使用 `web_fetch` 抓取目錄清單時，請觀察檔案結構。
- 如果是大型 Repo，優先尋找 `README.md` 中提到的技能目錄。
- 確保抓取原始內容 (Raw Content) 以避免 HTML 標籤干擾。
