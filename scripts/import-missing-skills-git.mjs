import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';

const ROOT = process.cwd();
const SKILLS_TS = path.join(ROOT, 'src/data/skills.ts');
const PUBLIC_SKILLS = path.join(ROOT, 'public/SKILLS');
const TMP_ROOT = path.join(ROOT, '.tmp', 'skill-import-git');
const REPORT_PATH = path.join(ROOT, 'plan/security-audits', 'missing-skills-import-20260307.md');

const TEXT_EXTENSIONS = new Set([
  '.md', '.txt', '.json', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf',
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.rb', '.php', '.go',
  '.rs', '.java', '.kt', '.swift', '.cs', '.sh', '.bash', '.zsh', '.ps1',
  '.sql', '.xml', '.xsd', '.csv', '.tsv'
]);

const DANGEROUS_PATTERNS = [
  { severity: 'High', label: 'Remote shell pipe execution', regex: /curl\s+[^\n|]+\|\s*(sh|bash|zsh)\b/i },
  { severity: 'High', label: 'Destructive rm -rf', regex: /rm\s+-rf\s+(\/|~|\$HOME|\.|\.\.)/i },
  { severity: 'High', label: 'Node child_process exec', regex: /child_process\.(exec|execSync|spawn|spawnSync)\s*\(/i },
  { severity: 'High', label: 'Python os.system/subprocess', regex: /\b(os\.system|subprocess\.(Popen|run|call))\s*\(/i },
  { severity: 'Medium', label: 'Dynamic eval', regex: /\beval\s*\(/i },
  { severity: 'Medium', label: 'Base64 decode and execute hint', regex: /(atob\(|base64\s+-d|Buffer\.from\([^\n]+base64)/i },
  { severity: 'Medium', label: 'Environment secret access hint', regex: /(AWS_ACCESS_KEY_ID|OPENAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN)/ },
];

const ensureDir = (dirPath) => fs.mkdirSync(dirPath, { recursive: true });
const removeDir = (dirPath) => fs.existsSync(dirPath) && fs.rmSync(dirPath, { recursive: true, force: true });
const slugify = (value) => (value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');

const normalizeGithubUrl = (input) => {
  try {
    const parsed = new URL(input);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, '');
    const mode = parts[2] || '';
    if (mode && mode !== 'tree' && mode !== 'blob') return { owner, repo, path: '' };
    return { owner, repo, path: mode ? parts.slice(4).join('/') : '' };
  } catch {
    return null;
  }
};

const parseLocalSkills = () => {
  const raw = fs.readFileSync(SKILLS_TS, 'utf8');
  const lines = raw.split(/\r?\n/);
  const rows = [];
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '{') {
      current = {};
      continue;
    }
    if (!current) continue;
    let match;
    if ((match = line.match(/^\s*id:\s*(\d+)/))) current.id = Number(match[1]);
    if ((match = line.match(/^\s*category:\s*'([^']+)'/))) current.category = match[1];
    if ((match = line.match(/^\s*source:\s*'([^']+)'/))) current.source = match[1];
    if ((match = line.match(/^\s*githubUrl:\s*'([^']+)'/))) current.githubUrl = match[1];
    if (trimmed === '},' || trimmed === '}') {
      if (current.id && current.source) rows.push(current);
      current = null;
    }
  }
  return rows;
};

const collectExistingSources = () => {
  const found = new Set();
  for (const category of fs.readdirSync(PUBLIC_SKILLS)) {
    const categoryPath = path.join(PUBLIC_SKILLS, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    for (const entry of fs.readdirSync(categoryPath)) {
      const full = path.join(categoryPath, entry);
      if (fs.statSync(full).isDirectory()) found.add(entry);
    }
  }
  return found;
};

const findSkillDirs = (repoRoot) => {
  const dirs = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === '.git') continue;
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry === 'SKILL.md') {
        dirs.push(path.relative(repoRoot, path.dirname(full)).split(path.sep).join('/').replace(/^\.$/, ''));
      }
    }
  };
  walk(repoRoot);
  return [...new Set(dirs)];
};

const chooseSkillDir = (source, repoPath, skillDirs) => {
  const normalizedRepoPath = (repoPath || '').replace(/^\/+|\/+$/g, '').replace(/\/SKILL\.md$/, '');
  const sourceSlug = slugify(source);
  const pathSlug = slugify(path.basename(normalizedRepoPath || ''));

  if (normalizedRepoPath && skillDirs.includes(normalizedRepoPath)) return normalizedRepoPath;
  if (normalizedRepoPath) {
    const scoped = skillDirs.filter((dir) => dir === normalizedRepoPath || dir.startsWith(`${normalizedRepoPath}/`));
    if (scoped.length === 1) return scoped[0];
    const exact = scoped.find((dir) => slugify(path.basename(dir)) === sourceSlug);
    if (exact) return exact;
  }

  const exactSource = skillDirs.find((dir) => slugify(path.basename(dir)) === sourceSlug);
  if (exactSource) return exactSource;

  const exactPathBase = pathSlug && skillDirs.find((dir) => slugify(path.basename(dir)) === pathSlug);
  if (exactPathBase) return exactPathBase;

  if (skillDirs.length === 1) return skillDirs[0];

  const fuzzy = skillDirs.filter((dir) => {
    const base = slugify(path.basename(dir));
    return base.includes(sourceSlug) || sourceSlug.includes(base);
  });
  if (fuzzy.length === 1) return fuzzy[0];

  if (skillDirs.includes('')) return '';
  throw new Error(`Unable to resolve a unique skill directory`);
};

const auditImportedSkill = (skillRoot) => {
  const findings = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
        continue;
      }
      const ext = path.extname(fullPath).toLowerCase();
      if (!TEXT_EXTENSIONS.has(ext) && path.basename(fullPath) !== 'SKILL.md') continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.regex.test(content)) {
          findings.push({ severity: pattern.severity, label: pattern.label, file: path.relative(skillRoot, fullPath).split(path.sep).join('/') });
        }
      }
    }
  };
  walk(skillRoot);
  const hasHigh = findings.some((item) => item.severity === 'High');
  const hasMedium = findings.some((item) => item.severity === 'Medium');
  return { verdict: hasHigh ? 'REJECT' : hasMedium ? 'WARNING' : 'PASS', findings };
};

const appendReport = (lines) => {
  fs.appendFileSync(REPORT_PATH, `${lines.join('\n')}\n`, 'utf8');
};

const cloneRepo = (url, destination) => {
  removeDir(destination);
  execFileSync('git', ['clone', '--depth', '1', url, destination], { stdio: 'ignore' });
};

const copyDirContents = (from, to) => {
  removeDir(to);
  ensureDir(path.dirname(to));
  fs.cpSync(from, to, { recursive: true });
};

const main = () => {
  ensureDir(TMP_ROOT);
  const skills = parseLocalSkills();
  const existing = collectExistingSources();
  const pending = skills.filter((item) => !existing.has(item.source) && item.githubUrl);
  const groupedRepos = new Map();
  for (const item of pending) {
    const parsed = normalizeGithubUrl(item.githubUrl);
    if (!parsed) continue;
    const key = `${parsed.owner}/${parsed.repo}`;
    const current = groupedRepos.get(key) || { parsed, items: [] };
    current.items.push(item);
    groupedRepos.set(key, current);
  }

  const results = [];

  for (const [key, payload] of groupedRepos.entries()) {
    const repoUrl = `https://github.com/${payload.parsed.owner}/${payload.parsed.repo}.git`;
    const cloneDir = path.join(TMP_ROOT, key.replace('/', '__'));
    try {
      cloneRepo(repoUrl, cloneDir);
      const skillDirs = findSkillDirs(cloneDir);
      for (const item of payload.items) {
        try {
          const chosenDir = chooseSkillDir(item.source, payload.parsed.path, skillDirs);
          const fromDir = chosenDir ? path.join(cloneDir, chosenDir) : cloneDir;
          const tempRoot = path.join(PUBLIC_SKILLS, 'Uncategorized', item.source);
          copyDirContents(fromDir, tempRoot);
          if (!fs.existsSync(path.join(tempRoot, 'SKILL.md'))) {
            throw new Error('Imported content does not contain SKILL.md');
          }
          const audit = auditImportedSkill(tempRoot);
          if (audit.verdict === 'PASS') {
            const finalRoot = path.join(PUBLIC_SKILLS, item.category, item.source);
            copyDirContents(tempRoot, finalRoot);
            removeDir(tempRoot);
            results.push({ source: item.source, status: 'imported', resolvedDir: chosenDir || '<repo-root>' });
          } else {
            results.push({ source: item.source, status: 'blocked', resolvedDir: chosenDir || '<repo-root>', findings: audit.findings });
          }
        } catch (error) {
          results.push({ source: item.source, status: 'failed', reason: error.message });
        }
      }
    } catch (error) {
      for (const item of payload.items) {
        results.push({ source: item.source, status: 'failed', reason: `git clone failed for ${key}: ${error.message}` });
      }
    } finally {
      removeDir(cloneDir);
    }
  }

  const lines = [];
  lines.push('');
  lines.push('## Git clone fallback results');
  for (const item of results) {
    if (item.status === 'imported') lines.push(`- [IMPORTED] ${item.source} from ${item.resolvedDir}`);
    else if (item.status === 'blocked') {
      lines.push(`- [BLOCKED] ${item.source} from ${item.resolvedDir}`);
      for (const finding of item.findings) lines.push(`  - ${finding.severity}: ${finding.label} at ${finding.file}`);
    } else lines.push(`- [FAILED] ${item.source}: ${item.reason}`);
  }
  appendReport(lines);
  console.log(JSON.stringify(results, null, 2));
};

main();
