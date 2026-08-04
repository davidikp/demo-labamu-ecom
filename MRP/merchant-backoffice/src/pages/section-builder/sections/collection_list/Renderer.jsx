import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';
import BlockStream from '../../ui/BlockStream';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4' };

// TODO(catalog integration): sourced from the static mock fixture, same as
// Featured Products — no collection-picker field exists yet to let the
// merchant choose a subset.
function CollectionListRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const colsClass = COLS_CLASS[mobile ? data.columns_mobile ?? '2' : data.columns_desktop ?? '3'] ?? 'grid-cols-2';
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
            placeholder={t('sectionBuilder:sections.collectionList.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.collectionList.defaultHeading')}</h2>
        )
      )}
      {data.source_mode === 'manual' ? (
        <BlockStream
          sectionType="collection_list"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className={`grid gap-4 ${colsClass}`}
          isMobile={isMobile}
        />
      ) : (
        <div className={`grid gap-4 ${colsClass}`}>
          {catalog.collections.map((collection) => (
            <div key={collection.id}>
              <div className={`mb-2 flex items-center justify-center rounded-md bg-gray-100 text-gray-300 ${aspectClass}`}>
                {t('sectionBuilder:sections.common.noImage')}
              </div>
              {data.show_collection_title !== false && (
                <p className="text-sm font-medium text-gray-900">{collection.name}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(CollectionListRenderer);
