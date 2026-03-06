import { useState, useEffect, useMemo, useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    X, Download, Github, User, Calendar, Tag,
    Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Loader2
} from 'lucide-react';
import type { Skill, SkillCategory } from '../types/skill';
import { useLanguage } from '../hooks/useLanguage';
import { getLocalized } from '../utils/i18n';

interface SkillDetailModalProps {
    skill: Skill;
    onClose: () => void;
    onDownload: () => void;
}

// ─── 檔案樹節點型別 ─────────────────────────────
interface TreeNode {
    name: string;
    path: string;
    isDir: boolean;
    children?: TreeNode[];
}

// ─── 將扁平 files[] 轉為巢狀樹 ─────────────────
function buildFileTree(files: string[]): TreeNode[] {
    const root: TreeNode[] = [];

    for (const filePath of files) {
        const parts = filePath.split('/');
        let currentLevel = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;
            const fullPath = parts.slice(0, i + 1).join('/');

            let existing = currentLevel.find(n => n.name === part);
            if (!existing) {
                existing = {
                    name: part,
                    path: fullPath,
                    isDir: !isLast,
                    children: isLast ? undefined : [],
                };
                currentLevel.push(existing);
            }
            if (!isLast) {
                currentLevel = existing.children!;
            }
        }
    }

    // 排序：資料夾優先，再按字母序
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.sort((a, b) => {
            if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
            return a.name.localeCompare(b.name);
        }).map(n => ({
            ...n,
            children: n.children ? sortNodes(n.children) : undefined,
        }));
    };

    return sortNodes(root);
}

// ─── 檔案樹元件 ─────────────────────────────────
interface FileTreeItemProps {
    node: TreeNode;
    depth: number;
    selectedPath: string | null;
    onSelect: (path: string) => void;
}

const FileTreeItem = ({ node, depth, selectedPath, onSelect }: FileTreeItemProps) => {
    const [expanded, setExpanded] = useState(depth === 0);
    const isSelected = selectedPath === node.path;

    if (node.isDir) {
        return (
            <div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-left text-sm hover:bg-slate-800/50 transition-colors rounded-lg ${isSelected ? 'bg-blue-500/10 text-blue-400' : 'text-slate-300'
                        }`}
                    style={{ paddingLeft: `${depth * 16 + 12}px` }}
                >
                    {expanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    }
                    {expanded
                        ? <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
                        : <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                    }
                    <span className="truncate font-medium">{node.name}</span>
                </button>
                {expanded && node.children?.map(child => (
                    <FileTreeItem
                        key={child.path}
                        node={child}
                        depth={depth + 1}
                        selectedPath={selectedPath}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        );
    }

    return (
        <button
            onClick={() => onSelect(node.path)}
            className={`w-full flex items-center gap-1.5 px-3 py-1.5 text-left text-sm transition-colors rounded-lg ${isSelected
                ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
            style={{ paddingLeft: `${depth * 16 + 12 + 18}px` }}
        >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{node.name}</span>
        </button>
    );
};

// ─── 分類色彩 (與 SkillCard 同步) ────────────────
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

// ─── 主元件 ─────────────────────────────────────
export const SkillDetailModal = ({ skill, onClose, onDownload }: SkillDetailModalProps) => {
    const { language, t } = useLanguage();

    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [loadingContent, setLoadingContent] = useState(false);

    const displayName = getLocalized(skill, 'name', language);
    const displayDescription = getLocalized(skill, 'description', language);

    const GITHUB_REPO_ROOT = 'https://github.com/eric861129/SKILLS_All-in-one/tree/main/public/SKILLS';
    const githubUrl = skill.githubUrl || `${GITHUB_REPO_ROOT}/${encodeURIComponent(skill.category)}/${encodeURIComponent(skill.source)}`;

    // 1. 載入 manifest
    useEffect(() => {
        const loadManifest = async () => {
            try {
                const res = await fetch(`${import.meta.env.BASE_URL}skills-manifest.json`);
                if (!res.ok) throw new Error('Failed to load manifest');
                const manifest = await res.json();
                const skillData = manifest[skill.source];
                if (skillData?.files) {
                    setFiles(skillData.files);
                    // 預設選取 SKILL.md
                    const defaultFile = skillData.files.find((f: string) => f === 'SKILL.md') || skillData.files[0];
                    if (defaultFile) setSelectedFile(defaultFile);
                }
            } catch (err) {
                console.error('載入 manifest 失敗:', err);
            } finally {
                setLoadingFiles(false);
            }
        };
        loadManifest();
    }, [skill.source]);

    // 2. 載入選中檔案的內容
    useEffect(() => {
        if (!selectedFile) return;
        const loadFile = async () => {
            setLoadingContent(true);
            try {
                const res = await fetch(`${import.meta.env.BASE_URL}SKILLS/${encodeURIComponent(skill.category)}/${encodeURIComponent(skill.source)}/${selectedFile}`);
                if (res.ok) {
                    const text = await res.text();
                    setFileContent(text);
                } else {
                    setFileContent('// Unable to load file content.');
                }
            } catch {
                setFileContent('// Error loading file.');
            } finally {
                setLoadingContent(false);
            }
        };
        loadFile();
    }, [selectedFile, skill.category, skill.source]);

    // 3. 鍵盤事件 - Esc 關閉
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // 防止背景滾動
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const fileTree = useMemo(() => buildFileTree(files), [files]);
    const isMarkdown = selectedFile?.endsWith('.md');

    const handleDownloadClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDownload();
    }, [onDownload]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            onClick={onClose}
        >
            {/* 遮罩 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal 本體 */}
            <div
                className="relative w-full max-w-6xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="shrink-0 border-b border-slate-800 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryStyles(skill.category)}`}>
                                    {skill.category}
                                </span>
                                <span className="text-slate-500 text-xs font-medium flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {skill.createdAt}
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-100 mb-2 tracking-tight">
                                {displayName}
                            </h2>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                                {displayDescription}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-200 shrink-0 ml-4"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center flex-wrap gap-4">
                        <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" />
                            {skill.author}
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5 text-blue-500/70" />
                            {(skill.downloadCount || 0).toLocaleString()} downloads
                        </span>
                        <div className="flex flex-wrap gap-1.5 ml-auto">
                            {skill.tags?.map(tag => (
                                <span key={tag} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50">
                                    <Tag className="w-2.5 h-2.5" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => window.open(githubUrl, '_blank')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-xl transition-all active:scale-95 border border-slate-700 hover:border-slate-500 flex items-center gap-2 text-sm font-bold"
                        >
                            <Github className="w-4 h-4" />
                            {skill.githubUrl ? t('originalSource') : t('viewInRepo')}
                        </button>
                        <button
                            onClick={handleDownloadClick}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2 text-sm font-bold"
                        >
                            <Download className="w-4 h-4" />
                            {t('download')}
                        </button>
                    </div>
                </div>

                {/* ── Content: File Tree + Preview ── */}
                <div className="flex flex-1 overflow-hidden">
                    {/* 左：檔案樹 */}
                    <div className="w-56 md:w-64 shrink-0 border-r border-slate-800 overflow-y-auto bg-slate-900/50">
                        <div className="p-3 border-b border-slate-800/50">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                {t('fileTree')}
                            </span>
                        </div>
                        <div className="p-2">
                            {loadingFiles ? (
                                <div className="flex items-center justify-center py-8 text-slate-500">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            ) : fileTree.length > 0 ? (
                                fileTree.map(node => (
                                    <FileTreeItem
                                        key={node.path}
                                        node={node}
                                        depth={0}
                                        selectedPath={selectedFile}
                                        onSelect={setSelectedFile}
                                    />
                                ))
                            ) : (
                                <p className="text-xs text-slate-600 text-center py-8">
                                    {t('noFilesFound')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 右：檔案內容 */}
                    <div className="flex-1 overflow-y-auto bg-slate-950">
                        {!selectedFile ? (
                            <div className="flex items-center justify-center h-full text-slate-600">
                                <div className="text-center">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p className="text-sm font-medium">{t('selectFile')}</p>
                                </div>
                            </div>
                        ) : loadingContent ? (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                <span className="text-sm">{t('loadingFile')}</span>
                            </div>
                        ) : (
                            <div className="p-6 md:p-8">
                                {/* 檔案名標題 */}
                                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-800/50">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedFile}</span>
                                </div>
                                {isMarkdown ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <Markdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{fileContent}</Markdown>
                                    </div>
                                ) : (
                                    <pre className="text-sm text-slate-300 bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                                        {fileContent}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
