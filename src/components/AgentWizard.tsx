import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Monitor, MessageSquare, Terminal as TerminalIcon, ExternalLink } from 'lucide-react';

const platforms = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    icon: <Monitor size={18} />,
    description: 'Setup instructions for Claude Desktop via MCP.',
    steps: [
      { title: 'Install Node.js', content: 'Ensure you have Node.js installed on your machine.' },
      { title: 'Configure MCP', content: 'Add the skill path to your `claude_desktop_config.json`.' },
      { title: 'Restart Claude', content: 'Restart Claude to load the new tools.' },
    ]
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: <MessageSquare size={18} />,
    description: 'How to use these skills with Custom GPTs.',
    steps: [
      { title: 'Create Custom GPT', content: 'Go to "Explore GPTs" and click "Create".' },
      { title: 'Import Actions', content: 'Copy the OpenAPI spec from the skill page and paste it into "Actions".' },
      { title: 'Add Instructions', content: 'Copy the system prompt into the "Instructions" field.' },
    ]
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    icon: <TerminalIcon size={18} />,
    description: 'Native integration with Gemini CLI.',
    steps: [
      { title: 'Install CLI', content: 'Install the Gemini CLI tool using npm: `npm install -g @google/gemini-cli`' },
      { title: 'Import Skill', content: 'Use the command `gemini skill import [path]`.' },
      { title: 'Verify', content: 'Run `gemini skills list` to confirm.' },
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
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
      {/* Platform Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-hide">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setActiveTab(platform.id)}
            className={`
              flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap
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
      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">{activePlatform.name} Guide</h3>
              <p className="text-slate-400 text-sm">{activePlatform.description}</p>
            </div>

            <div className="space-y-6">
              {activePlatform.steps.map((step, index) => (
                <div key={index} className="flex gap-6">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-bold text-slate-200 mb-2">{step.title}</h4>
                    <div className="relative group">
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 leading-relaxed font-mono">
                        {step.content}
                      </div>
                      <button
                        onClick={() => handleCopy(step.content, `${activeTab}-${index}`)}
                        className="absolute right-3 top-3 p-2 rounded-lg bg-slate-800/50 text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Copy to clipboard"
                      >
                        {copied === `${activeTab}-${index}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800/50 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                End of guide
              </span>
              <a 
                href="/docs" 
                className="text-xs font-bold text-accent hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                View Full Documentation <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
