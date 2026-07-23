/**
 * @module section-builder/sections/registry
 * @description Metadata for the 12 MVP section types (Epic 11) that power
 * the "Add section" list and sidebar/canvas labels. Phase 9 adds a real
 * `schema.js` + `Renderer.jsx` per type under `sections/<type>/`; until
 * then sections render as inert placeholders (Canvas.jsx) and this registry
 * is just the curated list + category grouping (US-3.5).
 *
 * Header and footer are deliberately excluded — they're global singletons
 * (US-3.6) with no "add" flow, only a hide toggle.
 */
export const SECTION_CATEGORIES = {
  hero: 'Hero & Banner',
  product: 'Product Display',
  brand: 'Brand Story',
  social: 'Social Proof',
  marketing: 'Marketing & Conversion',
  utility: 'Utility',
};

export const SECTION_REGISTRY = [
  { type: 'hero_banner', label: 'Hero Banner', category: 'hero' },
  { type: 'announcement_bar', label: 'Announcement Bar', category: 'hero' },
  { type: 'featured_products', label: 'Featured Products', category: 'product' },
  { type: 'collection_list', label: 'Collection List', category: 'product' },
  { type: 'image_with_text', label: 'Image with Text', category: 'brand' },
  { type: 'rich_text', label: 'Rich Text', category: 'brand' },
  { type: 'brand_values', label: 'Brand Values', category: 'brand' },
  { type: 'testimonials', label: 'Testimonials', category: 'social' },
  { type: 'newsletter_signup', label: 'Newsletter Signup', category: 'marketing' },
  { type: 'contact_form', label: 'Contact Form', category: 'utility' },
  { type: 'faq_accordion', label: 'FAQ Accordion', category: 'utility' },
  { type: 'divider_spacer', label: 'Divider / Spacer', category: 'utility' },
];

export const SECTION_LABELS = Object.fromEntries(SECTION_REGISTRY.map((s) => [s.type, s.label]));

export function labelForType(type) {
  if (type === 'header') return 'Header';
  if (type === 'footer') return 'Footer';
  return SECTION_LABELS[type] ?? type;
}
