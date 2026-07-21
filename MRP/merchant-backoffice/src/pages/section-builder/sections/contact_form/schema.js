/** US-11.H1 — Contact Form. */
export const schema = {
  heading: { type: 'text', label: 'Section heading', maxLength: 100, default: 'Get in touch', group: 'content' },
  subtext: { type: 'textarea', label: 'Subtext', maxLength: 400, default: '', group: 'content' },
  show_phone_field: { type: 'boolean', label: 'Show phone field', default: false, group: 'content' },
  show_subject_field: { type: 'boolean', label: 'Show subject field', default: false, group: 'content' },
  reply_to_email: { type: 'text', label: 'Send replies to', default: '', helpText: 'Defaults to your store owner email once onboarding is wired up.', group: 'content' },
  background_color: { type: 'color', label: 'Background color', default: { slot: 'background' }, group: 'color' },
};
