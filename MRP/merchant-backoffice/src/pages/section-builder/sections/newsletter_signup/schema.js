/** US-11.F1 — Newsletter Signup. */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 100, default: 'Join our newsletter', group: 'content' },
  subtext: { type: 'textarea', label: 'Subtext', maxLength: 400, default: 'Get new arrivals and exclusive offers delivered to your inbox.', group: 'content' },
  button_label: { type: 'text', label: 'Button label', maxLength: 100, default: 'Subscribe', group: 'content' },
  show_disclaimer: { type: 'boolean', label: 'Show privacy disclaimer', default: true, group: 'content' },
  disclaimer_text: { type: 'text', label: 'Disclaimer text', maxLength: 400, default: 'No spam. Unsubscribe anytime.', group: 'content', dependsOn: { field: 'show_disclaimer', equals: true } },
  layout_style: {
    type: 'select', label: 'Layout style', default: 'centered', group: 'layout',
    options: [{ value: 'centered', label: 'Centered' }, { value: 'split', label: 'Split — text left, form right' }],
  },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'primary' }, group: 'color' },
  text_color: {
    type: 'color',
    label: 'Text color',
    default: { slot: 'primary_text' },
    group: 'color',
    contrastCheck: { against: 'background_color' },
  },
};
