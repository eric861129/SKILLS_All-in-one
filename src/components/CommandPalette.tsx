import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Search, Command, X, Terminal } from 'lucide-react';
import { MOCK_SKILLS } from '../data/skills';
import { useLanguage } from '../hooks/useLanguage';

export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { language } = useLanguage();

    const fuse = useMemo(() => {
        return new Fuse(MOCK_SKILLS, {
            keys: [
                { name: 'name', weight: 1.0 },
                { name: 'nameZh', weight: 1.0 },
                { name: 'tags', weight: 0.8 },
                { name: 'description', weight: 0.5 },
                { name: 'descriptionZh', weight: 0.5 },
                { name: 'author', weight: 0.4 },
            ],
            threshold: 0.3,
            distance: 100,
        });
    }, []);

    const results = useMemo(() => {
        if (!query.trim()) return MOCK_SKILLS.slice(0, 5);
        return fuse.search(query).map(r => r.item).slice(0, 6);
    }, [query, fuse]);

    // Keyboard shortcuts to open/close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened & reset state
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    // Handle navigation inside palette
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = results[selectedIndex];
                if (selected) {
                    setIsOpen(false);
                    navigate(`/skill/${selected.id}`);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, navigate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">

                {/* Search Input */}
                <div className="flex items-center px-4 py-4 border-b border-slate-800">
                    <Search className="w-5 h-5 text-slate-500 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder={language === 'zh' ? '搜尋技能、標籤或作者...' : 'Search skills, tags, or authors...'}
                        className="flex-1 bg-transparent text-slate-100 text-lg placeholder:text-slate-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 ml-4">
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
                            ESC
                        </kbd>
                        <button onClick={() => setIsOpen(false)} className="sm:hidden p-1 text-slate-400 hover:text-slate-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Results list */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            {language === 'zh' ? '找不到相關技能' : 'No skills found'}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {results.map((skill, index) => {
                                const isSelected = index === selectedIndex;
                                const displayName = language === 'zh' && skill.nameZh ? skill.nameZh : skill.name;

                                return (
                                    <button
                                        key={skill.id}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onClick={() => {
                                            setIsOpen(false);
                                            navigate(`/skill/${skill.id}`);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${isSelected ? 'bg-blue-600/10 text-blue-400' : 'text-slate-300 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                                                <Terminal className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                                            </div>
                                            <div className="truncate">
                                                <div className={`font-bold text-sm truncate ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                                                    {displayName}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2 truncate">
                                                    <span className="text-slate-400 font-mono">{skill.author}</span>
                                                    <span>•</span>
                                                    <span>{skill.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Command className="w-4 h-4 text-blue-500/50 shrink-0 ml-4 max-sm:hidden" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="hidden sm:flex border-t border-slate-800 bg-slate-900/50 px-4 py-3 items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 break-normal">
                            <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">↑↓</kbd>
                            to navigate
                        </span>
                        <span className="flex items-center gap-1.5 break-normal">
                            <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">Enter</kbd>
                            to select
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
