import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import catalog from '../../mocks/catalog.json';

const COLS_CLASS = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-3', '4': 'sm:grid-cols-4' };

// TODO(catalog integration): sourced from the static mock fixture, same as
// Featured Products — no collection-picker field exists yet to let the
// merchant choose a subset.
function CollectionListRenderer({ data, theme }) {
  const { t } = useTranslation();
  const bg = resolveColor(data.background_color, theme.colors);
  const colsClass = COLS_CLASS[data.columns_desktop] ?? COLS_CLASS['3'];

  return (
    <section style={{ backgroundColor: bg }} className="px-6 py-10">
      {data.show_heading !== false && (
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{data.heading || t('sectionBuilder:sections.collectionList.defaultHeading')}</h2>
      )}
      <div className={`grid grid-cols-2 gap-4 ${colsClass}`}>
        {catalog.collections.map((collection) => (
          <div key={collection.id}>
            <div className="mb-2 flex aspect-square items-center justify-center rounded-md bg-gray-100 text-gray-300">
              {t('sectionBuilder:sections.common.noImage')}
            </div>
            {data.show_collection_title !== false && (
              <p className="text-sm font-medium text-gray-900">{collection.name}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(CollectionListRenderer);
