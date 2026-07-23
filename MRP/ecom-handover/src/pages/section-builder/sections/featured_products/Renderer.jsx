import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import catalog from '../../mocks/catalog.json';

// TODO(catalog integration): sourced from the static mock fixture — swap
// for a real products API once one exists (see api/client.js's registerMock
// pattern, already used for /storefront/products).
function ProductCard({ product, showPrice }) {
  const { t } = useTranslation();
  return (
    <div className="text-left">
      <div className="mb-2 flex aspect-square items-center justify-center rounded-md bg-gray-100 text-gray-300">
        {product.image ? <img src={product.image} alt={product.name} className="h-full w-full rounded-md object-cover" /> : t('sectionBuilder:sections.common.noImage')}
      </div>
      <p className="text-sm font-medium text-gray-900">{product.name}</p>
      {showPrice !== false && (
        <p className="text-sm text-gray-500">
          {product.stock === 0 ? (
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
    </div>
  );
}

const DESKTOP_COLS_CLASS = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-3', '4': 'sm:grid-cols-4' };

function FeaturedProductsRenderer({ data, theme }) {
  const { t } = useTranslation();
  const bg = resolveColor(data.background_color, theme.colors);
  const count = data.products_to_show ?? 4;
  const products = catalog.products.slice(0, count);
  const colsClass = DESKTOP_COLS_CLASS[data.columns_desktop] ?? DESKTOP_COLS_CLASS['4'];

  return (
    <section style={{ backgroundColor: bg }} className="px-6 py-10">
      {data.show_heading !== false && (
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{data.heading || t('sectionBuilder:sections.featuredProducts.defaultHeading')}</h2>
      )}
      <div className={`grid grid-cols-2 gap-4 ${colsClass}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} showPrice={data.show_price} />
        ))}
      </div>
      {data.show_view_all !== false && (
        <p className="mt-6 text-sm font-medium text-gray-700 underline">{t('sectionBuilder:sections.featuredProducts.viewAll')}</p>
      )}
    </section>
  );
}

export default memo(FeaturedProductsRenderer);
