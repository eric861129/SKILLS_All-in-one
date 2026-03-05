# Awesome Skills Batch 執行紀錄

此檔用來保留「每批 5 筆」實際做了什麼，供後續批次直接比照。

---

## Batch 001

- 批次 ID：`batch-001`
- 日期：`2026-03-05`
- 類型：`correction`
- 筆數：`5`
- 項目：
  1. `internal-comms`
  2. `webapp-testing`
  3. `systematic-debugging`
  4. `using-git-worktrees`
  5. `finishing-a-development-branch`

### 執行內容

1. 依 canonical 來源校正既有資料（未匯入新檔案）
2. 更新 `src/data/skills.ts` 的 `author` / `githubUrl`
3. 同步更新 `database/init_skills.sql`
4. 建立審查報告：`plan/security-audits/batch-001.md`
5. 更新追蹤：`plan/awesome-skills-tracking.json`
6. 執行 `npm run prebuild`、`npm run build`

### 結果

- Audit：`PASS`（metadata-only）
- Onboard：`completed`
- Sync：`completed`

---

## Batch 002

- 批次 ID：`batch-002`
- 日期：`2026-03-05`
- 類型：`import`
- 筆數：`5`
- 項目：
  1. `adaptyv`
  2. `aeon`
  3. `alpha-vantage`
  4. `alphafold-database`
  5. `anndata`

### 執行內容

1. 來源確認：
   - canonical repo：`K-Dense-AI/claude-scientific-skills`
   - canonical path：`scientific-skills/<skill>`
2. Import：
   - 匯入 5 筆 skill 檔案（`SKILL.md + references`）
   - 最終放置：`public/SKILLS/Scientific & Research Tools/<skill>/`
3. Audit：
   - 檢查 `SKILL.md` 與 `references/`
   - 未發現需阻擋上架的執行風險
   - 報告：`plan/security-audits/batch-002.md`
4. Onboard：
   - 新增 `src/data/skills.ts`：id `182~186`
   - 新增 `database/init_skills.sql`：id `182~186`
5. Sync：
   - `npm run prebuild` 重建 manifest
6. Verify：
   - `npm run build` 通過
   - `npm run test` 有既有基線失敗（Docs/LanguageProvider），註記非本批新增導致
7. Tracking：
   - `plan/awesome-skills-tracking.json` 新增 `batch-002`，checklist 全部 `completed`

### 結果

- Audit：`PASS`
- Onboard：`completed`
- Sync：`completed`
- 匯入後缺漏數由 `269` 下降為 `264`

---

## Batch 003

- 批次 ID：`batch-003`
- 日期：`2026-03-05`
- 類型：`import`
- 筆數：`5`
- 項目：
  1. `arboreto`
  2. `astropy`
  3. `benchling-integration`
  4. `bgpt-paper-search`
  5. `bindingdb-database`

### 執行內容

1. 來源確認：
   - canonical repo：`K-Dense-AI/claude-scientific-skills`
   - canonical path：`scientific-skills/<skill>`
2. Import：
   - 匯入 5 筆 skill 檔案到 `public/SKILLS/Uncategorized/<skill>/`
3. Audit：
   - 檢查 `SKILL.md`、`references/`、`scripts/`
   - 未發現需阻擋上架的執行風險
   - 報告：`plan/security-audits/batch-003.md`
4. Onboard：
   - 分類移動到 `public/SKILLS/Scientific & Research Tools/<skill>/`
   - 新增 `src/data/skills.ts`：id `187~191`
   - 新增 `database/init_skills.sql`：id `187~191`
5. Sync：
   - `npm run prebuild` 重建 manifest
6. Verify：
   - `npm run build` 通過
7. Tracking：
   - 更新 `plan/awesome-skills-tracking.json`，新增 `batch-003`

### 結果

- Audit：`PASS`
- Onboard：`completed`
- Sync：`completed`

---

## Batch 004

- 批次 ID：`batch-004`
- 日期：`2026-03-05`
- 類型：`import`
- 筆數：`5`
- 項目：
  1. `biopython`
  2. `biorxiv-database`
  3. `bioservices`
  4. `brenda-database`
  5. `cbioportal-database`

### 執行內容

1. 來源確認：
   - canonical repo：`K-Dense-AI/claude-scientific-skills`
   - canonical path：`scientific-skills/<skill>`
2. Import：
   - 匯入 5 筆 skill 檔案到 `public/SKILLS/Uncategorized/<skill>/`
3. Audit：
   - 檢查 `SKILL.md`、`references/`、`scripts/`
   - 未發現需阻擋上架的執行風險
   - 報告：`plan/security-audits/batch-004.md`
4. Onboard：
   - 分類移動到 `public/SKILLS/Scientific & Research Tools/<skill>/`
   - 新增 `src/data/skills.ts`：id `192~196`
   - 新增 `database/init_skills.sql`：id `192~196`
5. Sync：
   - `npm run prebuild` 重建 manifest
6. Verify：
   - `npm run build` 通過
7. Tracking：
   - 更新 `plan/awesome-skills-tracking.json`，新增 `batch-004`

### 結果

- Audit：`PASS`
- Onboard：`completed`
- Sync：`completed`

---

## Batch 005

- 批次 ID：`batch-005`
- 日期：`2026-03-05`
- 類型：`import`
- 筆數：`5`
- 項目：
  1. `aws-ami-builder`
  2. `azure-image-builder`
  3. `azure-verified-modules`
  4. `new-terraform-provider`
  5. `provider-actions`

### 執行內容

1. 來源確認：
   - canonical repo：`hashicorp/agent-skills`
   - canonical path：`packer/*`、`terraform/*`
2. Import：
   - 匯入 5 筆 skill 檔案到 `public/SKILLS/Uncategorized/<skill>/`
3. Audit：
   - 檢查 `SKILL.md`、`assets/`
   - 未發現需阻擋上架的執行風險
   - 報告：`plan/security-audits/batch-005.md`
4. Onboard：
   - 分類移動到 `public/SKILLS/Infrastructure & Cloud/<skill>/`
   - 新增 `src/data/skills.ts`：id `197~201`
   - 新增 `database/init_skills.sql`：id `197~201`
5. Sync：
   - `npm run prebuild` 重建 manifest
6. Verify：
   - `npm run build` 通過
7. Tracking：
   - 更新 `plan/awesome-skills-tracking.json`，新增 `batch-005`

### 結果

- Audit：`PASS`
- Onboard：`completed`
- Sync：`completed`

---

## Batch 006

- 批次 ID：`batch-006`
- 日期：`2026-03-05`
- 類型：`import`
- 筆數：`5`
- 項目：
  1. `cellxgene-census`
  2. `chembl-database`
  3. `cirq`
  4. `citation-management`
  5. `clinical-decision-support`

### 執行內容

1. 來源確認：
   - canonical repo：`K-Dense-AI/claude-scientific-skills`
   - canonical path：`scientific-skills/<skill>`
2. Import：
   - 匯入 5 筆 skill 檔案到 `public/SKILLS/Uncategorized/<skill>/`
3. Audit：
   - 檢查 `SKILL.md`、`references/`、`scripts/`、`assets/`
   - 未發現需阻擋上架的執行風險
   - 報告：`plan/security-audits/batch-006.md`
4. Onboard：
   - 分類移動到 `public/SKILLS/Scientific & Research Tools/<skill>/`
   - 新增 `src/data/skills.ts`：id `202~206`
   - 新增 `database/init_skills.sql`：id `202~206`
5. Sync：
   - `npm run prebuild` 重建 manifest
6. Verify：
   - `npm run build` 通過
7. Tracking：
   - 更新 `plan/awesome-skills-tracking.json`，新增 `batch-006`

### 結果

- Audit：`PASS`
- Onboard：`completed`
- Sync：`completed`

---

## Batch 007

- 批次 ID：`batch-007`
- 日期：`2026-03-05`
- 類型：`import`
- 筆數：`5`
- 項目：
  1. `clinical-reports`
  2. `clinicaltrials-database`
  3. `clinpgx-database`
  4. `clinvar-database`
  5. `cobrapy`

### 執行內容

1. 來源確認：
   - canonical repo：`K-Dense-AI/claude-scientific-skills`
   - canonical path：`scientific-skills/<skill>`
2. Import：
   - 匯入 5 筆 skill 檔案到 `public/SKILLS/Uncategorized/<skill>/`
3. Audit：
   - 檢查 `SKILL.md`、`references/`、`scripts/`、`assets/`
   - 未發現需阻擋上架的執行風險
   - 報告：`plan/security-audits/batch-007.md`
4. Onboard：
   - 分類移動到 `public/SKILLS/Scientific & Research Tools/<skill>/`
   - 新增 `src/data/skills.ts`：id `207~211`
   - 新增 `database/init_skills.sql`：id `207~211`
5. Sync：
   - `npm run prebuild` 重建 manifest
6. Verify：
   - `npm run build` 通過
7. Tracking：
   - 更新 `plan/awesome-skills-tracking.json`，新增 `batch-007`

### 結果

- Audit：`PASS`
- Onboard：`completed`
- Sync：`completed`

---

## Batch 008

- 批次 ID：`batch-008`
- 日期：`2026-03-05`
- 類型：`import`
- 筆數：`5`
- 項目：
  1. `atlassian`
  2. `claude-mcp-expert`
  3. `claude-skill-builder`
  4. `code-review`
  5. `consciousness-council`

### 執行內容

1. 來源確認：
   - canonical repos：`sanjay3290/ai-skills`、`raintree-technology/claude-starter`、`avifenesh/agnix`、`K-Dense-AI/claude-scientific-skills`
   - canonical paths：`skills/atlassian`、`.claude/skills/anthropic/*`、`tests/fixtures/valid/skills/code-review`、`scientific-skills/consciousness-council`
2. Import：
   - 匯入 5 筆 skill 檔案到 `public/SKILLS/Uncategorized/<skill>/`
3. Audit：
   - 檢查 `SKILL.md`、`scripts/`、`references/`
   - 未發現需阻擋上架的執行風險
   - 報告：`plan/security-audits/batch-008.md`
4. Onboard：
   - 分類移動到：
     - `Collaboration & Project Management`: `atlassian`
     - `Development & Code Tools`: `claude-mcp-expert`, `code-review`
     - `Utility & Automation`: `claude-skill-builder`, `consciousness-council`
   - 新增 `src/data/skills.ts`：id `212~216`
   - 新增 `database/init_skills.sql`：id `212~216`
5. Sync：
   - `npm run prebuild` 重建 manifest
6. Verify：
   - `npm run build` 通過
7. Tracking：
   - 更新 `plan/awesome-skills-tracking.json`，新增 `batch-008`

### 結果

- Audit：`PASS`
- Onboard：`completed`
- Sync：`completed`

---

## 後續批次填寫模板

請複製以下段落新增 `batch-00N`：

```md
## Batch 00N

- 批次 ID：`batch-00N`
- 日期：`YYYY-MM-DD`
- 類型：`correction` 或 `import`
- 筆數：`5`
- 項目：
  1. `skill-a`
  2. `skill-b`
  3. `skill-c`
  4. `skill-d`
  5. `skill-e`

### 執行內容

1. Source 判定與 canonical URL 確認
2. Import / Correction
3. Audit（附報告檔名）
4. Onboard（列出修改檔案）
5. Sync（prebuild）
6. Verify（build/test）
7. Tracking 回寫

### 結果

- Audit：`PASS/WARNING/REJECT`
- Onboard：`completed/pending`
- Sync：`completed/pending`
- 備註：`...`
```
