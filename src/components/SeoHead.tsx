import { useEffect } from 'react';
import type { SeoMeta } from '../seo/metadata';
import { buildCanonicalUrl, SITE_NAME } from '../seo/site';

type MetaDefinition = {
  type: 'name' | 'property';
  key: string;
  content?: string;
};

const MANAGED_TAG = 'data-seo-managed';
const MANAGED_JSONLD = 'data-seo-jsonld';

const upsertMetaTag = ({ type, key, content }: MetaDefinition) => {
  const selector = `meta[${type}="${key}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    existing?.remove();
    return;
  }

  const tag = existing || document.createElement('meta');
  tag.setAttribute(type, key);
  tag.setAttribute('content', content);
  tag.setAttribute(MANAGED_TAG, 'true');

  if (!existing) {
    document.head.appendChild(tag);
  }
};

const upsertLinkTag = (rel: string, href?: string) => {
  const selector = `link[rel="${rel}"]`;
  const existing = document.head.querySelector<HTMLLinkElement>(selector);

  if (!href) {
    existing?.remove();
    return;
  }

  const tag = existing || document.createElement('link');
  tag.setAttribute('rel', rel);
  tag.setAttribute('href', href);
  tag.setAttribute(MANAGED_TAG, 'true');

  if (!existing) {
    document.head.appendChild(tag);
  }
};

export const SeoHead = ({ meta }: { meta: SeoMeta }) => {
  useEffect(() => {
    document.title = meta.title;
    document.documentElement.lang = meta.lang || 'en';

    const canonicalUrl = buildCanonicalUrl(meta.canonicalPath);
    const openGraph = meta.openGraph || {};
    const twitter = meta.twitter || {};
    const metaTags: MetaDefinition[] = [
      { type: 'name', key: 'description', content: meta.description },
      { type: 'name', key: 'robots', content: meta.robots || 'index,follow' },
      { type: 'name', key: 'keywords', content: meta.keywords?.join(', ') },
      { type: 'name', key: 'author', content: 'Eric Huang' },
      { type: 'name', key: 'twitter:card', content: twitter.card || 'summary_large_image' },
      { type: 'name', key: 'twitter:title', content: twitter.title || meta.title },
      { type: 'name', key: 'twitter:description', content: twitter.description || meta.description },
      { type: 'name', key: 'twitter:image', content: twitter.image || openGraph.image },
      { type: 'property', key: 'og:type', content: openGraph.type || 'website' },
      { type: 'property', key: 'og:site_name', content: SITE_NAME },
      { type: 'property', key: 'og:locale', content: meta.lang === 'zh-Hant' ? 'zh_TW' : 'en_US' },
      { type: 'property', key: 'og:locale:alternate', content: meta.lang === 'zh-Hant' ? 'en_US' : 'zh_TW' },
      { type: 'property', key: 'og:title', content: openGraph.title || meta.title },
      { type: 'property', key: 'og:description', content: openGraph.description || meta.description },
      { type: 'property', key: 'og:url', content: openGraph.url || canonicalUrl },
      { type: 'property', key: 'og:image', content: openGraph.image },
    ];

    metaTags.forEach(upsertMetaTag);
    upsertLinkTag('canonical', canonicalUrl);

    document
      .querySelectorAll(`script[${MANAGED_JSONLD}="true"]`)
      .forEach((element) => element.remove());

    const jsonLdBlocks = meta.jsonLd ? (Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd]) : [];
    jsonLdBlocks.forEach((block) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute(MANAGED_JSONLD, 'true');
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
    });
  }, [meta]);

  return null;
};
