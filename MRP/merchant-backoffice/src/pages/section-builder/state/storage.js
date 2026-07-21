/**
 * @module section-builder/state/storage
 * @description Client-side draft + published persistence for the section
 * builder, following the pattern in builder/storefrontStorage.js. Keyed per
 * store so it never collides with the legacy wizard's `lb_storefront_config_v1`.
 *
 * No backend endpoint exists yet (US-8.3's "draft and published versions are
 * stored independently" is satisfied here purely with two localStorage keys).
 */
const DRAFT_KEY_PREFIX = 'sb_draft_v1';
const PUBLISHED_KEY_PREFIX = 'sb_published_v1';

function keyFor(prefix, storeId) {
  return `${prefix}_${storeId}`;
}

function load(prefix, storeId) {
  try {
    const raw = localStorage.getItem(keyFor(prefix, storeId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function save(prefix, storeId, content) {
  try {
    localStorage.setItem(
      keyFor(prefix, storeId),
      JSON.stringify({ ...content, savedAt: new Date().toISOString() })
    );
    return true;
  } catch {
    return false;
  }
}

export const loadDraft = (storeId) => load(DRAFT_KEY_PREFIX, storeId);
export const saveDraft = (storeId, present) => save(DRAFT_KEY_PREFIX, storeId, present);
export const clearDraft = (storeId) => localStorage.removeItem(keyFor(DRAFT_KEY_PREFIX, storeId));

export const loadPublished = (storeId) => load(PUBLISHED_KEY_PREFIX, storeId);
export const savePublished = (storeId, present) => save(PUBLISHED_KEY_PREFIX, storeId, present);
