import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * US-11.A2 — renders identically on every page (header/footer are global,
 * see builderReducer.js). Branches on `data.layout_variant` (schema.js) so
 * each site template can pick a structurally distinct footer identity
 * without any new data model beyond that one field — `columns` reproduces
 * the original single layout exactly, so existing drafts/tests without the
 * field are unaffected. Mirrors the pattern in `header/Renderer.jsx`.
 */
function FooterRenderer({ data, onNavigate }) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const columns = (data.link_columns ?? []).filter((c) => (c.links ?? []).length > 0);
  const variant = data.layout_variant || 'columns';
  const copyright = data.copyright_text || t('sectionBuilder:sections.footer.copyright', { year: currentYear });

  function renderLink(link) {
    return onNavigate ? (
      <a
        key={link.id ?? link.label}
        href={link.url || '#'}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(link.url);
        }}
        className="hover:underline"
      >
        {link.label || t('sectionBuilder:sections.common.link')}
      </a>
    ) : (
      <span key={link.id ?? link.label}>{link.label || t('sectionBuilder:sections.common.link')}</span>
    );
  }

  if (variant === 'minimal-bar') {
    // A single slim row — copyright and social icons only, tagline and link
    // columns dropped entirely for a lean, understated footer.
    return (
      <footer className="flex items-center justify-between px-6 py-4 text-xs opacity-70">
        <span>{copyright}</span>
        {data.show_social_icons !== false && <span className="flex gap-2">{t('sectionBuilder:sections.footer.socialPlaceholder')}</span>}
      </footer>
    );
  }

  if (variant === 'centered-tagline') {
    // Centered tagline above a centered copyright line — no link columns,
    // a quieter, editorial-feeling footer.
    return (
      <footer className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        {data.tagline && <p className="max-w-sm text-sm opacity-80">{data.tagline}</p>}
        <div className="flex items-center gap-3 text-xs opacity-70">
          <span>{copyright}</span>
          {data.show_social_icons !== false && <span className="flex gap-2">{t('sectionBuilder:sections.footer.socialPlaceholder')}</span>}
        </div>
      </footer>
    );
  }

  // 'columns' (default) — tagline, link columns, and a bottom bar. Original layout.
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
                  <li key={link.id ?? link.label}>{renderLink(link)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs opacity-70">
        <span>{copyright}</span>
        {data.show_social_icons !== false && <span className="flex gap-2">{t('sectionBuilder:sections.footer.socialPlaceholder')}</span>}
      </div>
    </footer>
  );
}

export default memo(FooterRenderer);
