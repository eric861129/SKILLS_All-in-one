import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SKILLS_TS = path.join(ROOT, 'src/data/skills.ts');
const PUBLIC_SKILLS = path.join(ROOT, 'public/SKILLS');
const AUDIT_DIR = path.join(ROOT, 'plan/security-audits');
const REPORT_PATH = path.join(AUDIT_DIR, 'missing-skills-import-20260307.md');
const USER_AGENT = 'skills-all-in-one-importer';

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const slugify = (value) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeGithubUrl = (input) => {
  try {
    const parsed = new URL(input);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, '');
    const mode = parts[2] || '';

    if (mode && mode !== 'tree' && mode !== 'blob') {
      return { owner, repo, branch: null, path: '' };
    }

    return {
      owner,
      repo,
      branch: mode ? (parts[3] || null) : null,
      path: mode ? parts.slice(4).join('/') : '',
    };
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
    if ((match = line.match(/^\s*name:\s*'([^']+)'/))) current.name = match[1];
    if ((match = line.match(/^\s*category:\s*'([^']+)'/))) current.category = match[1];
    if ((match = line.match(/^\s*author:\s*'([^']+)'/))) current.author = match[1];
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
      const skillPath = path.join(categoryPath, entry);
      if (fs.statSync(skillPath).isDirectory()) found.add(entry);
    }
  }
  return found;
};

const ghFetch = async (url, raw = false) => {
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: raw ? 'application/octet-stream' : 'application/vnd.github+json',
  };
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} - ${url}`);
  }
  return response;
};

const getRepoContext = async (owner, repo, branchHint) => {
  const repoResponse = await ghFetch(`https://api.github.com/repos/${owner}/${repo}`);
  const repoInfo = await repoResponse.json();
  const branch = branchHint || repoInfo.default_branch;
  const treeResponse = await ghFetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  const treeInfo = await treeResponse.json();
  return { branch, tree: treeInfo.tree || [] };
};

const listSkillDirs = (tree) => {
  const dirs = [];
  for (const item of tree) {
    if (item.type !== 'blob') continue;
    if (item.path === 'SKILL.md') {
      dirs.push('');
      continue;
    }
    if (item.path.endsWith('/SKILL.md')) {
      dirs.push(item.path.replace(/\/SKILL\.md$/, ''));
    }
  }
  return [...new Set(dirs)];
};

const chooseSkillDir = ({ source, githubUrl }, repoPath, skillDirs) => {
  const normalizedRepoPath = (repoPath || '').replace(/^\/+|\/+$/g, '').replace(/\/SKILL\.md$/, '');
  const sourceSlug = slugify(source);
  const pathSlug = slugify(path.basename(normalizedRepoPath || ''));

  if (normalizedRepoPath && skillDirs.includes(normalizedRepoPath)) return normalizedRepoPath;
  if (normalizedRepoPath) {
    const scoped = skillDirs.filter((dir) => dir === normalizedRepoPath || dir.startsWith(`${normalizedRepoPath}/`));
    if (scoped.length === 1) return scoped[0];
    const exactBasename = scoped.find((dir) => slugify(path.basename(dir)) === sourceSlug);
    if (exactBasename) return exactBasename;
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
  throw new Error(`Unable to resolve a unique skill directory from ${githubUrl}`);
};

const listFilesForDir = (tree, skillDir) => {
  const prefix = skillDir ? `${skillDir}/` : '';
  return tree
    .filter((item) => item.type === 'blob')
    .filter((item) => {
      if (!skillDir) return true;
      return item.path.startsWith(prefix);
    })
    .map((item) => ({
      remotePath: item.path,
      relativePath: skillDir ? item.path.slice(prefix.length) : item.path,
      size: item.size || 0,
    }))
    .filter((item) => item.relativePath && !item.relativePath.startsWith('.git/'));
};

const writeFileFromResponse = async (response, destination) => {
  ensureDir(path.dirname(destination));
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(destination, Buffer.from(arrayBuffer));
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
          findings.push({
            severity: pattern.severity,
            label: pattern.label,
            file: path.relative(skillRoot, fullPath).split(path.sep).join('/'),
          });
        }
      }
    }
  };
  walk(skillRoot);

  const hasHigh = findings.some((item) => item.severity === 'High');
  const hasMedium = findings.some((item) => item.severity === 'Medium');
  const verdict = hasHigh ? 'REJECT' : hasMedium ? 'WARNING' : 'PASS';
  const risk = hasHigh ? 'High' : hasMedium ? 'Medium' : 'Low';
  return { verdict, risk, findings };
};

const removeDir = (dirPath) => {
  if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });
};

const moveDir = (from, to) => {
  ensureDir(path.dirname(to));
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true });
  fs.renameSync(from, to);
};

const main = async () => {
  ensureDir(AUDIT_DIR);
  const skills = parseLocalSkills();
  const existing = collectExistingSources();
  const missing = skills.filter((item) => !existing.has(item.source));

  const unindexed = [];
  for (const category of fs.readdirSync(PUBLIC_SKILLS)) {
    const categoryPath = path.join(PUBLIC_SKILLS, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    for (const entry of fs.readdirSync(categoryPath)) {
      const skillPath = path.join(categoryPath, entry);
      if (fs.statSync(skillPath).isDirectory() && !skills.some((item) => item.source === entry)) {
        unindexed.push({ category, source: entry });
      }
    }
  }

  const report = [];
  report.push('# Missing Skills Import Report (2026-03-07)');
  report.push('');
  report.push('## Metadata exists but folder is missing');
  for (const item of missing) {
    report.push(`- id=${item.id} source=${item.source} category=${item.category} githubUrl=${item.githubUrl || 'N/A'}`);
  }
  report.push('');
  report.push('## Folder exists but metadata is missing');
  for (const item of unindexed) {
    report.push(`- source=${item.source} category=${item.category}`);
  }
  report.push('');

  const importResults = [];

  for (const item of missing) {
    if (!item.githubUrl) {
      importResults.push({ ...item, status: 'skipped', reason: 'Missing githubUrl' });
      continue;
    }

    try {
      const parsed = normalizeGithubUrl(item.githubUrl);
      if (!parsed) throw new Error('Unsupported githubUrl');

      const { branch, tree } = await getRepoContext(parsed.owner, parsed.repo, parsed.branch);
      const skillDirs = listSkillDirs(tree);
      const chosenDir = chooseSkillDir(item, parsed.path, skillDirs);
      const files = listFilesForDir(tree, chosenDir);
      const tempRoot = path.join(PUBLIC_SKILLS, 'Uncategorized', item.source);
      removeDir(tempRoot);
      ensureDir(tempRoot);

      for (const file of files) {
        const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${file.remotePath}`;
        const response = await ghFetch(rawUrl, true);
        await writeFileFromResponse(response, path.join(tempRoot, file.relativePath));
        await sleep(30);
      }

      if (!fs.existsSync(path.join(tempRoot, 'SKILL.md'))) {
        throw new Error(`Imported content does not contain SKILL.md (resolved dir: ${chosenDir || '<repo-root>'})`);
      }

      const audit = auditImportedSkill(tempRoot);
      const finalRoot = path.join(PUBLIC_SKILLS, item.category, item.source);

      if (audit.verdict === 'PASS') {
        moveDir(tempRoot, finalRoot);
        importResults.push({
          ...item,
          status: 'imported',
          branch,
          resolvedDir: chosenDir || '<repo-root>',
          fileCount: files.length,
          audit,
        });
      } else {
        importResults.push({
          ...item,
          status: 'blocked',
          branch,
          resolvedDir: chosenDir || '<repo-root>',
          fileCount: files.length,
          audit,
        });
      }
    } catch (error) {
      importResults.push({ ...item, status: 'failed', reason: error.message });
    }
  }

  report.push('## Import results');
  for (const item of importResults) {
    if (item.status === 'imported') {
      report.push(`- [IMPORTED] ${item.source} from ${item.resolvedDir} (${item.fileCount} files, audit=${item.audit.verdict})`);
    } else if (item.status === 'blocked') {
      report.push(`- [BLOCKED] ${item.source} from ${item.resolvedDir} (${item.fileCount} files, audit=${item.audit.verdict}, findings=${item.audit.findings.length})`);
      for (const finding of item.audit.findings) {
        report.push(`  - ${finding.severity}: ${finding.label} at ${finding.file}`);
      }
    } else if (item.status === 'failed') {
      report.push(`- [FAILED] ${item.source}: ${item.reason}`);
    } else {
      report.push(`- [SKIPPED] ${item.source}: ${item.reason}`);
    }
  }
  report.push('');

  fs.writeFileSync(REPORT_PATH, `${report.join('\n')}\n`, 'utf8');
  console.log(JSON.stringify({
    missingCount: missing.length,
    unindexedCount: unindexed.length,
    imported: importResults.filter((item) => item.status === 'imported').map((item) => item.source),
    blocked: importResults.filter((item) => item.status === 'blocked').map((item) => item.source),
    failed: importResults.filter((item) => item.status === 'failed').map((item) => ({ source: item.source, reason: item.reason })),
    skipped: importResults.filter((item) => item.status === 'skipped').map((item) => item.source),
    reportPath: REPORT_PATH,
  }, null, 2));
};

await main();
