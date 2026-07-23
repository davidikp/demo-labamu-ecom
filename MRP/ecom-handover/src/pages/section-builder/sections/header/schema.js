/** US-11.A1 — Header (global singleton). */
export const schema = {
  logo_text: { type: 'text', label: 'Logo text fallback', maxLength: 100, default: 'My Store', group: 'content' },
  nav_links: {
    type: 'repeater',
    label: 'Nav links',
    maxItems: 8,
    group: 'content',
    itemSchema: {
      label: { type: 'text', label: 'Label', maxLength: 100, default: '' },
      url: { type: 'text', label: 'URL', default: '/' },
    },
  },
  sticky: { type: 'boolean', label: 'Sticky on scroll', default: true, group: 'layout' },
  show_cart_icon: { type: 'boolean', label: 'Show cart icon', default: true, group: 'layout' },
  show_search_icon: { type: 'boolean', label: 'Show search icon', default: true, group: 'layout' },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'primary' }, group: 'color' },
  text_color: {
    type: 'color',
    label: 'Text / link color',
    default: { slot: 'primary_text' },
    group: 'color',
    contrastCheck: { against: 'background_color' },
  },
};
