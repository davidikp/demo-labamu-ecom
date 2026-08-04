import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';
import BlockStream from '../../ui/BlockStream';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

// TODO(catalog integration): sourced from the static mock fixture — swap
// for a real products API once one exists (see api/client.js's registerMock
// pattern, already used for /storefront/products).
function ProductCard({ product, showPrice, showQuickAdd, aspectClass }) {
  const { t } = useTranslation();
  const soldOut = product.stock === 0;
  return (
    <div className="text-left">
      <div className={`mb-2 flex items-center justify-center rounded-md bg-gray-100 text-gray-300 ${aspectClass}`}>
        {product.image ? <img src={product.image} alt={product.name} className="h-full w-full rounded-md object-cover" /> : t('sectionBuilder:sections.common.noImage')}
      </div>
      <p className="text-sm font-medium text-gray-900">{product.name}</p>
      {showPrice !== false && (
        <p className="text-sm text-gray-500">
          {soldOut ? (
            <span className="font-medium text-gray-400">{t('sectionBuilder:sections.featuredProducts.soldOut')}</span>
          ) : (
            <>
              ${product.price.toFixed(2)}
              {product.compareAtPrice && (
                <span className="ml-1 text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
              )}
            </>
          )}
        </p>
      )}
      {showQuickAdd && !soldOut && (
        <button
          type="button"
          disabled
          className="mt-2 w-full rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          {t('sectionBuilder:sections.featuredProducts.quickAdd', 'Add to cart')}
        </button>
      )}
    </div>
  );
}

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4' };

function FeaturedProductsRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const count = data.products_to_show ?? 4;
  const products = catalog.products.slice(0, count);
  const colsClass = COLS_CLASS[mobile ? data.columns_mobile ?? '2' : data.columns_desktop ?? '4'] ?? 'grid-cols-2';
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;
  const aspectClass = ASPECT_RATIO_CLASS[data.image_aspect_ratio] ?? ASPECT_RATIO_CLASS.square;

  return (
    <section className="px-6">
      {data.show_heading !== false && (
        onEdit ? (
          <EditableText
            as="h2"
            className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.featuredProducts.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.featuredProducts.defaultHeading')}</h2>
        )
      )}
      {data.source_mode === 'manual' ? (
        <BlockStream
          sectionType="featured_products"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className={`grid gap-4 ${colsClass}`}
          isMobile={isMobile}
        />
      ) : (
        <div className={`grid gap-4 ${colsClass}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showPrice={data.show_price} showQuickAdd={data.show_quick_add} aspectClass={aspectClass} />
          ))}
        </div>
      )}
      {data.show_view_all !== false && (
        <p className="mt-6 text-sm font-medium text-gray-700 underline">{t('sectionBuilder:sections.featuredProducts.viewAll')}</p>
      )}
    </section>
  );
}

export default memo(FeaturedProductsRenderer);
