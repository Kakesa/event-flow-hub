import { useEffect } from 'react';
import { absoluteUrl } from '@/config/site';
import type { PageSEO } from '@/content/seo.fr';

const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const upsertJsonLd = (id: string, data?: Record<string, unknown> | Record<string, unknown>[]) => {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export const usePageSEO = ({
  title,
  description,
  path,
  image,
  noindex,
  jsonLd,
}: PageSEO) => {
  useEffect(() => {
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    const canonical = absoluteUrl(path);
    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:locale', 'fr_FR');
    if (image) upsertMeta('property', 'og:image', image);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    if (image) upsertMeta('name', 'twitter:image', image);

    upsertJsonLd('page-json-ld', jsonLd);
  }, [title, description, path, image, noindex, JSON.stringify(jsonLd)]);
};
