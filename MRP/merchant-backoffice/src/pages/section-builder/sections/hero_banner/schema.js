/** US-11.B1 — Hero Banner. */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 100, default: 'Welcome to our store', group: 'content' },
  subtext: { type: 'textarea', label: 'Subtext', maxLength: 400, default: '', group: 'content' },
  button_label: { type: 'text', label: 'Button label', maxLength: 100, default: 'Shop now', group: 'content' },
  button_url: { type: 'text', label: 'Button URL', default: '/collections/all', group: 'content' },
  background_image: { type: 'image', label: 'Background image', helpText: 'Recommended: 1440x640px', group: 'media' },
  text_alignment: {
    type: 'select', label: 'Text alignment', default: 'left', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }],
  },
  overlay_opacity: { type: 'range', label: 'Image overlay opacity', min: 0, max: 80, step: 5, default: 0, unit: '%', group: 'layout' },
  min_height: { type: 'range', label: 'Min section height', min: 300, max: 800, step: 50, default: 500, unit: 'px', group: 'layout' },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'surface' }, group: 'color' },
  text_color: {
    type: 'color',
    label: 'Text color',
    default: { slot: 'text_primary' },
    group: 'color',
    contrastCheck: { against: 'background_color' },
  },
};
