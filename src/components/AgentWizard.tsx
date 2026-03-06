import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, Cpu, Settings, Globe, 
  ExternalLink, BookOpen, AlertCircle, Lightbulb, ChevronRight, 
  Info, Zap, Share2, FileCode, Sparkles, ShieldAlert, Layers, Code2
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const platforms = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: <Cpu size={18} />,
    docUrl: 'https://code.claude.com/docs/zh-TW/overview',
    description: {
      en: 'High-performance terminal agent by Anthropic. Supports global and project-level skill injection.',
      zh: 'Anthropic 開發的高性能終端 Agent。支援全域與專案等級的技能注入。'
    },
    content: {
      zh: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> 確認 SKILL 資料夾結構
            </h3>
            <p className="mb-6 leading-relaxed">在掛載前，請確保你的 SKILL 包符合標準結構。一個標準的 Skill 應該是一個資料夾，其內部至少包含一個 <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">SKILL.md</code>。</p>
            <ul className="space-y-4 list-none">
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                <div><strong>資料夾名稱：</strong>建議使用 <code>kebab-case</code>（如 <code>my-awesome-skill</code>）。</div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                <div><strong>SKILL.md：</strong>內容必須包含 YAML Frontmatter（名稱與描述），這是 Claude 辨識工具的關鍵。</div>
              </li>
            </ul>
            <div className="mt-6 bg-slate-950 border border-white/5 rounded-2xl p-6 font-mono text-xs leading-relaxed overflow-x-auto">
              <pre>{`---
name: my-awesome-skill
description: 描述這個 Skill 能做什麼，以及何時觸發（Trigger）
---
# Skill 指令內容...`}</pre>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> 選擇掛載路徑
            </h3>
            <p className="mb-8">根據你的需求，將資料夾移動到對應的位置：</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">全域掛載 (Personal Skills)</h4>
                <p className="text-sm text-slate-400 mb-6">如果你希望在任何專案下啟動都能使用，請放置於使用者的全域設定目錄：</p>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">macOS/Linux: <span className="text-accent">~/.claude/skills/</span></div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">Windows: <span className="text-accent">%USERPROFILE%\\.claude\\skills\\</span></div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition-all">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">專案專屬掛載 (Project Skills)</h4>
                <p className="text-sm text-slate-400 mb-6">如果你只希望在當前開發的專案中使用（例如特定的代碼風格檢查）：</p>
                <div className="bg-slate-900 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300">
                  路徑: <span className="text-emerald-400">[專案根目錄]/.claude/skills/</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">03.</span> 重新啟動或重載
            </h3>
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex gap-4">
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <p className="text-sm leading-relaxed">掛載完成後，原本開啟的 Claude Code 工作階段可能不會即時偵測到。請輸入以下指令：</p>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 text-sm bg-slate-900 p-4 rounded-xl border border-white/5">
                <code className="text-white">/exit</code> <span className="text-slate-500">結束運行中的階段</span>
              </div>
              <div className="flex items-center gap-4 text-sm bg-slate-900 p-4 rounded-xl border border-white/5">
                <code className="text-white">claude</code> <span className="text-slate-500">重新在終端機啟動</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">04.</span> 驗證與使用
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <TerminalIcon size={16} className="text-slate-500" /> 直接呼叫
                </h4>
                <p className="text-sm text-slate-400">輸入 <code>/</code> 加上你的 Skill 名稱確認是否觸發。</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-slate-500" /> 自然語言觸發
                </h4>
                <p className="text-sm text-slate-400">根據 <code>description</code> 直接下令，Claude 會自動辨識並載入。</p>
              </div>
            </div>
          </section>

          <section className="pt-10 border-t border-white/5">
            <div className="p-10 rounded-[3rem] bg-accent/5 border border-accent/10 relative overflow-hidden group">
              <Lightbulb className="absolute top-[-20px] right-[-20px] w-48 h-48 text-accent/5 group-hover:text-accent/10 transition-colors" />
              <div className="relative z-10">
                <h4 className="text-accent text-xl font-black mb-8 flex items-center gap-2 italic uppercase">
                  💡 大師小撇步
                </h4>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-2 shrink-0" />
                    <div>
                      <strong className="text-white block mb-1">衝突處理</strong>
                      <p className="text-sm text-slate-400">如果全域與專案有同名 Skill，全域設定會優先被採用（覆蓋）。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-2 shrink-0" />
                    <div>
                      <strong className="text-white block mb-1">偵錯模式</strong>
                      <p className="text-sm text-slate-400">如果沒反應，啟動時使用 <code>claude --debug</code> 查看詳細日誌。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-2 shrink-0" />
                    <div>
                      <strong className="text-white block mb-1">組合技</strong>
                      <p className="text-sm text-slate-400">結合 <code>scripts/</code> 裡的 Python/Bash 腳本，讓 SKILL.md 負責引導，腳本負責重度運算。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ),
      en: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> Verify SKILL Structure
            </h3>
            <p className="mb-6 leading-relaxed">Ensure your Skill package follows the standard structure. A standard Skill should be a folder containing at least a <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">SKILL.md</code> file.</p>
            <ul className="space-y-4 list-none">
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                <div><strong>Folder Name:</strong> Recommended to use <code>kebab-case</code> (e.g., <code>my-awesome-skill</code>).</div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                <div><strong>SKILL.md:</strong> Must contain YAML Frontmatter (name & description) for Claude to identify the tool.</div>
              </li>
            </ul>
            <div className="mt-6 bg-slate-950 border border-white/5 rounded-2xl p-6 font-mono text-xs leading-relaxed overflow-x-auto">
              <pre>{`---
name: my-awesome-skill
description: Describe what this Skill does and when it should trigger
---
# Skill instructions content...`}</pre>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> Choose Mounting Path
            </h3>
            <p className="mb-8">Move your folder to the appropriate location based on your needs:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">Global Mounting (Personal Skills)</h4>
                <p className="text-sm text-slate-400 mb-6">If you want the skill available in all projects, use the global directory:</p>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">macOS/Linux: <span className="text-accent">~/.claude/skills/</span></div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">Windows: <span className="text-accent">%USERPROFILE%\\.claude\\skills\\</span></div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition-all">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">Project-Specific Mounting</h4>
                <p className="text-sm text-slate-400 mb-6">If you only want the skill in the current development project:</p>
                <div className="bg-slate-900 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300">
                  Path: <span className="text-emerald-400">[Project Root]/.claude/skills/</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">03.</span> Restart or Reload
            </h3>
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex gap-4">
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <p className="text-sm leading-relaxed">Claude Code sessions might not detect changes instantly. Execute the following:</p>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 text-sm bg-slate-900 p-4 rounded-xl border border-white/5">
                <code className="text-white">/exit</code> <span className="text-slate-500">Exit the current session</span>
              </div>
              <div className="flex items-center gap-4 text-sm bg-slate-900 p-4 rounded-xl border border-white/5">
                <code className="text-white">claude</code> <span className="text-slate-500">Relaunch in terminal</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">04.</span> Verify & Use
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <TerminalIcon size={16} className="text-slate-500" /> Direct Call
                </h4>
                <p className="text-sm text-slate-400">Type <code>/</code> followed by your Skill name to trigger it.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-slate-500" /> Natural Language
                </h4>
                <p className="text-sm text-slate-400">Ask Claude naturally; it will automatically identify and load the matching skill.</p>
              </div>
            </div>
          </section>

          <section className="pt-10 border-t border-white/5">
            <div className="p-10 rounded-[3rem] bg-accent/5 border border-accent/10 relative overflow-hidden group">
              <Lightbulb className="absolute top-[-20px] right-[-20px] w-48 h-48 text-accent/5 group-hover:text-accent/10 transition-colors" />
              <div className="relative z-10">
                <h4 className="text-accent text-xl font-black mb-8 flex items-center gap-2 italic uppercase">
                  💡 Master Tips
                </h4>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-2 shrink-0" />
                    <div>
                      <strong className="text-white block mb-1">Conflict Resolution</strong>
                      <p className="text-sm text-slate-400">Global skills override project-level ones if names collide.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-2 shrink-0" />
                    <div>
                      <strong className="text-white block mb-1">Debug Mode</strong>
                      <p className="text-sm text-slate-400">Use <code>claude --debug</code> to view detailed skill loading logs.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mt-2 shrink-0" />
                    <div>
                      <strong className="text-white block mb-1">Power Combos</strong>
                      <p className="text-sm text-slate-400">Combine <code>SKILL.md</code> with scripts in the <code>scripts/</code> folder for heavy computation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    }
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: <Code2 size={18} />,
    docUrl: 'https://docs.cursor.com/',
    description: {
      en: 'The AI-first code editor. Supports project-level .cursorrules and global AI instructions.',
      zh: 'AI 優先的程式碼編輯器。支援專案級 .cursorrules 與全域 AI 指令掛載。'
    },
    content: {
      zh: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> 轉換 SKILL 內容
            </h3>
            <p className="mb-6 leading-relaxed">Cursor 的核心是讀取指令文件。請打開你原本那包 SKILL 裡的 <code>SKILL.md</code>，將其內容（特別是 <code>Instructions</code> 部分）準備好。</p>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> 選擇掛載方式
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">專案級掛載 (Project-Specific)</h4>
                <p className="text-sm text-slate-400 mb-6">如果你希望這套技能只在特定專案中生效：</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">1.</span> <span>在專案根目錄建立 <code>.cursorrules</code> 檔案。</span></li>
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">2.</span> <span>將 <code>SKILL.md</code> 內容貼進去。</span></li>
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">3.</span> <span><strong>自動偵測：</strong>當你在 Composer 或 Chat 中對話時會優先遵循。</span></li>
                </ol>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition-all">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">全域級掛載 (Global Rules)</h4>
                <p className="text-sm text-slate-400 mb-6">如果你希望在所有專案中都具備這套技能：</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">1.</span> <span>開啟 Cursor Settings (Cmd+Shift+J)。</span></li>
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">2.</span> <span>找到 General -&gt; Rules for AI。</span></li>
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">3.</span> <span>將你的技能指令貼入文字框。</span></li>
                </ol>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">03.</span> 進階掛載 — 引用外部腳本或文件
            </h3>
            <p className="mb-6 leading-relaxed">利用 Cursor 的 <strong>"Context References"</strong> 功能強化技能：</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-8">
               <ul className="space-y-4 text-sm">
                  <li className="flex gap-3">
                     <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>將 SKILL 相關文件放在專案目錄中（如 <code>/docs/skills/</code>）。</p>
                  </li>
                  <li className="flex gap-3">
                     <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>在對話框輸入 <code className="text-white">@</code> 選擇 <strong>Folders</strong> 或 <strong>Files</strong> 指向該資料夾。</p>
                  </li>
                  <li className="flex gap-3">
                     <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>這會強制 Cursor 在處理當前對話時，將這些文件作為「技能書」讀取。</p>
                  </li>
               </ul>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">04.</span> 驗證技能是否生效
            </h3>
            <p className="mb-6 leading-relaxed">在 Cursor Chat (Cmd+L) 中輸入：</p>
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 italic text-slate-400 text-sm font-medium">
              「確認目前已啟用的自定義規則，並簡述這套技能的核心邏輯。」
            </div>
          </section>

          <section className="pt-10 border-t border-white/5">
            <div className="p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden group">
              <Sparkles className="absolute top-[-20px] right-[-20px] w-48 h-48 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors" />
              <div className="relative z-10">
                <h4 className="text-indigo-400 text-xl font-black mb-8 flex items-center gap-2 italic uppercase">
                  💡 大師級調教：讓 SKILL 更強大
                </h4>
                <div className="space-y-10">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1 shadow-xl">
                       <FileCode size={24} />
                    </div>
                    <div>
                      <strong className="text-white block mb-2 text-lg font-black tracking-tight">使用 .cursorrules 的最佳實踐</strong>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">結構化你的指令，定義 Role、Skills 與 Rules：</p>
                      <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-slate-500 overflow-x-auto whitespace-pre">
{`# Role
你是一名資深 DDD 架構師。

# Skills
- 識別 Aggregates 與 Value Objects。

# Rules
- 所有的實體必須透過 Factory 創建。`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1 shadow-xl">
                       <Zap size={24} />
                    </div>
                    <div>
                      <strong className="text-white block mb-2 text-lg font-black tracking-tight">結合 "Composer" 模式 (Cmd + I)</strong>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        當你掛載了 SKILL 後，使用 Cmd+I 叫它「根據專案規範重構這個模組」，它會同時參考檔案結構與 <code>.cursorrules</code>。
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1 shadow-xl">
                       <Share2 size={24} />
                    </div>
                    <div>
                      <strong className="text-white block mb-2 text-lg font-black tracking-tight">動態切換</strong>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        將不同 SKILL 存放在不同的 Markdown 檔。需要用哪一包時，直接輸入 <code>@filename</code> 進行「動態掛載」。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ),
      en: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> Convert SKILL Content
            </h3>
            <p className="mb-6 leading-relaxed">Cursor is primarily instruction-based. Open your <code>SKILL.md</code> and prepare the content, especially the <code>Instructions</code> section.</p>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> Choose Mounting Method
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">Project-Specific</h4>
                <p className="text-sm text-slate-400 mb-6">Best for skills intended for a specific codebase:</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">1.</span> <span>Create a <code>.cursorrules</code> file in the project root.</span></li>
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">2.</span> <span>Paste the <code>SKILL.md</code> content.</span></li>
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">3.</span> <span><strong>Auto-detection:</strong> Cursor will prioritize these rules in Composer or Chat.</span></li>
                </ol>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition-all">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">Global Rules</h4>
                <p className="text-sm text-slate-400 mb-6">If you want the skill available globally across all projects:</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">1.</span> <span>Open Settings (Cmd+Shift+J).</span></li>
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">2.</span> <span>Go to General -&gt; Rules for AI.</span></li>
                  <li className="flex gap-2"><span className="text-slate-600 font-mono">3.</span> <span>Paste your skill instructions here.</span></li>
                </ol>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">03.</span> Context References
            </h3>
            <p className="mb-6 leading-relaxed">Leverage Cursor's <strong>"Context References"</strong> to enhance skills:</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-8">
               <ul className="space-y-4 text-sm">
                  <li className="flex gap-3">
                     <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>Store skill docs in a directory (e.g., <code>/docs/skills/</code>).</p>
                  </li>
                  <li className="flex gap-3">
                     <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>Type <code className="text-white">@</code> and select <strong>Folders</strong> or <strong>Files</strong> pointing to that path.</p>
                  </li>
                  <li className="flex gap-3">
                     <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                     <p>This forces Cursor to read those files as a "Skill Book" for the current dialogue.</p>
                  </li>
               </ul>
            </div>
          </section>

          <section className="pt-10 border-t border-white/5">
            <div className="p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-indigo-400 text-xl font-black mb-8 flex items-center gap-2 italic uppercase">
                  💡 Master Tuning
                </h4>
                <div className="space-y-8">
                  <div>
                    <strong className="text-white block mb-2 text-lg">Composer Mode (Cmd+I)</strong>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      When skills are mounted via <code>.cursorrules</code>, Composer will follow them when performing multi-file refactoring or generation tasks.
                    </p>
                  </div>
                  <div>
                    <strong className="text-white block mb-2 text-lg">Dynamic Switching</strong>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Store different skills in separate Markdown files and invoke them on-demand by typing <code>@filename</code> in the chat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    }
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    icon: <TerminalIcon size={18} />,
    docUrl: 'https://geminicli.com/docs/',
    description: {
      en: 'Local-first agent optimized for developer workflows and instant tool reloading.',
      zh: '開發者工作流優化的本機 Agent，支援工具即時重新載入。'
    },
    content: {
      zh: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> 使用指令快速安裝（推薦）
            </h3>
            <p className="mb-6 leading-relaxed">Gemini CLI 提供了一個專門的 <code>skills</code> 命名空間來管理能力。你可以直接指向本地資料夾：</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6 font-mono text-xs leading-relaxed mb-6">
              <div className="text-slate-500 mb-2"># 將路徑替換為實際的 SKILL 資料夾路徑</div>
              <code className="text-accent">gemini skills install /path/to/your/skill-folder</code>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                <div><strong>預設行為：</strong>這會將技能安裝到「使用者全域」範圍 (User Scope)。</div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                <div><strong>專案範圍：</strong>若只想在當前專案使用，請加上 <code>--scope workspace</code>。</div>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> 手動放置路徑（手動掛載）
            </h3>
            <p className="mb-8">如果你偏好手動操作，Gemini CLI 會自動掃描以下目錄：</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">全域技能 (User Skills)</h4>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">macOS/Linux: <span className="text-accent">~/.gemini/skills/</span></div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">Windows: <span className="text-accent">%USERPROFILE%\\.gemini\\skills\\</span></div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition-all">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">工作區技能 (Workspace Skills)</h4>
                <div className="bg-slate-900 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300">
                  路徑: <span className="text-emerald-400">[專案根目錄]/.gemini/skills/</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">03.</span> 配置 GEMINI.md (選擇性)
            </h3>
            <p className="mb-6">在專案根目錄建立 <code>GEMINI.md</code>，讓 Gemini 進入目錄時自動加載特定技能：</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6 font-mono text-xs leading-relaxed">
              <pre className="text-slate-400">{`# Project Context
This project uses the custom skill: [你的技能名稱]`}</pre>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">04.</span> 驗證與熱載入 (Hot Reload)
            </h3>
            <p className="mb-6 leading-relaxed">Gemini CLI 支援動態掃描，當你將新技能放入資料夾後，<strong>無需重新啟動 CLI</strong>，只需執行以下指令：</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm bg-slate-900 p-4 rounded-xl border border-white/5 group hover:border-accent/30 transition-colors">
                <code className="text-accent">/skill reload</code> 
                <span className="text-slate-500 italic">重新掃描技能目錄並即時掛載新 SKILL</span>
              </div>
              <div className="flex items-center gap-4 text-sm bg-slate-900 p-4 rounded-xl border border-white/5">
                <code className="text-white">/skills</code> 
                <span className="text-slate-500">查看目前所有 Active 的技能清單</span>
              </div>
            </div>
          </section>

          <section className="p-10 rounded-[3rem] bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-blue-400 text-xl font-black mb-4 flex items-center gap-2 italic uppercase">
                專家建議 (MCP)
              </h4>
              <p className="text-sm leading-relaxed text-slate-400">
                如果你的技能需要調用複雜的 Python 腳本或資料庫，建議將其包裝成 <strong>MCP Server</strong> 並透過 <code>~/.gemini/settings.json</code> 掛載。
                效能與穩定度會比純 Markdown 的 SKILL 更為強大。
              </p>
            </div>
          </section>
        </div>
      ),
      en: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> Fast Install via CLI (Recommended)
            </h3>
            <p className="mb-6 leading-relaxed">Gemini CLI provides a dedicated <code>skills</code> namespace for management. Point directly to your local folder:</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6 font-mono text-xs leading-relaxed mb-6">
              <code className="text-accent">gemini skills install /path/to/your/skill-folder</code>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                <div><strong>User Scope (Default):</strong> Installs the skill globally for the current user.</div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                <div><strong>Workspace Scope:</strong> Use <code>--scope workspace</code> to limit the skill to the current project.</div>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> Manual Mounting Paths
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">User Skills</h4>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">macOS/Linux: <span className="text-accent">~/.gemini/skills/</span></div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">Windows: <span className="text-accent">%USERPROFILE%\\.gemini\\skills\\</span></div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition-all">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">Workspace Skills</h4>
                <div className="bg-slate-900 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300">
                  Path: <span className="text-emerald-400">[Project Root]/.gemini/skills/</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">03.</span> Hot Reloading
            </h3>
            <p className="mb-6 leading-relaxed">Gemini CLI supports dynamic scanning. <strong>No restart required</strong>; simply execute:</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6 font-mono text-xs">
              <code className="text-accent">/skill reload</code>
            </div>
          </section>
        </div>
      )
    }
  },
  {
    id: 'codex-app',
    name: 'Codex App',
    icon: <Globe size={18} />,
    docUrl: 'https://openai.com/zh-Hant/index/introducing-the-codex-app/',
    description: {
      en: 'OpenAI’s integrated development app featuring team-wide skill sharing.',
      zh: 'OpenAI 的整合開發應用程式，支援全域、專案級與遞歸路徑的技能偵測。'
    },
    content: {
      zh: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> 定位 Codex 專用技能目錄
            </h3>
            <p className="mb-6 leading-relaxed">Codex App 啟動時會自動掃描特定路徑。請將你的 SKILL 資料夾移動至：</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">全域路徑 (User Skills)</h4>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">macOS/Linux: <span className="text-accent">~/.codex/skills/</span></div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">Windows: <span className="text-accent">%USERPROFILE%\\.codex\\skills\\</span></div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition-all">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">專案專屬 (Workspace Skills)</h4>
                <div className="bg-slate-900 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300">
                  路徑: <span className="text-emerald-400">[專案根目錄]/.codex/skills/</span>
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-500 italic">
              <strong>注意：</strong>Codex 支援從根目錄向上遞歸搜尋。如果你在多層級目錄開發，它會自動抓取當前目錄至 git root 之間所有的技能。
            </p>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> 利用內建指令安裝 (更快速)
            </h3>
            <p className="mb-6">在對話框中直接使用內建的 <strong>Skill Installer</strong> 進行註冊：</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6">
               <ol className="space-y-4">
                  <li className="flex gap-3 text-sm">
                     <span className="text-slate-600 font-mono">1.</span>
                     <span>在對話框輸入 <code className="text-accent">$</code>（Codex 技能觸發符號）。</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                     <span className="text-slate-600 font-mono">2.</span>
                     <div className="flex-1">
                        選擇 <code>Skill Installer</code> 或直接輸入：
                        <div className="mt-3 bg-slate-900 p-4 rounded-xl border border-white/5 font-mono text-xs text-accent">
                           $skill-installer /path/to/your/skill-folder
                        </div>
                     </div>
                  </li>
               </ol>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">03.</span> 啟用與停用管理
            </h3>
            <p className="mb-6">Codex 使用 <code>config.toml</code> 精細控制各技能的 Active 狀態：</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6 font-mono text-xs leading-relaxed">
              <div className="text-slate-600 mb-2"># ~/.codex/config.toml</div>
              <pre>{`[[skills.config]]
path = "~/path/to/your/skill/SKILL.md"
enabled = true`}</pre>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">※ 修改後請重啟 Codex App 以套用變更。</p>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">04.</span> 在 App 界面驗證與調用
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">顯式呼叫 (Explicit)</h4>
                <p className="text-sm text-slate-400 leading-relaxed">輸入 <code>/skills</code> 查看列表，或輸入 <code>$技能名稱</code> 強制執行。</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">隱式觸發 (Implicit)</h4>
                <p className="text-sm text-slate-400 leading-relaxed">Codex 採漸進式載入，當輸入需求符合描述時，才會自動加載指令。</p>
              </div>
            </div>
          </section>

          <section className="pt-10 border-t border-white/5">
            <div className="p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-indigo-400 text-xl font-black mb-8 flex items-center gap-2 italic uppercase">
                  🏆 Codex App 進階技巧
                </h4>
                <div className="grid grid-cols-1 gap-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                       <Zap size={20} />
                    </div>
                    <div>
                      <strong className="text-white block mb-2 text-lg">漸進式揭露 (Progressive Disclosure)</strong>
                      <p className="text-sm text-slate-400">Codex 極度在意 Token 消耗。務必精準撰寫 <code>description</code>，App 只會在必要時讀取詳細 Instructions。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                       <Share2 size={20} />
                    </div>
                    <div>
                      <strong className="text-white block mb-2 text-lg">多代理協作 (Multi-Agent Workflow)</strong>
                      <p className="text-sm text-slate-400">可同時掛載多個 SKILL讓不同 Agent 負責（如 Agent A 負責架構，Agent B 負責編碼），並在同 Thread 產生結果。</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                       <FileCode size={20} />
                    </div>
                    <div>
                      <strong className="text-white block mb-2 text-lg">使用 CODEX.md 強化連結</strong>
                      <p className="text-sm text-slate-400">在根目錄放 <code>CODEX.md</code> 並撰寫引導語，可大幅提升 Codex 自動觸發特定技能的機率。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 text-center">
             <a 
               href="https://www.youtube.com/watch?v=en0It1zBjpw" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-500 group font-bold text-sm"
             >
                <Globe size={18} className="group-hover:animate-spin" />
                觀看實戰：如何透過 Agent Skills 建立虛擬團隊
                <ExternalLink size={14} />
             </a>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> Locate Skills Directory
            </h3>
            <p className="mb-6 leading-relaxed">Codex App automatically scans specific paths upon startup. Move your SKILL folder to:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">Global Scope</h4>
                <div className="space-y-2 font-mono text-[10px]">
                  <div>macOS/Linux: ~/.codex/skills/</div>
                  <div>Windows: %USERPROFILE%\\.codex\\skills\\</div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">Workspace Scope</h4>
                <div className="font-mono text-[10px]">Path: ./.codex/skills/</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> Install via Internal Command
            </h3>
            <p className="mb-6 leading-relaxed">Use the built-in <strong>Skill Installer</strong> in the dialogue box for faster registration:</p>
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 font-mono text-xs text-accent">
              $skill-installer /path/to/your/skill-folder
            </div>
          </section>
        </div>
      )
    }
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    icon: <Settings size={18} />,
    docUrl: 'https://antigravity.google/docs/get-started',
    description: {
      en: 'Google’s agent-first environment featuring advanced Artifacts rendering and centralized management.',
      zh: 'Google 的 Agent 優先開發環境，具備先進的 Artifacts 渲染能力與中心化管理系統。'
    },
    content: {
      zh: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> 選擇掛載範圍
            </h3>
            <p className="mb-8 leading-relaxed">Antigravity 會自動掃描以下兩個核心目錄，請將你的 SKILL 資料夾放入其中：</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">專案級掛載 (Workspace Scope)</h4>
                <p className="text-sm text-slate-400 mb-6">僅在當前專案生效（如專案專屬部署腳本）：</p>
                <div className="bg-slate-900 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300">
                  路徑: <span className="text-accent">[專案根目錄]/.agent/skills/</span>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition-all">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">全域級掛載 (Global Scope)</h4>
                <p className="text-sm text-slate-400 mb-6">適用於 Antigravity 內開啟的所有專案：</p>
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">macOS/Linux: <span className="text-emerald-400">~/.gemini/antigravity/skills/</span></div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-white/5 text-slate-300">Windows: <span className="text-emerald-400">%USERPROFILE%\\.gemini\\antigravity\\skills\\</span></div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> 配置 SKILL.md 的關鍵欄位
            </h3>
            <p className="mb-6 leading-relaxed">Antigravity 採用 <strong>Progressive Disclosure（漸進式揭露）</strong> 機制，對 YAML Frontmatter 要求較嚴格。請確保檔案頂部包含：</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-6 font-mono text-xs leading-relaxed overflow-x-auto mb-6">
              <pre>{`---
name: your-skill-name
description: 明確描述「什麼情況下」Agent 應該載入這包技能。
---`}</pre>
            </div>
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 flex gap-4">
              <Info className="text-indigo-400 shrink-0" size={20} />
              <p className="text-sm leading-relaxed text-slate-400">
                <strong>大師提醒：</strong>Agent 平時不會讀取完整內容，只會先看 <code>description</code>。如果描述過於模糊，Agent 在判斷是否要「動手」時可能會略過它。
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">03.</span> 在 Antigravity 介面中啟用
            </h3>
            <p className="mb-6">Antigravity 提供圖形化的 <strong>Agent Manager</strong> 視圖進行管理：</p>
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-8">
               <ul className="space-y-6">
                  <li className="flex gap-4">
                     <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                     <p className="text-sm">打開 <strong>Agent Manager</strong>（通常位於左側側邊欄或專屬視窗）。</p>
                  </li>
                  <li className="flex gap-4">
                     <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                     <p className="text-sm">在 <strong>Settings</strong> 或 <strong>Skills</strong> 標籤頁中，點擊 <strong className="text-white">"Refresh Skills"</strong>。</p>
                  </li>
                  <li className="flex gap-4">
                     <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                     <p className="text-sm">確認技能出現在列表中，且狀態標示為 <span className="text-emerald-400 font-bold">Enabled</span>。</p>
                  </li>
               </ul>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">04.</span> 調用與驗證
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2 italic">自然觸發</h4>
                <p className="text-sm text-slate-400 leading-relaxed">直接描述任務，Agent 若判斷 Match 描述，會自動顯示 <code>[Using skill: name]</code>。</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2 italic">強制調用 (@)</h4>
                <p className="text-sm text-slate-400 leading-relaxed">在對話框輸入 <code className="text-white">@</code> 選擇技能（例如 <code>@my-skill</code>），強制當次對話載入。</p>
              </div>
            </div>
          </section>

          <section className="pt-10 border-t border-white/5">
            <div className="p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden group">
              <Sparkles className="absolute top-[-20px] right-[-20px] w-48 h-48 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors" />
              <div className="relative z-10">
                <h4 className="text-emerald-400 text-xl font-black mb-8 flex items-center gap-2 italic uppercase">
                  🚀 進階技巧：結合 Artifacts
                </h4>
                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-1 shadow-xl">
                       <Layers size={24} />
                    </div>
                    <div>
                      <strong className="text-white block mb-2 text-lg font-black tracking-tight">視覺化渲染</strong>
                      <p className="text-sm text-slate-400 leading-relaxed">如果你在 SKILL 中定義了生成特定格式檔案（如圖表、實作計畫）的指令，Antigravity 會自動在右側面板渲染出精美的視覺化介面。</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-1 shadow-xl">
                       <ShieldAlert size={24} />
                    </div>
                    <div>
                      <strong className="text-white block mb-2 text-lg font-black tracking-tight">本地腳本授權</strong>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        若技能包含 <code>.py</code> 或 <code>.sh</code> 腳本，請在 <code>settings.json</code> 中確認已給予執行權限，否則會卡在「請求授權」步驟。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 text-center">
             <a 
               href="https://antigravity.google/docs/skills" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-800 border border-white/5 text-slate-300 hover:bg-accent hover:text-white transition-all duration-500 group font-bold text-sm"
             >
                <FileCode size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                參考官方進階指南 (Authoring Guide)
                <ExternalLink size={14} />
             </a>
          </div>
        </div>
      ),
      en: (
        <div className="space-y-10 text-slate-300">
          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">01.</span> Choose Mounting Scope
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                <h4 className="text-accent font-black mb-4 uppercase tracking-widest text-xs">Workspace Scope</h4>
                <div className="font-mono text-[10px]">Path: ./.agent/skills/</div>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5">
                <h4 className="text-emerald-400 font-black mb-4 uppercase tracking-widest text-xs">Global Scope</h4>
                <div className="space-y-2 font-mono text-[10px]">
                  <div>macOS/Linux: ~/.gemini/antigravity/skills/</div>
                  <div>Windows: %USERPROFILE%\\.gemini\\antigravity\\skills\\</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-white text-2xl font-black mb-6 flex items-center gap-3">
              <span className="text-accent text-lg">02.</span> Use Agent Manager
            </h3>
            <p className="mb-6 leading-relaxed">Open the <strong>Agent Manager</strong> UI and click <strong>"Refresh Skills"</strong> to sync your local directory.</p>
          </section>
        </div>
      )
    }
  }
];

export const AgentWizard = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState(platforms[0].id);

  const activePlatform = platforms.find(p => p.id === activeTab) || platforms[0];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-12 items-start">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 shrink-0 space-y-2 sticky top-24">
        <div className="px-4 mb-6">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2">{t('selectAgent')}</h4>
           <div className="h-1 w-8 bg-accent/20 rounded-full"></div>
        </div>
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setActiveTab(platform.id)}
            className={`
              w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group
              ${activeTab === platform.id 
                ? 'bg-accent text-white shadow-lg shadow-accent/20 translate-x-2' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
            `}
          >
            <div className="flex items-center gap-3">
              {platform.icon}
              <span className="text-sm font-bold tracking-tight">{platform.name}</span>
            </div>
            <ChevronRight size={14} className={`transition-transform duration-300 ${activeTab === platform.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
          </button>
        ))}
      </aside>

      {/* Document Content */}
      <div className="flex-1 bg-slate-900 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden min-h-[800px]">
        {/* Doc Header */}
        <div className="bg-slate-950/50 border-b border-white/5 p-10 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    {activePlatform.icon}
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{activePlatform.name}</h2>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">{activePlatform.description[language as keyof typeof activePlatform.description]}</p>
              
              <a 
                href={activePlatform.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors py-2 px-4 bg-accent/5 border border-accent/10 rounded-xl"
              >
                <BookOpen size={12} />
                Official Docs
                <ExternalLink size={10} className="ml-1 opacity-50" />
              </a>
           </div>
           
           <div className="shrink-0 flex items-center gap-4 px-6 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 h-fit">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest">{t('protocolVerified')}</span>
           </div>
        </div>

        {/* Doc Body */}
        <main className="p-10 md:p-16 max-w-4xl">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
             >
               {activePlatform.content[language as keyof typeof activePlatform.content]}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
