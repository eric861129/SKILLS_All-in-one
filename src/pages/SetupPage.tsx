import { Terminal, ShieldCheck, Zap, ArrowLeft, Plus, Languages, Activity, ChevronDown, Mouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AgentWizard } from '../components/AgentWizard';
import { useLanguage } from '../hooks/useLanguage';
import { ScrollToTop } from '../components/ScrollToTop';

export const SetupPage = () => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-950 text-white noise-overlay">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 glass-surface border-b border-white/5 px-4 md:px-8 py-4">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-accent/40 transition-all">
                            <ArrowLeft size={18} className="text-slate-400 group-hover:text-accent" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">
                            {language === 'zh' ? '返回索引' : 'Back to Registry'}
                        </span>
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                            className="p-2 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-all text-slate-500 hover:text-accent border border-transparent"
                        >
                            <Languages size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'en' ? '中文' : 'EN'}</span>
                        </button>
                        <a 
                            href="https://github.com/eric861129/SKILLS_All-in-one" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-xl"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative min-h-[85vh] flex flex-col items-center pt-40 pb-48 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(99,102,241,0.15),transparent)]" />
                
                <div className="relative max-w-[1000px] mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <Activity size={14} className="animate-pulse" />
                        Injection Protocol v2.0
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-none italic uppercase">
                        {t('setupYourAgent')}
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-16 font-medium">
                        {t('setupSubtitle')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        {[
                           { icon: <Terminal size={18} />, label: 'Absolute Paths' },
                           { icon: <ShieldCheck size={18} />, label: 'Verified Integrity' },
                           { icon: <Zap size={18} />, label: 'Instant Sync' }
                        ].map(badge => (
                           <div key={badge.label} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
                               <span className="text-slate-700">{badge.icon}</span>
                               {badge.label}
                           </div>
                        ))}
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce cursor-default select-none">
                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                      <Mouse size={12} className="text-slate-500" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">Scroll for Protocol</span>
                   </div>
                   <ChevronDown size={16} className="text-accent" />
                </div>
            </header>

            {/* Main Content */}
            <main className="relative max-w-[1400px] mx-auto px-4 py-32">
                <div className="grid grid-cols-1 gap-32">
                    <section>
                        <div className="flex flex-col items-center text-center mb-20">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-white mb-4">
                                {t('stepByStep')}
                            </h2>
                            <div className="w-24 h-1.5 bg-accent rounded-full mb-6"></div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Select target environment below</p>
                        </div>
                        <AgentWizard />
                    </section>

                    {/* Resources - Compact Version */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-xl p-10 rounded-[2.5rem] bg-slate-900 border border-white/5 backdrop-blur-sm relative overflow-hidden group shadow-2xl">
                             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                             
                             <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-700 shadow-xl">
                                   <Plus size={24} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase italic">{t('missingAgentTitle')}</h3>
                                <p className="text-slate-400 leading-relaxed mb-8 font-medium text-sm">
                                   {t('missingAgentDesc')}
                                </p>
                                <a 
                                   href="https://github.com/eric861129/SKILLS_All-in-one/issues/new?template=submit_skill.md" 
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg active:scale-95"
                                >
                                   {t('submitProtocol')}
                                </a>
                             </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-24 px-4 text-center">
                <div className="p-4 bg-white/5 rounded-3xl w-fit mx-auto mb-10 border border-white/5 shadow-2xl">
                    <Terminal size={32} className="text-slate-700" />
                </div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] leading-loose">
                    © 2026 SKILLS All-in-one · {language === 'zh' ? '高品質 AI Agent 技能庫' : 'Premium AI Agent Skills Library'}
                    <br />
                    <span className="text-slate-800">Advanced Injection Protocols Enabled</span>
                </p>
            </footer>

            <ScrollToTop />
        </div>
    );
};
