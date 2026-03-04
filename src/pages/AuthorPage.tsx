import { useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Terminal } from 'lucide-react';
import { useSkills } from '../hooks/useSkills';
import { SkillCard } from '../components/SkillCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { ScrollToTop } from '../components/ScrollToTop';
import { useLanguage } from '../hooks/useLanguage';


export const AuthorPage = () => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const { skills, loading } = useSkills();
    const { language } = useLanguage();

    // Filter skills exactly by author
    const authorSkills = useMemo(() => {
        if (!name) return [];
        return skills.filter(s => s.author === name).sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    }, [skills, name]);

    const totalDownloads = useMemo(() => {
        return authorSkills.reduce((sum, s) => sum + (s.downloadCount || 0), 0);
    }, [authorSkills]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (name) {
            document.title = `${name} | SKILLS All-in-one`;
        }
    }, [name]);

    return (
        <div className="min-h-screen bg-slate-950 text-white noise-overlay">
            {/* Top Nav */}
            <nav className="border-b border-slate-900 px-4 md:px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {language === 'zh' ? '返回技能庫' : 'Back to Library'}
                    </Link>
                </div>
            </nav>

            {/* Author Profile Header */}
            <header className="border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col items-center text-center">
                    <div className="p-5 bg-blue-500/10 rounded-full border border-blue-500/20 mb-6 relative group">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-colors"></div>
                        <User className="w-12 h-12 text-blue-400 relative z-10" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                        {name}
                    </h1>

                    <p className="text-slate-400 text-lg max-w-2xl mb-8">
                        {language === 'zh'
                            ? `探索 ${name} 開發的高品質 Agent 技能。這些工具幫助您更高效地完成各式開發任務。`
                            : `Explore high-quality Agent skills developed by ${name}. These tools help you build and automate more efficiently.`}
                    </p>

                    <div className="flex gap-4">
                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-4">
                            <div className="text-2xl font-black tracking-tight font-mono text-emerald-400">
                                {loading ? '—' : authorSkills.length}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-1">
                                {language === 'zh' ? '開發技能數' : 'Skills created'}
                            </div>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-4">
                            <div className="text-2xl font-black tracking-tight font-mono text-amber-400">
                                {loading ? '—' : totalDownloads.toLocaleString()}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-1">
                                {language === 'zh' ? '總下載量' : 'Total downloads'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Skills Grid */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight">
                        {language === 'zh' ? '作品集' : 'Portfolio'}
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : authorSkills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {authorSkills.map((skill, index) => (
                            <div
                                key={skill.id}
                                className="stagger-item h-full"
                                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                            >
                                <SkillCard
                                    skill={skill}
                                    onPreview={() => navigate(`/skill/${skill.id}`)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                        <Terminal className="w-12 h-12 text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-200 mb-2">{language === 'zh' ? '查無技能' : 'No skills found'}</h3>
                        <p className="text-slate-500">{language === 'zh' ? '這位作者目前沒有公開的技能。' : 'This author has no public skills yet.'}</p>
                    </div>
                )}
            </main>

            <ScrollToTop />
        </div>
    );
};
