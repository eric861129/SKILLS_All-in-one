import { Download, Tag, User, Calendar, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Skill, SkillCategory } from '../types/skill';
import { useLanguage } from '../hooks/useLanguage';

const GITHUB_REPO_ROOT = 'https://github.com/eric861129/SKILLS_All-in-one/tree/main/public/SKILLS';
const MAX_VISIBLE_TAGS = 3;

interface SkillCardProps {
  skill: Skill;
  onDownload?: () => void;
  onPreview?: () => void;
}

export const SkillCard = ({ skill, onDownload, onPreview }: SkillCardProps) => {
  const { language, t } = useLanguage();

  const handleViewGithub = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = skill.githubUrl || `${GITHUB_REPO_ROOT}/${encodeURIComponent(skill.category)}/${encodeURIComponent(skill.source)}`;
    window.open(url, '_blank');
  };

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

  const displayName = language === 'zh' && skill.nameZh
    ? (skill.nameZh.includes(skill.name) ? skill.nameZh : `${skill.nameZh} (${skill.name})`)
    : skill.name;
  const displayDescription = language === 'zh' && skill.descriptionZh ? skill.descriptionZh : skill.description;

  const visibleTags = skill.tags?.slice(0, MAX_VISIBLE_TAGS) || [];
  const hiddenTagCount = (skill.tags?.length || 0) - MAX_VISIBLE_TAGS;

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-[var(--duration-normal)] group flex flex-col h-full hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer active:scale-[0.98] relative overflow-hidden"
      onClick={() => onPreview?.()}
    >
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/50 transition-all duration-700"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryStyles(skill.category)}`}>
          {skill.category}
        </span>
        <span className="text-slate-500 text-[10px] font-medium flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {skill.createdAt}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors duration-[var(--duration-normal)]">
        {displayName}
      </h3>

      <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">
        {displayDescription}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {visibleTags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
            <Tag className="w-2.5 h-2.5" />
            {tag}
          </span>
        ))}
        {hiddenTagCount > 0 && (
          <span className="text-[10px] text-slate-600 bg-slate-800/30 px-2 py-0.5 rounded border border-slate-700/30 font-mono">
            +{hiddenTagCount}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
        <div className="flex flex-col relative z-10 w-full pr-2">
          <Link
            to={`/author/${encodeURIComponent(skill.author)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-1.5 hover:text-blue-400 transition-colors truncate"
            title={skill.author}
          >
            <User className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">{skill.author}</span>
          </Link>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-blue-500/70" />
            <span className="font-mono">{(skill.downloadCount || 0).toLocaleString()}</span>
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleViewGithub}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl transition-all duration-[var(--duration-fast)] active:scale-95 border border-slate-700 hover:border-slate-600 flex items-center gap-2 px-3"
            title={skill.githubUrl ? t('originalSource') : t('viewInRepo')}
          >
            <Github className="w-5 h-5" />
            <span className="text-xs font-bold">{skill.githubUrl ? t('originalSource') : t('viewInRepo')}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.();
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all duration-[var(--duration-fast)] active:scale-95 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 flex items-center gap-2 px-4"
            title={t('download')}
          >
            <Download className="w-5 h-5" />
            <span className="text-xs font-bold">{t('download')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
