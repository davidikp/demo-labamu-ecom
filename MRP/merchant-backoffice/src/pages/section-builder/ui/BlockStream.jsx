import BlockBoundary from './BlockBoundary';
import AddBlockControl from './AddBlockControl';
import { blockDef } from '../sections/blocks/registry';

/**
 * Renders a section's (or group's) blocks in order, each via its registry
 * Renderer, wrapped in a selectable BlockBoundary with inline-edit wiring
 * (builder mode only). Container blocks (groups) receive a derived `childCtx`
 * so their nested BlockStream can select/edit/add their children.
 *
 * `sectionType` powers the Add-block type list; `addTypes` overrides it for a
 * group's allowed child types. `gated` (default true) only shows the on-canvas
 * Add control once a block is active — nested groups pass gated={false} so the
 * add control is always visible inside an open group.
 */
export default function BlockStream({
  sectionType,
  addTypes,
  blocks = [],
  theme,
  mediaLibrary,
  blockCtx,
  className = 'flex flex-col gap-4',
  itemClassName,
  gated = true,
  hideAdd = false,
  isMobile,
}) {
  const showAdd = !hideAdd && blockCtx && !blockCtx.atMax && (!gated || blockCtx.selectedBlockId || blockCtx.sectionActive);
  return (
    <>
      <div className={className}>
        {blocks.map((b) => {
          const def = blockDef(b.type);
          if (!def?.Renderer) return null;
          const Cmp = def.Renderer;

          // Derive a child context for container (group) blocks — recurses to
          // any nesting depth via blockCtx.childCtxFor, so a group nested
          // inside a group inside a group still gets working select/edit/add.
          const childCtx = def.container && blockCtx ? blockCtx.childCtxFor(b.id) : undefined;

          return (
            <BlockBoundary
              key={b.id}
              selected={blockCtx?.selectedBlockId === b.id}
              onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
              label={def.label}
            >
              <div className={itemClassName}>
                <Cmp
                  block={b}
                  theme={theme}
                  mediaLibrary={mediaLibrary}
                  onEdit={blockCtx ? (key, value) => blockCtx.onEdit(b.id, key, value) : undefined}
                  childCtx={childCtx}
                  isMobile={isMobile}
                />
              </div>
            </BlockBoundary>
          );
        })}
      </div>

      {showAdd && (
        <AddBlockControl sectionType={sectionType} types={addTypes} atMax={blockCtx.atMax} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" />
      )}
    </>
  );
}
