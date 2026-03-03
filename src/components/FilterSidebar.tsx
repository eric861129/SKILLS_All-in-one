import { useState, useMemo } from 'react';
import { Search, User, Tag, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface FilterSidebarProps {
    authorCounts: [string, number][];
    tagCounts: [string, number][];
    selectedAuthors: string[];
    selectedTags: string[];
    onToggleAuthor: (author: string) => void;
    onToggleTag: (tag: string) => void;
    onClearAll: () => void;
    /** 行動端控制 */
    isOpen: boolean;
    onClose: () => void;
}

const INITIAL_SHOW_COUNT = 8;

export const FilterSidebar = ({
    authorCounts,
    tagCounts,
    selectedAuthors,
    selectedTags,
    onToggleAuthor,
    onToggleTag,
    onClearAll,
    isOpen,
    onClose,
}: FilterSidebarProps) => {
    const { t } = useLanguage();

    const [authorSearch, setAuthorSearch] = useState('');
    const [tagSearch, setTagSearch] = useState('');
    const [showAllAuthors, setShowAllAuthors] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);

    const filteredAuthors = useMemo(() => {
        if (!authorSearch.trim()) return authorCounts;
        const q = authorSearch.toLowerCase();
        return authorCounts.filter(([name]) => name.toLowerCase().includes(q));
    }, [authorCounts, authorSearch]);

    const filteredTags = useMemo(() => {
        if (!tagSearch.trim()) return tagCounts;
        const q = tagSearch.toLowerCase();
        return tagCounts.filter(([name]) => name.toLowerCase().includes(q));
    }, [tagCounts, tagSearch]);

    const displayedAuthors = showAllAuthors ? filteredAuthors : filteredAuthors.slice(0, INITIAL_SHOW_COUNT);
    const displayedTags = showAllTags ? filteredTags : filteredTags.slice(0, INITIAL_SHOW_COUNT);

    const hasActiveFilters = selectedAuthors.length > 0 || selectedTags.length > 0;

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                    <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">{t('advancedFilters')}</span>
                </div>
                {/* 行動端關閉按鈕 */}
                <button
                    onClick={onClose}
                    className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* ── 作者篩選 ── */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            {t('filterByAuthor')}
                        </span>
                    </div>

                    {/* Author 搜尋 */}
                    <div className="relative mb-3">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                        <input
                            type="text"
                            value={authorSearch}
                            onChange={e => setAuthorSearch(e.target.value)}
                            placeholder={t('authorSearch')}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    {/* Author checkbox 列表 */}
                    <div className="space-y-0.5">
                        {displayedAuthors.map(([author, count]) => (
                            <button
                                key={author}
                                onClick={() => onToggleAuthor(author)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${selectedAuthors.includes(author)
                                        ? 'bg-blue-500/10 text-blue-400'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                    }`}
                            >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${selectedAuthors.includes(author)
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'border-slate-600'
                                    }`}>
                                    {selectedAuthors.includes(author) && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs truncate flex-1">{author}</span>
                                <span className="text-[10px] text-slate-600 font-mono shrink-0">{count}</span>
                            </button>
                        ))}
                    </div>

                    {filteredAuthors.length > INITIAL_SHOW_COUNT && (
                        <button
                            onClick={() => setShowAllAuthors(!showAllAuthors)}
                            className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                            {showAllAuthors ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {showAllAuthors ? t('showLess') : `${t('showMore')} (${filteredAuthors.length - INITIAL_SHOW_COUNT})`}
                        </button>
                    )}
                </div>

                {/* ── 標籤篩選 ── */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            {t('filterByTag')}
                        </span>
                    </div>

                    {/* Tag 搜尋 */}
                    <div className="relative mb-3">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                        <input
                            type="text"
                            value={tagSearch}
                            onChange={e => setTagSearch(e.target.value)}
                            placeholder={t('tagSearch')}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    {/* Tag checkbox 列表 */}
                    <div className="space-y-0.5">
                        {displayedTags.map(([tag, count]) => (
                            <button
                                key={tag}
                                onClick={() => onToggleTag(tag)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${selectedTags.includes(tag)
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                    }`}
                            >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${selectedTags.includes(tag)
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-slate-600'
                                    }`}>
                                    {selectedTags.includes(tag) && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs truncate flex-1">{tag}</span>
                                <span className="text-[10px] text-slate-600 font-mono shrink-0">{count}</span>
                            </button>
                        ))}
                    </div>

                    {filteredTags.length > INITIAL_SHOW_COUNT && (
                        <button
                            onClick={() => setShowAllTags(!showAllTags)}
                            className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                            {showAllTags ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {showAllTags ? t('showLess') : `${t('showMore')} (${filteredTags.length - INITIAL_SHOW_COUNT})`}
                        </button>
                    )}
                </div>
            </div>

            {/* 清除篩選 */}
            {hasActiveFilters && (
                <div className="shrink-0 p-4 border-t border-slate-800">
                    <button
                        onClick={onClearAll}
                        className="w-full text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/5 transition-all"
                    >
                        <X className="w-3 h-3" />
                        {t('clearAllFilters')}
                        <span className="text-slate-600 ml-1">
                            ({selectedAuthors.length + selectedTags.length})
                        </span>
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* 桌面端：固定側欄 */}
            <aside className="hidden md:flex w-[260px] shrink-0 border-r border-slate-800 bg-slate-900/50 flex-col h-full">
                {sidebarContent}
            </aside>

            {/* 行動端：Drawer 覆蓋層 */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                    <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
};
