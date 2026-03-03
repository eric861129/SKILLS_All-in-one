export type SkillCategory = 
  | 'Document Skills' 
  | 'Development & Code Tools' 
  | 'Data & Analysis' 
  | 'Scientific & Research Tools' 
  | 'Writing & Research' 
  | 'Learning & Knowledge' 
  | 'Media & Content' 
  | 'Health & Life Sciences' 
  | 'Collaboration & Project Management' 
  | 'Security & Web Testing' 
  | 'Utility & Automation' 
  | 'Collections';

export interface Skill {
  id: number;
  name: string;
  author: string;
  description: string;
  source: string; // 對應資料庫中的 source 欄位 (原 folderName)
  downloadCount: number;
  createdAt: string;
  category: SkillCategory;
  tags: string[];
  version?: string;
}
