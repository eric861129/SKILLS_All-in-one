import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal } from "lucide-react";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from "../hooks/useLanguage";
import type { Components } from 'react-markdown';

interface HowItWorksProps {
  isOpen: boolean;
  onClose: () => void;
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mt-2 mb-8 leading-tight">{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-12 mb-6 pb-2 border-b border-slate-800">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-bold text-slate-100 mt-10 mb-4">{children}</h3>,
  h4: ({ children }) => <h4 className="text-lg font-semibold text-slate-200 mt-8 mb-3">{children}</h4>,
  p: ({ children }) => <p className="text-slate-400 leading-8 mb-6 text-base md:text-lg">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:text-indigo-300 underline underline-offset-4 transition-colors"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc marker:text-accent pl-6 space-y-3 text-slate-400 mb-6">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal marker:text-emerald-400 pl-6 space-y-3 text-slate-400 mb-6">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-accent bg-accent/5 text-slate-300 rounded-r-2xl pl-6 py-4 mb-8 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-slate-800/50" />,
  table: ({ children }) => (
    <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-900/80 text-slate-200">{children}</thead>,
  tbody: ({ children }) => <tbody className="text-slate-400">{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-slate-800/50 last:border-0">{children}</tr>,
  th: ({ children }) => <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-500">{children}</th>,
  td: ({ children }) => <td className="px-6 py-4 align-top leading-relaxed">{children}</td>,
  pre: ({ children }) => (
    <pre className="bg-slate-950 border border-white/5 rounded-2xl p-6 mb-8 overflow-x-auto text-sm leading-relaxed font-mono text-emerald-400 shadow-2xl">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return <code className="font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">{children}</code>;
    }
    return <code className="font-mono">{children}</code>;
  },
  strong: ({ children }) => <strong className="text-slate-100 font-black">{children}</strong>,
  em: ({ children }) => <em className="text-slate-200 italic">{children}</em>,
};

const ARTICLE_CONTENT_ZH = `# 什麼是 AI Agent SKILL？定義未來協作的「能力單元」

在 AI Agent 的世界中，大語言模型（LLM）是「大腦」，但如果沒有 **SKILL（技能）**，大腦就像是一個空有知識卻無法與物理世界互動、沒有專業 SOP 的靈魂。

### 💡 核心定義

**AI Agent SKILL** 是一個標準化的「能力封裝包」。它不只是幾行程式碼，而是結合了 **特定意圖（Intent）**、**操作工具（Tools）** 與 **執行邏輯（Logic）** 的模組。

簡單來說：

* **LLM** 知道「什麼是電子郵件」。
* **SKILL** 讓 Agent 知道「如何存取你的 Outlook、遵循你的語氣風格，並在週五下午自動彙報進度」。

---

## SKILL 的三大組成要素

一個高品質的 SKILL 遵循「感知－決策－執行」的閉環：

1. **指令規範 (System Instructions)**：定義 Agent 在具備此技能時的「人格」與「作業標準書」。
2. **工具組 (Toolsets/Functions)**：定義 Agent 可以調用的 API、腳本或本地指令（如：檔案讀寫、網頁搜索）。
3. **知識上下文 (Injected Context)**：提供該領域必備的知識庫或範例（Few-shot prompting），減少模型幻覺。

---

## SKILLS 平台的標準格式 (Standard Specification)

為了確保所有的 SKILL 都能在不同的 Agent 環境（如 Claude Code, Claude Desktop, ChatGPT）中無縫切換，我們採用 **\`SKILLS v1.0\` 標準結構**（兼容 agentskills.io 規範）。

每個 SKILL 必須以一個資料夾形式存在，結構如下：

\`\`\`text
/your-skill-name
├── SKILL.md          # 核心能力索引與說明書 (必備)
├── config.json       # 自動化配置與元數據 (選填)
├── scripts/          # 執行的腳本邏輯 (Python/JS/Bash) (選填)
├── templates/        # 輸出的格式模板或範例 (選填)
├── reference/        # 格式範本、專有名詞、填寫範例 (選填)
└── assets/           # 靜態資源：圖片、資料檔、PDF (選填)
\`\`\`

### 1. \`SKILL.md\`：技能的身分證與「導航地圖」

這是最重要的檔案，採用結構化 Markdown 撰寫。它不僅是給人看的文件，更是 **Agent 在掃描可用技能時的唯一依據**。

#### 🛡️ 檔案頭部 (YAML Frontmatter) 規範

\`SKILL.md\` 開頭必須包含精確的 YAML 定義，這決定了 Agent 是否能正確「檢索」到此技能：

\`\`\`yaml
---
name: skill-name
description: A description of what this skill does and when to use it.
---
\`\`\`

**嚴格命名規則：**

* **Name**: 長度 1-64 字元。只能包含小寫字母、數字與破折號 \`-\`（不能以 \`-\` 開頭結尾或連續）。**必須與目錄名稱完全一致**。
* **Description**: 長度 1-1024 字元。這是寫給 Agent 看的「廣告」，應清晰描述：**「這個技能能幫你做什麼？」** 以及 **「在什麼情況下你應該啟用它？」**。

#### 📄 內容結構 (Content Body)

* **Capabilities**: 條列此技能可以解決什麼問題，建議使用動詞開頭（例如：Refactor, Analyze, Generate）。
* **Prerequisites**: 需要安裝什麼環境或 API Key。
* **Safety Audit**: 標註該技能是否涉及敏感操作（如刪除檔案）。

---

### 2. \`config.json\`：機器可讀配置 (MCP/JSON Schema)

用於自動化部署與工具定義。如果你希望 Agent 能「主動呼叫」特定 Function，請在此定義工具的 JSON Schema。

\`\`\`json
{
  "id": "code-refactor-pro",
  "version": "1.2.0",
  "author": "EricHuang",
  "runtime": "node20",
  "permissions": ["file_read", "file_write"],
  "tools": [
    {
      "name": "analyze_complexity",
      "description": "計算指定程式碼檔案的圈複雜度（Cyclomatic Complexity）",
      "parameters": {
        "type": "object",
        "properties": {
          "filePath": { "type": "string" }
        }
      }
    }
  ]
}
\`\`\``;

const ARTICLE_CONTENT_EN = `# What is AI Agent SKILL? Defining "Atomic Capabilities" for the Future

In the world of AI Agents, large language models (LLMs) are the "brain," but without **SKILLS**, the brain is like a soul full of knowledge but unable to interact with the physical world or follow professional SOPs.

### 💡 Core Definition

An **AI Agent SKILL** is a standardized "capability encapsulation package." It's not just a few lines of code, but a module that combines **Specific Intents**, **Operational Tools**, and **Execution Logic**.

Simply put:

* **LLM** knows "what an email is."
* **SKILL** tells the Agent "how to access your Outlook, follow your tone of voice, and automatically report progress every Friday afternoon."

---

## Three Pillars of a SKILL

A high-quality SKILL follows the "Perceive – Decide – Execute" loop:

1. **System Instructions**: Defines the "persona" and "standard operating procedures" (SOP) when the Agent possesses this skill.
2. **Toolsets/Functions**: Defines the APIs, scripts, or local commands (e.g., file I/O, web search) the Agent can invoke.
3. **Injected Context**: Provides essential domain knowledge or few-shot examples to reduce model hallucination.

---

## Standard Specification for the SKILLS Platform

To ensure all SKILLs can seamlessly switch across different environments (like Claude Code, Cursor, Gemini), we adopt the **\`SKILLS v1.0\` standard structure**.

Each SKILL must exist as a folder with the following structure:

\`\`\`text
/your-skill-name
├── SKILL.md          # Core capability index and manual (Required)
├── config.json       # Automated config and metadata (Optional)
├── scripts/          # Execution logic scripts (Python/JS/Bash) (Optional)
├── templates/        # Output format templates or examples (Optional)
├── reference/        # Reference docs and terminology (Optional)
└── assets/           # Static resources: images, data files, PDFs (Optional)
\`\`\`

### 1. \`SKILL.md\`: The Identity and Navigation Map

This is the most critical file, written in structured Markdown. It is not just for humans but is the **sole source of truth for the Agent when scanning for available capabilities**.

#### 🛡️ YAML Frontmatter Specification

The top of \`SKILL.md\` must contain precise YAML definitions to ensure the Agent can correctly "retrieve" the skill:

\`\`\`yaml
---
name: skill-name
description: A description of what this skill does and when to use it.
---
\`\`\`

**Strict Naming Rules:**

* **Name**: 1-64 characters. Lowercase letters, numbers, and hyphens \`-\` only. **Must match the directory name exactly**.
* **Description**: 1-1024 characters. This is the "ad" for the Agent. It should clearly state: **"What can this skill do for you?"** and **"Under what conditions should you enable it?"**.

#### 📄 Content Body

* **Capabilities**: List what problems this skill solves (e.g., Refactor, Analyze, Generate).
* **Prerequisites**: Required environments or API keys.
* **Safety Audit**: Marks if the skill involves sensitive operations (like deleting files).

---

### 2. \`config.json\`: Machine-Readable Config (MCP/JSON Schema)

Used for automated deployment and tool definitions. If you want the Agent to "proactively call" specific functions, define the JSON Schema here.

\`\`\`json
{
  "id": "code-refactor-pro",
  "version": "1.2.0",
  "author": "EricHuang",
  "runtime": "node20",
  "permissions": ["file_read", "file_write"],
  "tools": [
    {
      "name": "analyze_complexity",
      "description": "Calculate the cyclomatic complexity of a specified code file",
      "parameters": {
        "type": "object",
        "properties": {
          "filePath": { "type": "string" }
        }
      }
    }
  ]
}
\`\`\``;

export const HowItWorks = ({ isOpen, onClose }: HowItWorksProps) => {
  const { language, t } = useLanguage();
  const content = language === 'zh' ? ARTICLE_CONTENT_ZH : ARTICLE_CONTENT_EN;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl h-[85vh] bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] z-[70] flex flex-col overflow-hidden"
          >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 md:px-10 md:py-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 items-center justify-center text-accent shadow-inner">
                  <Terminal size={20} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-[9px] font-black uppercase tracking-widest mb-2">
                    Industry Standard Protocol
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white leading-tight uppercase italic">
                    Capability Unit
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-all shadow-xl active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content: Scrollable Article */}
            <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar">
              <article className="max-w-3xl mx-auto">
                <Markdown 
                  components={markdownComponents} 
                  remarkPlugins={[remarkGfm]}
                >
                  {content}
                </Markdown>
              </article>
            </div>

            {/* Footer */}
            <div className="p-6 md:px-10 border-t border-white/5 bg-slate-950/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Standardized Skill Specification v1.0
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-full md:w-auto px-10 py-3 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-[0.15em] text-[10px] hover:bg-accent hover:text-white transition-all duration-500 shadow-xl active:scale-95"
              >
                {t("closeModal")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
