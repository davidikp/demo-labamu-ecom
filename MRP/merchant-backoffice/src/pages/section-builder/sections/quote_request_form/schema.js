import { SECTION_CHROME_FIELDS } from '../shared/sectionChrome';

/** Request a Quote Form — a specific, opinionated form layout (Name, Email +
 * Phone, Message, Submit) for quote requests, distinct in purpose/wording
 * from the generic contact_form. Fixed field set, not a generic block canvas. */
export const schema = {
  heading: { type: 'text', label: 'Heading', maxLength: 100, default: 'Request a Quote', group: 'content' },
  subtext: { type: 'text', label: 'Subtext', maxLength: 200, default: 'Need a custom tailored clothing for special events? Just let us know what you need!', group: 'content' },
  button_label: { type: 'text', label: 'Button label', maxLength: 40, default: 'Request a Quote', group: 'content' },
  ...SECTION_CHROME_FIELDS,
  padding_top: { ...SECTION_CHROME_FIELDS.padding_top, default: 40 },
  padding_bottom: { ...SECTION_CHROME_FIELDS.padding_bottom, default: 40 },
};
