/** US-11.D2 — Rich Text. */
export const schema = {
  content: { type: 'richtext', label: 'Content', group: 'content' },
  content_width: {
    type: 'select', label: 'Content width', default: '680', group: 'layout',
    options: [
      { value: '680', label: 'Narrow 680px' },
      { value: '860', label: 'Standard 860px' },
      { value: '1200', label: 'Wide 1200px' },
    ],
  },
  text_alignment: {
    type: 'select', label: 'Text alignment', default: 'left', group: 'layout',
    options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }],
  },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'background' }, group: 'color' },
  text_color: { type: 'color', label: 'Text color', default: { slot: 'text_primary' }, group: 'color' },
};
