/** US-11.B2 — Announcement Bar. */
export const schema = {
  message: { type: 'text', label: 'Message text', maxLength: 400, default: 'Free shipping on orders over $50', group: 'content' },
  show_link: { type: 'boolean', label: 'Show link', default: false, group: 'content' },
  link_label: { type: 'text', label: 'Link label', maxLength: 100, default: '', group: 'content', dependsOn: { field: 'show_link', equals: true } },
  link_url: { type: 'text', label: 'Link URL', default: '', group: 'content', dependsOn: { field: 'show_link', equals: true } },
  text_alignment: {
    type: 'select', label: 'Text alignment', default: 'center', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }],
  },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'accent' }, group: 'color' },
  text_color: {
    type: 'color',
    label: 'Text color',
    default: { slot: 'accent_text' },
    group: 'color',
    contrastCheck: { against: 'background_color' },
  },
};
