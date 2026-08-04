import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';
import { HEADING_SIZE_FIELD } from '../shared/headingSize';
import { IMAGE_ASPECT_RATIO_FIELD } from '../shared/imageAspectRatio';

/** US-11.C4 — Collection List. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Shop by category', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  ...HEADING_SIZE_FIELD,
  source_mode: {
    type: 'select', label: 'Content source', default: 'dynamic', group: 'content',
    options: [{ value: 'dynamic', label: 'From a source' }, { value: 'manual', label: 'Manual blocks' }],
  },
  columns_desktop: {
    type: 'select', label: 'Columns on desktop', default: '3', group: 'layout',
    options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
  },
  columns_mobile: {
    type: 'select', label: 'Columns on mobile', default: '2', group: 'mobile',
    options: [{ value: '1', label: '1' }, { value: '2', label: '2' }],
  },
  show_collection_title: { type: 'boolean', label: 'Show collection title', default: true, group: 'layout' },
  ...IMAGE_ASPECT_RATIO_FIELD,
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};

export const blockConfig = { allowed: ['collection'], presets: [], max: 12 };
