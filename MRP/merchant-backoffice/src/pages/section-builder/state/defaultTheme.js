import { rawSchema } from './themeSchemaAdapter';
import { schema as headerSchema } from '../sections/header/schema';
import { schema as footerSchema } from '../sections/footer/schema';
import { defaultsForSchema } from '../sections/schemaDefaults';
import { schemaForType } from '../sections/index';

function defaultSection(id, type, overrides = {}) {
  return { id, type, data: { ...defaultsForSchema(schemaForType(type)), ...overrides } };
}

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
 * System pages (US-6.1). Product/Collection/Cart/Checkout are seeded with a
 * starter section (a minimal PDP spotlight, a collection grid, and cart/
 * checkout summaries) so they aren't blank, but they still pull from the
 * mock catalog fixture (mocks/catalog.json), not a real backend — see
 * TODO(catalog integration) notes in the section renderers themselves.
 * All five pages are section-editable like Home; merchants can add, remove,
 * or rearrange sections on any of them.
 */
export function createDefaultPages() {
  return [
    { id: 'home', name: 'Home', type: 'system', slug: '/', sections: [], seo: {}, hiddenFromNav: false },
    {
      id: 'product', name: 'Product', type: 'system', slug: '/products/:handle', seo: {}, hiddenFromNav: false,
      sections: [
        defaultSection('product-default-spotlight', 'product_spotlight', {
          show_variant_selector: false,
          show_quantity_selector: false,
        }),
      ],
    },
    {
      id: 'collection', name: 'Collection', type: 'system', slug: '/collections/:handle', seo: {}, hiddenFromNav: false,
      sections: [
        defaultSection('collection-default-grid', 'featured_products', {
          heading: 'Collection',
          show_view_all: false,
        }),
      ],
    },
    {
      id: 'cart', name: 'Cart', type: 'system', slug: '/cart', seo: {}, hiddenFromNav: false,
      sections: [defaultSection('cart-default-summary', 'cart_summary')],
    },
    {
      id: 'checkout', name: 'Checkout', type: 'system', slug: '/checkout', seo: {}, hiddenFromNav: false,
      sections: [defaultSection('checkout-default-summary', 'checkout_summary')],
    },
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
