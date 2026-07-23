import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { resolveMedia } from '../../ui/fields/imageValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';

const ALIGN_CLASS = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' };

function HeroBannerRenderer({ data, theme, mediaLibrary }) {
  const { t } = useTranslation();
  const bg = resolveColor(data.background_color, theme.colors);
  const text = resolveColor(data.text_color, theme.colors);
  const image = resolveMedia(data.background_image, mediaLibrary);
  const align = ALIGN_CLASS[data.text_alignment] ?? ALIGN_CLASS.left;

  return (
    <section
      className="relative flex justify-center overflow-hidden bg-cover bg-center px-6 py-16"
      style={{
        backgroundColor: image ? undefined : bg,
        backgroundImage: image ? `url(${image.url})` : undefined,
        minHeight: `${data.min_height ?? 500}px`,
      }}
    >
      {image && (
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${(data.overlay_opacity ?? 0) / 100})` }} />
      )}
      <div className={`relative z-10 flex max-w-lg flex-col justify-center gap-4 ${align}`} style={{ color: text }}>
        <h1 className="text-3xl font-bold">{data.heading || t('sectionBuilder:sections.heroBanner.defaultHeading')}</h1>
        {data.subtext && <p className="text-base opacity-90">{data.subtext}</p>}
        <span style={themedButtonStyle(theme.buttons, { primary: resolveColor({ slot: 'primary' }, theme.colors), primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) })}>
          {data.button_label || t('sectionBuilder:sections.heroBanner.defaultButtonText')}
        </span>
      </div>
    </section>
  );
}

export default memo(HeroBannerRenderer);
