import { memo } from 'react';
import { Search, ShoppingBag, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';

/**
 * US-11.A1 — renders identically on every page (header/footer are global,
 * see builderReducer.js). Branches on `data.layout_variant` (schema.js) so
 * each site template can pick a structurally distinct header identity
 * without any new data model beyond that one field — `inline` reproduces
 * the original single layout exactly, so existing drafts/tests without the
 * field are unaffected.
 */
function HeaderRenderer({ data, isMobile, onNavigate, theme, mediaLibrary, currentPath }) {
  const { t } = useTranslation();
  const links = data.nav_links ?? [
    { id: 'a', label: t('sectionBuilder:sections.header.defaultNavShop'), url: '/collections/all' },
    { id: 'b', label: t('sectionBuilder:sections.header.defaultNavAbout'), url: '/about' },
  ];
  const logoText = data.logo_text || t('sectionBuilder:sections.header.defaultStoreName');
  const logoImage = resolveMedia(data.logo_image, mediaLibrary);
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
    // Active-state comparison: `currentPath` is optional and undefined by
    // default (only threaded through by PreviewLive.jsx and
    // SectionBuilder.jsx's own live canvas today — see Canvas.jsx). When
    // it's undefined, `isActive` is `null` and we fall through to the
    // original uniform class untouched, so any call site that hasn't been
    // updated to pass `currentPath` renders byte-identical to before.
    const isActive = currentPath != null ? link.url === currentPath : null;
    const className = isActive === true ? linkClassName + ' font-bold opacity-100' : linkClassName;
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
        className={className + ' hover:underline'}
      >
        {link.label || t('sectionBuilder:sections.common.link')}
      </a>
    ) : (
      <span key={link.id ?? link.label} className={className}>
        {link.label || t('sectionBuilder:sections.common.link')}
      </span>
    );
  }

  function renderLogo(baseClassName) {
    // When no logo_image is set, keep the exact original single-span
    // markup (no wrapper, no extra classes) so every existing header
    // without this field renders byte-identical to before.
    if (!logoImage) {
      return <span className={baseClassName}>{logoText}</span>;
    }
    return (
      <span className={'inline-flex items-center gap-2 ' + baseClassName}>
        <img src={logoImage.url} alt="" aria-hidden className="h-6 w-6" />
        <span>{logoText}</span>
      </span>
    );
  }

  function renderLanguageSwitcher() {
    // Decorative-only — this pill is NOT wired to any real i18n/locale
    // mechanism. It exists purely to reproduce Figma's visual (border pill +
    // globe icon + "EN" + chevron). This app's real language switching (if
    // any) lives entirely elsewhere; do not mistake this for a functional
    // control or wire it up to change locale.
    return (
      <span className="flex items-center gap-1 rounded-full border border-current/20 px-2 py-1 text-xs">
        <Globe size={14} aria-hidden />
        <span>EN</span>
        <ChevronDown size={12} aria-hidden />
      </span>
    );
  }

  function renderIcons() {
    return (
      <div className="flex items-center gap-3">
        {data.show_search_icon !== false && <Search size={18} aria-hidden />}
        {data.show_cart_icon !== false && <ShoppingBag size={18} aria-hidden />}
        {data.show_language_switcher && renderLanguageSwitcher()}
      </div>
    );
  }

  const borderStyle = data.show_border
    ? { borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: theme?.colors?.border || undefined }
    : undefined;
  const borderClass = data.show_border && !theme?.colors?.border ? 'border-b border-gray-200' : '';
  const withBorder = (base) => (borderClass ? base + ' ' + borderClass : base);

  if (variant === 'centered-nav') {
    // Logo/icons columns size to their own content (`auto`); the nav column
    // takes the rest (`1fr`) — a plain `grid-cols-3` would instead force all
    // three into equal thirds, squeezing the nav into a column far narrower
    // than the logo/icon columns actually need and wrapping multi-word
    // labels even though the row has visible spare width either side.
    return (
      <header className={withBorder('grid grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4')} style={borderStyle}>
        <div className="flex items-center justify-start">{renderLogo('text-lg font-semibold')}</div>
        <nav className={navClass('flex items-center justify-center gap-5 text-sm whitespace-nowrap')}>
          {links.map((l) => renderLink(l, ''))}
        </nav>
        <div className="flex items-center justify-end">{renderIcons()}</div>
      </header>
    );
  }

  if (variant === 'centered-split') {
    // Nav links split into two groups flanking a centered logo — a clean,
    // symmetric layout (fits Manufacture's corporate/B2B feel).
    const half = Math.ceil(links.length / 2);
    const leftLinks = links.slice(0, half);
    const rightLinks = links.slice(half);
    return (
      <header className={withBorder('grid grid-cols-3 items-center px-6 py-4')} style={borderStyle}>
        <nav className={navClass('flex gap-5 text-sm')}>{leftLinks.map((l) => renderLink(l, ''))}</nav>
        {renderLogo('text-center text-lg font-semibold')}
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
      <header className={borderClass || undefined} style={borderStyle}>
        <div className="flex items-center justify-between border-b border-current/10 px-6 py-2">
          <nav className={navClass('flex gap-4 text-[11px] uppercase tracking-wide')}>
            {links.map((l) => renderLink(l, ''))}
          </nav>
          {renderIcons()}
        </div>
        <div className="px-6 py-3">{renderLogo('text-2xl font-extrabold uppercase tracking-tight')}</div>
      </header>
    );
  }

  // 'inline' (default) — logo left, nav inline, icons right. Original layout.
  return (
    <header className={withBorder('flex items-center justify-between px-6 py-4')} style={borderStyle}>
      {renderLogo('text-lg font-semibold')}
      <nav className={navClass('flex gap-5 text-sm')}>{links.map((l) => renderLink(l, ''))}</nav>
      {renderIcons()}
    </header>
  );
}

export default memo(HeaderRenderer);
