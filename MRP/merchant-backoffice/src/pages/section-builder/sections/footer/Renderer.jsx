import { memo } from 'react';
import { useTranslation } from 'react-i18next';

function FooterRenderer({ data }) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const columns = (data.link_columns ?? []).filter((c) => (c.links ?? []).length > 0);

  return (
    <footer className="px-6 py-8">
      {data.tagline && <p className="mb-4 max-w-sm text-sm opacity-80">{data.tagline}</p>}
      {columns.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-8">
          {columns.map((col) => (
            <div key={col.id}>
              <p className="mb-2 text-sm font-semibold">{col.heading || t('sectionBuilder:sections.footer.linksHeading')}</p>
              <ul className="space-y-1 text-sm opacity-80">
                {(col.links ?? []).map((link) => (
                  <li key={link.id ?? link.label}>{link.label || t('sectionBuilder:sections.common.link')}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs opacity-70">
        <span>{data.copyright_text || t('sectionBuilder:sections.footer.copyright', { year: currentYear })}</span>
        {data.show_social_icons !== false && <span className="flex gap-2">{t('sectionBuilder:sections.footer.socialPlaceholder')}</span>}
      </div>
    </footer>
  );
}

export default memo(FooterRenderer);
