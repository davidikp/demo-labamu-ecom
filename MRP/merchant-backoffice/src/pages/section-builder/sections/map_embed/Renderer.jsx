import { memo } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BlockStream from '../../ui/BlockStream';
import EditableText from '../../ui/EditableText';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

// Simplification: no real Google Maps Embed API key/backend in this
// prototype — a static placeholder stands in for the interactive map.
function MapEmbedRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const height = mobile ? data.map_height_mobile ?? 250 : data.map_height ?? 400;

  return (
    <section className="px-6">
      <BlockStream
        sectionType="map_embed"
        blocks={blocks}
        theme={theme}
        mediaLibrary={mediaLibrary}
        blockCtx={blockCtx}
        className="mb-4 flex flex-col gap-1"
        isMobile={isMobile}
      />
      <div
        role="img"
        aria-label={t('sectionBuilder:sections.mapEmbed.mapAriaLabel')}
        className="flex items-center justify-center gap-1.5 rounded-md bg-gray-200 text-sm text-gray-400"
        style={{ height: `${height}px` }}
      >
        <MapPin size={16} aria-hidden /> {data.address || t('sectionBuilder:sections.mapEmbed.noAddress')}
      </div>
      {data.show_address_text !== false && (onEdit || data.address || data.store_hours || data.phone_number) && (
        <div className="mt-4 space-y-1 text-sm text-gray-600">
          {onEdit ? (
            <EditableText
              as="p"
              multiline
              value={data.address}
              placeholder={t('sectionBuilder:sections.mapEmbed.addressPlaceholder', 'Add your address…')}
              onCommit={(v) => onEdit('address', v)}
            />
          ) : (
            data.address && <p>{data.address}</p>
          )}
          {onEdit ? (
            <EditableText
              as="p"
              multiline
              className="whitespace-pre-line"
              value={data.store_hours}
              placeholder={t('sectionBuilder:sections.mapEmbed.storeHoursPlaceholder', 'Add store hours…')}
              onCommit={(v) => onEdit('store_hours', v)}
            />
          ) : (
            data.store_hours && <p className="whitespace-pre-line">{data.store_hours}</p>
          )}
          {onEdit ? (
            <EditableText
              as="p"
              value={data.phone_number}
              placeholder={t('sectionBuilder:sections.mapEmbed.phonePlaceholder', 'Add a phone number…')}
              onCommit={(v) => onEdit('phone_number', v)}
            />
          ) : (
            data.phone_number && <p>{data.phone_number}</p>
          )}
        </div>
      )}
    </section>
  );
}

export default memo(MapEmbedRenderer);
