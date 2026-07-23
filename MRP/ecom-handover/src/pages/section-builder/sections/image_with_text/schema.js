/** US-11.D1 — Image with Text. */
export const schema = {
  eyebrow_label: { type: 'text', label: 'Eyebrow label', maxLength: 100, default: '', group: 'content' },
  heading: { type: 'text', label: 'Heading', maxLength: 100, default: 'About our story', group: 'content' },
  body_text: { type: 'textarea', label: 'Body text', maxLength: 1000, default: '', group: 'content' },
  show_button: { type: 'boolean', label: 'Show button', default: false, group: 'content' },
  button_label: { type: 'text', label: 'Button label', maxLength: 100, default: 'Learn more', group: 'content', dependsOn: { field: 'show_button', equals: true } },
  button_url: { type: 'text', label: 'Button URL', default: '', group: 'content', dependsOn: { field: 'show_button', equals: true } },
  image: { type: 'image', label: 'Image', helpText: 'Recommended: 800x600px', group: 'media' },
  image_position: {
    type: 'select', label: 'Image position', default: 'left', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }],
  },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'background' }, group: 'color' },
  text_color: { type: 'color', label: 'Text color', default: { slot: 'text_primary' }, group: 'color' },
};
