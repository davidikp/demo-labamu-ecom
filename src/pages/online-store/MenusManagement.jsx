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
import { Trash2, Plus, GripVertical, Pencil } from 'lucide-react';
import { Table, MainBtn, TextField, Popup, IconBtn, Tooltip } from '../../ce-ui';
import { loadOrSeedDemoDraft } from '../section-builder/state/demoBootstrap';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS, PROTECTED_MENU_IDS } from '../section-builder/state/builderReducer';
import { slugify } from '../section-builder/sections/pageHelpers';
import PageLinkCombobox from '../section-builder/ui/fields/PageLinkCombobox';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';
import { useSnackbar } from '../../contexts/SnackbarContext';

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
function MenuItemRow({ item, pages, error, onChange, onRemove }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const requiredText = t('sectionBuilder:onlineStore.menus.itemFieldRequired', 'Field cannot be empty');

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      // `min-h` (not a fixed `h-[49px]`) + `items-start` — a row grows to fit
      // its inline error text (below) instead of clipping it; the drag
      // handle/delete button get a small top margin so they still align
      // with the fields' first line once the row is no longer a fixed
      // single-line height.
      className="flex min-h-[49px] items-start gap-2 border-b border-lb-line-1 bg-lb-surface px-4 py-2 last:border-b-0"
    >
      <span
        aria-label={t('sectionBuilder:fields.repeaterField.dragToReorder', 'Drag to reorder')}
        className="mt-1.5 w-5 shrink-0 cursor-grab touch-none text-lb-on-surface-3 hover:text-lb-on-surface"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </span>
      <div className="flex w-1/2 flex-col gap-1">
        <input
          type="text"
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder={t('sectionBuilder:onlineStore.menus.labelPlaceholder', 'e.g. About us')}
          className={`w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${
            error?.label ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
          }`}
        />
        {error?.label && <p className="text-xs text-red-600">{requiredText}</p>}
      </div>
      <div className="flex w-1/2 flex-col gap-1">
        <PageLinkCombobox
          value={item.url}
          onChange={(url) => onChange({ url })}
          pages={pages}
          placeholder={t('sectionBuilder:onlineStore.menus.linkSearchPlaceholder', 'Search or paste link')}
          className="w-full"
          error={Boolean(error?.url)}
        />
        {error?.url && <p className="text-xs text-red-600">{requiredText}</p>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('sectionBuilder:editor.common.delete', 'Delete')}
        className="mt-1 flex h-8 w-5 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
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
function MenuFormDrawer({ menu, isNew, pages, onSave, onClose }) {
  const { t } = useTranslation();
  const [name, setName] = useState(menu?.name ?? '');
  const [items, setItems] = useState(() => (menu?.items ?? []).map((item) => ({ ...item })));
  // Keyed by item id — `{ label: bool, url: bool }`. Once a row exists (added
  // via "Add menu item", or already present from a saved menu) both its
  // fields are mandatory: Save validates every row and surfaces inline
  // errors on whichever fields are still blank instead of persisting a menu
  // with empty label/link entries.
  const [itemErrors, setItemErrors] = useState({});
  // Save is never preemptively disabled (same "surface the error on click
  // instead" convention as PageEditor.jsx's own Title field) — this holds
  // the inline error text shown under Name once a blank Save attempt fires.
  const [nameError, setNameError] = useState(null);
  const handle = slugify(name);
  const fieldRequiredText = t('sectionBuilder:onlineStore.menus.itemFieldRequired', 'Field cannot be empty');

  // Popup (ce-ui/ui/popup.tsx) already locks body scroll while `open` itself,
  // but has no Escape-to-close handling of its own — kept here so this form
  // doesn't regress the keyboard behavior the previous hand-built drawer had.
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

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
    setItemErrors((prev) => {
      if (!prev[id]) return prev;
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    // Clear only the field(s) just edited — the other field's error (if any)
    // stays until it's fixed too, so fixing the label alone doesn't also
    // silently drop a still-blank link's error.
    setItemErrors((prev) => {
      if (!prev[id]) return prev;
      const cleared = { ...prev[id] };
      if ('label' in patch) cleared.label = false;
      if ('url' in patch) cleared.url = false;
      if (!cleared.label && !cleared.url) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: cleared };
    });
  };

  // Every present row's Label and Link are mandatory — returns the
  // `{ [itemId]: { label, url } }` error map (empty when everything's
  // filled in).
  const validateItems = () => {
    const errors = {};
    items.forEach((item) => {
      const labelBad = !item.label?.trim();
      const urlBad = !item.url?.trim();
      if (labelBad || urlBad) errors[item.id] = { label: labelBad, url: urlBad };
    });
    return errors;
  };

  const handleSaveClick = () => {
    const nameBad = !name.trim();
    setNameError(nameBad ? fieldRequiredText : null);

    const errors = validateItems();
    setItemErrors(errors);

    if (nameBad || Object.keys(errors).length > 0) return;
    onSave({ name: name.trim(), items });
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
        label: isNew
          ? t('sectionBuilder:onlineStore.menus.save', 'Save')
          : t('sectionBuilder:onlineStore.menus.saveChanges', 'Save Changes'),
        onClick: handleSaveClick,
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <TextField
            label={t('sectionBuilder:onlineStore.menus.nameLabel', 'Name')}
            required
            size="lg"
            autoFocus={isNew}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder={t('sectionBuilder:onlineStore.menus.namePlaceholder', 'e.g. Main menu')}
            errorText={nameError}
          />
          <p className="mt-1 text-xs text-gray-400">
            {t('sectionBuilder:onlineStore.menus.handlePrefix', 'Handle: {{handle}}', { handle: handle || '—' })}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* No outer border/rounding here — only the horizontal divider
              lines between the header and rows (border-b on each) remain,
              matching Table's own row dividers instead of a bordered card
              outline. No `overflow-hidden` either: PageLinkCombobox's
              suggestion list now renders through a portal (see that file),
              so nothing here needs to stay unclipped for it anymore, but
              there's still no reason to clip anything else in this column. */}
          <div>
            {items.length === 0 ? (
              <div className="flex items-center justify-center rounded-lb-card border-2 border-dashed border-lb-line-2 bg-lb-surface px-4 py-10 font-lb text-[14px] text-lb-on-surface-3">
                {t('sectionBuilder:onlineStore.menus.noItems', 'No menu items yet.')}
              </div>
            ) : (
              <>
                {/* Header row classnames copied from Table's own <thead>/<th> (ce-ui/ui/table.tsx)
                    so this hand-rolled header is visually indistinguishable from a real Table
                    instance: h-[49px]/px-4 cell box, bg-lb-surface header background,
                    border-lb-line-2 divider, font-lb/font-lb-bold text-lb-on-surface typography.
                    Hidden entirely in the empty state above — a header with nothing under it
                    reads oddly next to the dashed placeholder box. */}
                <div className="flex h-[49px] items-center gap-2 border-b border-lb-line-2 bg-lb-surface px-4">
                  <span className="w-5 shrink-0" aria-hidden="true" />
                  <span className="w-1/2 font-lb font-lb-bold text-[14px] leading-[20px] text-lb-on-surface">
                    {t('sectionBuilder:onlineStore.menus.itemLabelField', 'Menu Item')}
                  </span>
                  <span className="w-1/2 font-lb font-lb-bold text-[14px] leading-[20px] text-lb-on-surface">
                    {t('sectionBuilder:onlineStore.menus.itemLinkField', 'Link')}
                  </span>
                  <span className="w-5 shrink-0" aria-hidden="true" />
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    {items.map((item) => (
                      <MenuItemRow
                        key={item.id}
                        item={item}
                        pages={pages}
                        error={itemErrors[item.id]}
                        onChange={(patch) => updateItem(item.id, patch)}
                        onRemove={() => removeItem(item.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </>
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
  const { showSnackbar } = useSnackbar();
  const [draft, setDraft] = useState(() => loadOrSeedDemoDraft(STORE_ID));
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
    showSnackbar(t('sectionBuilder:onlineStore.menus.savedSnackbar', 'Menu successfully saved'), 'green');
  };

  const handleSaveNew = ({ name, items }) => {
    const id = createMenuId(name, draft.menus ?? {});
    const next = runDraftAction(STORE_ID, { type: ACTIONS.SAVE_MENU, id, name, items });
    setDraft(next);
    setCreatingMenu(false);
    showSnackbar(t('sectionBuilder:onlineStore.menus.savedSnackbar', 'Menu successfully saved'), 'green');
  };

  // Confirming ConfirmDialog closes both the confirm dialog AND the edit
  // drawer (there's nothing left to edit once the menu is gone) and
  // refreshes the list from the just-persisted draft.
  const handleConfirmDelete = () => {
    const next = runDraftAction(STORE_ID, { type: ACTIONS.DELETE_MENU, id: deletingMenuId });
    setDraft(next);
    showSnackbar(t('sectionBuilder:onlineStore.menus.deletedSnackbar', 'Menu successfully deleted'), 'grey');
    setDeletingMenuId(null);
    setEditingMenuId(null);
  };

  const deletingMenu = deletingMenuId ? draft.menus?.[deletingMenuId] : null;

  const columns = [
    {
      key: 'name',
      header: t('sectionBuilder:onlineStore.menus.columnName', 'Name'),
      render: (value) => <span style={{ color: '#282828' }}>{value}</span>,
    },
    {
      key: 'items',
      header: t('sectionBuilder:onlineStore.menus.columnItems', 'Items'),
      // Item *names* (comma-joined), not a count — a blank/unlabeled item
      // (freshly added via "Add menu item", not yet given a label) is
      // dropped from the list rather than showing as an empty entry between
      // two commas.
      render: (value) => {
        const labels = value.map((item) => item.label?.trim()).filter(Boolean);
        return labels.length ? (
          <span className="block truncate" title={labels.join(', ')}>
            {labels.join(', ')}
          </span>
        ) : (
          <span className="text-lb-on-surface-3">{t('sectionBuilder:onlineStore.menus.noItemsShort', 'No items')}</span>
        );
      },
    },
    {
      key: 'actions',
      width: 160,
      header: t('sectionBuilder:onlineStore.menus.columnActions', 'Actions'),
      // Row click no longer opens the edit modal — Edit/Delete are the only
      // way into a menu now, so this column carries both as tertiary
      // (ghost-style) icon buttons rather than the whole row being a target.
      render: (_value, row) => {
        const isProtected = PROTECTED_MENU_IDS.includes(row.id);
        return (
          <div className="flex items-center gap-1">
            <Tooltip content={t('sectionBuilder:onlineStore.menus.editTooltip', 'Edit')}>
              <IconBtn
                variant="ghost"
                size="sm"
                icon={<Pencil size={16} />}
                aria-label={t('sectionBuilder:onlineStore.menus.editTooltip', 'Edit')}
                onClick={() => setEditingMenuId(row.id)}
              />
            </Tooltip>
            <Tooltip
              content={
                isProtected
                  ? t('sectionBuilder:onlineStore.menus.deleteProtectedTooltip', "This menu can't be deleted")
                  : t('sectionBuilder:onlineStore.menus.deleteTooltip', 'Delete')
              }
            >
              <IconBtn
                variant="danger-ghost"
                size="sm"
                icon={<Trash2 size={16} />}
                disabled={isProtected}
                aria-label={t('sectionBuilder:onlineStore.menus.deleteTooltip', 'Delete')}
                onClick={() => setDeletingMenuId(row.id)}
              />
            </Tooltip>
          </div>
        );
      },
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

        {/* No wrapper styling here — Table (ce-ui) already paints its own
            white background + 12px rounded corners + overflow-hidden on
            this exact box (table.tsx's root div). Duplicating the same
            background/border-radius on this outer div doesn't add
            anything and risks a hairline seam at the bottom corners at
            certain zoom/DPI levels, since two independently-rasterized
            rounded rects of the same radius on the same rect don't always
            composite pixel-for-pixel identically — hence the "table
            outline is cropped" artifact this replaces. No `onRowClick`
            either — Edit/Delete in the Actions column are the only way
            into a row now, so the row itself carries no click/hover
            affordance (Table only adds its built-in hover-bg/cursor-pointer
            when onRowClick is passed). */}
        <Table
          columns={columns}
          data={pagedMenus}
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

      {editingMenu && (
        <MenuFormDrawer
          menu={editingMenu}
          isNew={false}
          pages={pages}
          onSave={handleSaveExisting}
          onClose={() => setEditingMenuId(null)}
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
        title={t('sectionBuilder:onlineStore.menus.deleteConfirmTitle', 'Delete this menu?')}
        description={t('sectionBuilder:onlineStore.menus.deleteConfirmDescription', 'This menu and its items will be permanently deleted.')}
        confirmLabel={t('sectionBuilder:onlineStore.menus.deleteConfirm', 'Yes, Delete')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingMenuId(null)}
      />
    </div>
  );
}
