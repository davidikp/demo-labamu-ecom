import { memo } from 'react';
import { resolveMedia } from '../../ui/fields/imageValue';
import BlockStream from '../../ui/BlockStream';

const ALIGN_CLASS = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' };
const POSITION_CLASS = { top: 'justify-start', center: 'justify-center', bottom: 'justify-end' };

function HeroBannerRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx }) {
  const image = resolveMedia(data.background_image, mediaLibrary);
  const align = ALIGN_CLASS[data.text_alignment] ?? ALIGN_CLASS.left;
  const position = POSITION_CLASS[data.content_position] ?? POSITION_CLASS.center;

  return (
    <section
      className="relative flex justify-center overflow-hidden bg-cover bg-center px-6"
      style={{
        backgroundImage: image ? `url(${image.url})` : undefined,
        minHeight: `${data.min_height ?? 500}px`,
      }}
    >
      {image && (
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${(data.overlay_opacity ?? 0) / 100})` }} />
      )}
      <div className={`relative z-10 flex max-w-lg flex-col ${position}`}>
        <BlockStream
          sectionType="hero_banner"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className={`flex flex-col gap-4 ${align}`}
        />
      </div>
    </section>
  );
}

export default memo(HeroBannerRenderer);
