import { SECTION_CHROME_FIELDS_NO_PADDING } from '../shared/sectionChrome';

/** US-11.A1 — Header (global singleton). */
export const schema = {
  logo_text: { type: 'text', label: 'Logo text fallback', maxLength: 100, default: 'My Store', group: 'content' },
  // Optional icon shown alongside logo_text (never a replacement for it —
  // absent by default so every existing header without this field renders
  // exactly as before, text-only).
  logo_image: { type: 'image', label: 'Logo icon', group: 'content' },
  layout_variant: {
    type: 'select',
    label: 'Layout',
    default: 'inline',
    group: 'layout',
    options: [
      { value: 'inline', label: 'Inline — logo left, nav inline' },
      { value: 'centered-split', label: 'Centered — logo center, nav split' },
      { value: 'stacked-bold', label: 'Stacked — bold logo below a slim nav bar' },
      { value: 'centered-nav', label: 'Centered — logo left, nav centered, actions right' },
    ],
  },
  nav_links: {
    type: 'repeater',
    label: 'Nav links',
    maxItems: 8,
    group: 'content',
    // New items default their URL to whichever page is active in the
    // builder when "Add item" is clicked, rather than always defaulting to
    // "/" — see RepeaterField.jsx.
    autofillUrlFromActivePage: true,
    itemSchema: {
      label: { type: 'text', label: 'Label', maxLength: 100, default: '' },
      url: { type: 'text', label: 'URL', default: '/' },
    },
  },
  sticky: { type: 'boolean', label: 'Sticky on scroll', default: true, group: 'layout' },
  show_cart_icon: { type: 'boolean', label: 'Show cart icon', default: true, group: 'layout' },
  show_search_icon: { type: 'boolean', label: 'Show search icon', default: true, group: 'layout' },
  // Decorative-only pill (border + globe icon + "EN" + chevron) — see the
  // code comment in Renderer.jsx's renderIcons() for why this is NOT a real
  // i18n control.
  show_language_switcher: { type: 'boolean', label: 'Show language switcher', default: false, group: 'layout' },
  show_border: { type: 'boolean', label: 'Show bottom border', default: false, group: 'layout' },
  ...SECTION_CHROME_FIELDS_NO_PADDING,
  color_scheme: { ...SECTION_CHROME_FIELDS_NO_PADDING.color_scheme, default: 'primary' },
};
