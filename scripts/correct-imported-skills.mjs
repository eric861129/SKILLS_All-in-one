import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public/SKILLS');
const TMP = path.join(ROOT, '.tmp', 'skill-corrections');
const REPORT = path.join(ROOT, 'plan/security-audits', 'missing-skills-import-20260307.md');

const TEXT_EXTENSIONS = new Set(['.md','.txt','.json','.yml','.yaml','.toml','.ini','.cfg','.conf','.js','.mjs','.cjs','.ts','.tsx','.jsx','.py','.rb','.php','.go','.rs','.java','.kt','.swift','.cs','.sh','.bash','.zsh','.ps1','.sql','.xml','.xsd','.csv','.tsv']);
const PATTERNS = [
  { severity: 'High', label: 'Remote shell pipe execution', regex: /curl\s+[^\n|]+\|\s*(sh|bash|zsh)\b/i },
  { severity: 'High', label: 'Destructive rm -rf', regex: /rm\s+-rf\s+(\/|~|\$HOME|\.|\.\.)/i },
  { severity: 'High', label: 'Node child_process exec', regex: /child_process\.(exec|execSync|spawn|spawnSync)\s*\(/i },
  { severity: 'High', label: 'Python os.system/subprocess', regex: /\b(os\.system|subprocess\.(Popen|run|call))\s*\(/i },
  { severity: 'Medium', label: 'Dynamic eval', regex: /\beval\s*\(/i },
  { severity: 'Medium', label: 'Base64 decode and execute hint', regex: /(atob\(|base64\s+-d|Buffer\.from\([^\n]+base64)/i },
  { severity: 'Medium', label: 'Environment secret access hint', regex: /(AWS_ACCESS_KEY_ID|OPENAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN)/ },
];

const jobs = [
  {
    repo: 'https://github.com/ComposioHQ/awesome-claude-skills.git',
    items: [
      { source: 'image-enhancer', category: 'Media & Content', repoPath: 'image-enhancer' },
      { source: 'meeting-insights-analyzer', category: 'Collaboration & Project Management', repoPath: 'meeting-insights-analyzer' },
      { source: 'file-organizer', category: 'Utility & Automation', repoPath: 'file-organizer' },
      { source: 'invoice-organizer', category: 'Utility & Automation', repoPath: 'invoice-organizer' },
    ],
  },
  {
    repo: 'https://github.com/sanjay3290/ai-skills.git',
    items: [
      { source: 'imagen', category: 'Media & Content', repoPath: 'skills/imagen' },
      { source: 'elevenlabs', category: 'Media & Content', repoPath: 'skills/elevenlabs' },
      { source: 'google-tts', category: 'Media & Content', repoPath: 'skills/google-tts' },
      { source: 'outline', category: 'Collaboration & Project Management', repoPath: 'skills/outline' },
    ],
  },
  {
    repo: 'https://github.com/mhattingpete/claude-skills-marketplace.git',
    items: [
      { source: 'review-implementing', category: 'Collaboration & Project Management', repoPath: 'engineering-workflow-plugin/skills/review-implementing' },
      { source: 'test-fixing', category: 'Collaboration & Project Management', repoPath: 'engineering-workflow-plugin/skills/test-fixing' },
    ],
  },
];

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const removeDir = (dir) => fs.existsSync(dir) && fs.rmSync(dir, { recursive: true, force: true });

const auditDir = (dir) => {
  const findings = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current)) {
      const full = path.join(current, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else {
        const ext = path.extname(full).toLowerCase();
        if (!TEXT_EXTENSIONS.has(ext) && path.basename(full) !== 'SKILL.md') continue;
        const content = fs.readFileSync(full, 'utf8');
        for (const p of PATTERNS) if (p.regex.test(content)) findings.push({ ...p, file: path.relative(dir, full).split(path.sep).join('/') });
      }
    }
  };
  walk(dir);
  return findings;
};

ensureDir(TMP);
const lines = ['', '## Correction pass'];
for (const job of jobs) {
  const name = path.basename(job.repo, '.git');
  const cloneDir = path.join(TMP, name);
  removeDir(cloneDir);
  execFileSync('git', ['clone', '--depth', '1', job.repo, cloneDir], { stdio: 'ignore' });
  for (const item of job.items) {
    const src = path.join(cloneDir, item.repoPath);
    const dest = path.join(PUBLIC, item.category, item.source);
    removeDir(dest);
    fs.cpSync(src, dest, { recursive: true });
    const findings = auditDir(dest);
    if (findings.some((f) => f.severity === 'High')) {
      removeDir(dest);
      const unc = path.join(PUBLIC, 'Uncategorized', item.source);
      removeDir(unc);
      fs.cpSync(src, unc, { recursive: true });
      lines.push(`- [BLOCKED] ${item.source} corrected import hit audit blocker`);
      for (const finding of findings) lines.push(`  - ${finding.severity}: ${finding.label} at ${finding.file}`);
    } else {
      lines.push(`- [IMPORTED] ${item.source} corrected from ${item.repoPath}`);
    }
  }
  removeDir(cloneDir);
}
fs.appendFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');
console.log(lines.join('\n'));
