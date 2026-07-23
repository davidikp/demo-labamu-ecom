import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';

// TODO(backend): submission, email notification, and rate limiting (US-9.1's
// AC) need a real endpoint — this renders the form fields only.
function ContactFormRenderer({ data, theme }) {
  const { t } = useTranslation();
  const bg = resolveColor(data.background_color, theme.colors);

  return (
    <section style={{ backgroundColor: bg }} className="px-6 py-10">
      <h2 className="mb-1 text-xl font-semibold text-gray-900">{data.heading || t('sectionBuilder:sections.contactForm.defaultHeading')}</h2>
      {data.subtext && <p className="mb-4 text-sm text-gray-500">{data.subtext}</p>}
      <div className="max-w-md space-y-3">
        <input disabled placeholder={t('sectionBuilder:sections.contactForm.namePlaceholder')} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
        <input disabled placeholder={t('sectionBuilder:sections.contactForm.emailPlaceholder')} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
        {data.show_phone_field && <input disabled placeholder={t('sectionBuilder:sections.contactForm.phonePlaceholder')} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />}
        {data.show_subject_field && <input disabled placeholder={t('sectionBuilder:sections.contactForm.subjectPlaceholder')} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />}
        <textarea disabled placeholder={t('sectionBuilder:sections.contactForm.messagePlaceholder')} rows={3} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
        <span className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">{t('sectionBuilder:sections.contactForm.sendButton')}</span>
      </div>
    </section>
  );
}

export default memo(ContactFormRenderer);
