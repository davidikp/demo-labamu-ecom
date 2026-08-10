import { SECTION_CHROME_FIELDS_NO_PADDING } from '../shared/sectionChrome';

/** US-11.A2 — Footer (global singleton). */
export const schema = {
  layout_variant: {
    type: 'select',
    label: 'Layout',
    default: 'columns',
    group: 'layout',
    options: [
      { value: 'columns', label: 'Columns — tagline, link columns, and a bottom bar' },
      { value: 'centered-tagline', label: 'Centered — tagline and copyright only, no columns' },
      { value: 'minimal-bar', label: 'Minimal — a single slim copyright row' },
    ],
  },
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
  ...SECTION_CHROME_FIELDS_NO_PADDING,
  color_scheme: { ...SECTION_CHROME_FIELDS_NO_PADDING.color_scheme, default: 'primary' },
};
