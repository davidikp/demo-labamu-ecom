import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import catalog from '../../mocks/catalog.json';
import EditableText from '../../ui/EditableText';
import { resolveMedia } from '../../ui/fields/imageValue';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4' };

// TODO(catalog integration): sourced from the static mock fixture — swap for
// a real collections API once one exists.
//
// `data.collections` is a repeater where each item picks its own source:
// a real catalog collection (by handle) or fully custom title/image/url —
// resolved here into one normalized { id, name, image, url } shape so the
// render branches below don't need to care which it was.
// Empty/unset falls back to "show everything" in the catalog — the
// original, pre-picker behavior — so sections saved before this field
// existed don't suddenly render nothing.
function collectionsForSection(data, mediaLibrary) {
  const items = data.collections ?? [];
  if (!items.length) return catalog.collections;
  return items
    .map((item) => {
      if (item.source === 'custom') {
        return { id: item.id, name: item.title, image: resolveMedia(item.image, mediaLibrary)?.url ?? null, url: item.url };
      }
      const collection = catalog.collections.find((c) => c.handle === item.handle);
      return collection ? { id: item.id, name: collection.name, image: collection.image, url: `/collections/${collection.handle}` } : null;
    })
    .filter(Boolean);
}

function CollectionListRenderer({ data, onEdit, isMobile, breakpoint, mediaLibrary }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const collections = collectionsForSection(data, mediaLibrary);
  // See map_embed/testimonials/etc Renderer.jsx — the builder/preview canvas
  // simulates each device as a fixed-width frame inside a real (usually
  // wide) browser, so this reads the `breakpoint` prop Canvas.jsx already
  // passes down rather than a CSS breakpoint. Only meaningful for 'cards' —
  // 'circular' wraps naturally via flexbox, no fixed column count.
  const columns = mobile
    ? data.columns_mobile ?? '2'
    : breakpoint === 'tablet'
      ? data.columns_tablet ?? '3'
      : data.columns_desktop ?? '3';
  const colsClass = COLS_CLASS[columns] ?? 'grid-cols-2';
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
      {data.display_style === 'circular' ? (
        // Xinear-style compact icon-shortcut row — a single edge-to-edge
        // row of rounded-square thumbnails (not full circles; Figma's
        // reference uses 190x190 rounded squares). columns_desktop,
        // columns_mobile, and image_aspect_ratio are intentionally ignored
        // here, they only apply to the 'cards' display style.
        // `sm:` (a real, ≥640px browser-width media query) doesn't reflect
        // the builder canvas's simulated device frame — see
        // useResponsiveMobile.js — so this reads the same `mobile` boolean
        // used above instead of a CSS breakpoint.
        <div className={`flex flex-wrap justify-center gap-6 ${mobile ? '' : 'justify-between'}`}>
          {collections.map((collection) => (
            <div key={collection.id} className={`flex flex-col items-center gap-2 ${mobile ? 'w-20' : 'w-auto flex-1'}`}>
              <div className={`flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-gray-300 ${mobile ? 'w-20' : 'w-full'}`}>
                {collection.image ? (
                  <img src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
                ) : (
                  t('sectionBuilder:sections.common.noImage')
                )}
              </div>
              {data.show_collection_title !== false && (
                <p className="text-center text-sm font-medium text-gray-900">{collection.name}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${colsClass}`}>
          {collections.map((collection) => (
            <div key={collection.id}>
              <div className={`mb-2 flex items-center justify-center overflow-hidden rounded-md bg-gray-100 text-gray-300 ${aspectClass}`}>
                {collection.image ? (
                  <img src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
                ) : (
                  t('sectionBuilder:sections.common.noImage')
                )}
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
