import { useState, useEffect, useMemo } from 'react';
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

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/skills`);
      if (!response.ok) throw new Error('無法取得技能列表');
      const data = await response.json();
      setAllSkills(data);
    } catch (err: any) {
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
    setAllSkills(prev => prev.map(s => s.id === id ? { ...s, downloadCount: s.downloadCount + 1 } : s));

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
    const cats = new Set<SkillCategory>();
    allSkills.forEach(s => cats.add(s.category));
    return Array.from(cats).sort();
  }, [allSkills]);

  // Fuse.js 配置
  const fuse = useMemo(() => {
    return new Fuse(allSkills, {
      keys: ['name', 'description', 'tags'],
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
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      const searchItems = searchResults.map(r => r.item);
      
      if (selectedCategory !== 'All') {
        result = searchItems.filter(s => s.category === selectedCategory);
      } else {
        result = searchItems;
      }
    }

    // 3. 排序邏輯
    if (sortBy === 'Popular') {
      result.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (sortBy === 'Latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [allSkills, searchQuery, selectedCategory, sortBy, fuse]);

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
    incrementDownload, 
    refresh: fetchSkills 
  };
};
