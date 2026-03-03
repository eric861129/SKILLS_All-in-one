import { Terminal, Search, Loader2 } from 'lucide-react';
import { useSkills } from './hooks/useSkills';
import { SkillCard } from './components/SkillCard';
import { downloadAndZipSkill } from './utils/downloadSkill';
import { Skill } from './types/skill';

function App() {
  const { skills, loading, incrementDownload } = useSkills();

  const handleDownload = async (skill: Skill) => {
    // 1. 增加下載計數
    incrementDownload(skill.id);
    
    // 2. 打包並下載檔案
    try {
      await downloadAndZipSkill(skill);
    } catch (err) {
      console.error('下載失敗:', err);
      alert('下載失敗，請稍後再試');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Header / Hero Section */}
      <header className="py-16 px-4 flex flex-col items-center border-b border-slate-900 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950">
        <div className="flex items-center gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Terminal className="w-12 h-12 text-blue-400" />
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            SKILLS All-in-one
          </h1>
        </div>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl text-center leading-relaxed animate-in fade-in duration-1000 delay-200">
          探索高品質 AI Skills，一鍵下載，加速您的工作流程。
        </p>

        {/* Search Bar (Placeholder for Phase 3) */}
        <div className="relative w-full max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="搜尋技能名稱或說明..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-200 placeholder:text-slate-600 shadow-xl"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            熱門技能推薦
          </h2>
          <div className="text-sm text-slate-500">
            共 {skills.length} 個技能
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="animate-pulse">正在載入 AI 技能庫...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {skills.map((skill) => (
              <SkillCard 
                key={skill.id} 
                skill={skill} 
                onDownload={() => handleDownload(skill)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 px-4 text-center text-slate-600 text-sm">
        <p>© 2026 SKILLS All-in-one - Built with React & Tailwind</p>
      </footer>
    </div>
  )
}

export default App
