import { useState, useEffect } from 'react';
import { Skill } from '../types/skill';
import { MOCK_SKILLS } from '../data/mockSkills';

const API_BASE_URL = ''; // 待設定

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      if (!API_BASE_URL) {
        // 模擬網路延遲
        await new Promise(resolve => setTimeout(resolve, 800));
        setSkills(MOCK_SKILLS);
      } else {
        const response = await fetch(`${API_BASE_URL}/skills`);
        if (!response.ok) throw new Error('無法取得技能列表');
        const data = await response.json();
        setSkills(data);
      }
    } catch (err: any) {
      setError(err.message);
      // 錯誤時降級使用 Mock Data
      setSkills(MOCK_SKILLS);
    } finally {
      setLoading(false);
    }
  };

  const incrementDownload = async (id: number) => {
    // 樂觀更新 (Optimistic Update)
    setSkills(prev => prev.map(s => s.id === id ? { ...s, downloadCount: s.downloadCount + 1 } : s));

    if (API_BASE_URL) {
      try {
        await fetch(`${API_BASE_URL}/increment-download?id=${id}`, { method: 'POST' });
      } catch (err) {
        console.error('更新下載次數失敗', err);
      }
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return { skills, loading, error, incrementDownload, refresh: fetchSkills };
};
