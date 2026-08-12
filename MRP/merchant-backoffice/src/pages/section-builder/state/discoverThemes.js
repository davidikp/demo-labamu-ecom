/**
 * @module section-builder/state/discoverThemes
 * @description Fixture pool for the Online Store > Themes "Discover" rail —
 * a fixed set of Shopify-style theme names used to sample a handful of
 * "suggested" themes on the gallery page load. Not backed by SITE_TEMPLATES
 * (section-builder/state/siteTemplates.js) — but each entry now carries the
 * same illustrative shape those templates use (`theme`, `header`, `footer`,
 * `media`, `pages`), just intentionally lighter (one hero section, no bundled
 * photography), so `defaultPreviewDataFor` from siteTemplates.js can be
 * reused as-is to render a real Canvas preview for Discover cards instead of
 * a flat gradient placeholder.
 */

import { defaultsForSchema } from '../sections/schemaDefaults';
import { schemaForType } from '../sections/index';
import { seedBlocks, sectionSupportsBlocks } from '../sections/blockHelpers';

/** A minimal hero_banner section with a heading/subheading pair authored
 * directly (rather than via seedBlocks) so each Discover fixture can carry
 * its own distinct copy without needing a live block-id generator. */
function heroSection(id, heading, subheading) {
  return {
    id,
    type: 'hero_banner',
    data: { ...defaultsForSchema(schemaForType('hero_banner')) },
    blocks: [
      { id: `${id}-heading`, type: 'heading', data: { text: heading, size: 'large', alignment: 'center' } },
      { id: `${id}-subheading`, type: 'subheading', data: { text: subheading } },
    ],
  };
}

/** Any other registered section type, with schema defaults + seeded blocks
 * (when the type supports blocks) — same shape as siteTemplates.js's own
 * `defaultSection`, kept local here so Discover fixtures can pull in
 * genuinely different section TYPES (not just recolored hero banners) for
 * structural variety (see Task 4), without needing bespoke copy per fixture.
 */
function extraSection(id, type, overrides = {}) {
  return {
    id,
    type,
    data: { ...defaultsForSchema(schemaForType(type)), ...overrides },
    ...(sectionSupportsBlocks(type) ? { blocks: seedBlocks(type) } : {}),
  };
}

function homePage(templateId, sections) {
  return { id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false, sections };
}

export const DISCOVER_THEME_POOL = [
  {
    templateId: 'horizon',
    name: 'Horizon',
    previewImageUrl: '/assets/themes/horizon-preview.png',
    theme: {
      typography: { heading_font: 'Playfair Display', body_font: 'Inter', heading_size: 'large', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#fff8f2', surface: '#fdeee0', primary: '#1c2b39', primary_text: '#ffffff',
        accent: '#e8853a', accent_text: '#ffffff', text_primary: '#1c2b39', text_secondary: '#6b5f54', border: '#f0ded0',
      },
    },
    header: { layout_variant: 'inline', logo_text: 'Horizon' },
    footer: { layout_variant: 'centered-tagline', tagline: 'Explore beyond the edge.' },
    media: [],
    // Structural pattern: hero only (the simplest single-section homepage).
    pages: [homePage('horizon', [heroSection('horizon-home-hero', 'Horizon — Explore Beyond the Edge', 'Gear and apparel for the long way round.')])],
  },
  {
    templateId: 'tinker',
    name: 'Tinker',
    previewImageUrl: '/assets/themes/tinker-preview.png',
    theme: {
      typography: { heading_font: 'Space Grotesk', body_font: 'Inter', heading_size: 'medium', body_size: 'medium', letter_spacing: 'wide', heading_transform: 'none' },
      colors: {
        background: '#f7f7f5', surface: '#ececea', primary: '#232323', primary_text: '#ffffff',
        accent: '#ff6b35', accent_text: '#ffffff', text_primary: '#232323', text_secondary: '#6f6f6f', border: '#dddddb',
      },
    },
    header: { layout_variant: 'centered-split', logo_text: 'Tinker' },
    footer: { layout_variant: 'minimal-bar', tagline: 'Tools for people who build things.' },
    media: [],
    // Structural pattern: hero + 3-column feature grid (brand_values).
    pages: [homePage('tinker', [
      heroSection('tinker-home-hero', 'Tinker — Build It Yourself', 'Workshop-grade tools and parts, curated for makers.'),
      extraSection('tinker-home-values', 'brand_values', { heading: 'Why makers choose Tinker' }),
    ])],
  },
  {
    templateId: 'savor',
    name: 'Savor',
    previewImageUrl: '/assets/themes/savor-preview.png',
    theme: {
      typography: { heading_font: 'Cormorant Garamond', body_font: 'Nunito', heading_size: 'large', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#fbf4ee', surface: '#f3e3d3', primary: '#5a3a29', primary_text: '#ffffff',
        accent: '#b5651d', accent_text: '#ffffff', text_primary: '#3a2718', text_secondary: '#8a7360', border: '#e8d5bf',
      },
    },
    header: { layout_variant: 'stacked-bold', logo_text: 'Savor' },
    footer: { layout_variant: 'columns', tagline: 'Small-batch flavor, delivered fresh.' },
    media: [],
    // Structural pattern: hero + image-and-text split section.
    pages: [homePage('savor', [
      heroSection('savor-home-hero', 'Savor — Taste the Difference', 'Small-batch pantry staples made the slow way.'),
      extraSection('savor-home-story', 'image_with_text', { image_position: 'left' }),
    ])],
  },
  {
    templateId: 'ritual',
    name: 'Ritual',
    previewImageUrl: '/assets/themes/ritual-preview.png',
    theme: {
      typography: { heading_font: 'Playfair Display', body_font: 'Lora', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#f6f8f5', surface: '#e8ede4', primary: '#3f4f3d', primary_text: '#ffffff',
        accent: '#7c9885', accent_text: '#ffffff', text_primary: '#2c352b', text_secondary: '#6c7a68', border: '#dbe4d6',
      },
    },
    header: { layout_variant: 'inline', logo_text: 'Ritual' },
    footer: { layout_variant: 'centered-tagline', tagline: 'A quiet moment, every day.' },
    media: [],
    // Structural pattern: hero + testimonials/quote block.
    pages: [homePage('ritual', [
      heroSection('ritual-home-hero', 'Ritual — A Quiet Moment', 'Wellness essentials for slowing down.'),
      extraSection('ritual-home-testimonials', 'testimonials'),
    ])],
  },
  {
    templateId: 'craft',
    name: 'Craft',
    previewImageUrl: '/assets/themes/craft-preview.png',
    theme: {
      typography: { heading_font: 'Merriweather', body_font: 'Source Sans Pro', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#faf6f0', surface: '#eee1cd', primary: '#4a3220', primary_text: '#ffffff',
        accent: '#a3672b', accent_text: '#ffffff', text_primary: '#3a2718', text_secondary: '#7d6a54', border: '#e3d3ba',
      },
    },
    header: { layout_variant: 'centered-split', logo_text: 'Craft' },
    footer: { layout_variant: 'columns', tagline: 'Handmade, one piece at a time.' },
    media: [],
    // Structural pattern: hero + featured products grid.
    pages: [homePage('craft', [
      heroSection('craft-home-hero', 'Craft — Made by Hand', 'Artisan goods built to last generations.'),
      extraSection('craft-home-featured', 'featured_products', { heading: 'Handmade favorites' }),
    ])],
  },
  {
    templateId: 'sense',
    name: 'Sense',
    previewImageUrl: '/assets/themes/sense-preview.png',
    theme: {
      typography: { heading_font: 'Cormorant Garamond', body_font: 'Poppins', heading_size: 'large', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#fdf5f7', surface: '#f7e3e9', primary: '#402330', primary_text: '#ffffff',
        accent: '#d68fa0', accent_text: '#402330', text_primary: '#402330', text_secondary: '#8a6a76', border: '#f0d4dd',
      },
    },
    header: { layout_variant: 'inline', logo_text: 'Sense' },
    footer: { layout_variant: 'centered-tagline', tagline: 'Fragrance, felt.' },
    media: [],
    // Structural pattern: hero only (same as Horizon — reuse is fine, not
    // every fixture needs a unique skeleton).
    pages: [homePage('sense', [heroSection('sense-home-hero', 'Sense — Fragrance, Felt', 'Botanical scents blended in small batches.')])],
  },
  {
    templateId: 'studio',
    name: 'Studio',
    previewImageUrl: '/assets/themes/studio-preview.png',
    theme: {
      typography: { heading_font: 'Montserrat', body_font: 'Inter', heading_size: 'large', body_size: 'medium', letter_spacing: 'wide', heading_transform: 'uppercase' },
      colors: {
        background: '#ffffff', surface: '#f2f2f2', primary: '#111111', primary_text: '#ffffff',
        accent: '#f4c430', accent_text: '#111111', text_primary: '#111111', text_secondary: '#5c5c5c', border: '#e2e2e2',
      },
    },
    header: { layout_variant: 'centered-split', logo_text: 'Studio' },
    footer: { layout_variant: 'minimal-bar', tagline: 'Bold ideas, sharp execution.' },
    media: [],
    // Structural pattern: hero + 3-column feature grid (brand_values).
    pages: [homePage('studio', [
      heroSection('studio-home-hero', 'Studio — Bold by Design', 'A creative studio for brands that stand out.'),
      extraSection('studio-home-values', 'brand_values', { heading: 'What sets us apart' }),
    ])],
  },
  {
    templateId: 'motion',
    name: 'Motion',
    previewImageUrl: '/assets/themes/motion-preview.png',
    theme: {
      typography: { heading_font: 'Oswald', body_font: 'Roboto', heading_size: 'large', body_size: 'medium', letter_spacing: 'wide', heading_transform: 'uppercase' },
      colors: {
        background: '#101010', surface: '#1c1c1c', primary: '#e63946', primary_text: '#ffffff',
        accent: '#e63946', accent_text: '#ffffff', text_primary: '#ffffff', text_secondary: '#b3b3b3', border: '#2e2e2e',
      },
    },
    header: { layout_variant: 'stacked-bold', logo_text: 'Motion' },
    footer: { layout_variant: 'minimal-bar', tagline: 'Train harder. Move faster.' },
    media: [],
    // Structural pattern: hero + image-and-text split section.
    pages: [homePage('motion', [
      heroSection('motion-home-hero', 'Motion — Train Harder', 'Performance gear engineered for the finish line.'),
      extraSection('motion-home-story', 'image_with_text', { image_position: 'right' }),
    ])],
  },
  {
    templateId: 'origin',
    name: 'Origin',
    previewImageUrl: '/assets/themes/origin-preview.png',
    theme: {
      typography: { heading_font: 'Fraunces', body_font: 'Inter', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#f5f7f2', surface: '#e6ecdf', primary: '#33452f', primary_text: '#ffffff',
        accent: '#4c6b47', accent_text: '#ffffff', text_primary: '#22301f', text_secondary: '#657a5f', border: '#d8e2cf',
      },
    },
    header: { layout_variant: 'inline', logo_text: 'Origin' },
    footer: { layout_variant: 'columns', tagline: 'Sustainably sourced, from the ground up.' },
    media: [],
    // Structural pattern: hero + testimonials/quote block.
    pages: [homePage('origin', [
      heroSection('origin-home-hero', 'Origin — From the Ground Up', 'Sustainably sourced goods with a traceable story.'),
      extraSection('origin-home-testimonials', 'testimonials'),
    ])],
  },
  {
    templateId: 'refresh',
    name: 'Refresh',
    previewImageUrl: '/assets/themes/refresh-preview.png',
    theme: {
      typography: { heading_font: 'Poppins', body_font: 'Poppins', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#eefcfa', surface: '#d8f5f0', primary: '#023e3b', primary_text: '#ffffff',
        accent: '#00b8a9', accent_text: '#ffffff', text_primary: '#023e3b', text_secondary: '#4c7a76', border: '#c3ece6',
      },
    },
    header: { layout_variant: 'centered-split', logo_text: 'Refresh' },
    footer: { layout_variant: 'centered-tagline', tagline: 'Hydration, reimagined.' },
    media: [],
    // Structural pattern: hero + collection grid.
    pages: [homePage('refresh', [
      heroSection('refresh-home-hero', 'Refresh — Hydration, Reimagined', 'Clean, functional drinks for every day.'),
      extraSection('refresh-home-collections', 'collection_list', { heading: 'Shop by collection' }),
    ])],
  },
];

/**
 * Returns a random sample of `count` unique themes from DISCOVER_THEME_POOL,
 * via a Fisher-Yates shuffle followed by a slice (no repeats, no bias toward
 * the front of the pool). Uses Math.random() — fine here since this is
 * normal UI randomness (which themes to suggest), not deterministic
 * business logic.
 */
export function sampleDiscoverThemes(count = 5) {
  const shuffled = [...DISCOVER_THEME_POOL];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
