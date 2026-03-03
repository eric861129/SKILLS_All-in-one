# Contributing to SKILLS All-in-one

感謝你對 SKILLS All-in-one 的興趣！我們歡迎任何形式的貢獻。

---

## 如何提交新的 AI Skill

### 1. 準備你的 Skill 檔案

每個 Skill 是一個資料夾，包含一個 `SKILL.md` 主檔案和可選的輔助檔案。

```
your-skill-name/
├── SKILL.md          # 必要：技能主文件
├── scripts/          # 可選：輔助腳本
├── examples/         # 可選：範例檔案
└── resources/        # 可選：其他資源
```

### 2. 選擇分類

你的 Skill 必須歸類到以下分類之一：

| 分類 | 說明 |
|------|------|
| Document Skills | 文件處理相關 |
| Development & Code Tools | 程式開發工具 |
| Data & Analysis | 資料分析 |
| Scientific & Research Tools | 科學研究 |
| Writing & Research | 寫作與研究 |
| Learning & Knowledge | 學習與知識 |
| Media & Content | 媒體與內容 |
| Health & Life Sciences | 健康與生命科學 |
| Collaboration & Project Management | 協作與專案管理 |
| Security & Web Testing | 安全與測試 |
| Utility & Automation | 工具與自動化 |
| Collections | 技能合集 |

### 3. 提交方式

**方式一：透過 Issue 提交（推薦新手使用）**
1. 前往 [Submit a Skill Issue](https://github.com/eric861129/SKILLS_All-in-one/issues/new?template=submit_skill.md)
2. 填寫 Skill 資訊
3. 上傳或附上你的 Skill 檔案連結

**方式二：直接提交 Pull Request**
1. Fork 本專案
2. 將你的 Skill 資料夾放入 `public/SKILLS/{Category}/`
3. 在 `src/data/skills.ts` 中新增對應的 metadata
4. 提交 PR

---

## Pull Request 規範

### 分支命名
```
feat/add-skill-{skill-name}
fix/{description}
docs/{description}
```

### Commit Message 格式
```
feat: add {skill-name} skill
fix: {description}
docs: update {description}
```

### PR Checklist
- [ ] Skill 資料夾已放入正確的 `public/SKILLS/{Category}/` 路徑
- [ ] `src/data/skills.ts` 中已新增對應的 metadata
- [ ] `SKILL.md` 檔案包含完整的 YAML frontmatter (name, description)
- [ ] 本地 `npm run build` 通過

---

## 開發環境設定

```bash
# 1. Fork 並 Clone
git clone https://github.com/YOUR_USERNAME/SKILLS_All-in-one.git
cd SKILLS_All-in-one

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 確認 Build 通過
npm run build
```

---

## 行為準則

- 尊重所有貢獻者
- 提供有建設性的回饋
- 保持專業與友善的溝通

感謝你的貢獻！
