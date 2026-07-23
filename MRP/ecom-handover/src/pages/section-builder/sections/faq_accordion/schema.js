/** US-11.H2 — FAQ Accordion. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Frequently asked questions', group: 'content' },
  show_heading: { type: 'boolean', label: 'Show heading', default: true, group: 'content' },
  faq_items: {
    type: 'repeater',
    label: 'FAQ items',
    maxItems: 20,
    group: 'content',
    itemSchema: {
      question: { type: 'text', label: 'Question', maxLength: 400, default: '' },
      answer: { type: 'richtext', label: 'Answer', default: '' },
    },
  },
  allow_multiple_open: { type: 'boolean', label: 'Allow multiple open', default: false, group: 'layout' },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'background' }, group: 'color' },
};
