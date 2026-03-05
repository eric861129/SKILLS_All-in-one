import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { getEncoding } from 'js-tiktoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const skillsDir = path.join(__dirname, '../public/SKILLS');
const manifestFile = path.join(__dirname, '../public/skills-manifest.json');
const textExtensions = new Set([
  '.md', '.txt', '.json', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf',
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.rb', '.php', '.go',
  '.rs', '.java', '.kt', '.swift', '.cs', '.sh', '.bash', '.zsh', '.ps1',
  '.sql', '.xml', '.xsd', '.csv', '.tsv'
]);
const dependencyFiles = new Set([
  'requirements.txt',
  'package.json',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod'
]);

const safeReadText = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
};

const getTabKey = (filePath) => {
  const normalized = filePath.split('\\').join('/');
  const parts = normalized.split('/');
  return parts.length > 1 ? parts[0] : 'root';
};

const parseRequirements = (content) => {
  const libs = [];
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('-')) continue;
    const cleaned = line.split('#')[0].trim();
    const match = cleaned.match(/^([A-Za-z0-9_.-]+)/);
    if (match) libs.push(match[1]);
  }
  return libs;
};

const parsePackageJson = (content) => {
  try {
    const parsed = JSON.parse(content);
    const pools = [
      parsed.dependencies || {},
      parsed.devDependencies || {},
      parsed.peerDependencies || {},
      parsed.optionalDependencies || {},
    ];
    return pools.flatMap((deps) => Object.keys(deps));
  } catch {
    return [];
  }
};

const parseTomlStringArray = (chunk) => {
  const values = [];
  const regex = /"([^"]+)"|'([^']+)'/g;
  let match;
  while ((match = regex.exec(chunk)) !== null) {
    values.push((match[1] || match[2] || '').trim());
  }
  return values;
};

const parsePyprojectToml = (content) => {
  const libs = [];

  const projectDepsMatch = content.match(/\[project\][\s\S]*?dependencies\s*=\s*\[((?:.|\n)*?)\]/m);
  if (projectDepsMatch) {
    const deps = parseTomlStringArray(projectDepsMatch[1]);
    deps.forEach((dep) => {
      const match = dep.match(/^([A-Za-z0-9_.-]+)/);
      if (match) libs.push(match[1]);
    });
  }

  const poetrySection = content.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(?:\n\[|$)/m);
  if (poetrySection) {
    for (const rawLine of poetrySection[1].split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const keyMatch = line.match(/^([A-Za-z0-9_.-]+)\s*=/);
      if (keyMatch && keyMatch[1].toLowerCase() !== 'python') {
        libs.push(keyMatch[1]);
      }
    }
  }

  return libs;
};

const parseCargoToml = (content) => {
  const libs = [];
  const sections = [
    /\[dependencies\]([\s\S]*?)(?:\n\[|$)/m,
    /\[workspace\.dependencies\]([\s\S]*?)(?:\n\[|$)/m,
  ];

  for (const sectionRegex of sections) {
    const section = content.match(sectionRegex);
    if (!section) continue;
    for (const rawLine of section[1].split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const keyMatch = line.match(/^([A-Za-z0-9_.-]+)\s*=/);
      if (keyMatch) libs.push(keyMatch[1]);
    }
  }

  return libs;
};

const parseGoMod = (content) => {
  const libs = [];
  const requireBlock = content.match(/require\s*\(([\s\S]*?)\)/m);
  if (requireBlock) {
    for (const rawLine of requireBlock[1].split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//')) continue;
      const dep = line.split(/\s+/)[0];
      if (dep) libs.push(dep);
    }
  }

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('require ') || line.includes('(')) continue;
    const dep = line.replace(/^require\s+/, '').split(/\s+/)[0];
    if (dep) libs.push(dep);
  }

  return libs;
};

const parseLibraries = (fileName, content) => {
  switch (fileName) {
    case 'requirements.txt':
      return parseRequirements(content);
    case 'package.json':
      return parsePackageJson(content);
    case 'pyproject.toml':
      return parsePyprojectToml(content);
    case 'Cargo.toml':
      return parseCargoToml(content);
    case 'go.mod':
      return parseGoMod(content);
    default:
      return [];
  }
};

const normalizeStringList = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

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
  const cl100k = getEncoding('cl100k_base');
  
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
      const fileMeta = {};
      const textContents = [];
      const libraries = new Set();
      let frontmatterData = {};

      files.forEach((file) => {
        const absPath = path.join(skillPath, file);
        const stat = fs.statSync(absPath);
        const ext = path.extname(file).toLowerCase();
        const fileName = path.basename(file);
        const isText = textExtensions.has(ext) || fileName === 'SKILL.md';
        const text = isText ? safeReadText(absPath) : null;

        fileMeta[file] = {
          sizeBytes: stat.size,
          lineCount: text ? text.split('\n').length : 0,
          ext: ext ? ext.slice(1) : 'none',
          tabKey: getTabKey(file),
        };

        if (text) {
          textContents.push(text);
          if (dependencyFiles.has(fileName)) {
            parseLibraries(fileName, text).forEach((lib) => libraries.add(lib));
          }
          if (file === 'SKILL.md') {
            try {
              frontmatterData = matter(text).data || {};
            } catch {
              frontmatterData = {};
            }
          }
        }
      });

      const combinedText = textContents.join('\n');
      const heuristic = combinedText.length > 0 ? Math.ceil(combinedText.length / 4) : 0;
      const cl100kCount = combinedText.length > 0 ? cl100k.encode(combinedText).length : 0;

      const metadata = frontmatterData.metadata && typeof frontmatterData.metadata === 'object'
        ? frontmatterData.metadata
        : {};
      const skillsDeps = normalizeStringList(frontmatterData.skills);
      const relatedSkills = [
        ...normalizeStringList(frontmatterData['related-skills']),
        ...normalizeStringList(metadata['related-skills']),
        ...normalizeStringList(metadata.relatedSkills),
      ];
      const runtimeTools = Array.isArray(frontmatterData['allowed-tools'])
        ? frontmatterData['allowed-tools'].filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
        : [];

      manifest[skillFolder] = {
        category,
        files,
        fileMeta,
        tokenEstimate: {
          heuristic,
          cl100k: cl100kCount,
        },
        dependencies: {
          skills: [...new Set([...skillsDeps, ...relatedSkills])].sort((a, b) => a.localeCompare(b)),
          libraries: [...libraries].sort((a, b) => a.localeCompare(b)),
          runtimeTools: [...new Set(runtimeTools)].sort((a, b) => a.localeCompare(b)),
          source: 'structured',
        },
      };
    });
  });

  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  console.log('Manifest generated at:', manifestFile);
};

generateManifest();
