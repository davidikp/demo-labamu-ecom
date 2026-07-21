/** US-11.D4 — Brand Values. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Why shop with us', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  values: {
    type: 'repeater',
    label: 'Value items',
    maxItems: 6,
    group: 'content',
    itemSchema: {
      icon: { type: 'text', label: 'Icon (emoji)', maxLength: 4, default: '⭐' },
      label: { type: 'text', label: 'Label', maxLength: 100, default: '' },
      description: { type: 'text', label: 'Description', maxLength: 400, default: '' },
    },
  },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'background' }, group: 'color' },
  icon_color: { type: 'color', label: 'Icon color', default: { slot: 'accent' }, group: 'color' },
};
