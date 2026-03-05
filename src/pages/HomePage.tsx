import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Terminal, Search, Filter, X, Flame, Clock, ArrowUpDown, Languages, SlidersHorizontal, Plus } from 'lucide-react';
import { useSkills } from '../hooks/useSkills';
import { SkillCard } from '../components/SkillCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { SkeletonCard } from '../components/SkeletonCard';
import { ScrollToTop } from '../components/ScrollToTop';
import { HowItWorks } from '../components/HowItWorks';
import { JsonLd } from '../components/JsonLd';
import { useLanguage } from '../hooks/useLanguage';
import type { Skill, SkillCategory } from '../types/skill';
import type { SortOption } from '../hooks/useSkills';

const ITEMS_PER_PAGE = 24;

export const HomePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchInputRef = useRef<HTMLInputElement>(null);

    const {
        skills,
        loading,
        categories,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        authorCounts,
        tagCounts,
        selectedAuthors,
        selectedTags,
        toggleAuthor,
        toggleTag,
        clearSidebarFilters
    } = useSkills();

    const { language, setLanguage, t } = useLanguage();

    // 行動端側欄狀態
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    // 分頁
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // 當篩選、搜尋、排序改變時重設分頁
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [searchQuery, selectedCategory, sortBy, selectedAuthors, selectedTags]);

    const visibleSkills = skills.slice(0, visibleCount);
    const hasMore = visibleCount < skills.length;

    // ─── URL 同步：讀取 URL 參數 ──────────────────────
    useEffect(() => {
        const q = searchParams.get('q');
        const cat = searchParams.get('cat');
        const sort = searchParams.get('sort');

        if (q !== null && q !== searchQuery) setSearchQuery(q);
        if (cat !== null && cat !== selectedCategory) {
            if (cat === 'All' || categories.includes(cat as SkillCategory)) {
                setSelectedCategory(cat as SkillCategory | 'All');
            }
        }
        if (sort !== null && (sort === 'Popular' || sort === 'Latest') && sort !== sortBy) {
            setSortBy(sort as SortOption);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only on mount

    // ─── URL 同步：寫入 URL 參數 ──────────────────────
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedCategory !== 'All') params.set('cat', selectedCategory);
        if (sortBy !== 'Popular') params.set('sort', sortBy);

        const newSearch = params.toString();
        const currentSearch = searchParams.toString();
        if (newSearch !== currentSearch) {
            setSearchParams(params, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedCategory, sortBy]);

    // ─── 鍵盤快捷鍵 ────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            if (e.key === '/' && !isInput) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape' && isInput) {
                (target as HTMLInputElement).blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handlePreview = useCallback((skill: Skill) => {
        navigate(`/skill/${skill.id}`);
    }, [navigate]);

    const activeFilterCount = selectedAuthors.length + selectedTags.length;

    // 統計數據
    const totalDownloads = skills.reduce((sum, s) => sum + (s.downloadCount || 0), 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white noise-overlay">
            <JsonLd />

            {/* Language Switcher Float */}
            <div className="fixed top-6 right-6 z-40">
                <button
                    onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                    className="glass-surface p-2.5 rounded-xl flex items-center gap-2 hover:border-accent/50 transition-all duration-300 text-slate-300 hover:text-accent shadow-2xl"
                >
                    <Languages size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">{language === 'en' ? '中文' : 'EN'}</span>
                </button>
            </div>

            {/* ─── Hero Section (Asymmetric) ─── */}
            <header className="relative overflow-hidden border-b border-slate-900/50">
                {/* Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)]" />

                <div className="relative max-w-[1600px] mx-auto px-4 md:px-8 py-16 md:py-24">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 lg:gap-16">
                        {/* Left: Title & Search */}
                        <div className="flex-1 max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-accent/10 rounded-2xl border border-accent/20">
                                    <Terminal className="w-7 h-7 text-accent" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Open Source</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight mb-4">
                                {language === 'zh' ? 'AI 技能下載中心' : 'AI Skills Library'}
                            </h1>
                            <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-[55ch] mb-8">
                                {t('subtitle')}
                            </p>

                            {/* Search Bar */}
                            <div className="relative w-full group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-accent transition-colors" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('searchPlaceholder')}
                                    className="w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl py-4 pl-13 pr-14 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all duration-300 text-slate-100 text-base placeholder:text-slate-600 shadow-2xl"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {searchQuery ? (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-300"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <kbd className="max-md:hidden inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-600 bg-slate-800/50 border border-slate-700/50 rounded-md">
                                            /
                                        </kbd>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Stats Cards */}
                        <div className="flex gap-4 lg:gap-5 lg:pb-2">
                            {[
                                { value: loading ? '—' : skills.length, label: language === 'zh' ? '總技能數' : 'Total Skills', accent: 'text-accent' },
                                { value: categories.length, label: language === 'zh' ? '分類數' : 'Categories', accent: 'text-emerald-400' },
                                { value: totalDownloads.toLocaleString(), label: language === 'zh' ? '總下載次數' : 'Downloads', accent: 'text-amber-400' },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl px-5 py-4 min-w-[120px] backdrop-blur-sm">
                                    <div className={`text-2xl md:text-3xl font-black tracking-tight font-mono ${stat.accent}`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-1">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <HowItWorks />

            {/* Main Content: Sidebar + Content Area */}
            <div className="flex max-w-[1600px] mx-auto min-h-[calc(100dvh-400px)]">
                {/* Sidebar */}
                <FilterSidebar
                    authorCounts={authorCounts}
                    tagCounts={tagCounts}
                    selectedAuthors={selectedAuthors}
                    selectedTags={selectedTags}
                    onToggleAuthor={toggleAuthor}
                    onToggleTag={toggleTag}
                    onClearAll={clearSidebarFilters}
                    isOpen={showMobileSidebar}
                    onClose={() => setShowMobileSidebar(false)}
                />

                {/* Right Content */}
                <main className="flex-1 px-4 py-8 md:py-12 md:px-8">
                    {/* Category & Filter Bar */}
                    <div className="flex flex-col gap-6 md:gap-8 mb-12">

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            {/* Categories */}
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 text-slate-400 mb-4">
                                    <Filter className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{language === 'zh' ? '依分類篩選' : 'Filter by Category'}</span>
                                </div>
                                <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                    <button
                                        onClick={() => setSelectedCategory('All')}
                                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border shrink-0 hover:-translate-y-px ${selectedCategory === 'All'
                                            ? 'bg-accent border-accent/50 text-white shadow-lg shadow-accent/20'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                            }`}
                                    >
                                        {t('allCategories')}
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border shrink-0 hover:-translate-y-px ${selectedCategory === cat
                                                ? 'bg-accent border-accent/50 text-white shadow-lg shadow-accent/20'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Toggle + Mobile Filter Button */}
                            <div className="flex items-end gap-3 shrink-0">
                                {/* 行動端篩選按鈕 */}
                                <div className="md:hidden">
                                    <button
                                        onClick={() => setShowMobileSidebar(true)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${activeFilterCount > 0
                                            ? 'bg-accent border-accent/50 text-white shadow-lg shadow-accent/20'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                            }`}
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        {t('advancedFilters')}
                                        {activeFilterCount > 0 && (
                                            <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
                                        )}
                                    </button>
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 text-slate-400 mb-4">
                                        <ArrowUpDown className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{language === 'zh' ? '排序方式' : 'Sort By'}</span>
                                    </div>
                                    <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex">
                                        <button
                                            onClick={() => setSortBy('Popular')}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'Popular'
                                                ? 'bg-slate-800 text-accent shadow-sm'
                                                : 'text-slate-500 hover:text-slate-300'
                                                }`}
                                        >
                                            <Flame className={`w-3.5 h-3.5 ${sortBy === 'Popular' ? 'text-orange-500' : ''}`} />
                                            {t('sortByPopular')}
                                        </button>
                                        <button
                                            onClick={() => setSortBy('Latest')}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'Latest'
                                                ? 'bg-slate-800 text-accent shadow-sm'
                                                : 'text-slate-500 hover:text-slate-300'
                                                }`}
                                        >
                                            <Clock className="w-3.5 h-3.5" />
                                            {t('sortByLatest')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-accent rounded-full"></div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight">
                                {selectedCategory === 'All' ? (language === 'zh' ? '所有技能' : 'All Skills') : selectedCategory}
                                {searchQuery && <span className="text-slate-500 ml-3 font-medium normal-case text-base">{language === 'zh' ? '搜尋結果' : 'Search Results'}</span>}
                            </h2>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50 font-mono">
                            {loading ? '...' : skills.length} items
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[600px]">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : visibleSkills.length > 0 ? (
                        <div className="min-h-[600px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {visibleSkills.map((skill, index) => (
                                    <div
                                        key={skill.id}
                                        className="stagger-item"
                                        style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                                    >
                                        <SkillCard
                                            skill={skill}
                                            onPreview={() => handlePreview(skill)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <div className="flex justify-center mt-12">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                                        className="group flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:-translate-y-px active:scale-[0.98]"
                                    >
                                        {language === 'zh' ? '載入更多' : 'Load More'}
                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
                                            {skills.length - visibleCount}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 px-4 min-h-[400px]">
                            <div className="p-5 bg-slate-800/50 rounded-full mb-6 text-slate-600">
                                <Search className="w-10 h-10 md:w-12 md:h-12" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-200 mb-3">{t('noResults')}</h3>
                            <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-sm md:text-base">
                                {language === 'zh' ? '嘗試更換關鍵字或清除篩選條件，或是聯繫我們提交新的技能需求。' : 'Try changing your keywords or clearing filters, or contact us to submit a new skill request.'}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('All');
                                    clearSidebarFilters();
                                }}
                                className="mt-8 text-accent hover:text-indigo-300 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center gap-2 transition-colors border border-accent/20 px-6 py-2.5 rounded-xl hover:bg-accent/5"
                            >
                                {language === 'zh' ? '清除所有篩選條件' : 'Clear All Filters'}
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-900/50 py-16 px-4 text-center mt-20">
                <div className="p-3 bg-slate-900/50 rounded-2xl w-fit mx-auto mb-6 border border-slate-800/50">
                    <Terminal className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-600 text-xs md:text-sm font-medium tracking-wide">
                    © 2026 SKILLS All-in-one · {language === 'zh' ? '高品質 AI Agent 技能庫' : 'Premium AI Agent Skills Library'}
                </p>
                <div className="mt-6 flex flex-col items-center gap-6">
                    <a
                        href="https://github.com/eric861129/SKILLS_All-in-one/issues/new?template=submit_skill.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-accent hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-accent/20 hover:shadow-indigo-500/30 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        {t('submitSkill')}
                    </a>
                    <div className="flex justify-center gap-6 text-slate-700 text-[10px] font-bold uppercase tracking-widest">
                        <a href="https://github.com/eric861129/SKILLS_All-in-one#readme" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">Documentation</a>
                        <a href="https://github.com/eric861129/SKILLS_All-in-one" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">GitHub</a>
                        <a href="https://github.com/eric861129/SKILLS_All-in-one/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">{language === 'zh' ? '如何貢獻' : 'Contributing'}</a>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top */}

            {/* Scroll to Top */}
            <ScrollToTop />
        </div>
    )
}
