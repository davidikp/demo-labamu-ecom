import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';

/** US-11.A1 — renders identically on every page (header/footer are global, see builderReducer.js). */
function HeaderRenderer({ data, theme }) {
  const bg = resolveColor(data.background_color, theme.colors);
  const text = resolveColor(data.text_color, theme.colors);
  const links = data.nav_links ?? [
    { id: 'a', label: 'Shop', url: '/collections/all' },
    { id: 'b', label: 'About', url: '/about' },
  ];

  return (
    <header style={{ backgroundColor: bg, color: text }} className="flex items-center justify-between px-6 py-4">
      <span className="text-lg font-semibold">{data.logo_text || 'My Store'}</span>
      <nav className="hidden gap-5 text-sm sm:flex">
        {links.map((link) => (
          <span key={link.id ?? link.label}>{link.label || 'Link'}</span>
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
