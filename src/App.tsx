import { useState } from 'react';
import { Terminal, Search, Loader2, Filter, X, Flame, Clock, ArrowUpDown, Languages, SlidersHorizontal } from 'lucide-react';
import { useSkills } from './hooks/useSkills';
import { SkillCard } from './components/SkillCard';
import { SkillDetailModal } from './components/SkillDetailModal';
import { FilterSidebar } from './components/FilterSidebar';
import { downloadAndZipSkill } from './utils/downloadSkill';
import { useLanguage } from './hooks/useLanguage';
import type { Skill } from './types/skill';

function App() {
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
    clearSidebarFilters,
    incrementDownload
  } = useSkills();

  const { language, setLanguage, t } = useLanguage();

  // Modal 狀態
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  // 行動端側欄狀態
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const handleDownload = async (skill: Skill) => {
    incrementDownload(skill.id);
    try {
      await downloadAndZipSkill(skill);
    } catch (err) {
      console.error('下載失敗:', err);
    }
  };

  const activeFilterCount = selectedAuthors.length + selectedTags.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Language Switcher Float */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 hover:border-blue-500 transition-all text-slate-300 hover:text-blue-400 shadow-2xl"
        >
          <Languages size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">{language === 'en' ? '中文' : 'EN'}</span>
        </button>
      </div>

      {/* Header / Hero Section */}
      <header className="py-12 md:py-20 px-4 flex flex-col items-center border-b border-slate-900 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
        <div className="flex items-center gap-3 md:gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="p-2.5 md:p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <Terminal className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
            {t('title')}
          </h1>
        </div>
        <p className="text-base md:text-lg text-slate-400 mb-10 md:mb-12 max-w-2xl text-center leading-relaxed font-medium animate-in fade-in duration-1000 delay-200">
          {t('subtitle')}
        </p>

        {/* Search Bar */}
        <div className="relative w-full max-w-2xl group animate-in fade-in zoom-in-95 duration-700 delay-300">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl group-focus-within:bg-blue-500/30 transition-all -z-10 rounded-full opacity-50"></div>
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl py-4 md:py-5 pl-12 md:pl-14 pr-12 md:pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-slate-100 text-base md:text-lg placeholder:text-slate-600 shadow-2xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content: Sidebar + Content Area */}
      <div className="flex max-w-[1600px] mx-auto min-h-[calc(100vh-300px)]">
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
          <div className="flex flex-col gap-6 md:gap-8 mb-12 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-400">

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
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${selectedCategory === 'All'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                  >
                    {t('allCategories')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${selectedCategory === cat
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
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
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
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
                          ? 'bg-slate-800 text-blue-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${sortBy === 'Popular' ? 'text-orange-500' : ''}`} />
                      {t('sortByPopular')}
                    </button>
                    <button
                      onClick={() => setSortBy('Latest')}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'Latest'
                          ? 'bg-slate-800 text-blue-400 shadow-sm'
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
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                {selectedCategory === 'All' ? (language === 'zh' ? '所有技能' : 'All Skills') : selectedCategory}
                {searchQuery && <span className="text-slate-500 ml-3 font-medium normal-case text-base">{language === 'zh' ? '搜尋結果' : 'Search Results'}</span>}
              </h2>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
              {skills.length} ITEMS
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 relative z-10" />
              </div>
              <p className="text-lg font-medium tracking-wide animate-pulse font-sans">{t('loading')}</p>
            </div>
          ) : skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onDownload={() => handleDownload(skill)}
                  onPreview={() => setSelectedSkill(skill)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 animate-in fade-in zoom-in-95 duration-500 px-4">
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
                className="mt-8 text-blue-400 hover:text-blue-300 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center gap-2 transition-colors border border-blue-400/20 px-6 py-2.5 rounded-xl hover:bg-blue-400/5"
              >
                {language === 'zh' ? '清除所有篩選條件' : 'Clear All Filters'}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-16 px-4 text-center mt-20">
        <div className="p-3 bg-slate-900 rounded-2xl w-fit mx-auto mb-6 border border-slate-800">
          <Terminal className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-slate-600 text-xs md:text-sm font-medium tracking-wide">
          © 2026 SKILLS All-in-one · {language === 'zh' ? '高品質 AI Agent 技能庫' : 'Premium AI Agent Skills Library'}
        </p>
        <div className="mt-6 flex justify-center gap-6 text-slate-700 text-[10px] font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-slate-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-slate-400 transition-colors">GitHub</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Support</a>
        </div>
      </footer>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onDownload={() => handleDownload(selectedSkill)}
        />
      )}
    </div>
  )
}

export default App
