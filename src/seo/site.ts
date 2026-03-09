export const SITE_NAME = 'SKILLS All-in-one';
export const SITE_BASE_URL = 'https://huangchiyu.com';
export const SITE_BASE_PATH = '/SKILLS_All-in-one';
export const SITE_URL = `${SITE_BASE_URL}${SITE_BASE_PATH}`;
export const DEFAULT_OG_IMAGE_PATH = '/social-preview.svg';
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;

export const buildCanonicalUrl = (path: string) => {
  const normalizedPath = path === '/' ? '' : path;
  return `${SITE_URL}${normalizedPath}`;
};
