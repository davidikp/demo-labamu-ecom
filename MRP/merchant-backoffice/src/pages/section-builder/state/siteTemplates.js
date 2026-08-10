import { defaultsForSchema } from '../sections/schemaDefaults';
import { schemaForType } from '../sections/index';
import { seedBlocks, sectionSupportsBlocks } from '../sections/blockHelpers';
import { defaultTheme, createDefaultGlobals } from './defaultTheme';

/**
 * @module section-builder/state/siteTemplates
 * @description Business-type "site templates" — each bundles a visual theme
 * (same `{typography, colors}` shape as `sections/themePresets.js`), a
 * header/footer content override, a bundled media library (real,
 * free-license stock photography under public/assets/templates/<id>/), and
 * a default page/section scaffold — reusing only existing section types (no
 * new renderers). Templates are named after business-type flavors purely as
 * a naming convention for the picker UI — this has no relationship to any
 * actual merchant business-type/industry selection elsewhere in the app.
 *
 * Two distinct application modes (see builderReducer.js):
 *  - "seed" (APPLY_SITE_TEMPLATE_SEED): first-ever template pick for a site —
 *    replaces theme, pages, header/footer, AND media library.
 *  - "reskin" (APPLY_SITE_TEMPLATE_RESKIN): switching templates afterwards —
 *    replaces theme.colors/typography only. Page structure, section
 *    arrangement, header/footer content, media, and any section
 *    customization are left untouched.
 *
 * Image fields don't hold a URL — they hold `{ mediaId }`, resolved against
 * the store's mediaLibrary (see ui/fields/imageValue.js). `media(...)` below
 * builds real media-library-shaped records; `image(mediaId)` builds the
 * `{ mediaId }` reference an image field expects.
 */

function defaultSection(id, type, overrides = {}) {
  return {
    id,
    type,
    data: { ...defaultsForSchema(schemaForType(type)), ...overrides },
    ...(sectionSupportsBlocks(type) ? { blocks: seedBlocks(type) } : {}),
  };
}

function image(mediaId) {
  return { mediaId };
}

/** Photos are free-license stock (Unsplash License / Pexels License — free
 * for commercial use, no attribution required), downloaded once into
 * public/assets/templates/<id>/ rather than hotlinked. */
function media(templateId, entries) {
  return entries.map(({ key, filename, width, height }) => ({
    id: `${templateId}-${key}`,
    filename,
    url: `/assets/templates/${templateId}/${filename}`,
    width,
    height,
    uploadedAt: '2026-01-01T00:00:00.000Z',
  }));
}

export const SITE_TEMPLATES = [
  {
    id: 'clothing',
    name: 'Clothing',
    theme: {
      typography: { heading_font: 'Cormorant Garamond', body_font: 'Lora', heading_size: 'large', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#ffffff', surface: '#f5f2ef', primary: '#1a1a1a', primary_text: '#ffffff',
        accent: '#b08968', accent_text: '#ffffff', text_primary: '#1a1a1a', text_secondary: '#6b6b6b', border: '#e5e0da',
      },
    },
    // Editorial, minimal identity — logo left, nav inline (Renderer.jsx's
    // default layout), plain-text logo.
    header: { layout_variant: 'inline', logo_text: 'Horizon & Co.' },
    // Centered, editorial footer to match the inline header's understated,
    // minimal identity — no link columns competing for attention.
    footer: { layout_variant: 'centered-tagline', tagline: 'Considered essentials, made to last.' },
    media: media('clothing', [
      { key: 'hero', filename: 'hero.jpg', width: 1600, height: 1067 },
      { key: 'secondary', filename: 'secondary.jpg', width: 1200, height: 801 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('clothing-home-hero', 'hero_banner', { background_image: image('clothing-hero') }),
          defaultSection('clothing-home-announcement', 'announcement_bar'),
          defaultSection('clothing-home-catalog', 'collection_list', { heading: 'Shop by category' }),
          defaultSection('clothing-home-lifestyle', 'image_with_text', { image: image('clothing-secondary'), image_position: 'right' }),
          defaultSection('clothing-home-featured', 'featured_products', { heading: 'New arrivals' }),
          defaultSection('clothing-home-testimonials', 'testimonials'),
        ],
      },
      {
        id: 'about', name: 'About', type: 'system', slug: '/about', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('clothing-about-brand', 'brand_values', { heading: 'Why shop with us' }),
          defaultSection('clothing-about-team', 'team_about'),
        ],
      },
      {
        id: 'contact', name: 'Contact', type: 'system', slug: '/contact', seo: {}, hiddenFromNav: false,
        sections: [defaultSection('clothing-contact-form', 'contact_form')],
      },
    ],
  },
  {
    id: 'fnb',
    name: 'Food & Beverage',
    theme: {
      typography: { heading_font: 'Cormorant Garamond', body_font: 'Nunito', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#faf6f0', surface: '#f0e8dc', primary: '#6b4f3b', primary_text: '#ffffff',
        accent: '#b5651d', accent_text: '#ffffff', text_primary: '#3a2e22', text_secondary: '#7a6a58', border: '#e0d3bf',
      },
    },
    // Energetic, layered identity — slim caps nav bar above a big bold
    // logo row (Renderer.jsx's 'stacked-bold' variant).
    header: { layout_variant: 'stacked-bold', logo_text: 'Savor Kitchen' },
    // Full columns footer — layered and generous, matching the stacked-bold
    // header's energetic, content-rich identity.
    footer: { layout_variant: 'columns', tagline: 'Fresh, seasonal, made with care.' },
    media: media('fnb', [
      { key: 'hero', filename: 'hero.jpg', width: 1600, height: 1067 },
      { key: 'secondary', filename: 'secondary.jpg', width: 1200, height: 800 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('fnb-home-hero', 'hero_banner', { background_image: image('fnb-hero') }),
          defaultSection('fnb-home-announcement', 'announcement_bar'),
          defaultSection('fnb-home-catalog', 'featured_products', { heading: 'Our menu' }),
          defaultSection('fnb-home-interior', 'image_with_text', { image: image('fnb-secondary'), image_position: 'left' }),
          defaultSection('fnb-home-testimonials', 'testimonials'),
          defaultSection('fnb-home-map', 'map_embed'),
        ],
      },
      {
        id: 'about', name: 'About', type: 'system', slug: '/about', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('fnb-about-brand', 'brand_values', { heading: 'Why dine with us' }),
          defaultSection('fnb-about-team', 'team_about'),
        ],
      },
      {
        id: 'contact', name: 'Contact', type: 'system', slug: '/contact', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('fnb-contact-form', 'contact_form'),
          defaultSection('fnb-contact-map', 'map_embed'),
        ],
      },
    ],
  },
  {
    id: 'manufacture',
    name: 'Manufacture',
    theme: {
      typography: { heading_font: 'Montserrat', body_font: 'Inter', heading_size: 'medium', body_size: 'medium', letter_spacing: 'wide', heading_transform: 'none' },
      colors: {
        background: '#ffffff', surface: '#eef2f7', primary: '#1f2a44', primary_text: '#ffffff',
        accent: '#3d6bff', accent_text: '#ffffff', text_primary: '#1a1a1a', text_secondary: '#5c6470', border: '#dbe1ea',
      },
    },
    // Clean, symmetric, corporate identity — nav split left/right around a
    // centered logo (Renderer.jsx's 'centered-split' variant).
    header: { layout_variant: 'centered-split', logo_text: 'Meridian Industrial' },
    // Minimal single-row footer — clean and corporate, matching the
    // centered-split header's symmetric, no-frills identity.
    footer: { layout_variant: 'minimal-bar', tagline: 'Precision manufacturing, built to spec.' },
    media: media('manufacture', [
      { key: 'hero', filename: 'hero.jpg', width: 1600, height: 1067 },
      { key: 'secondary', filename: 'secondary.jpg', width: 1200, height: 817 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('manufacture-home-hero', 'hero_banner', { background_image: image('manufacture-hero') }),
          defaultSection('manufacture-home-brand', 'brand_values', { heading: 'Our capabilities' }),
          defaultSection('manufacture-home-facility', 'image_with_text', { image: image('manufacture-secondary'), image_position: 'right' }),
          defaultSection('manufacture-home-catalog', 'featured_products', { heading: 'Our products' }),
          defaultSection('manufacture-home-logos', 'press_logos'),
          defaultSection('manufacture-home-faq', 'faq_accordion'),
        ],
      },
      {
        id: 'about', name: 'About', type: 'system', slug: '/about', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('manufacture-about-team', 'team_about'),
          defaultSection('manufacture-about-faq', 'faq_accordion'),
        ],
      },
      {
        id: 'contact', name: 'Contact', type: 'system', slug: '/contact', seo: {}, hiddenFromNav: false,
        sections: [defaultSection('manufacture-contact-form', 'contact_form', { reply_to_email: '' })],
      },
    ],
  },
];

export function siteTemplateById(id) {
  return SITE_TEMPLATES.find((t) => t.id === id) ?? null;
}

/**
 * Builds an illustrative preview (header/footer/sections/theme/media) from a
 * template's own default data — never a merchant's real content. Shared by
 * ThemeGallery's inactive-card previews and the standalone theme preview
 * route (ThemePreview.jsx) so both render exactly the same "what this theme
 * looks like out of the box" data from one source of truth.
 */
export function defaultPreviewDataFor(template) {
  const globals = createDefaultGlobals(template.pages);
  const theme = { ...defaultTheme, ...template.theme };
  const header = { ...globals.header, data: { ...globals.header.data, ...template.header } };
  const footer = { ...globals.footer, data: { ...globals.footer.data, ...template.footer } };
  return { header, footer, sections: template.pages[0]?.sections ?? [], theme, mediaLibrary: template.media };
}
