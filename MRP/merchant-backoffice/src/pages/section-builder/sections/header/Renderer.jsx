import { memo } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** US-11.A1 — renders identically on every page (header/footer are global, see builderReducer.js). */
function HeaderRenderer({ data }) {
  const { t } = useTranslation();
  const links = data.nav_links ?? [
    { id: 'a', label: t('sectionBuilder:sections.header.defaultNavShop'), url: '/collections/all' },
    { id: 'b', label: t('sectionBuilder:sections.header.defaultNavAbout'), url: '/about' },
  ];

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <span className="text-lg font-semibold">{data.logo_text || t('sectionBuilder:sections.header.defaultStoreName')}</span>
      <nav className="hidden gap-5 text-sm sm:flex">
        {links.map((link) => (
          <span key={link.id ?? link.label}>{link.label || t('sectionBuilder:sections.common.link')}</span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        {data.show_search_icon !== false && <Search size={18} aria-hidden />}
        {data.show_cart_icon !== false && <ShoppingBag size={18} aria-hidden />}
      </div>
    </header>
  );
}

export default memo(HeaderRenderer);
