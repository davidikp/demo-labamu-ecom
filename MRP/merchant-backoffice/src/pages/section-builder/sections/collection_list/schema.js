/** US-11.C4 — Collection List. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Shop by category', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '3', group: 'layout',
    options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
  },
  show_collection_title: { type: 'boolean', label: 'Show collection title', default: true, group: 'layout' },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'background' }, group: 'color' },
};
