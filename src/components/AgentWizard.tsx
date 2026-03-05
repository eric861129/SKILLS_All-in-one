import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Monitor, MessageSquare, Terminal as TerminalIcon, ExternalLink, Cpu, Globe, Rocket } from 'lucide-react';

const platforms = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    icon: <Monitor size={18} />,
    description: 'Setup instructions for Claude Desktop via Model Context Protocol (MCP).',
    steps: [
      { title: 'Install Node.js', content: 'Ensure Node.js (v18+) is installed: `node -v`' },
      { title: 'Open Config', content: 'Open `%APPDATA%\\Claude\\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS.' },
      { title: 'Add Tool', content: '"mcpServers": {\n  "my-skill": {\n    "command": "node",\n    "args": ["C:/path/to/skill/index.js"]\n  }\n}' },
      { title: 'Restart', content: 'Fully quit Claude Desktop and restart it to see the new tools in the "Available Tools" menu.' },
    ]
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: <MessageSquare size={18} />,
    description: 'How to use these skills with Custom GPTs / Actions.',
    steps: [
      { title: 'Create GPT', content: 'Go to ChatGPT -> Explore GPTs -> Create.' },
      { title: 'Configure Actions', content: 'In the Create tab, click "Configure" then "Create new action".' },
      { title: 'Import Schema', content: 'Click "Import from URL" or paste the OpenAPI spec provided in the skill folder.' },
      { title: 'Set Privacy', content: 'Ensure the privacy policy URL is set if required by the action.' },
    ]
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    icon: <TerminalIcon size={18} />,
    description: 'Native integration with the Gemini CLI agent.',
    steps: [
      { title: 'Install CLI', content: '`npm install -g @google/gemini-cli`' },
      { title: 'Authenticate', content: 'Run `gemini auth` to set up your API keys.' },
      { title: 'Import', content: 'Run `gemini skill add <folder-path>` to register the local skill.' },
      { title: 'Run', content: 'Ask Gemini: "Use the [skill-name] tool to..."' },
    ]
  },
  {
    id: 'claudecode',
    name: 'Claude Code',
    icon: <Cpu size={18} />,
    description: 'Using skills with the experimental Claude Code CLI.',
    steps: [
      { title: 'Install', content: '`npm install -g @anthropic/claude-code`' },
      { title: 'Project Link', content: 'Navigate to your project folder and run `claude link`.' },
      { title: 'Add MCP', content: 'Add the skill to your `.claudecode/config.json` servers list.' },
    ]
  },
  {
    id: 'mcp-generic',
    name: 'Generic MCP',
    icon: <Globe size={18} />,
    description: 'Standard protocol for any Model Context Protocol compliant host.',
    steps: [
      { title: 'Check Host', content: 'Ensure your agent host supports MCP (Model Context Protocol).' },
      { title: 'Environment', content: 'Set up any required environment variables (e.g., API keys).' },
      { title: 'Connect', content: 'Point your host to the skill entry point (usually `index.js` or a Docker image).' },
    ]
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    icon: <Rocket size={18} />,
    description: 'Integration with Google Antigravity / Experimental tools.',
    steps: [
      { title: 'Beta Access', content: 'Ensure you have access to the Antigravity developer preview.' },
      { title: 'Config', content: 'Update your `antigravity.yaml` with the skill metadata.' },
      { title: 'Deploy', content: 'Deploy the skill using `ag deploy`.' },
    ]
  }
];

export const AgentWizard = () => {
  const [activeTab, setActiveTab] = useState(platforms[0].id);
  const [copied, setCopied] = useState<string | null>(null);

  const activePlatform = platforms.find(p => p.id === activeTab) || platforms[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
      {/* Platform Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-hide bg-slate-950/20">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setActiveTab(platform.id)}
            className={`
              flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all whitespace-nowrap uppercase tracking-widest
              ${activeTab === platform.id 
                ? 'text-accent border-b-2 border-accent bg-accent/5' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}
            `}
          >
            {platform.icon}
            {platform.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider mb-4">
                {activePlatform.name} Setup
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">Step-by-Step Guide</h3>
              <p className="text-slate-400 text-sm max-w-xl">{activePlatform.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {activePlatform.steps.map((step, index) => (
                <div key={index} className="flex gap-6 group/step">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-sm font-black text-accent group-hover/step:border-accent/30 transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-bold text-slate-200 mb-3 text-sm uppercase tracking-wide">{step.title}</h4>
                    <div className="relative group">
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed font-mono break-all md:break-normal">
                        {step.content}
                      </div>
                      <button
                        onClick={() => handleCopy(step.content, `${activeTab}-${index}`)}
                        className="absolute right-3 top-3 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-slate-700"
                        title="Copy to clipboard"
                      >
                        {copied === `${activeTab}-${index}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Documentation current as of 2026
                </span>
              </div>
              <a 
                href="/SKILLS_All-in-one/docs" 
                className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-accent text-slate-300 hover:text-white text-xs font-bold transition-all duration-300 border border-slate-700 hover:border-accent/50"
              >
                Explore Wiki <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
