import { SECTION_CHROME_FIELDS_NO_PADDING } from '../shared/sectionChrome';

/** US-11.A1 — Header (global singleton). */
export const schema = {
  logo_text: { type: 'text', label: 'Logo text fallback', maxLength: 100, default: 'My Store', group: 'content' },
  layout_variant: {
    type: 'select',
    label: 'Layout',
    default: 'inline',
    group: 'layout',
    options: [
      { value: 'inline', label: 'Inline — logo left, nav inline' },
      { value: 'centered-split', label: 'Centered — logo center, nav split' },
      { value: 'stacked-bold', label: 'Stacked — bold logo below a slim nav bar' },
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
  ...SECTION_CHROME_FIELDS_NO_PADDING,
  color_scheme: { ...SECTION_CHROME_FIELDS_NO_PADDING.color_scheme, default: 'primary' },
};
