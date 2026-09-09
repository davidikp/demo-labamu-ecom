import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle, themedButtonHoverStyle } from './themedButtonStyle';
import { themedCardStyle, CARD_SHADOW_CSS } from './themedLayout';
import { buildProductPath } from './productSource';
import ThemedButtonHover from './ThemedButtonHover';

/**
 * @module section-builder/sections/shared/ProductCard
 * @description Shared product-card visual primitive for `featured_products`
 * and `product_carousel` (both previously hand-rolled near-identical
 * image/title/price/quick-add markup independently). Everything about how a
 * product card *looks* — border, radius, hover shadow, title clamp/size,
 * price weight, quick-add button — is theme-driven (`theme.layout`,
 * `theme.colors`, `theme.buttons`), never hardcoded per-theme, so a theme
 * like Houzez reaches its golden-reference card look purely through token
 * values, not a special-cased card component.
 *
 * `product_spotlight` is intentionally NOT built on this — it's a single
 * large PDP-style split layout (image + details panel), not a repeated grid
 * card, so it doesn't share this component's visual concerns.
 */
function ProductCard({ product, theme, showPrice, showQuickAdd, aspectClass, widthStyle, onQuickAddClick, onNavigate }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const soldOut = product.stock === 0;
  const layout = theme?.layout ?? {};
  const cardStyle = themedCardStyle(layout);
  const border = layout.card_border !== false ? theme?.colors?.border : undefined;
  const hoverShadow = hovered ? CARD_SHADOW_CSS[layout.card_shadow] ?? 'none' : 'none';
  // Optional — `onNavigate` is only wired for callers that render a real
  // storefront (see catalog_list/Renderer.jsx's identical pattern); a
  // caller that doesn't pass it (e.g. a context this card isn't clickable
  // in) renders exactly as before, non-interactive.
  const handleClick = onNavigate && product.handle ? () => onNavigate(buildProductPath(product.handle)) : undefined;

  return (
    <div
      className={`flex flex-col text-left ${handleClick ? 'cursor-pointer' : ''}`}
      style={{
        ...cardStyle,
        boxShadow: hoverShadow,
        border: border ? `1px solid ${border}` : undefined,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease',
        ...widthStyle,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      role={handleClick ? 'link' : undefined}
    >
      <div className={`flex items-center justify-center bg-gray-50 text-gray-300 ${aspectClass}`}>
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          t('sectionBuilder:sections.common.noImage')
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p
          className="mb-1 overflow-hidden text-gray-600"
          style={{
            fontSize: '13px',
            lineHeight: 1.5,
            fontWeight: 500,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.name}
        </p>
        {showPrice !== false && (
          <p className="mt-auto text-[15px] font-bold text-gray-900">
            {soldOut ? (
              <span className="text-sm font-medium text-gray-400">{t('sectionBuilder:sections.common.soldOut', 'Sold out')}</span>
            ) : (
              <>
                {typeof product.price === 'string' ? product.price : `$${product.price.toFixed(2)}`}
                {product.compareAtPrice && (
                  <span className="ml-1 text-sm font-normal text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
                )}
              </>
            )}
          </p>
        )}
        {showQuickAdd && !soldOut && (() => {
          const quickAddPrimary = resolveColor({ slot: 'primary' }, theme.colors);
          const quickAddStyle = themedButtonStyle(theme.buttons, { primary: quickAddPrimary, primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) });
          const quickAddHoverStyle = themedButtonHoverStyle(theme.buttons, quickAddStyle, quickAddPrimary);
          return (
            <div className="mt-3">
              <ThemedButtonHover
                as="button"
                type="button"
                disabled
                onClick={(e) => { e.stopPropagation(); onQuickAddClick?.(e); }}
                className="w-full text-xs font-semibold"
                style={quickAddStyle}
                hoverStyle={quickAddHoverStyle}
              >
                {t('sectionBuilder:sections.common.addToCart', 'Add to cart')}
              </ThemedButtonHover>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default ProductCard;
