import { memo } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * US-11.A1 — renders identically on every page (header/footer are global,
 * see builderReducer.js). Branches on `data.layout_variant` (schema.js) so
 * each site template can pick a structurally distinct header identity
 * without any new data model beyond that one field — `inline` reproduces
 * the original single layout exactly, so existing drafts/tests without the
 * field are unaffected.
 */
function HeaderRenderer({ data, isMobile, onNavigate }) {
  const { t } = useTranslation();
  const links = data.nav_links ?? [
    { id: 'a', label: t('sectionBuilder:sections.header.defaultNavShop'), url: '/collections/all' },
    { id: 'b', label: t('sectionBuilder:sections.header.defaultNavAbout'), url: '/about' },
  ];
  const logoText = data.logo_text || t('sectionBuilder:sections.header.defaultStoreName');
  const variant = data.layout_variant || 'inline';

  // Show nav links whenever we're not explicitly in the builder's Mobile
  // viewport toggle. A `sm:` media-query class would depend on the actual
  // browser window's width — which doesn't reflect the builder's simulated
  // Desktop/Mobile toggle (a fixed-width div, not a real narrower window),
  // and isn't reliably ≥640px even for the live preview/storefront (zoom
  // level, window size, etc.). There's no mobile hamburger menu yet, so
  // defaulting to visible avoids the nav silently disappearing. Mutually
  // exclusive strings (never both `flex ...` and `hidden` at once) — Tailwind
  // resolves conflicting display utilities by stylesheet order, not by
  // string concatenation order, so appending "hidden" onto a "flex ..."
  // class string is not guaranteed to actually hide anything.
  const navClass = (base) => (isMobile ? 'hidden' : base);

  function renderLink(link, linkClassName) {
    // Only clickable on the read-only preview/live render (onNavigate is
    // only passed there, see Canvas.jsx's GlobalBlock) — inside the
    // interactive builder these stay plain text so clicking selects the
    // header instead of jumping the merchant to another page.
    return onNavigate ? (
      <a
        key={link.id ?? link.label}
        href={link.url || '#'}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(link.url);
        }}
        className={linkClassName + ' hover:underline'}
      >
        {link.label || t('sectionBuilder:sections.common.link')}
      </a>
    ) : (
      <span key={link.id ?? link.label} className={linkClassName}>
        {link.label || t('sectionBuilder:sections.common.link')}
      </span>
    );
  }

  function renderIcons() {
    return (
      <div className="flex items-center gap-3">
        {data.show_search_icon !== false && <Search size={18} aria-hidden />}
        {data.show_cart_icon !== false && <ShoppingBag size={18} aria-hidden />}
      </div>
    );
  }

  if (variant === 'centered-split') {
    // Nav links split into two groups flanking a centered logo — a clean,
    // symmetric layout (fits Manufacture's corporate/B2B feel).
    const half = Math.ceil(links.length / 2);
    const leftLinks = links.slice(0, half);
    const rightLinks = links.slice(half);
    return (
      <header className="grid grid-cols-3 items-center px-6 py-4">
        <nav className={navClass('flex gap-5 text-sm')}>{leftLinks.map((l) => renderLink(l, ''))}</nav>
        <span className="text-center text-lg font-semibold">{logoText}</span>
        <div className="flex items-center justify-end gap-5">
          <nav className={navClass('flex gap-5 text-sm')}>{rightLinks.map((l) => renderLink(l, ''))}</nav>
          {renderIcons()}
        </div>
      </header>
    );
  }

  if (variant === 'stacked-bold') {
    // Two-row header: a slim small-caps nav bar on top, then a large bold
    // uppercase logo row beneath — an energetic, layered identity.
    return (
      <header>
        <div className="flex items-center justify-between border-b border-current/10 px-6 py-2">
          <nav className={navClass('flex gap-4 text-[11px] uppercase tracking-wide')}>
            {links.map((l) => renderLink(l, ''))}
          </nav>
          {renderIcons()}
        </div>
        <div className="px-6 py-3">
          <span className="text-2xl font-extrabold uppercase tracking-tight">{logoText}</span>
        </div>
      </header>
    );
  }

  // 'inline' (default) — logo left, nav inline, icons right. Original layout.
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <span className="text-lg font-semibold">{logoText}</span>
      <nav className={navClass('flex gap-5 text-sm')}>{links.map((l) => renderLink(l, ''))}</nav>
      {renderIcons()}
    </header>
  );
}

export default memo(HeaderRenderer);
