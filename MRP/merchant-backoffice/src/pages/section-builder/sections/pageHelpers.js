/**
 * @module section-builder/sections/pageHelpers
 * @description Pure helpers for custom page creation (US-6.3, US-6.5).
 */
export function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isSlugTaken(slug, pages, excludePageId = null) {
  return pages.some((p) => p.id !== excludePageId && p.slug === slug);
}

export function defaultMetaTitle(pageName, storeName) {
  return `${pageName} — ${storeName}`;
}
