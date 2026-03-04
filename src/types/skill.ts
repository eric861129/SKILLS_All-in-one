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
  nameZh?: string; // 中文名稱
  author: string;
  description: string;
  descriptionZh?: string; // 中文敘述
  source: string; // 對應資料庫中的 source 欄位 (原 folderName)
  downloadCount: number; //預設為0
  createdAt: string;
  category: SkillCategory;
  tags: string[];
  version?: string;
  githubUrl?: string; // 原作者 GitHub 連結
}
