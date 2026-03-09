import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const SKILLS_TS = path.join(ROOT, 'src/data/skills.ts');
const PUBLIC_SKILLS = path.join(ROOT, 'public/SKILLS');
const AGENT_SKILLS = path.join(ROOT, '.agent/skills');
const USER_AGENT = 'skills-all-in-one-updater';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const normalizeGithubUrl = (input) => {
  try {
    const parsed = new URL(input);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, '');
    const mode = parts[2] || '';

    return {
      owner,
      repo,
      branch: mode === 'tree' || mode === 'blob' ? (parts[3] || null) : null,
      path: mode === 'tree' || mode === 'blob' ? parts.slice(4).join('/') : '',
    };
  } catch {
    return null;
  }
};

const parseLocalSkills = () => {
  const raw = fs.readFileSync(SKILLS_TS, 'utf8');
  // Simple regex-based parser for our specific format
  const skills = [];
  const skillBlockRegex = /\{[\s\S]*?id:\s*(\d+)[\s\S]*?\}/g;
  let match;

  while ((match = skillBlockRegex.exec(raw)) !== null) {
    const block = match[0];
    const id = parseInt(block.match(/id:\s*(\d+)/)?.[1]);
    const name = block.match(/name:\s*'([^']+)'/)?.[1];
    const category = block.match(/category:\s*'([^']+)'/)?.[1];
    const source = block.match(/source:\s*'([^']+)'/)?.[1];
    const githubUrl = block.match(/githubUrl:\s*'([^']+)'/)?.[1];

    if (id && name && source) {
      skills.push({ id, name, category, source, githubUrl });
    }
  }
  return skills;
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

const getContentHash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

const getLocalSkillPath = (skill) => {
  // Check agent skills first
  const agentPath = path.join(AGENT_SKILLS, skill.source);
  if (fs.existsSync(agentPath)) return agentPath;

  // Check public skills
  const publicPath = path.join(PUBLIC_SKILLS, skill.category || 'Uncategorized', skill.source);
  if (fs.existsSync(publicPath)) return publicPath;

  return null;
};

const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetSkill = args.find(arg => !arg.startsWith('--'));

  console.log(`🚀 Skill Updater Starting... ${dryRun ? '[DRY RUN]' : ''}`);

  const skills = parseLocalSkills();
  const updateTargets = skills.filter(s => s.githubUrl && (!targetSkill || s.name === targetSkill));

  console.log(`🔍 Scanning ${updateTargets.length} skills for updates...`);

  for (const skill of updateTargets) {
    try {
      const localPath = getLocalSkillPath(skill);
      if (!localPath) {
        console.warn(`⚠️  Skipping ${skill.name}: Local path not found.`);
        continue;
      }

      const localSkillMdPath = path.join(localPath, 'SKILL.md');
      if (!fs.existsSync(localSkillMdPath)) {
        console.warn(`⚠️  Skipping ${skill.name}: Local SKILL.md not found at ${localSkillMdPath}`);
        continue;
      }

      const localContent = fs.readFileSync(localSkillMdPath, 'utf8');
      const localHash = getContentHash(localContent);

      const parsed = normalizeGithubUrl(skill.githubUrl);
      if (!parsed) {
        console.warn(`⚠️  Skipping ${skill.name}: Invalid GitHub URL ${skill.githubUrl}`);
        continue;
      }

      // 1. Get default branch if not specified
      let branch = parsed.branch;
      if (!branch) {
        const repoRes = await ghFetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
        const repoInfo = await repoRes.json();
        branch = repoInfo.default_branch;
      }

      // 2. Fetch remote SKILL.md
      const remoteUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${parsed.path}${parsed.path ? '/' : ''}SKILL.md`;
      const remoteRes = await ghFetch(remoteUrl, true);
      const remoteContent = await remoteRes.text();
      const remoteHash = getContentHash(remoteContent);

      if (localHash === remoteHash) {
        console.log(`✅ ${skill.name} is up to date.`);
        continue;
      }

      console.log(`✨ Update available for ${skill.name}!`);

      if (dryRun) continue;

      // 3. Perform update (download all files in the tree)
      console.log(`   Downloading files for ${skill.name}...`);
      const treeUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=1`;
      const treeRes = await ghFetch(treeUrl);
      const treeInfo = await treeRes.json();

      const skillDirPrefix = parsed.path ? `${parsed.path}/` : '';
      const filesToDownload = treeInfo.tree.filter(item => 
        item.type === 'blob' && item.path.startsWith(skillDirPrefix)
      );

      for (const file of filesToDownload) {
        const relativePath = file.path.slice(skillDirPrefix.length);
        const fileRemoteUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${file.path}`;
        const fileDest = path.join(localPath, relativePath);

        ensureDir(path.dirname(fileDest));
        const fileRes = await ghFetch(fileRemoteUrl, true);
        const buffer = Buffer.from(await fileRes.arrayBuffer());
        fs.writeFileSync(fileDest, buffer);
        console.log(`   - Updated ${relativePath}`);
        await sleep(50);
      }

      // 4. Update metadata in src/data/skills.ts (Timestamp)
      // This part is complex due to JS/TS file manipulation. 
      // For now, we'll just log that it was updated.
      console.log(`🎉 Successfully updated ${skill.name} to the latest version.`);

    } catch (err) {
      console.error(`❌ Error updating ${skill.name}:`, err.message);
    }
  }

  console.log('\n🏁 Update check completed.');
};

main();
