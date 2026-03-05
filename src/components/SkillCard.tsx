import { Download, Tag, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Skill, SkillCategory } from '../types/skill';
import { useLanguage } from '../hooks/useLanguage';

/**
 * Utility to merge tailwind classes safely
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MAX_VISIBLE_TAGS = 3;

interface SkillCardProps {
  skill: Skill;
  onPreview?: () => void;
}

export const SkillCard = ({ skill, onPreview }: SkillCardProps) => {
  const { language } = useLanguage();

  const getCategoryStyles = (category: SkillCategory) => {
    switch (category) {
      case 'Development & Code Tools':
        return 'bg-accent/10 text-accent border-accent/20';
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "glass-surface rounded-2xl p-6 group flex flex-col h-full cursor-pointer relative overflow-hidden",
        "hover:border-accent/40 transition-colors duration-300",
        "hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.1)]"
      )}
      onClick={() => onPreview?.()}
    >
      {/* Top Accent line on hover */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/0 to-transparent group-hover:via-accent/50 transition-all duration-700"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          getCategoryStyles(skill.category)
        )}>
          {skill.category}
        </span>
        <span className="text-slate-500 text-[10px] font-medium flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {skill.createdAt}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-accent transition-colors duration-300">
        {displayName}
      </h3>

      <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow leading-relaxed">
        {displayDescription}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {visibleTags.map((tag: string) => (
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
        <div className="flex flex-col relative z-10 w-full">
          <Link
            to={`/author/${encodeURIComponent(skill.author)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-1.5 hover:text-accent transition-colors truncate w-fit"
            title={skill.author}
          >
            <User className="w-4 h-4 text-accent shrink-0" />
            <span className="truncate">{skill.author}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-accent/70" />
              <span className="font-mono">{(skill.downloadCount || 0).toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

