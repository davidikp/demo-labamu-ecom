import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { resolveMedia } from '../../ui/fields/imageValue';

function ImageWithTextRenderer({ data, theme, mediaLibrary }) {
  const { t } = useTranslation();
  const bg = resolveColor(data.background_color, theme.colors);
  const text = resolveColor(data.text_color, theme.colors);
  const image = resolveMedia(data.image, mediaLibrary);
  const imageFirst = (data.image_position ?? 'left') === 'left';

  const imageBlock = (
    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-gray-100 text-gray-300">
      {image ? <img src={image.url} alt={image.filename} className="h-full w-full object-cover" /> : t('sectionBuilder:sections.common.noImage')}
    </div>
  );

  const textBlock = (
    <div style={{ color: text }} className="flex flex-col justify-center gap-3">
      {data.eyebrow_label && (
        <span style={{ color: resolveColor({ slot: 'accent' }, theme.colors) }} className="text-xs font-semibold uppercase tracking-wide">
          {data.eyebrow_label}
        </span>
      )}
      <h2 className="text-2xl font-semibold">{data.heading || t('sectionBuilder:sections.imageWithText.defaultHeading')}</h2>
      {data.body_text && <p className="text-sm opacity-80">{data.body_text}</p>}
      {data.show_button && data.button_label && (
        <span className="text-sm font-medium underline">{data.button_label}</span>
      )}
    </div>
  );

  return (
    <section style={{ backgroundColor: bg }} className="grid grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-2">
      {imageFirst ? (
        <>
          {imageBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {imageBlock}
        </>
      )}
    </section>
  );
}

export default memo(ImageWithTextRenderer);
