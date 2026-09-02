import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { Table, MainBtn, TextField, Popup } from '../../ce-ui';
import { loadDraft } from '../section-builder/state/storage';
import { createFreshState } from '../section-builder/state/useSectionBuilder';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS, PROTECTED_MENU_IDS } from '../section-builder/state/builderReducer';
import { slugify } from '../section-builder/sections/pageHelpers';
import PageLinkCombobox from '../section-builder/ui/fields/PageLinkCombobox';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// PagesManagement.jsx/FilesManagement.jsx.
const STORE_ID = 'demo';

/**
 * One draggable, inline-editable row of the menu items table — drag handle
 * + Label input + link combobox + delete, columns matching the header row
 * in MenuFormDrawer below exactly. Uses the same `useSortable` pattern as
 * RepeaterField.jsx/SectionListItem.jsx (this codebase's only existing
 * drag-reorder mechanism) rather than a bespoke DnD implementation.
 */
function MenuItemRow({ item, pages, onChange, onRemove }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex h-[49px] items-center gap-2 border-b border-lb-line-1 bg-lb-surface px-4 last:rounded-b-lg last:border-b-0"
    >
      <span
        aria-label={t('sectionBuilder:fields.repeaterField.dragToReorder', 'Drag to reorder')}
        className="w-5 shrink-0 cursor-grab touch-none text-lb-on-surface-3 hover:text-lb-on-surface"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </span>
      <input
        type="text"
        value={item.label}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder={t('sectionBuilder:onlineStore.menus.labelPlaceholder', 'e.g. About us')}
        className="w-1/2 rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
      <PageLinkCombobox
        value={item.url}
        onChange={(url) => onChange({ url })}
        pages={pages}
        placeholder={t('sectionBuilder:onlineStore.menus.linkSearchPlaceholder', 'Search or paste link')}
        className="w-1/2"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('sectionBuilder:editor.common.delete', 'Delete')}
        className="w-5 shrink-0 text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

/**
 * Menu form — a wide, centered ce-ui `Popup` (not a hand-built slide-in
 * panel). Investigation of demo-mrp's own "drawer" components (which this
 * screen was originally asked to match) showed they aren't true side panels
 * either: `GeneralModal` there is just the same vendored `Popup` given a
 * custom wide `width` via a CSS-var className override, wrapping ordinary
 * centered-modal content. So this follows that same pattern on top of this
 * codebase's own `Popup` (ce-ui/ui/popup.tsx) rather than inventing a
 * side-anchored layout `Popup` doesn't support: `platform="desktop"` for its
 * centered/scroll-body layout, widened past its default `w-[560px]` via the
 * `menu-form-popup` class (see index.css) — the same "static override class
 * + !important" trick demo-mrp's `.gm-modal-width` uses, since `cn()` here
 * is a plain string join (no tailwind-merge) so a later utility class in the
 * className string isn't guaranteed to win in the compiled stylesheet, and a
 * literal `w-[720px]` string can't be authored dynamically through Tailwind's
 * static class scanner anyway.
 *
 * `Popup` only supports a fixed primary/secondary action-button pair (see
 * popup.tsx), not arbitrary footer JSX, so the conditionally-shown Delete
 * button (left-aligned, separate from Cancel/Save) can't live in that row —
 * it's rendered as part of the Popup's own scrollable children instead,
 * pinned above the built-in Cancel/Save row via a top border, rather than
 * fighting Popup's footer API.
 *
 * One single form covers both "create a new menu" (empty name, no items)
 * and "edit an existing menu" (pre-filled) — Shopify's own menu editor
 * doesn't split naming a menu from populating it into two steps, and
 * there's no reason for this screen's mental model to add one. Mirrors the
 * label+url add/reorder/remove UX of RepeaterField.jsx's nav-link items,
 * but commits name+items together in one ACTIONS.SAVE_MENU action on Save
 * rather than dispatching per-edit — there's no live undo/redo history to
 * coalesce into outside the Section Builder itself (see runDraftAction.js).
 */
function MenuFormDrawer({ menu, isNew, pages, onSave, onClose, onRequestDelete }) {
  const { t } = useTranslation();
  const [name, setName] = useState(menu?.name ?? '');
  const [items, setItems] = useState(() => (menu?.items ?? []).map((item) => ({ ...item })));
  const handle = slugify(name);

  // Popup (ce-ui/ui/popup.tsx) already locks body scroll while `open` itself,
  // but has no Escape-to-close handling of its own — kept here so this form
  // doesn't regress the keyboard behavior the previous hand-built drawer had.
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // The two default menus ('main-menu'/'footer-menu') can never be deleted —
  // Header/Footer's `nav_menu_ref` defaults point at those fixed ids — so
  // Delete is only ever offered for an existing, non-protected (custom)
  // menu; never shown at all in create mode.
  const canDelete = !isNew && menu?.id && !PROTECTED_MENU_IDS.includes(menu.id);

  const addItem = () => {
    // url starts as '' (not '/') so the Link input shows its "Search or
    // paste link" placeholder for a brand-new blank item instead of looking
    // like it already has a real value — PageLinkCombobox and the
    // SAVE_MENU/render paths (header/footer Renderer.jsx) already treat an
    // empty url as just another free-text value, so no fallback is needed.
    setItems((prev) => [...prev, { id: crypto.randomUUID(), label: '', url: '' }]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  // Same dnd-kit sensor set as RepeaterField.jsx/SectionListItem.jsx (the
  // only existing drag-reorder mechanism in this codebase) so this list's
  // drag handle behaves identically — pointer with a small activation
  // distance (so a plain click into an input doesn't start a drag), touch
  // with a short delay, and keyboard support for free.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const ids = prev.map((item) => item.id);
      return arrayMove(prev, ids.indexOf(active.id), ids.indexOf(over.id));
    });
  };

  return (
    <Popup
      open
      onClose={onClose}
      platform="desktop"
      align="left"
      className="menu-form-popup"
      testId="menu-form-drawer"
      title={
        isNew
          ? t('sectionBuilder:onlineStore.menus.createMenuTitle', 'Add New Menu')
          : t('sectionBuilder:onlineStore.menus.editMenuTitle', 'Edit Menu')
      }
      secondaryAction={{
        label: t('sectionBuilder:editor.common.cancel', 'Cancel'),
        onClick: onClose,
      }}
      primaryAction={{
        label: t('sectionBuilder:onlineStore.menus.save', 'Save'),
        onClick: () => onSave({ name: name.trim(), items }),
        disabled: !name.trim(),
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <TextField
            label={t('sectionBuilder:onlineStore.menus.nameLabel', 'Name')}
            size="lg"
            autoFocus={isNew}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('sectionBuilder:onlineStore.menus.namePlaceholder', 'e.g. Main menu')}
          />
          <p className="mt-1 text-xs text-gray-400">
            {t('sectionBuilder:onlineStore.menus.handlePrefix', 'Handle: {{handle}}', { handle: handle || '—' })}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* No `overflow-hidden` here (unlike a plain rounded-corner card) — this
              wraps the rows, and PageLinkCombobox's suggestion dropdown is an
              absolutely-positioned child of a row; `overflow-hidden` on this
              ancestor would clip that dropdown instead of letting it float
              over neighbouring rows. Rounding is done per-edge below instead
              (rounded-t-lg on the header, rounded-b-lg on the last row via
              MenuItemRow's `last:rounded-b-lg`). */}
          <div className="rounded-lg border border-lb-line-2">
            {/* Header row classnames copied from Table's own <thead>/<th> (ce-ui/ui/table.tsx)
                so this hand-rolled header is visually indistinguishable from a real Table
                instance: h-[49px]/px-4 cell box, bg-lb-surface header background,
                border-lb-line-2 divider, font-lb/font-lb-bold text-lb-on-surface typography. */}
            <div className="flex h-[49px] items-center gap-2 rounded-t-lg border-b border-lb-line-2 bg-lb-surface px-4">
              <span className="w-5 shrink-0" aria-hidden="true" />
              <span className="w-1/2 font-lb font-lb-bold text-[14px] leading-[20px] text-lb-on-surface">
                {t('sectionBuilder:onlineStore.menus.itemLabelField', 'Label')}
              </span>
              <span className="w-1/2 font-lb font-lb-bold text-[14px] leading-[20px] text-lb-on-surface">
                {t('sectionBuilder:onlineStore.menus.itemLinkField', 'Link')}
              </span>
              <span className="w-5 shrink-0" aria-hidden="true" />
            </div>
            {items.length === 0 ? (
              <p className="rounded-b-lg bg-lb-surface px-4 py-3 font-lb text-[14px] text-lb-on-surface-3">
                {t('sectionBuilder:onlineStore.menus.noItems', 'No menu items yet.')}
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                  {items.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      pages={pages}
                      onChange={(patch) => updateItem(item.id, patch)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
          <MainBtn
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            label={t('sectionBuilder:onlineStore.menus.addItem', 'Add menu item')}
            onClick={addItem}
            className="mt-1 w-fit"
          />
        </div>

        {/* Delete lives here, not in Popup's own action row — `Popup` only
            supports a fixed primary/secondary button pair (popup.tsx), with
            no footer prop for a third, left-aligned, conditionally-shown
            button — so it's pinned to the bottom of the scrollable content
            instead, set off with a top divider so it still reads as its own
            row sitting just above Cancel/Save. */}
        {canDelete && (
          <div className="flex justify-start border-t border-lb-line-1 pt-4">
            <MainBtn
              variant="danger"
              size="lg"
              leftIcon={<Trash2 size={16} />}
              label={t('sectionBuilder:onlineStore.menus.delete', 'Delete')}
              onClick={onRequestDelete}
            />
          </div>
        )}
      </div>
    </Popup>
  );
}

// Same "slug + short unique suffix on collision" convention as
// pageHelpers.js's createPageId, applied to menu ids instead of page ids —
// menu ids are used as `state.menus` object keys (and as the
// `nav_menu_ref.menuId` a header/footer section stores), so they must be
// unique and stable, not merely human-readable.
function createMenuId(name, existingMenus) {
  const base = slugify(name) || 'menu';
  if (!existingMenus[base]) return base;
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * @module pages/online-store/MenusManagement
 * @description Content > Menus — Shopify-style list of the site's navigation
 * menus (`state.menus`, see builderReducer.js createInitialState/
 * ACTIONS.SAVE_MENU), each opening into MenuFormDrawer above to name the menu
 * and add/edit/reorder/remove its `{label, url}` items in one form. Header/
 * footer sections reference one of these menus by id via their
 * `nav_menu_ref` field.
 */
export default function MenusManagement() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(() => loadDraft(STORE_ID) ?? createFreshState(STORE_ID));
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [creatingMenu, setCreatingMenu] = useState(false);
  // Set to the menu being deleted while its ConfirmDialog is open — holds
  // the id (not just a boolean) so the dialog can interpolate the menu's
  // name into its confirm text.
  const [deletingMenuId, setDeletingMenuId] = useState(null);

  // Search + pagination — same local-state/useMemo shape as
  // PagesManagement.jsx's own filteredPages/pagedPages pair.
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const menus = useMemo(() => Object.values(draft.menus ?? {}), [draft.menus]);
  const pages = draft.pages ?? [];
  const editingMenu = editingMenuId ? draft.menus?.[editingMenuId] : null;

  const filteredMenus = useMemo(() => {
    if (!search.trim()) return menus;
    const needle = search.trim().toLowerCase();
    return menus.filter((menu) => (menu.name ?? '').toLowerCase().includes(needle));
  }, [menus, search]);

  const pagedMenus = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredMenus.slice(start, start + perPage);
  }, [filteredMenus, page, perPage]);

  const handleSaveExisting = ({ name, items }) => {
    const next = runDraftAction(STORE_ID, { type: ACTIONS.SAVE_MENU, id: editingMenuId, name, items });
    setDraft(next);
    setEditingMenuId(null);
  };

  const handleSaveNew = ({ name, items }) => {
    const id = createMenuId(name, draft.menus ?? {});
    const next = runDraftAction(STORE_ID, { type: ACTIONS.SAVE_MENU, id, name, items });
    setDraft(next);
    setCreatingMenu(false);
  };

  // Confirming ConfirmDialog closes both the confirm dialog AND the edit
  // drawer (there's nothing left to edit once the menu is gone) and
  // refreshes the list from the just-persisted draft.
  const handleConfirmDelete = () => {
    const next = runDraftAction(STORE_ID, { type: ACTIONS.DELETE_MENU, id: deletingMenuId });
    setDraft(next);
    setDeletingMenuId(null);
    setEditingMenuId(null);
  };

  const deletingMenu = deletingMenuId ? draft.menus?.[deletingMenuId] : null;

  const columns = [
    {
      key: 'name',
      header: t('sectionBuilder:onlineStore.menus.columnName', 'Title'),
      render: (value) => <span style={{ color: '#282828' }}>{value}</span>,
    },
    {
      key: 'items',
      header: t('sectionBuilder:onlineStore.menus.columnItems', 'Items'),
      render: (value) => t('sectionBuilder:onlineStore.menus.itemCount', '{{count}} items', { count: value.length }),
    },
  ];

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828' }}>
            {t('sectionBuilder:onlineStore.menus.heading', 'Menus')}
          </h1>
          <MainBtn
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            label={t('sectionBuilder:onlineStore.menus.create', 'New Menu')}
            onClick={() => setCreatingMenu(true)}
          />
        </div>

        {/* No outer border here — only the horizontal row dividers Table
            (ce-ui) already renders between rows/header are wanted, not a
            bordered card outline. */}
        <div className="menus-table-wrapper" style={{ background: '#FFFFFF', borderRadius: '12px', position: 'relative' }}>
          <Table
            columns={columns}
            data={pagedMenus}
            onRowClick={(row) => setEditingMenuId(row.id)}
            totalRows={filteredMenus.length}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            hidePaginationOnSinglePage
            filters={{
              search: {
                value: search,
                onChange: (value) => {
                  setSearch(value);
                  setPage(1);
                },
                placeholder: t('sectionBuilder:onlineStore.menus.searchPlaceholder', 'Search by menu name'),
              },
              rowsPerPage: {
                onChange: (nextPerPage) => {
                  setPerPage(nextPerPage);
                  setPage(1);
                },
              },
            }}
            emptyStateTitle={t('sectionBuilder:onlineStore.menus.noMenus', 'No menus yet')}
          />
        </div>
      </div>

      {/*
        Same occlusion issue/fix as PagesManagement.jsx's `.pages-table-wrapper`
        override: Table (ce-ui) paints an opaque background on each <td>, which
        hides the row's own hover background — so hover is reapplied here via a
        scoped selector on this table's own wrapper class instead.
      */}
      <style>{`
        .menus-table-wrapper tbody tr:hover td {
          background-color: #F9FAFB;
        }
      `}</style>

      {editingMenu && (
        <MenuFormDrawer
          menu={editingMenu}
          isNew={false}
          pages={pages}
          onSave={handleSaveExisting}
          onClose={() => setEditingMenuId(null)}
          onRequestDelete={() => setDeletingMenuId(editingMenu.id)}
        />
      )}
      {creatingMenu && (
        <MenuFormDrawer
          menu={null}
          isNew
          pages={pages}
          onSave={handleSaveNew}
          onClose={() => setCreatingMenu(false)}
        />
      )}

      <ConfirmDialog
        open={!!deletingMenu}
        danger
        title={t('sectionBuilder:onlineStore.menus.deleteConfirmTitle', 'Delete "{{name}}"?', { name: deletingMenu?.name ?? '' })}
        description={t('sectionBuilder:onlineStore.menus.deleteConfirmDescription', "This can't be undone. Any header or footer section using this menu will show no links.")}
        confirmLabel={t('sectionBuilder:onlineStore.menus.delete', 'Delete')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingMenuId(null)}
      />
    </div>
  );
}
