import { Download, Tag, User, Calendar } from 'lucide-react';
import { Skill } from '../types/skill';

interface SkillCardProps {
  skill: Skill;
  onDownload?: () => void;
}

export const SkillCard = ({ skill, onDownload }: SkillCardProps) => {
  const categoryColors = {
    '工具': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    '開發': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    '創意': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    '分析': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all group flex flex-col h-full shadow-lg hover:shadow-blue-500/10">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[skill.category]}`}>
          {skill.category}
        </span>
        <span className="text-slate-500 text-xs flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {skill.createdAt}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
        {skill.name}
      </h3>
      
      <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
        {skill.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {skill.tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            <Tag className="w-2.5 h-2.5" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 flex items-center gap-1 mb-1">
            <User className="w-3 h-3" />
            {skill.author}
          </span>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Download className="w-3 h-3 text-blue-500" />
            {skill.downloadCount.toLocaleString()} 次下載
          </span>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDownload?.();
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          title="下載 Skill"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
