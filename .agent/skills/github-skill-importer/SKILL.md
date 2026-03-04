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

## ⚠️ 常見問題與教訓 (Lessons Learned)

在執行導入任務時，請務必注意以下曾發生的錯誤，以確保資料完整性：

### 1. 遺漏深層子目錄 (Missing Subdirectories)

- **問題**：僅抓取根目錄的 `SKILL.md`，忽略了 `references/`、`scripts/` 或 `services/` 等關鍵參考資料。
- **對策**：在定位技能後，必須**遞迴掃描**該目錄下的所有子資料夾。若 `SKILL.md` 中有提到其他檔案連結，需優先補齊。

### 2. 中文編碼損壞 (Encoding Corruption)

- **問題**：在 Windows 環境下使用 PowerShell 的 `Set-Content` 或 `>` 重導向符號處理包含中文的檔案時，會導致編碼轉為 ANSI/UTF-16，使繁體中文變成亂碼 (`?`)。
- **對策**：**嚴禁**使用 PowerShell 原生命令修改檔案內容。請統一使用 `write_file` 工具或 Node.js 腳本並明確指定 `utf8` 編碼寫入。

### 3. 抓取後未寫入 (Silent Write Failure)

- **問題**：使用 `web_fetch` 獲取內容後，因流程中斷或遺漏步驟而未執行 `write_file`，導致本地出現空資料夾。
- **對策**：每抓取一個檔案，應立即執行對應的寫入指令，並在完成後使用 `ls -R` 或 `dir /s` 驗證檔案是否確實存在於磁碟。

### 4. 清單未包含深層檔案 (Manifest Sync)

- **問題**：`skills-manifest.json` 可能未掃描到過深層級的檔案，導致前端顯示異常。
- **對策**：完成檔案寫入後，務必執行 `npm run prebuild` 觸發 `generate-manifest.js` 重新掃描，並隨機抽查 `json` 內容。

### 5. 遺漏配置文件 (Missing skill.json)

- **問題**：部分 Repo（如 `claude-starter`）將自動啟用的元數據放在 `skill.json` 中，若未抓取會導致技能功能不完整。
- **對策**：導入時必須同時抓取同目錄下的 `skill.json`。**核心原則：使用者透過此平台下載的 SKILL 必須是完全體，嚴禁出現功能缺失或檔案不全的狀況。**

---

## 💡 技巧：如何有效獲取 GitHub 內容

- 使用 `web_fetch` 抓取目錄清單時，請觀察檔案結構。
- 如果是大型 Repo，優先尋找 `README.md` 中提到的技能目錄。
- 確保抓取原始內容 (Raw Content) 以避免 HTML 標籤干擾。
