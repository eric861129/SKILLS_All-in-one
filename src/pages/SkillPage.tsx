import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Github,
    User,
    Calendar,
    Tag,
    Terminal,
    ImageIcon,
    FileCode2,
    Folder,
    FolderOpen,
    FileText,
    Loader2,
    Copy,
    Expand,
    X,
    Hash,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MOCK_SKILLS } from '../data/skills';
import { useLanguage } from '../hooks/useLanguage';
import { downloadAndZipSkill } from '../utils/downloadSkill';
import { useToast } from '../components/Toast';
import { GiscusComments } from '../components/GiscusComments';
import { getLocalized } from '../utils/i18n';
import type { Skill, SkillCategory } from '../types/skill';
import type { SkillManifestEntry, SkillsManifest } from '../types/manifest';

const API_BASE_URL = 'https://skill-proxy-api.iamhandsomeboy1129.workers.dev';
type TreeNode = {
    id: string;
    name: string;
    isDir: boolean;
    fullPath?: string;
    children?: TreeNode[];
};

type FileLoadResult =
    | { kind: 'text'; content: string }
    | { kind: 'binary'; sizeBytes: number; mimeType: string };

const BINARY_FILE_EXTENSIONS = new Set([
    '7z',
    'bin',
    'bz2',
    'class',
    'db',
    'dmg',
    'doc',
    'docx',
    'exe',
    'gz',
    'ico',
    'jar',
    'jpg',
    'jpeg',
    'lock',
    'mp3',
    'mp4',
    'otf',
    'pdf',
    'png',
    'ppt',
    'pptx',
    'tar',
    'tgz',
    'ttf',
    'wasm',
    'webp',
    'woff',
    'woff2',
    'xls',
    'xlsx',
    'zip',
]);

const getFileExt = (filePath: string) => filePath.split('.').pop()?.toLowerCase() || '';

const isBinaryFilePath = (filePath: string) => BINARY_FILE_EXTENSIONS.has(getFileExt(filePath));

const isBinaryContentType = (contentType: string) => {
    if (!contentType) return false;
    const normalized = contentType.toLowerCase();
    if (
        normalized.startsWith('text/') ||
        normalized.includes('application/json') ||
        normalized.includes('application/xml') ||
        normalized.includes('application/javascript') ||
        normalized.includes('application/x-yaml') ||
        normalized.includes('application/yaml')
    ) {
        return false;
    }
    return (
        normalized.includes('application/octet-stream') ||
        normalized.includes('application/gzip') ||
        normalized.includes('application/zip') ||
        normalized.includes('application/x-tar') ||
        normalized.includes('application/x-gzip') ||
        normalized.includes('application/pdf') ||
        normalized.includes('image/') ||
        normalized.includes('audio/') ||
        normalized.includes('video/')
    );
};

const formatBytes = (sizeBytes: number) => {
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    const kb = sizeBytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
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

const buildTreeFromFiles = (files: string[]): TreeNode[] => {
    const root: TreeNode[] = [];

    files.forEach((fullPath) => {
        const parts = fullPath.split('/').filter(Boolean);
        let level = root;

        parts.forEach((part, index) => {
            const isDir = index < parts.length - 1;
            const nodeId = parts.slice(0, index + 1).join('/');
            let node = level.find((existing) => existing.id === nodeId);

            if (!node) {
                node = {
                    id: nodeId,
                    name: part,
                    isDir,
                    fullPath: isDir ? undefined : fullPath,
                    children: isDir ? [] : undefined,
                };
                level.push(node);
            }

            if (isDir && node.children) {
                level = node.children;
            }
        });
    });

    const sortTree = (nodes: TreeNode[]): TreeNode[] => {
        return nodes
            .sort((a, b) => {
                if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
                return a.name.localeCompare(b.name);
            })
            .map((node) => ({
                ...node,
                children: node.children ? sortTree(node.children) : undefined,
            }));
    };

    return sortTree(root);
};

const extractMarkdownFrontmatter = (content: string) => {
    const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n)?/);
    if (!match) {
        return { frontmatter: null, body: content };
    }
    return {
        frontmatter: match[1].trim(),
        body: content.slice(match[0].length).trimStart(),
    };
};

const extToLanguage = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'py':
            return 'python';
        case 'json':
            return 'json';
        case 'yml':
        case 'yaml':
            return 'yaml';
        case 'sh':
        case 'bash':
            return 'bash';
        case 'toml':
            return 'toml';
        case 'rs':
            return 'rust';
        case 'go':
            return 'go';
        case 'java':
            return 'java';
        case 'sql':
            return 'sql';
        case 'xml':
        case 'xsd':
            return 'xml';
        case 'md':
            return 'markdown';
        default:
            return 'text';
    }
};

const copyText = async (text: string) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
};

const markdownComponents: Components = {
    h1: ({ children }) => <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-100 mt-2 mb-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold text-slate-100 mt-10 mb-4 pb-2 border-b border-slate-800">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold text-slate-200 mt-8 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-semibold text-slate-200 mt-6 mb-2">{children}</h4>,
    p: ({ children }) => <p className="text-slate-300 leading-8 mb-4">{children}</p>,
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-200 underline underline-offset-4 decoration-blue-400/60 transition-colors"
        >
            {children}
        </a>
    ),
    ul: ({ children }) => <ul className="list-disc marker:text-blue-400 pl-6 space-y-2 text-slate-300 mb-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal marker:text-emerald-400 pl-6 space-y-2 text-slate-300 mb-4">{children}</ol>,
    li: ({ children }) => <li className="leading-7">{children}</li>,
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-blue-500/50 bg-slate-900/60 text-slate-300 rounded-r-xl pl-4 py-3 mb-5 italic">
            {children}
        </blockquote>
    ),
    hr: () => <hr className="my-8 border-slate-800" />,
    table: ({ children }) => (
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-900/80 text-slate-200">{children}</thead>,
    tbody: ({ children }) => <tbody className="text-slate-300">{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-slate-800 last:border-0">{children}</tr>,
    th: ({ children }) => <th className="text-left px-4 py-2.5 font-semibold">{children}</th>,
    td: ({ children }) => <td className="px-4 py-2.5 align-top">{children}</td>,
    pre: ({ children }) => (
        <pre className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 mb-5 overflow-x-auto text-sm leading-7">
            {children}
        </pre>
    ),
    code: ({ children, className }) => {
        const isInline = !className;
        if (isInline) {
            return <code className="font-mono text-emerald-300 bg-slate-800 px-1.5 py-0.5 rounded">{children}</code>;
        }
        return <code className="font-mono text-slate-200">{children}</code>;
    },
    strong: ({ children }) => <strong className="text-slate-100 font-semibold">{children}</strong>,
    em: ({ children }) => <em className="text-slate-200">{children}</em>,
};

const looksLikeSpaHtmlFallback = (content: string) => {
    const sample = content.slice(0, 1200).toLowerCase();
    return (
        sample.includes('<!doctype html') &&
        sample.includes('<div id="root"') &&
        (sample.includes('@vite/client') || sample.includes('spa redirect'))
    );
};

const FileTreeItem = ({
    node,
    depth,
    selectedFile,
    onSelect,
}: {
    node: TreeNode;
    depth: number;
    selectedFile: string | null;
    onSelect: (path: string) => void;
}) => {
    const [expanded, setExpanded] = useState(depth < 1);
    const isSelected = node.fullPath && selectedFile === node.fullPath;

    if (node.isDir) {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left text-sm rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
                    style={{ paddingLeft: `${depth * 14 + 8}px` }}
                >
                    {expanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    {expanded ? (
                        <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : (
                        <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                    <span className="truncate">{node.name}</span>
                </button>
                {expanded &&
                    node.children?.map((child) => (
                        <FileTreeItem
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            selectedFile={selectedFile}
                            onSelect={onSelect}
                        />
                    ))}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => node.fullPath && onSelect(node.fullPath)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm rounded-lg transition-colors ${
                isSelected
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
            style={{ paddingLeft: `${depth * 14 + 22}px` }}
        >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{node.name}</span>
        </button>
    );
};

export const SkillPage = () => {
    const { id } = useParams<{ id: string }>();
    const { language, t } = useLanguage();
    const { showToast } = useToast();

    const [downloadCount, setDownloadCount] = useState<number>(0);
    const [manifestEntry, setManifestEntry] = useState<SkillManifestEntry | null>(null);
    const [manifestLoading, setManifestLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [fileBinaryMeta, setFileBinaryMeta] = useState<{ sizeBytes: number; mimeType: string } | null>(null);
    const [loadingFile, setLoadingFile] = useState(false);
    const [readerMode, setReaderMode] = useState(false);
    const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
    const fileCacheRef = useRef<Map<string, FileLoadResult>>(new Map());
    const fileRequestCacheRef = useRef<Map<string, Promise<FileLoadResult>>>(new Map());

    const skill = useMemo(() => {
        const numId = Number(id);
        return MOCK_SKILLS.find((s) => s.id === numId) || null;
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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!skill) return;
        const loadManifest = async () => {
            setManifestLoading(true);
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}skills-manifest.json`);
                if (!response.ok) throw new Error('Failed to load skills manifest');
                const manifest: SkillsManifest = await response.json();
                setManifestEntry(manifest[skill.source] || null);
            } catch (error) {
                console.error('Failed to load skill manifest:', error);
                setManifestEntry(null);
            } finally {
                setManifestLoading(false);
            }
        };
        loadManifest();
    }, [skill]);

    useEffect(() => {
        if (!manifestEntry?.files?.length) {
            setSelectedFile(null);
            return;
        }
        const defaultFile = manifestEntry.files.find((file) => file === 'SKILL.md') || manifestEntry.files[0];
        if (!defaultFile) return;
        setSelectedFile(defaultFile);
    }, [manifestEntry]);

    useEffect(() => {
        fileCacheRef.current.clear();
        fileRequestCacheRef.current.clear();
    }, [skill?.source, manifestEntry?.category]);

    const fetchSkillFile = useCallback(
        async (targetFile: string, signal?: AbortSignal) => {
            if (!skill) throw new Error('Skill not found');
            const category = manifestEntry?.category || skill.category;
            const source = skill.source;
            const encodedFile = targetFile.split('/').map((part) => encodeURIComponent(part)).join('/');
            const base = import.meta.env.BASE_URL;
            const candidates = [
                `${base}SKILLS/${category}/${source}/${targetFile}`,
                `${base}SKILLS/${encodeURIComponent(category)}/${encodeURIComponent(source)}/${encodedFile}`,
            ];

            for (const path of [...new Set(candidates)]) {
                const response = await fetch(path, { signal });
                if (!response.ok) continue;
                const contentType = (response.headers?.get?.('content-type') || '').toLowerCase();
                const binaryByPath = isBinaryFilePath(targetFile);

                if (binaryByPath || isBinaryContentType(contentType)) {
                    if (contentType.includes('text/html')) {
                        const htmlText = await response.text();
                        if (looksLikeSpaHtmlFallback(htmlText)) {
                            continue;
                        }
                        return { kind: 'text', content: htmlText } as FileLoadResult;
                    }
                    const buffer = await response.arrayBuffer();
                    return {
                        kind: 'binary',
                        sizeBytes: buffer.byteLength,
                        mimeType: contentType || 'application/octet-stream',
                    } as FileLoadResult;
                }

                const text = await response.text();
                if (!targetFile.toLowerCase().endsWith('.html') && looksLikeSpaHtmlFallback(text)) {
                    continue;
                }
                return { kind: 'text', content: text } as FileLoadResult;
            }
            throw new Error('Failed to load file');
        },
        [skill, manifestEntry]
    );

    const loadFileContent = useCallback(
        async (targetFile: string, signal?: AbortSignal) => {
            const cached = fileCacheRef.current.get(targetFile);
            if (cached) {
                return cached;
            }

            const inFlight = fileRequestCacheRef.current.get(targetFile);
            if (inFlight) {
                return inFlight;
            }

            const request = fetchSkillFile(targetFile, signal)
                .then((result) => {
                    fileCacheRef.current.set(targetFile, result);
                    return result;
                })
                .finally(() => {
                    fileRequestCacheRef.current.delete(targetFile);
                });

            fileRequestCacheRef.current.set(targetFile, request);
            return request;
        },
        [fetchSkillFile]
    );

    useEffect(() => {
        if (!skill || !selectedFile) return;
        const abortController = new AbortController();
        let cancelled = false;

        const loadFile = async () => {
            setHighlightedLine(null);
            const cached = fileCacheRef.current.get(selectedFile);
            if (cached) {
                if (cached.kind === 'binary') {
                    setFileContent('');
                    setFileBinaryMeta({ sizeBytes: cached.sizeBytes, mimeType: cached.mimeType });
                } else {
                    setFileContent(cached.content);
                    setFileBinaryMeta(null);
                }
                setLoadingFile(false);
                return;
            }

            setLoadingFile(true);
            try {
                const loadedResult = await loadFileContent(selectedFile, abortController.signal);
                if (cancelled) return;
                if (loadedResult.kind === 'binary') {
                    setFileContent('');
                    setFileBinaryMeta({ sizeBytes: loadedResult.sizeBytes, mimeType: loadedResult.mimeType });
                } else {
                    setFileContent(loadedResult.content);
                    setFileBinaryMeta(null);
                }
            } catch (error) {
                if (abortController.signal.aborted) return;
                console.error('Failed to load file content:', error);
                if (cancelled) return;
                setFileBinaryMeta(null);
                setFileContent('// Unable to load file content.');
            } finally {
                if (cancelled) return;
                setLoadingFile(false);
            }
        };

        loadFile();
        return () => {
            cancelled = true;
            abortController.abort();
        };
    }, [selectedFile, skill, loadFileContent]);

    useEffect(() => {
        if (!manifestEntry?.files?.length || !skill) return;

        const connection = (navigator as Navigator & {
            connection?: { saveData?: boolean; effectiveType?: string };
        }).connection;
        if (connection?.saveData) return;

        const isSlowNetwork = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
        if (isSlowNetwork) return;

        const fileMeta = manifestEntry.fileMeta || {};
        const MAX_CONCURRENT_PRELOAD = 2;
        const MAX_PRELOAD_FILES = 16;
        const MAX_FILE_SIZE_BYTES = 180 * 1024;
        const DEFAULT_SIZE_BYTES = 24 * 1024;

        const queue = [...manifestEntry.files]
            .filter((file) => file !== selectedFile)
            .filter((file) => !isBinaryFilePath(file))
            .filter((file) => {
                const size = fileMeta[file]?.sizeBytes;
                return typeof size !== 'number' || size <= MAX_FILE_SIZE_BYTES;
            })
            .sort((a, b) => (fileMeta[a]?.sizeBytes ?? DEFAULT_SIZE_BYTES) - (fileMeta[b]?.sizeBytes ?? DEFAULT_SIZE_BYTES))
            .slice(0, MAX_PRELOAD_FILES);

        if (!queue.length) return;

        let cancelled = false;
        const abortController = new AbortController();
        const preloadTimer = window.setTimeout(() => {
            const worker = async () => {
                while (!cancelled) {
                    const next = queue.shift();
                    if (!next) return;
                    if (fileCacheRef.current.has(next)) continue;
                    try {
                        await loadFileContent(next, abortController.signal);
                    } catch {
                        if (abortController.signal.aborted) return;
                    }
                }
            };

            void Promise.all(
                Array.from({ length: MAX_CONCURRENT_PRELOAD }, () => worker())
            );
        }, 250);

        return () => {
            cancelled = true;
            abortController.abort();
            window.clearTimeout(preloadTimer);
        };
    }, [manifestEntry, selectedFile, skill, loadFileContent]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setReaderMode(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const handleDownload = async (s: Skill) => {
        try {
            setDownloadCount((prev) => prev + 1);
            fetch(`${API_BASE_URL}/increment-download?id=${s.id}`, { method: 'POST' }).catch(() => {});
            await downloadAndZipSkill(s);
            showToast(t('downloadSuccess', { name: getLocalized(s, 'name', language) }), 'success');
        } catch (err) {
            console.error('Download failed:', err);
            showToast(t('downloadFailed'), 'error');
        }
    };

    const handleCopyFile = useCallback(async () => {
        if (!selectedFile) return;
        if (fileBinaryMeta) {
            showToast(
                language === 'zh' ? '\u4e8c\u9032\u4f4d\u6a94\u6848\u7121\u6cd5\u4ee5\u6587\u5b57\u8907\u88fd' : 'Binary file cannot be copied as text',
                'error'
            );
            return;
        }
        try {
            await copyText(fileContent);
            showToast(t('copySuccess', { name: selectedFile }), 'success');
        } catch {
            showToast(t('copyFailed'), 'error');
        }
    }, [fileBinaryMeta, fileContent, language, selectedFile, showToast]);

    const activationSkill = useMemo(() => {
        if (!skill?.usageCommand) return null;
        return MOCK_SKILLS.find((candidate) => candidate.source === skill.usageCommand) || null;
    }, [skill]);

    const relatedSkills = useMemo(() => {
        if (!skill) return [];
        return MOCK_SKILLS
            .filter((s) => s.category === skill.category && s.id !== skill.id)
            .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
            .slice(0, 3);
    }, [skill]);

    const treeForCurrentTab = useMemo(() => {
        return buildTreeFromFiles(manifestEntry?.files || []);
    }, [manifestEntry]);

    const isMarkdown = !fileBinaryMeta && selectedFile?.toLowerCase().endsWith('.md');
    const tokenEstimate = manifestEntry?.tokenEstimate;

    const renderContent = (reader: boolean) => {
        if (loadingFile) {
            return (
                <div className="flex items-center justify-center h-full text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>{t('loadingFile')}</span>
                </div>
            );
        }
        if (!selectedFile) {
            return (
                <div className="flex items-center justify-center h-full text-slate-600">
                    <p>{t('selectFile')}</p>
                </div>
            );
        }

        if (fileBinaryMeta) {
            return (
                <div className="h-full rounded-xl border border-slate-800 bg-slate-950/50 p-6 flex items-center justify-center">
                    <div className="max-w-lg text-center">
                        <h4 className="text-slate-100 text-lg font-semibold mb-2">
                            {t('binaryNotPreviewable')}
                        </h4>
                        <p className="text-slate-400 text-sm mb-2">
                            {language === 'zh'
                                ? '這個檔案屬於壓縮或二進位格式，無法以程式碼檢視器顯示。'
                                : 'This file is compressed or binary and cannot be rendered in the code viewer.'}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                            {fileBinaryMeta.mimeType} · {formatBytes(fileBinaryMeta.sizeBytes)}
                        </p>
                    </div>
                </div>
            );
        }

        if (isMarkdown) {
            const { frontmatter, body } = extractMarkdownFrontmatter(fileContent);
            const frontmatterLineCount = frontmatter ? frontmatter.split(/\r?\n/).length : 0;
            return (
                <div className={reader ? 'text-base' : 'text-[15px]'}>
                    {frontmatter && (
                        <details className="mb-5 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                            <summary className="cursor-pointer px-4 py-2.5 text-xs font-semibold text-slate-300 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                                <span>YAML Frontmatter</span>
                                <span className="text-slate-500 font-mono">{frontmatterLineCount} lines</span>
                            </summary>
                            <pre className="m-0 px-4 py-3 text-[12px] md:text-[13px] leading-6 overflow-x-auto text-slate-300 bg-slate-950/60">
                                {frontmatter}
                            </pre>
                        </details>
                    )}
                    <Markdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{body}</Markdown>
                </div>
            );
        }

        return (
            <div data-testid="syntax-viewer" className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                <SyntaxHighlighter
                    language={extToLanguage(selectedFile)}
                    style={oneDark}
                    showLineNumbers
                    wrapLines
                    lineProps={(lineNumber: number) => ({
                        onClick: () => setHighlightedLine(lineNumber),
                        style: {
                            display: 'block',
                            cursor: 'pointer',
                            backgroundColor:
                                highlightedLine === lineNumber ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        },
                    })}
                    customStyle={{
                        margin: 0,
                        background: 'transparent',
                        fontSize: reader ? '0.95rem' : '0.85rem',
                        lineHeight: 1.6,
                    }}
                >
                    {fileContent}
                </SyntaxHighlighter>
            </div>
        );
    };

    if (!skill) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-6">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                    <Terminal className="w-12 h-12 text-slate-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-200">{t('skillNotFound')}</h1>
                <p className="text-slate-500">
                    {language === 'zh'
                        ? '這個技能可能已移除，或你輸入了錯誤的 ID。'
                        : 'This skill may have been removed or the ID is incorrect.'}
                </p>
                <Link
                    to="/"
                    className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2 border border-blue-400/20 px-5 py-2.5 rounded-xl hover:bg-blue-400/5 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('backToHome')}
                </Link>
            </div>
        );
    }

    const displayName = getLocalized(skill, 'name', language);
    const displayDescription = getLocalized(skill, 'description', language);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <nav className="border-b border-slate-900 px-4 md:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('backToLibrary')}
                    </Link>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
                    <div className="flex-1">
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-4 ${getCategoryStyles(
                                skill.category
                            )}`}
                        >
                            {skill.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-100 mb-3">{displayName}</h1>
                        {language === 'zh' && skill.nameZh && !skill.nameZh.includes(skill.name) && (
                            <p className="text-slate-500 text-sm font-mono mb-4">{skill.name}</p>
                        )}
                        <p className="text-slate-400 text-lg leading-relaxed max-w-3xl mb-8">{displayDescription}</p>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                        <div className="flex gap-3">
                            <a
                                href={
                                    skill.githubUrl ||
                                    `https://github.com/eric861129/SKILLS_All-in-one/tree/main/public/SKILLS/${encodeURIComponent(
                                        skill.category
                                    )}/${encodeURIComponent(skill.source)}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all active:scale-95 border border-slate-700 hover:border-slate-500 flex items-center gap-2 px-5"
                            >
                                <Github className="w-5 h-5" />
                                <span className="text-sm font-bold">{skill.githubUrl ? t('originalSource') : t('viewInRepo')}</span>
                            </a>
                            <button
                                onClick={() => handleDownload(skill)}
                                className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2 px-5"
                            >
                                <Download className="w-5 h-5" />
                                <span className="text-sm font-bold">{t('download')}</span>
                            </button>
                        </div>
                        <div className="mt-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:w-[320px]">
                            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2 mb-3">
                                <Hash className="w-3.5 h-3.5" />
                                Token Estimation
                            </h3>
                            <div className="space-y-2">
                                <div className="text-sm flex items-center justify-between text-slate-300">
                                    <span>~ heuristic</span>
                                    <span className="font-mono text-blue-300">
                                        {typeof tokenEstimate?.heuristic === 'number'
                                            ? tokenEstimate.heuristic.toLocaleString()
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="text-sm flex items-center justify-between text-slate-300">
                                    <span>cl100k</span>
                                    <span className="font-mono text-emerald-300">
                                        {typeof tokenEstimate?.cl100k === 'number'
                                            ? tokenEstimate.cl100k.toLocaleString()
                                            : 'N/A'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 pt-1">
                                    {t('valuesEstimates')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <section data-testid="skill-deep-preview" className="mb-12 relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 md:px-8">
                    <div className="max-w-[1600px] mx-auto">
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            <FileCode2 className="w-4 h-4" />
                            Deep Inspection
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] min-h-[72vh]">
                                <div className="border-r border-slate-800 bg-slate-950/40 overflow-y-auto">
                                    <div className="px-3 py-2 border-b border-slate-800/70 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                        {skill.source}
                                    </div>
                                    {manifestLoading ? (
                                        <div className="flex items-center justify-center py-10 text-slate-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </div>
                                    ) : treeForCurrentTab.length > 0 ? (
                                        <div className="p-2">
                                            {treeForCurrentTab.map((node) => (
                                                <FileTreeItem
                                                    key={node.id}
                                                    node={node}
                                                    depth={0}
                                                    selectedFile={selectedFile}
                                                    onSelect={setSelectedFile}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-600 px-3 py-8 text-center">
                                            {t('noFilesFound')}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col overflow-hidden">
                                    <div className="border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2">
                                        <div className="text-xs text-slate-400 font-mono truncate">{selectedFile}</div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCopyFile}
                                                disabled={!selectedFile || Boolean(fileBinaryMeta)}
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                                {t('copyFile')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setReaderMode(true)}
                                                disabled={!selectedFile || Boolean(fileBinaryMeta)}
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                            >
                                                <Expand className="w-3.5 h-3.5" />
                                                Reader Mode
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 md:p-7 overflow-auto h-[72vh]">{renderContent(false)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {skill.previewImages && skill.previewImages.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">
                            <ImageIcon className="w-4 h-4" />
                            {t('preview')}
                        </div>
                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {skill.previewImages.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${skill.name} screenshot ${idx + 1}`}
                                    className="shrink-0 w-[85%] sm:w-[500px] md:w-[600px] h-[300px] sm:h-[400px] object-cover rounded-2xl border border-slate-800 snap-center shadow-2xl shadow-slate-900/50"
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <Link
                        to={`/author/${encodeURIComponent(skill.author)}`}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group cursor-pointer"
                    >
                        <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                            <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{t('author')}</p>
                            <p className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{skill.author}</p>
                        </div>
                    </Link>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                            <Download className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{t('downloads')}</p>
                            <p className="text-sm font-semibold text-slate-200">{downloadCount.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                        <div className="p-2.5 bg-amber-500/10 rounded-xl">
                            <Calendar className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{t('created')}</p>
                            <p className="text-sm font-semibold text-slate-200">{skill.createdAt}</p>
                        </div>
                    </div>
                </div>

                {activationSkill && (
                    <div className="mb-10">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5" />
                            {language === 'zh' ? '啟用技能' : 'Activation Skill'}
                        </h2>
                        <Link
                            to={`/skill/${activationSkill.id}`}
                            className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">
                                        {language === 'zh' ? 'SuperPower 系列' : 'SuperPower Series'}
                                    </div>
                                    <h3 className="text-base font-bold text-slate-200 group-hover:text-blue-400 transition-colors mb-2">
                                        {getLocalized(activationSkill, 'name', language)}
                                    </h3>
                                    <p className="text-sm text-slate-400 max-w-2xl">
                                        {language === 'zh'
                                            ? '這個技能屬於 SuperPower 系列，建議先透過 using-superpowers 建立技能調用流程後再使用。'
                                            : 'This skill is part of the SuperPower series. Start with using-superpowers to establish the activation workflow before using it.'}
                                    </p>
                                </div>
                                <div className="text-xs uppercase tracking-widest text-slate-500 font-medium">
                                    {activationSkill.source}
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                <div className="mb-10">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" />
                        {t('tags')}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {skill.tags?.map((tag) => (
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

                {relatedSkills.length > 0 && (
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                            {t('relatedSkills')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {relatedSkills.map((relatedSkill) => {
                                const relatedName = getLocalized(relatedSkill, 'name', language);
                                return (
                                    <Link
                                        key={relatedSkill.id}
                                        to={`/skill/${relatedSkill.id}`}
                                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-all group"
                                    >
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border mb-3 ${getCategoryStyles(
                                                relatedSkill.category
                                            )}`}
                                        >
                                            {relatedSkill.category}
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors mb-2">
                                            {relatedName}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {relatedSkill.author}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Download className="w-3 h-3" />
                                                {(relatedSkill.downloadCount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                <GiscusComments skillId={skill.id} skillName={skill.name} />
            </div>

            {readerMode && (
                <div
                    className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm p-4 md:p-8"
                    data-testid="reader-mode-overlay"
                >
                    <div className="h-full max-w-6xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
                        <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                            <div className="text-sm font-mono text-slate-300 truncate">{selectedFile}</div>
                            <button
                                type="button"
                                onClick={() => setReaderMode(false)}
                                className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 md:p-8 overflow-auto flex-1">{renderContent(true)}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

