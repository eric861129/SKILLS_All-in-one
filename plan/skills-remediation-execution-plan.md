# SKILL 修復與補齊主計畫（高效率分批、低負載、可持續執行）

## 1) 摘要

本計畫目標是同時解決三件事：

1. 逐一修正「有問題的 SKILL」（作者/來源錯誤、metadata 與檔案不一致）。
2. 高效率補齊 `awesome-claude-skills` 尚未納入的 SKILL。
3. 整理 `/plan`，保留必要檔案並將非核心文件歸檔，降低後續維護成本。

已知基線（目前狀態）：

- `awesome` 候選：374
- tracking 標記 `missing`：205
- tracking 標記作者/來源 mismatch：10
- `public/SKILLS` 實際存在且含 `SKILL.md`：168
- `public/SKILLS` 與 `awesome` 交集：148
- `public/SKILLS` 已存在但 tracking 仍 `missing`：15
- `public/SKILLS` 已存在且仍 mismatch：2（`oiloil-ui-ux-guide`, `skill-creator`）
- `missing` 中 fixture/invalid 類：28（先分流，不進主線上架）

已鎖定策略：

- `/plan`：中度清理
- `missing`：fixture 分流處理
- 批次節奏：單 repo、每批最多 5 筆
- 執行方式：混合模式（腳本生成 + 人工審查）

---

## 2) 範圍與成功標準

### 範圍內

1. 修正 tracking 的 mismatch 項目（作者/來源）。
2. 將 `public/SKILLS` 已存在但未上架（tracking missing）的 15 筆補齊上架流程。
3. 以 repo 為單位分批匯入非 fixture 的 missing SKILL。
4. 整理 `/plan` 結構與文件治理規範。

### 範圍外

1. fixture/invalid 類 skill 的正式上架（先留待低優先人工覆核）。
2. 非 awesome 來源的策略性產品規劃文件重寫（僅歸檔）。

### 成功標準（DoD）

1. `public/SKILLS` 已存在但 tracking `missing` 由 15 降到 0。
2. tracking mismatch 由 10 降到 0（或明確標註阻塞原因）。
3. 每批均遵守「單 repo、最多 5 筆、含安全審查報告」。
4. 每批完成後 `npm run prebuild && npm run build && npm run test` 可重現。
5. `/plan` 清理後只保留運行必要文件與歸檔目錄，無散落臨時文件。

---

## 3) `/plan` 中度清理規劃（必要保留 + 歸檔）

### 根目錄保留清單（allowlist）

1. `plan/awesome-skills-tracking.json`
2. `plan/awesome-skills-batch-playbook.md`
3. `plan/awesome-skills-batch-log.md`
4. `plan/awesome-skills-comparison-report.md`（最新單一版）
5. `plan/security-audits/`（全保留）
6. `plan/skills-remediation-execution-plan.md`（本企劃落地檔）
7. `plan/awesome-skills-work-queues.json`（批次調度 SoT）

### 歸檔規則

1. 建立 `plan/archive/`
2. 將非流程核心且非當前運行必要文件移到 `plan/archive/`
3. 先移動 `plan/future_reinforcement.md` 到 `plan/archive/future_reinforcement.md`
4. 之後若有歷史比較報告版本，統一放 `plan/archive/reports/`

### 刪除規則

1. 主目錄只允許 allowlist 文件與必要資料夾
2. 非 allowlist 的暫存輸出先移 archive，不直接刪除
3. 連續 2 週無引用再做刪除決策（降低誤刪風險）

---

## 4) 介面與資料結構變更（決策完成）

### 公開產品 API / 前端型別

- 不新增、不變更公開 API 與 UI 型別。

### 內部流程資料介面（新增）

新增 `plan/awesome-skills-work-queues.json`，作為批次調度單一事實來源（SoT）：

1. `generatedAt`
2. `queues.mismatch`
3. `queues.local_present_tracking_missing`
4. `queues.import_nonfixture_by_repo`
5. `queues.fixture_manual_review`
6. `queues.local_only_custom`

每個 queue item 欄位固定：

1. `sourceSlug`
2. `repo`
3. `repoPath`
4. `reason`
5. `priority`
6. `status`（`todo|doing|done|blocked|deferred`）
7. `notes`

---

## 5) 執行波次（Wave）與順序

### Wave 0：盤點同步（1 批）

1. 生成 `work-queues.json`
2. 確認每個 slug 的三方狀態：tracking / skills.ts / `public/SKILLS`
3. 產出「當日任務看板」

### Wave 1：先修低成本問題（4 批）

1. 批次 R1：修正已存在檔案且 mismatch 的 2 筆  
   `oiloil-ui-ux-guide`, `skill-creator`
2. 批次 R2-R4：補齊「檔案已存在但 tracking missing」15 筆  
   14 筆 `jeffallan/claude-skills` + 1 筆 `revealjs`
3. 此波不抓 GitHub 大 repo，先把「本地已有資產」上架完成

### Wave 2：缺漏匯入主線（單 repo x 5）

依 repo 優先順序：

1. `K-Dense-AI/claude-scientific-skills`（122，約 25 批）
2. `HeshamFS/materials-simulation-skills`（15，約 3 批）
3. `hashicorp/agent-skills`（9，約 2 批）
4. `raintree-technology/claude-starter`（7，約 2 批）
5. `sanjay3290/ai-skills`（7，約 2 批）
6. 其他單點 repo（各 1 批）

### Wave 3：人工覆核線（不併主線）

1. fixture/invalid（28）維持 `deferred`
2. `needs_manual_review`（來源衝突）逐筆人工定 canonical 後再入主線

---

## 6) 每批標準作業（SOP，單 repo、最多 5 筆）

1. 從 `work-queues.json` 選同 repo 前 5 筆 `todo`
2. 預估批次大小（檔案數/估算大小）；超出門檻則拆批
3. 用 sparse-checkout 只抓必要 `repoPath`
4. Import 到 `public/SKILLS/Uncategorized/<slug>/`
5. 執行安全審查並輸出 `plan/security-audits/batch-XXX.md`
6. Onboard：分類搬移 + `src/data/skills.ts` + `database/init_skills.sql`
7. Sync：`npm run prebuild`
8. Verify：`npm run build`、`npm run test`
9. 回寫：tracking、batch log、comparison report
10. Commit：一批一 commit，訊息固定模板

---

## 7) 混合模式落地（腳本 + 人工）

### 腳本負責

1. queue 生成
2. 批次候選挑選（同 repo、最多 5）
3. 大小預估與拆批建議
4. 狀態回寫（done/blocked）

### 人工負責

1. 安全審查判斷（PASS/WARNING/REJECT）
2. 類別與 tags 最終裁定
3. mismatch 內容修正正確性確認
4. `needs_manual_review` canonical 決策

---

## 8) 測試案例與驗收場景

1. 場景 A：僅 metadata 修正批（不抓新檔）  
   驗收：`skills.ts` 與 SQL 完整對齊，tracking 對應狀態更新。
2. 場景 B：本地已存在檔案的補登批（15 筆）  
   驗收：`tracking missing` 由 15 → 0。
3. 場景 C：遠端匯入批（單 repo x 5）  
   驗收：有 audit、有 onboard、有 prebuild/build/test 結果、有 commit。
4. 場景 D：fixture 分流  
   驗收：不進主線、不污染上架統計、有明確 deferred 記錄。
5. 場景 E：`/plan` 清理  
   驗收：主目錄僅 allowlist + 必要資料夾，`future_reinforcement.md` 已歸檔。

---

## 9) 風險與對策

1. 風險：單批抓取過大導致失敗  
   對策：單 repo + 5 筆上限 + 預估超標即拆批。
2. 風險：tracking 與檔案系統再次漂移  
   對策：每批結束必跑 reconciliation 檢查。
3. 風險：GitHub rate limit  
   對策：repo tree 結果本地快取，優先處理本地已有資產批次。
4. 風險：誤刪 `/plan` 文件  
   對策：中度清理先 archive、後刪除。

---

## 10) 交付物與檔案規劃（實作時建立/更新）

1. 新增：`plan/skills-remediation-execution-plan.md`（本企劃落地版）
2. 新增：`plan/awesome-skills-work-queues.json`
3. 新增：`plan/archive/`（含 `future_reinforcement.md` 歸檔）
4. 持續更新：  
   `plan/awesome-skills-tracking.json`  
   `plan/awesome-skills-batch-log.md`  
   `plan/security-audits/batch-XXX.md`  
   `plan/awesome-skills-comparison-report.md`

---

## 11) 假設與預設值（已鎖定）

1. 清理強度採「中度清理」。
2. fixture/invalid 採「分流處理」。
3. 批次節奏採「單 repo x 5 筆」。
4. 執行模式採「混合模式（腳本 + 人工）」。
5. 不變更公開 API；僅增補內部流程資料檔與治理規範。
