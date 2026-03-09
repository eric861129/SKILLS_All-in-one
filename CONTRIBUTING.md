# 貢獻指南

[English version](./CONTRIBUTING_en.md)

<a id="contributing-guide"></a>

感謝你想幫忙完善 **SKILLS All-in-one**。這份文件說明如何提交新技能、送出 Pull Request，以及在更新技能資料時需要同步處理哪些內容。

<a id="submit-skill-guide"></a>

## 提交技能說明

如果你想先提案，再由維護者協助整理進庫，請使用 `Submit a Skill` Issue 流程。

### 適合用 Issue 的情況

- 你有技能來源或想法，但還沒整理成 PR
- 你想先確認分類、命名、適用平台或收錄方向
- 你希望先提供技能說明、GitHub repo、預覽截圖或 `SKILL.md` 草稿

### 提交步驟

1. 先閱讀本頁說明，確認技能分類與基本結構。
2. 開啟 [Submit a Skill Issue](https://github.com/eric861129/SKILLS_All-in-one/issues/new?template=submit_skill.md)。
3. 填寫技能名稱、作者、分類、標籤、用途與來源連結。
4. 如果已經有 `SKILL.md` 或 repo，也請一併附上。

### 建議提供的資訊

- 技能名稱
- 作者或來源
- 類別
- 關鍵標籤
- 使用情境
- 原始 repo / 文件 / 截圖
- `SKILL.md` 範例或摘要

## 用 Pull Request 直接貢獻

如果你已經整理好技能檔案，建議直接送 PR。

### 目錄結構

```text
public/SKILLS/{Category}/{skill-name}/
  SKILL.md
  scripts/
  examples/
  references/
  assets/
```

### 必要更新

1. 將技能檔案加入 `public/SKILLS/{Category}/{skill-name}/`
2. 在 `src/data/skills.ts` 新增對應 metadata
3. 視需要更新 `database/incremental_updates.sql`
4. 確認 `SKILL.md` 至少有清楚的 `name` 與 `description`
5. 本地驗證 `npm run build`

### PR 命名建議

```text
feat/add-skill-{skill-name}
fix/{description}
docs/{description}
```

### Commit message 建議

```text
feat: add {skill-name} skill
fix: {description}
docs: update {description}
```

### PR Checklist

- [ ] 技能檔案已加入正確分類目錄
- [ ] `src/data/skills.ts` 已新增或更新 metadata
- [ ] 如有需要，已同步更新 `database/incremental_updates.sql`
- [ ] `SKILL.md` 已包含基本說明
- [ ] `npm run build` 可通過

## 類別參考

- Document Skills
- Development & Code Tools
- Data & Analysis
- Scientific & Research Tools
- Writing & Research
- Learning & Knowledge
- Media & Content
- Health & Life Sciences
- Collaboration & Project Management
- Security & Web Testing
- Utility & Automation
- Collections

## 本地開發

```bash
git clone https://github.com/YOUR_USERNAME/SKILLS_All-in-one.git
cd SKILLS_All-in-one
npm install
npm run dev
npm run build
```
