# README 驅動 Skill 匯入作業手冊（每批 5 筆）

## 目的

建立可重複執行的標準流程，讓後續遇到新的 GitHub 來源時，能以固定節奏「每批 5 筆」完成：

1. 匯入缺漏技能
2. 校正既有技能 metadata（`githubUrl`、`author`）
3. 通過審查、上架與同步

---

## 單一事實來源（Source of Truth）

1. 候選與狀態：`plan/awesome-skills-tracking.json`
2. 安全審查報告：`plan/security-audits/batch-xxx.md`
3. 前端資料：`src/data/skills.ts`
4. SQL 初始化資料：`database/init_skills.sql`
5. 實際技能檔案：`public/SKILLS/<Category>/<skill-folder>/`
6. Manifest：`public/skills-manifest.json`（由 `npm run prebuild` 生成）

---

## Batch 固定流程（5 筆）

### Step 0: 挑選批次

1. 開啟 `plan/awesome-skills-tracking.json`
2. 若做校正：從 `nextBatchProposals.correction` 取前 5 筆
3. 若做匯入：從 `nextBatchProposals.import` 取前 5 筆
4. 批次命名：`batch-00N`

### Step 1: Import（僅匯入批次）

1. 取得 canonical URL（由 tracking `items[].canonical.originUrl`）
2. 優先用 `git sparse-checkout` 只抓需要路徑，避免整包 clone
3. 將技能內容放到：
   - 暫放：`public/SKILLS/Uncategorized/<skill>`
   - 審查通過後：`public/SKILLS/<Category>/<skill>`
4. 必備檢查：確認含 `SKILL.md`

### Step 2: Audit（必做，不可跳過）

1. 逐筆檢查 `SKILL.md`、`scripts/`、`references/`
2. 重點檢查：
   - 可執行腳本（shell/python/js）是否有危險行為
   - 是否要求不合理權限或含資料外傳風險
   - 是否暴露 secrets / hardcoded credentials
3. 在 `plan/security-audits/batch-00N.md` 記錄：
   - 範圍、項目、結果（PASS/WARNING/REJECT）、風險、處置
4. `WARNING/REJECT`：該 skill 不上架，保留於 tracking 並註記原因

### Step 3: Onboard

1. 決定分類（必須是 `src/types/skill.ts` 既有 category）
2. 更新 `src/data/skills.ts`
   - 新增 skill：分配新 `id`（只遞增，不重用）
   - 填 `name/description/author/category/tags/source/githubUrl`
3. 更新 `database/init_skills.sql`
   - 新增對應 `INSERT`（`id` 與 `skills.ts` 一致）
4. 匯入批次：搬移資料夾到最終分類路徑

### Step 4: Sync

1. 執行：`npm run prebuild`
2. 確認 `public/skills-manifest.json` 有該 5 筆條目

### Step 5: Verify

1. 執行：`npm run build`
2. 建議執行：`npm run test`（若有既有基線失敗需註記非本批導致）
3. 抽查：
   - 首頁可搜尋到 skill
   - SkillPage 可開啟
   - 檔案預覽與下載可用
   - GitHub 來源連結正確

### Step 6: Tracking 回寫

1. 在 `plan/awesome-skills-tracking.json` 新增/更新該批次：
   - `id/type/size/status/items/checklist`
2. checklist 固定欄位：
   - `import`、`audit`、`onboard`、`sync`
3. 更新後重新執行 inventory（建議）：
   - `node scripts/awesome-skills-inventory.mjs`

---

## 建議命令（PowerShell）

```powershell
# 1) 更新 tracking 快照
node scripts/awesome-skills-inventory.mjs

# 2) 同步 manifest
npm run prebuild

# 3) 建置驗證
npm run build

# 4) 測試（可選，但建議）
npm run test
```

---

## 批次完成定義（Definition of Done）

1. 每批固定 5 筆，且有明確批次 ID
2. `skills.ts` 與 `init_skills.sql` 已同步
3. `security-audits/batch-00N.md` 已建立並標示結果
4. `tracking.json` 已記錄批次與 checklist
5. `prebuild`、`build` 通過
6. manifest 已包含該批技能

---

## 新增來源時的防呆規則

1. README 只作發現入口，不當最終真值
2. canonical 來源衝突時，官方上游優先（例如 `anthropics/skills`）
3. 遇到 invalid fixture / 測試用 skill（如測試資料夾）先標記人工覆核
4. 任何審查不通過項目不可上架
5. 文字檔統一 UTF-8（No BOM）
