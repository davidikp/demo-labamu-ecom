import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';

/** US-11.A1 — renders identically on every page (header/footer are global, see builderReducer.js). */
function HeaderRenderer({ data, theme }) {
  const { t } = useTranslation();
  const bg = resolveColor(data.background_color, theme.colors);
  const text = resolveColor(data.text_color, theme.colors);
  const links = data.nav_links ?? [
    { id: 'a', label: t('sectionBuilder:sections.header.defaultNavShop'), url: '/collections/all' },
    { id: 'b', label: t('sectionBuilder:sections.header.defaultNavAbout'), url: '/about' },
  ];

  return (
    <header style={{ backgroundColor: bg, color: text }} className="flex items-center justify-between px-6 py-4">
      <span className="text-lg font-semibold">{data.logo_text || t('sectionBuilder:sections.header.defaultStoreName')}</span>
      <nav className="hidden gap-5 text-sm sm:flex">
        {links.map((link) => (
          <span key={link.id ?? link.label}>{link.label || t('sectionBuilder:sections.common.link')}</span>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-sm">
        {data.show_search_icon !== false && <span aria-hidden>🔍</span>}
        {data.show_cart_icon !== false && <span aria-hidden>🛒</span>}
      </div>
    </header>
  );
}

export default memo(HeaderRenderer);
