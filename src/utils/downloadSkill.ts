import JSZip from 'jszip';
import type { Skill } from '../types/skill';

interface SkillManifest {
  [skillSource: string]: {
    category: string;
    files: string[];
  };
}

/**
 * 下載並打包 Skill 檔案
 * @param skill 技能物件
 */
export const downloadAndZipSkill = async (skill: Skill) => {
  const zip = new JSZip();
  const folder = zip.folder(skill.source);

  if (!folder) return;

  try {
    // 1. 取得檔案清單 (Manifest)
    const manifestResponse = await fetch(`${import.meta.env.BASE_URL}skills-manifest.json`);
    if (!manifestResponse.ok) throw new Error('無法取得檔案清單');

    const manifest: SkillManifest = await manifestResponse.json();
    const skillData = manifest[skill.source];

    if (!skillData) {
      console.warn(`Manifest 中找不到技能: ${skill.source}，將使用基本偵測模式。`);
      await fallbackDownload(skill, folder);
    } else {
      // 2. 根據清單下載所有檔案
      const fetchPromises = skillData.files.map(async (filePath) => {
        try {
          const response = await fetch(`${import.meta.env.BASE_URL}SKILLS/${skillData.category}/${skill.source}/${filePath}`);
          if (response.ok) {
            const blob = await response.blob();
            // 建立子目錄結構並放入檔案
            folder.file(filePath, blob);
            return true;
          }
        } catch (e) {
          console.error(`下載檔案失敗: ${filePath}`, e);
        }
        return false;
      });

      await Promise.all(fetchPromises);
    }

    // 3. 產生 zip 並下載
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${skill.source}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('下載過程發生錯誤:', error);
    alert('下載失敗，請稍後再試。');
  }
};

/**
 * 備援下載模式 (當 Manifest 讀取失敗或找不到該技能時)
 */
const fallbackDownload = async (skill: Skill, folder: JSZip) => {
  const commonFiles = ['SKILL.md', 'README.md', 'LICENSE.txt'];
  const fetchPromises = commonFiles.map(async (fileName) => {
    const response = await fetch(`${import.meta.env.BASE_URL}SKILLS/${skill.category}/${skill.source}/${fileName}`);
    if (response.ok) {
      const blob = await response.blob();
      folder.file(fileName, blob);
    }
  });
  await Promise.all(fetchPromises);
};
