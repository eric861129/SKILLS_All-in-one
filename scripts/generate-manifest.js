import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const skillsDir = path.join(__dirname, '../public/SKILLS');
const manifestFile = path.join(__dirname, '../public/skills-manifest.json');

const getFiles = (dir, baseDir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      // 遞迴進入子目錄
      results = results.concat(getFiles(filePath, baseDir));
    } else {
      // 回傳相對於技能根目錄的路徑
      const relPath = path.relative(baseDir, filePath).split(path.sep).join('/');
      results.push(relPath);
    }
  });
  return results;
};

const generateManifest = () => {
  const manifest = {};
  
  if (!fs.existsSync(skillsDir)) {
    console.error('Skills directory not found:', skillsDir);
    return;
  }

  const categories = fs.readdirSync(skillsDir);

  categories.forEach((category) => {
    const categoryPath = path.join(skillsDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) return;

    const skills = fs.readdirSync(categoryPath);
    skills.forEach((skillFolder) => {
      const skillPath = path.join(categoryPath, skillFolder);
      if (!fs.statSync(skillPath).isDirectory()) return;

      const files = getFiles(skillPath, skillPath);
      manifest[skillFolder] = {
        category,
        files
      };
    });
  });

  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  console.log('Manifest generated at:', manifestFile);
};

generateManifest();
