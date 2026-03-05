import { motion, AnimatePresence } from 'framer-motion';
import { Box, Cpu, Share2, X, ArrowRight, Database, Code2, Globe, Sparkles, FolderTree, FileJson, FileCode, Layers } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface HowItWorksProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorks = ({ isOpen, onClose }: HowItWorksProps) => {
  const { t } = useLanguage();

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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl max-h-[90vh] bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] z-[70] flex flex-col overflow-hidden"
          >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
               <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
               <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 items-center justify-center text-accent">
                   <Sparkles size={20} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-[9px] font-black uppercase tracking-widest mb-2">
                    Architecture
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white leading-tight">
                    {t('whatIsSkill')}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-all shadow-xl"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content: Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-20">
              {/* Intro */}
              <div className="text-center">
                 <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-xl mx-auto">
                    {t('whatIsSkillSubtitle')}
                 </p>
              </div>

              {/* Section 1: Architecture Visualization */}
              <div className="relative py-10 px-6 bg-slate-950/50 border border-white/5 rounded-[2.5rem]">
                 <div className="grid grid-cols-1 lg:grid-cols-7 items-center gap-4 text-center">
                    <div className="lg:col-span-2 p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl relative group">
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">The Brain</div>
                       <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                          <Cpu size={32} />
                       </div>
                       <h4 className="text-white font-black text-xl mb-2">AI Model</h4>
                       <p className="text-slate-500 text-[10px] leading-tight uppercase font-bold tracking-wider">Claude / Gemini / GPT-4</p>
                    </div>
                    <div className="hidden lg:flex lg:col-span-1 justify-center"><ArrowRight className="text-slate-700 animate-pulse" size={32} /></div>
                    <div className="lg:col-span-1 p-6 rounded-[2rem] bg-accent/10 border border-accent/20 shadow-2xl relative">
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent border border-accent/50 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-accent/20">Protocol</div>
                       <div className="font-black text-3xl text-accent">MCP</div>
                       <div className="text-[10px] text-accent/70 font-bold uppercase tracking-tighter mt-1">Standard</div>
                    </div>
                    <div className="hidden lg:flex lg:col-span-1 justify-center"><ArrowRight className="text-slate-700 animate-pulse" size={32} /></div>
                    <div className="lg:col-span-2 p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl relative group">
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Capabilities</div>
                       <div className="flex gap-2 justify-center mb-6">
                          <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 group-hover:-translate-y-1 transition-transform"><Database size={20} /></div>
                          <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 group-hover:translate-y-1 transition-transform"><Code2 size={20} /></div>
                          <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400 group-hover:-translate-y-1 transition-transform"><Globe size={20} /></div>
                       </div>
                       <h4 className="text-white font-black text-xl mb-2">Agent Skills</h4>
                       <p className="text-slate-500 text-[10px] leading-tight uppercase font-bold tracking-wider">Modular Tools & APIs</p>
                    </div>
                 </div>
              </div>

              {/* Section 2: Three Concepts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { id: 1, title: t('skillConcept1'), description: t('skillDesc1'), icon: <Box size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { id: 2, title: t('skillConcept2'), description: t('skillDesc2'), icon: <Cpu size={24} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                  { id: 3, title: t('skillConcept3'), description: t('skillDesc3'), icon: <Share2 size={24} />, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                ].map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-500"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.bg} ${item.color} border border-white/5 shadow-inner`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 tracking-tight italic uppercase">{item.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-medium">{item.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Section 3: Standard Directory Structure */}
              <div className="pt-10">
                 <div className="flex flex-col items-center text-center mb-12">
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">{t('skillStructureTitle')}</h3>
                    <div className="w-16 h-1 bg-accent rounded-full mb-6"></div>
                    <p className="text-slate-400 text-sm font-medium max-w-2xl">{t('skillStructureDesc')}</p>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* File Tree Visualization */}
                    <div className="bg-slate-950 border border-white/10 rounded-[2.5rem] p-10 font-mono text-sm relative group overflow-hidden shadow-2xl">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-emerald-500 to-amber-500 opacity-50"></div>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3 text-slate-300">
                             <FolderTree size={18} className="text-accent" />
                             <span className="font-bold">my-awesome-skill/</span>
                          </div>
                          <div className="pl-8 space-y-4 border-l border-slate-800">
                             <div className="flex items-center gap-3 text-slate-400 group-hover:text-white transition-colors">
                                <FileCode size={16} className="text-emerald-400" />
                                <span>SKILL.md</span>
                                <span className="text-[10px] text-slate-600 ml-auto uppercase font-black">Required</span>
                             </div>
                             <div className="flex items-center gap-3 text-slate-400 group-hover:text-white transition-colors">
                                <FileJson size={16} className="text-blue-400" />
                                <span>metadata.json</span>
                                <span className="text-[10px] text-slate-600 ml-auto uppercase font-black">Registry</span>
                             </div>
                             <div className="flex items-center gap-3 text-slate-500">
                                <FolderTree size={16} className="text-slate-700" />
                                <span>scripts/</span>
                                <span className="text-[10px] text-slate-700 ml-auto uppercase font-black italic">Optional</span>
                             </div>
                             <div className="flex items-center gap-3 text-slate-500">
                                <Layers size={16} className="text-slate-700" />
                                <span>assets/</span>
                                <span className="text-[10px] text-slate-700 ml-auto uppercase font-black italic">Optional</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Explanations */}
                    <div className="space-y-8">
                       {[
                          { title: t('coreLogic'), desc: 'Contains the instruction set, tools definitions, and YAML header. This is what the Agent actually reads.', icon: <FileCode size={20} className="text-emerald-400" /> },
                          { title: t('metadataInfo'), desc: 'Standardized JSON for category, tags, and versioning. Essential for site-wide search and indexing.', icon: <FileJson size={20} className="text-blue-400" /> },
                          { title: t('extensibility'), desc: 'Complex skills can call external Python/JS scripts or reference static assets for advanced tasks.', icon: <Layers size={20} className="text-amber-400" /> }
                       ].map((feat) => (
                          <div key={feat.title} className="flex gap-5 group">
                             <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center transition-all group-hover:border-accent/30 group-hover:bg-accent/5">
                                {feat.icon}
                             </div>
                             <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-tight mb-1 group-hover:text-accent transition-colors">{feat.title}</h4>
                                <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-slate-950/50 flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Industry Standard MCP Enabled</span>
               </div>
               <button 
                 onClick={onClose}
                 className="w-full md:w-auto px-8 py-2.5 rounded-xl bg-white text-slate-950 font-black uppercase tracking-[0.15em] text-[10px] hover:bg-accent hover:text-white transition-all duration-300 shadow-xl active:scale-95"
               >
                 {t('closeModal')}
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
