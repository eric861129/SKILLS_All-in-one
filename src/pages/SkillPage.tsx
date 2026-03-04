import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Github, User, Calendar, Tag, Terminal } from 'lucide-react';
import { MOCK_SKILLS } from '../data/skills';
import { useLanguage } from '../hooks/useLanguage';
import { downloadAndZipSkill } from '../utils/downloadSkill';
import { useToast } from '../components/Toast';
import { GiscusComments } from '../components/GiscusComments';
import type { Skill, SkillCategory } from '../types/skill';

const API_BASE_URL = 'https://skill-proxy-api.iamhandsomeboy1129.workers.dev';

const getCategoryStyles = (category: SkillCategory) => {
    switch (category) {
        case 'Development & Code Tools':
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'Document Skills':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'Data & Analysis':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'Media & Content':
            return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
        case 'Utility & Automation':
            return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'Writing & Research':
            return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        case 'Security & Web Testing':
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        default:
            return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

export const SkillPage = () => {
    const { id } = useParams<{ id: string }>();
    const { language, t } = useLanguage();
    const { showToast } = useToast();

    // Fetch real download counts from API
    const [downloadCount, setDownloadCount] = useState<number>(0);

    const skill = useMemo(() => {
        const numId = Number(id);
        return MOCK_SKILLS.find(s => s.id === numId) || null;
    }, [id]);

    useEffect(() => {
        if (skill) {
            setDownloadCount(skill.downloadCount || 0);
            const title = language === 'zh' && skill.nameZh ? skill.nameZh : skill.name;
            document.title = `${title} | SKILLS All-in-one`;
        }
        return () => {
            document.title = 'SKILLS All-in-one | Premium AI Agent Skills Library';
        };
    }, [skill, language]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const handleDownload = async (s: Skill) => {
        try {
            setDownloadCount(prev => prev + 1);
            fetch(`${API_BASE_URL}/increment-download?id=${s.id}`, { method: 'POST' }).catch(() => { });
            await downloadAndZipSkill(s);
            showToast(language === 'zh' ? `${s.nameZh || s.name} 下載成功` : `${s.name} downloaded successfully`, 'success');
        } catch (err) {
            console.error('下載失敗:', err);
            showToast(language === 'zh' ? '下載失敗，請稍後再試' : 'Download failed, please try again', 'error');
        }
    };

    if (!skill) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-6">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <Terminal className="w-12 h-12 text-slate-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-200">{language === 'zh' ? '找不到此技能' : 'Skill Not Found'}</h1>
                <p className="text-slate-500">{language === 'zh' ? '此技能可能已被移除或 ID 不正確。' : 'This skill may have been removed or the ID is incorrect.'}</p>
                <Link
                    to="/"
                    className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2 border border-blue-400/20 px-5 py-2.5 rounded-xl hover:bg-blue-400/5 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'zh' ? '返回首頁' : 'Back to Home'}
                </Link>
            </div>
        );
    }

    const displayName = language === 'zh' && skill.nameZh
        ? (skill.nameZh.includes(skill.name) ? skill.nameZh : `${skill.nameZh}`)
        : skill.name;
    const displayDescription = language === 'zh' && skill.descriptionZh ? skill.descriptionZh : skill.description;

    // Find related skills (same category, exclude self)
    const relatedSkills = useMemo(() => {
        return MOCK_SKILLS
            .filter(s => s.category === skill.category && s.id !== skill.id)
            .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
            .slice(0, 3);
    }, [skill]);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Top Nav */}
            <nav className="border-b border-slate-900 px-4 md:px-8 py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {language === 'zh' ? '返回技能庫' : 'Back to Library'}
                    </Link>
                </div>
            </nav>

            {/* Skill Hero Section */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
                    <div className="flex-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-4 ${getCategoryStyles(skill.category)}`}>
                            {skill.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-100 mb-3">{displayName}</h1>
                        {language === 'zh' && skill.nameZh && !skill.nameZh.includes(skill.name) && (
                            <p className="text-slate-500 text-sm font-mono mb-4">{skill.name}</p>
                        )}
                        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{displayDescription}</p>
                    </div>

                    <div className="flex gap-3 shrink-0">
                        <a
                            href={skill.githubUrl || `https://github.com/eric861129/SKILLS_All-in-one/tree/main/public/SKILLS/${encodeURIComponent(skill.category)}/${encodeURIComponent(skill.source)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all active:scale-95 border border-slate-700 hover:border-slate-500 flex items-center gap-2 px-5"
                        >
                            <Github className="w-5 h-5" />
                            <span className="text-sm font-bold">{skill.githubUrl ? (language === 'zh' ? '原始來源' : 'Source') : (language === 'zh' ? '本站來源' : 'Repo')}</span>
                        </a>
                        <button
                            onClick={() => handleDownload(skill)}
                            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2 px-5"
                        >
                            <Download className="w-5 h-5" />
                            <span className="text-sm font-bold">{t('download')}</span>
                        </button>
                    </div>
                </div>

                {/* Metadata Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl">
                            <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{language === 'zh' ? '作者' : 'Author'}</p>
                            <p className="text-sm font-semibold text-slate-200">{skill.author}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                            <Download className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{language === 'zh' ? '下載次數' : 'Downloads'}</p>
                            <p className="text-sm font-semibold text-slate-200">{downloadCount.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-2.5 bg-amber-500/10 rounded-xl">
                            <Calendar className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{language === 'zh' ? '建立日期' : 'Created'}</p>
                            <p className="text-sm font-semibold text-slate-200">{skill.createdAt}</p>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="mb-10">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" />
                        {language === 'zh' ? '標籤' : 'Tags'}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {skill.tags?.map(tag => (
                            <Link
                                key={tag}
                                to={`/?tag=${encodeURIComponent(tag)}`}
                                className="text-xs uppercase tracking-widest text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 font-medium hover:border-blue-500/30 hover:text-blue-400 transition-colors"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Related Skills */}
                {relatedSkills.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                            {language === 'zh' ? '同分類技能' : 'Related Skills'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedSkills.map(rs => {
                                const rsName = language === 'zh' && rs.nameZh
                                    ? (rs.nameZh.includes(rs.name) ? rs.nameZh : `${rs.nameZh}`)
                                    : rs.name;
                                return (
                                    <Link
                                        key={rs.id}
                                        to={`/skill/${rs.id}`}
                                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-all group"
                                    >
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border mb-3 ${getCategoryStyles(rs.category)}`}>
                                            {rs.category}
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors mb-2">{rsName}</h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{rs.author}</span>
                                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{(rs.downloadCount || 0).toLocaleString()}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <GiscusComments skillId={skill.id} skillName={skill.name} />
            </div>
        </div>
    );
};
