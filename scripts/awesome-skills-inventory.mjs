import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const README_URL = 'https://raw.githubusercontent.com/BehiSecc/awesome-claude-skills/main/README.md';
const TRACKING_PATH = path.join(__dirname, '../plan/awesome-skills-tracking.json');
const LOCAL_SKILLS_PATH = path.join(__dirname, '../src/data/skills.ts');
const BATCH_SIZE = 5;

const REPO_CACHE = new Map();

const headers = {
  'User-Agent': 'skills-all-in-one-inventory',
  Accept: 'application/vnd.github+json',
};

const normalizeText = (value) => (value || '').trim().toLowerCase();

const normalizeGithubUrl = (input) => {
  try {
    const parsed = new URL(input);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname
      .replace(/\/+$/, '')
      .split('/')
      .filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, '');

    if (!owner || !repo) return null;

    const mode = parts[2] || '';
    if (mode && mode !== 'tree' && mode !== 'blob') {
      return {
        owner,
        repo,
        branch: null,
        path: '',
        original: `https://github.com/${owner}/${repo}`,
      };
    }

    const branch = mode ? parts[3] || null : null;
    const subPath = mode ? parts.slice(4).join('/') : '';

    return {
      owner,
      repo,
      branch,
      path: subPath,
      original: `https://github.com/${owner}/${repo}${mode ? `/${mode}/${branch || ''}${subPath ? `/${subPath}` : ''}` : ''}`
        .replace(/\/+$/, ''),
    };
  } catch {
    return null;
  }
};

const slugify = (value) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const extractGithubUrls = (markdown) => {
  const urlMatches = markdown.match(/https:\/\/github\.com\/[^\s)>"']+/g) || [];
  const cleaned = urlMatches
    .map((raw) => raw.replace(/[),.;]+$/, ''))
    .map((raw) => raw.replace(/#.*$/, ''))
    .filter((raw) => !raw.includes('/issues') && !raw.includes('/pull/') && !raw.includes('/actions'));

  return [...new Set(cleaned)];
};

const parseLocalSkills = () => {
  const raw = fs.readFileSync(LOCAL_SKILLS_PATH, 'utf8');
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
    if ((match = line.match(/^\s*source:\s*'([^']+)'/))) current.source = match[1];
    if ((match = line.match(/^\s*author:\s*'([^']+)'/))) current.author = match[1];
    if ((match = line.match(/^\s*githubUrl:\s*'([^']+)'/))) current.githubUrl = match[1];

    if (trimmed === '},' || trimmed === '}') {
      if (current.source && current.githubUrl) {
        rows.push(current);
      }
      current = null;
    }
  }

  return rows;
};

const fetchJson = async (url) => {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} - ${url}`);
  }
  return response.json();
};

const getRepoSkillDirs = async (owner, repo) => {
  const key = `${owner}/${repo}`.toLowerCase();
  if (REPO_CACHE.has(key)) return REPO_CACHE.get(key);

  const repoInfo = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
  const branch = repoInfo.default_branch;
  const tree = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  const skillDirs = (tree.tree || [])
    .filter((item) => item.type === 'blob' && item.path.endsWith('/SKILL.md'))
    .map((item) => item.path.replace(/\/SKILL\.md$/, ''));

  const payload = {
    owner,
    repo,
    branch,
    skillDirs,
  };
  REPO_CACHE.set(key, payload);
  return payload;
};

const resolveSkillDirsFromPath = (allDirs, requestedPath) => {
  if (!requestedPath) return allDirs;
  const normalized = requestedPath.replace(/^\/+|\/+$/g, '');
  if (!normalized) return allDirs;

  if (normalized.endsWith('SKILL.md')) {
    const dir = normalized.replace(/\/SKILL\.md$/, '');
    return allDirs.includes(dir) ? [dir] : [];
  }

  const scoped = allDirs.filter((dir) => dir === normalized || dir.startsWith(`${normalized}/`));
  return scoped;
};

const chooseCanonical = (candidates) => {
  if (candidates.length === 1) {
    return { winner: candidates[0], conflict: false };
  }

  const anthropic = candidates.find((item) => normalizeText(item.originOwner) === 'anthropics');
  if (anthropic) {
    return { winner: anthropic, conflict: false };
  }

  return { winner: candidates[0], conflict: true };
};

const ensureDir = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const buildTracking = async () => {
  const readmeResponse = await fetch(README_URL, { headers: { 'User-Agent': headers['User-Agent'] } });
  if (!readmeResponse.ok) {
    throw new Error(`Unable to fetch README: ${readmeResponse.status} ${readmeResponse.statusText}`);
  }
  const readme = await readmeResponse.text();
  const discoveredUrls = extractGithubUrls(readme)
    .map(normalizeGithubUrl)
    .filter(Boolean);

  const localSkills = parseLocalSkills();
  const localBySource = new Map(localSkills.map((item) => [slugify(item.source), item]));
  const localByUrl = new Map(
    localSkills.map((item) => [normalizeText(item.githubUrl.replace(/\/+$/, '')), item])
  );

  const rawCandidates = [];
  const failures = [];

  for (const entry of discoveredUrls) {
    try {
      const repoData = await getRepoSkillDirs(entry.owner, entry.repo);
      const targetDirs = resolveSkillDirsFromPath(repoData.skillDirs, entry.path);

      for (const dir of targetDirs) {
        const sourceSlug = slugify(path.basename(dir));
        if (!sourceSlug) continue;
        rawCandidates.push({
          sourceSlug,
          originUrl: `https://github.com/${entry.owner}/${entry.repo}/tree/${repoData.branch}/${dir}`,
          originOwner: entry.owner,
          repo: `${entry.owner}/${entry.repo}`,
          repoPath: dir,
        });
      }
    } catch (error) {
      failures.push({
        url: entry.original,
        reason: error.message,
      });
    }
  }

  const grouped = new Map();
  for (const candidate of rawCandidates) {
    const list = grouped.get(candidate.sourceSlug) || [];
    list.push(candidate);
    grouped.set(candidate.sourceSlug, list);
  }

  const items = [];
  let urlMismatchCount = 0;
  let authorMismatchCount = 0;
  let missingCount = 0;

  for (const [sourceSlug, candidates] of grouped.entries()) {
    const { winner, conflict } = chooseCanonical(candidates);
    const local = localBySource.get(sourceSlug) || localByUrl.get(normalizeText(winner.originUrl));
    const expectedAuthor = normalizeText(winner.originOwner) === 'anthropics' ? 'Anthropic' : winner.originOwner;

    let status = 'ok';
    const notes = [];

    if (conflict) {
      status = 'needs_manual_review';
      notes.push('Multiple upstream origins found; canonical selected by fallback rule.');
    }

    if (!local) {
      status = status === 'needs_manual_review' ? status : 'missing';
      missingCount += 1;
      notes.push('No local skill matched by source slug or canonical URL.');
    } else {
      const normalizedLocalUrl = normalizeText((local.githubUrl || '').replace(/\/+$/, ''));
      const normalizedOriginUrl = normalizeText(winner.originUrl.replace(/\/+$/, ''));
      const localAuthor = local.author || '';

      if (normalizedLocalUrl !== normalizedOriginUrl) {
        urlMismatchCount += 1;
        status = status === 'needs_manual_review' ? status : 'url_mismatch';
        notes.push('githubUrl differs from canonical origin.');
      }

      if (normalizeText(localAuthor) !== normalizeText(expectedAuthor)) {
        authorMismatchCount += 1;
        if (status === 'ok') status = 'author_mismatch';
        if (status === 'url_mismatch') status = 'url_and_author_mismatch';
        notes.push('author differs from canonical owner/frontmatter fallback.');
      }
    }

    items.push({
      sourceSlug,
      status,
      canonical: winner,
      local: local
        ? {
            id: local.id,
            source: local.source,
            author: local.author,
            githubUrl: local.githubUrl,
          }
        : null,
      expected: {
        author: expectedAuthor,
        githubUrl: winner.originUrl,
      },
      notes,
    });
  }

  items.sort((a, b) => a.sourceSlug.localeCompare(b.sourceSlug));

  const correctionQueue = items.filter((item) =>
    ['url_mismatch', 'author_mismatch', 'url_and_author_mismatch'].includes(item.status)
  );
  const importQueue = items.filter((item) => item.status === 'missing');

  const tracking = {
    generatedAt: new Date().toISOString(),
    sourceReadme: README_URL,
    stats: {
      localSkills: localSkills.length,
      discoveredRepoLinks: discoveredUrls.length,
      expandedCandidates: rawCandidates.length,
      uniqueCandidates: items.length,
      missing: missingCount,
      urlMismatch: urlMismatchCount,
      authorMismatch: authorMismatchCount,
      fetchFailures: failures.length,
    },
    batches: [
      {
        id: 'batch-001',
        type: 'correction',
        size: 5,
        status: 'completed',
        items: [
          'internal-comms',
          'webapp-testing',
          'systematic-debugging',
          'using-git-worktrees',
          'finishing-a-development-branch',
        ],
        checklist: {
          import: 'not_required_metadata_only',
          audit: 'pass_metadata_only',
          onboard: 'completed',
          sync: 'completed',
        },
      },
    ],
    nextBatchProposals: {
      correction: correctionQueue.slice(0, BATCH_SIZE).map((item) => item.sourceSlug),
      import: importQueue.slice(0, BATCH_SIZE).map((item) => item.sourceSlug),
    },
    failures,
    items,
  };

  return tracking;
};

const main = async () => {
  const tracking = await buildTracking();
  ensureDir(TRACKING_PATH);
  fs.writeFileSync(TRACKING_PATH, `${JSON.stringify(tracking, null, 2)}\n`, 'utf8');
  console.log(`Tracking file updated: ${TRACKING_PATH}`);
  console.log(`Unique candidates: ${tracking.stats.uniqueCandidates}`);
  console.log(`Missing: ${tracking.stats.missing}`);
  console.log(`URL mismatch: ${tracking.stats.urlMismatch}`);
  console.log(`Author mismatch: ${tracking.stats.authorMismatch}`);
  if (tracking.stats.fetchFailures > 0) {
    console.log(`Fetch failures: ${tracking.stats.fetchFailures}`);
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
