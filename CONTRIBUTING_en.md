# Contributing Guide

[中文版](./CONTRIBUTING.md)

<a id="contributing-guide"></a>

Thanks for contributing to **SKILLS All-in-one**. This guide explains how to submit a new skill, open a Pull Request, and update the related metadata used by the website and skill registry.

<a id="submit-skill-guide"></a>

## Submit a Skill Guide

If you want to propose a skill before preparing a full PR, use the `Submit a Skill` issue flow.

### When to use an issue

- You have a skill idea or source repo but have not prepared the final files yet
- You want feedback on category, naming, platform fit, or inclusion scope
- You want to share a draft `SKILL.md`, screenshots, or reference repo first

### Submission steps

1. Read this guide and confirm the category and expected structure.
2. Open the [Submit a Skill Issue](https://github.com/eric861129/SKILLS_All-in-one/issues/new?template=submit_skill.md).
3. Fill in the skill name, author, category, tags, use case, and source links.
4. Attach your `SKILL.md`, screenshots, or repository link if you already have them.

### Recommended information

- Skill name
- Author or source
- Category
- Tags
- Use case or target workflow
- Original repo / docs / screenshots
- `SKILL.md` sample or summary

## Contribute via Pull Request

If your skill is already prepared, a Pull Request is preferred.

### Expected folder structure

```text
public/SKILLS/{Category}/{skill-name}/
  SKILL.md
  scripts/
  examples/
  references/
  assets/
```

### Required updates

1. Add the skill files under `public/SKILLS/{Category}/{skill-name}/`
2. Add the matching metadata entry in `src/data/skills.ts`
3. Update `database/incremental_updates.sql` if needed
4. Ensure `SKILL.md` includes a clear `name` and `description`
5. Verify the project with `npm run build`

### Suggested branch names

```text
feat/add-skill-{skill-name}
fix/{description}
docs/{description}
```

### Suggested commit messages

```text
feat: add {skill-name} skill
fix: {description}
docs: update {description}
```

### PR Checklist

- [ ] Skill files are added under the correct category
- [ ] `src/data/skills.ts` metadata is added or updated
- [ ] `database/incremental_updates.sql` is updated if required
- [ ] `SKILL.md` includes the basic description
- [ ] `npm run build` passes locally

## Category Reference

- Document Skills
- Development & Code Tools
- Data & Analysis
- Scientific & Research Tools
- Writing & Research
- Learning & Knowledge
- Media & Content
- Health & Life Sciences
- Collaboration & Project Management
- Security & Web Testing
- Utility & Automation
- Collections

## Local Development

```bash
git clone https://github.com/YOUR_USERNAME/SKILLS_All-in-one.git
cd SKILLS_All-in-one
npm install
npm run dev
npm run build
```
