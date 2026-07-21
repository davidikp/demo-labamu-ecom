/** US-11.C1 — Featured Products. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Featured products', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  source: {
    type: 'select', label: 'Product source', default: 'collection', group: 'content',
    options: [
      { value: 'collection', label: 'From a collection' },
      { value: 'best_sellers', label: 'Best sellers' },
      { value: 'newest', label: 'Newest arrivals' },
    ],
  },
  products_to_show: { type: 'range', label: 'Products to show', min: 2, max: 12, step: 1, default: 4, group: 'layout' },
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '4', group: 'layout',
    options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
  },
  show_price: { type: 'boolean', label: 'Show price', default: true, group: 'layout' },
  show_view_all: { type: 'boolean', label: 'Show "View all" link', default: true, group: 'layout' },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'background' }, group: 'color' },
};
