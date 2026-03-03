import JSZip from 'jszip';
import type { Skill } from '../types/skill';

/**
 * 下載並打包 Skill 檔案
 * @param skill 技能物件
 */
export const downloadAndZipSkill = async (skill: Skill) => {
  const zip = new JSZip();
  const folder = zip.folder(skill.folderName);

  if (!folder) return;

  // 常見檔案清單 (可根據不同技能擴充)
  const commonFiles = ['main.py', 'requirements.txt', 'README.md', 'strategy.txt', 'analyze.py', 'reader.js', 'index.js', 'SKILL.md'];
  
  const fetchPromises = commonFiles.map(async (fileName) => {
    try {
      // 根據新架構調整路徑: /SKILLS/{Category}/{folderName}/{fileName}
      const response = await fetch(`/SKILLS/${skill.category}/${skill.folderName}/${fileName}`);
      if (response.ok) {
        const blob = await response.blob();
        folder.file(fileName, blob);
        return true;
      }
    } catch (e) {
      // 檔案不存在，忽略
    }
    return false;
  });

  await Promise.all(fetchPromises);

  // 產生 zip 並下載
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${skill.folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
