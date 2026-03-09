const REPO_BASE_URL = 'https://github.com/eric861129/SKILLS_All-in-one';

const getContributingFileName = (language: string) => (language === 'zh' ? 'CONTRIBUTING.md' : 'CONTRIBUTING_en.md');

export const getRepositoryUrl = () => REPO_BASE_URL;

export const getReadmeUrl = (language: string) =>
  `${REPO_BASE_URL}/blob/main/${language === 'zh' ? 'README.md' : 'README_en.md'}`;

export const getContributingUrl = (language: string) =>
  `${REPO_BASE_URL}/blob/main/${getContributingFileName(language)}#contributing-guide`;

export const getSubmitSkillGuideUrl = (language: string) =>
  `${REPO_BASE_URL}/blob/main/${getContributingFileName(language)}#submit-skill-guide`;

export const getSubmitSkillIssueUrl = () =>
  `${REPO_BASE_URL}/issues/new?template=submit_skill.md`;
