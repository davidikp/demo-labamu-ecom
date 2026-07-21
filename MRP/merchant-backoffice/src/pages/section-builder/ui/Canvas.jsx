import { memo, useState } from 'react';
import { labelForType } from '../sections/registry';
import { hasNonDefaultContent } from '../sections/contentHelpers';
import { SECTION_DEFINITIONS } from '../sections/index';

const VIEWPORT_WIDTH = { desktop: 1280, mobile: 390 };

const RenderedEntity = memo(function RenderedEntity({ entity, theme, mediaLibrary }) {
  const Renderer = SECTION_DEFINITIONS[entity.type]?.Renderer;
  if (!Renderer) {
    return <p className="p-6 text-xs text-gray-400">Unknown section type: {entity.type}</p>;
  }
  return <Renderer data={entity.data ?? {}} theme={theme} mediaLibrary={mediaLibrary} isBuilder />;
});

const GlobalBlock = memo(function GlobalBlock({ entity, selected, onSelect, theme, mediaLibrary, readOnly }) {
  if (entity.hidden) {
    // On the live storefront a hidden header/footer simply isn't rendered;
    // the "hidden" placeholder is a builder-only affordance.
    if (readOnly) return null;
    return (
      <div
        onClick={() => onSelect(entity.type)}
        className="cursor-pointer border-b border-dashed border-gray-200 bg-gray-50 p-3 text-center text-xs text-gray-400"
      >
        {labelForType(entity.type)} hidden
      </div>
    );
  }
  return (
    <div
      onClick={readOnly ? undefined : () => onSelect(entity.type)}
      className={'relative ' + (readOnly ? '' : 'cursor-pointer ') + (selected ? 'outline outline-2 outline-blue-500' : '')}
    >
      {selected && !readOnly && (
        <span className="absolute left-2 top-2 z-10 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {labelForType(entity.type)}
        </span>
      )}
      <RenderedEntity entity={entity} theme={theme} mediaLibrary={mediaLibrary} />
    </div>
  );
});

/**
 * US-10.2 — memoized so editing one section's data (which only changes that
 * section's own object reference, see builderReducer.js's updatePage) does
 * not re-render sibling sections. `onSelect`/`onMove`/`onDuplicate`/`onDelete`
 * are the raw stable callbacks from SectionBuilder (useCallback'd there);
 * this component binds `section.id` itself so the props it receives never
 * change identity for unrelated edits.
 */
const SectionBlock = memo(function SectionBlock({ section, index, count, selected, onSelect, onMove, onDuplicate, onDelete, theme, mediaLibrary }) {
  const [confirming, setConfirming] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (hasNonDefaultContent(section)) {
      setConfirming(true);
    } else {
      onDelete(section.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(section.id)}
      className={'group relative cursor-pointer ' + (selected ? 'outline outline-2 outline-blue-500' : '')}
    >
      {selected && (
        <span className="absolute left-2 top-2 z-10 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {labelForType(section.type)}
        </span>
      )}

      <div className="absolute right-2 top-2 z-10 hidden items-center gap-1 rounded-md border border-gray-200 bg-white p-0.5 shadow-sm group-hover:flex">
        <button
          type="button"
          title="Move up"
          aria-label="Move section up"
          disabled={index === 0}
          onClick={(e) => { e.stopPropagation(); onMove(section.id, -1); }}
          className="rounded px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          title="Move down"
          aria-label="Move section down"
          disabled={index === count - 1}
          onClick={(e) => { e.stopPropagation(); onMove(section.id, 1); }}
          className="rounded px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          title="Duplicate"
          aria-label="Duplicate section"
          onClick={(e) => { e.stopPropagation(); onDuplicate(section.id); }}
          className="rounded px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
        >
          ⧉
        </button>
        <button
          type="button"
          title="Delete"
          aria-label="Delete section"
          onClick={handleDeleteClick}
          className="rounded px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50"
        >
          ✕
        </button>
      </div>

      {confirming ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 border-b border-dashed border-gray-200 bg-white p-4 text-sm text-gray-700"
        >
          <span>Delete this section? This can't be undone.</span>
          <button
            type="button"
            onClick={() => onDelete(section.id)}
            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <RenderedEntity entity={section} theme={theme} mediaLibrary={mediaLibrary} />
      )}
    </div>
  );
});

/**
 * Center canvas (US-1.1, US-2.1, US-3.3, US-3.4, US-3.6). Renders each
 * section's real Renderer (Epic 11) with a selection outline + hover action
 * bar layered on top.
 */
export default function Canvas({
  viewport,
  header,
  footer,
  sections,
  selectedId,
  onSelect,
  onDeselect,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  theme,
  mediaLibrary,
  readOnly = false,
}) {
  const isMobile = viewport === 'mobile';
  const width = VIEWPORT_WIDTH[viewport];

  return (
    <div className="min-w-[480px] flex-1 overflow-auto bg-gray-50 p-6" onClick={onDeselect}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          'mx-auto bg-white ' +
          (isMobile ? 'rounded-2xl border border-gray-300 shadow-sm' : 'shadow-sm')
        }
        style={{ width, maxWidth: '100%' }}
      >
        <GlobalBlock
          entity={header}
          selected={selectedId === 'header'}
          onSelect={onSelect}
          theme={theme}
          mediaLibrary={mediaLibrary}
          readOnly={readOnly}
        />

        {sections.length === 0 ? (
          !readOnly && (
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              No sections yet
            </div>
          )
        ) : readOnly ? (
          sections.map((section) => (
            <RenderedEntity key={section.id} entity={section} theme={theme} mediaLibrary={mediaLibrary} />
          ))
        ) : (
          sections.map((section, index) => (
            <SectionBlock
              key={section.id}
              section={section}
              index={index}
              count={sections.length}
              selected={selectedId === section.id}
              onSelect={onSelect}
              onMove={onMoveSection}
              onDuplicate={onDuplicateSection}
              onDelete={onDeleteSection}
              theme={theme}
              mediaLibrary={mediaLibrary}
            />
          ))
        )}

        <GlobalBlock
          entity={footer}
          selected={selectedId === 'footer'}
          onSelect={onSelect}
          theme={theme}
          mediaLibrary={mediaLibrary}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
