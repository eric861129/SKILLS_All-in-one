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
  description: string;
  author: string;
  category: SkillCategory;
  tags: string[];
  downloadCount: number;
  createdAt: string;
  version: string;
  folderName: string;
}
