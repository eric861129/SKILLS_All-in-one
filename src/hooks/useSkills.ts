import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { Skill, SkillCategory } from '../types/skill';
import { MOCK_SKILLS } from '../data/skills';

const API_BASE_URL = 'https://skill-proxy-api.iamhandsomeboy1129.workers.dev';

export type SortOption = 'Popular' | 'Latest';

export const useSkills = () => {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 篩選與排序狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Popular');

  // 側邊欄篩選狀態
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/skills`);
      if (!response.ok) throw new Error('無法取得技能列表');
      const data = await response.json();

      // 確保資料是陣列且格式正確
      if (Array.isArray(data)) {
        const sanitizedData = data.map(s => ({
          ...s,
          nameZh: s.nameZh || s.name_zh, // 支援多種命名風格
          descriptionZh: s.descriptionZh || s.description_zh,
          source: s.source || s.folderName,
          tags: Array.isArray(s.tags) ? s.tags : (typeof s.tags === 'string' ? JSON.parse(s.tags) : []),
          downloadCount: Number(s.downloadCount) || 0
        }));
        setAllSkills(sanitizedData);
      } else {
        setAllSkills(MOCK_SKILLS);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
      // 降級使用本地資料 (預設排序)
      const sortedMock = [...MOCK_SKILLS].sort((a, b) => b.downloadCount - a.downloadCount);
      setAllSkills(sortedMock);
    } finally {
      setLoading(false);
    }
  };

  const incrementDownload = async (id: number) => {
    // 樂觀更新
    setAllSkills(prev => prev.map(s => s.id === id ? { ...s, downloadCount: (s.downloadCount || 0) + 1 } : s));

    try {
      await fetch(`${API_BASE_URL}/increment-download?id=${id}`, { method: 'POST' });
    } catch (err) {
      console.error('更新下載次數失敗', err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // 計算所有可用的分類
  const categories = useMemo(() => {
    if (!allSkills.length) return [];
    const cats = new Set<SkillCategory>();
    allSkills.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats).sort();
  }, [allSkills]);

  // 作者帶數量 (降序) — 體現貢獻者尊重
  const authorCounts = useMemo((): [string, number][] => {
    const map = new Map<string, number>();
    allSkills.forEach(s => {
      if (s.author) map.set(s.author, (map.get(s.author) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [allSkills]);

  // 標籤帶數量 (降序)
  const tagCounts = useMemo((): [string, number][] => {
    const map = new Map<string, number>();
    allSkills.forEach(s => {
      s.tags?.forEach(t => map.set(t, (map.get(t) || 0) + 1));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [allSkills]);

  // 切換選取作者
  const toggleAuthor = useCallback((author: string) => {
    setSelectedAuthors(prev =>
      prev.includes(author) ? prev.filter(a => a !== author) : [...prev, author]
    );
  }, []);

  // 切換選取標籤
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  // 清除所有側邊欄篩選
  const clearSidebarFilters = useCallback(() => {
    setSelectedAuthors([]);
    setSelectedTags([]);
  }, []);

  // Fuse.js 配置 - 新增中文搜尋支援
  const fuse = useMemo(() => {
    return new Fuse(allSkills, {
      keys: [
        { name: 'name', weight: 1.0 },
        { name: 'nameZh', weight: 1.0 },
        { name: 'tags', weight: 0.8 },
        { name: 'author', weight: 0.6 },
        { name: 'description', weight: 0.4 },
        { name: 'descriptionZh', weight: 0.4 }
      ],
      threshold: 0.3,
      distance: 100,
    });
  }, [allSkills]);

  // 最終過濾與排序後的技能列表
  const filteredSkills = useMemo(() => {
    let result = [...allSkills];

    // 1. 分類過濾
    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }

    // 2. 關鍵字搜尋
    if (searchQuery.trim() && allSkills.length > 0) {
      const searchResults = fuse.search(searchQuery);
      const searchItems = searchResults.map(r => r.item);

      if (selectedCategory !== 'All') {
        result = searchItems.filter(s => s.category === selectedCategory);
      } else {
        result = searchItems;
      }
    }

    // 3. 作者篩選
    if (selectedAuthors.length > 0) {
      result = result.filter(s => selectedAuthors.includes(s.author));
    }

    // 4. 標籤篩選 (OR 邏輯：取聯集)
    if (selectedTags.length > 0) {
      result = result.filter(s => s.tags?.some(t => selectedTags.includes(t)));
    }

    // 5. 排序邏輯
    if (sortBy === 'Popular') {
      result.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    } else if (sortBy === 'Latest') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [allSkills, searchQuery, selectedCategory, selectedAuthors, selectedTags, sortBy, fuse]);

  return {
    skills: filteredSkills,
    loading,
    error,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    // 側邊欄篩選
    authorCounts,
    tagCounts,
    selectedAuthors,
    selectedTags,
    toggleAuthor,
    toggleTag,
    clearSidebarFilters,
    incrementDownload,
    refresh: fetchSkills
  };
};
