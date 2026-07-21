import { rawSchema } from './themeSchemaAdapter';
import { schema as headerSchema } from '../sections/header/schema';
import { schema as footerSchema } from '../sections/footer/schema';
import { defaultsForSchema } from '../sections/schemaDefaults';

/**
 * @module section-builder/state/defaultTheme
 * @description Default theme values, derived directly from
 * theme-settings-schema.json's field defaults (single source of truth as of
 * Phase 4) — no more hand-duplicated values to drift out of sync.
 */
function defaultsForGroup(groupKey) {
  const fields = rawSchema.groups[groupKey].fields;
  return Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.default]));
}

export const defaultTheme = {
  typography: defaultsForGroup('typography'),
  colors: defaultsForGroup('colors'),
  buttons: defaultsForGroup('buttons'),
  layout: defaultsForGroup('layout'),
  product_cards: defaultsForGroup('product_cards'),
};

/**
 * System pages (US-6.1). Only Home is section-editable in this builder —
 * Product/Collection/Cart/Checkout are rendered from the catalog, not from
 * a section stack, so they're listed (per the spec's page grouping) but
 * their `sections` stay permanently empty here. TODO(catalog integration):
 * these four need their own dedicated editors, not this section canvas.
 */
export function createDefaultPages() {
  return [
    { id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {}, hiddenFromNav: false },
    { id: 'product', name: 'Product', type: 'system', slug: '/products/:handle', sections: [], seo: {}, hiddenFromNav: false },
    { id: 'collection', name: 'Collection', type: 'system', slug: '/collections/:handle', sections: [], seo: {}, hiddenFromNav: false },
    { id: 'cart', name: 'Cart', type: 'system', slug: '/cart', sections: [], seo: {}, hiddenFromNav: false },
    { id: 'checkout', name: 'Checkout', type: 'system', slug: '/checkout', sections: [], seo: {}, hiddenFromNav: false },
  ];
}

/**
 * Header and footer are global singletons present on every store from
 * creation (US-3.6) — never absent, so there's no "add" flow for them,
 * only a hide toggle.
 */
export function createDefaultGlobals() {
  return {
    header: { id: 'header', type: 'header', hidden: false, data: defaultsForSchema(headerSchema) },
    footer: { id: 'footer', type: 'footer', hidden: false, data: defaultsForSchema(footerSchema) },
  };
}
