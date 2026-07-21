/** US-11.E1 — Testimonials. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'What customers say', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  quotes: {
    type: 'repeater',
    label: 'Quote items',
    maxItems: 6,
    group: 'content',
    itemSchema: {
      quote: { type: 'textarea', label: 'Quote text', maxLength: 400, default: '' },
      reviewer_name: { type: 'text', label: 'Reviewer name', maxLength: 100, default: '' },
      star_rating: {
        type: 'select', label: 'Star rating', default: '5',
        options: [{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }],
      },
    },
  },
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '3', group: 'layout',
    options: [{ value: '2', label: '2' }, { value: '3', label: '3' }],
  },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'surface' }, group: 'color' },
};
