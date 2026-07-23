/** US-11.A2 — Footer (global singleton). */
export const schema = {
  tagline: { type: 'textarea', label: 'Tagline', maxLength: 400, group: 'content' },
  link_columns: {
    type: 'repeater',
    label: 'Link columns',
    maxItems: 4,
    group: 'content',
    itemSchema: {
      heading: { type: 'text', label: 'Column heading', maxLength: 100, default: '' },
      links: {
        type: 'repeater',
        label: 'Links',
        maxItems: 8,
        itemSchema: {
          label: { type: 'text', label: 'Label', maxLength: 100, default: '' },
          url: { type: 'text', label: 'URL', default: '/' },
        },
      },
    },
  },
  copyright_text: { type: 'text', label: 'Copyright text', maxLength: 400, default: '', group: 'content' },
  show_social_icons: { type: 'boolean', label: 'Show social icons', default: true, group: 'content' },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'primary' }, group: 'color' },
  text_color: {
    type: 'color',
    label: 'Text color',
    default: { slot: 'primary_text' },
    group: 'color',
    contrastCheck: { against: 'background_color' },
  },
};
