import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LocaleProvider, Snackbar } from '../../ce-ui';
import { useSectionBuilder } from './state/useSectionBuilder';
import { ACTIONS } from './state/builderReducer';
import { getGroupSchema } from './state/themeSchemaAdapter';
import { registerBuilderMocks } from './mocks/registerBuilderMocks';
import { useConfirmLeaveIfDirty } from './hooks/useConfirmLeaveIfDirty';
import { useUndoRedoShortcuts } from './hooks/useUndoRedoShortcuts';
import TopBar from './ui/TopBar';
import Sidebar from './ui/Sidebar';
import Canvas from './ui/Canvas';
import SettingsPanel from './ui/SettingsPanel';
import ThemePanel from './ui/ThemePanel';
import MediaLibraryPanel from './ui/MediaLibraryPanel';
import PublishDrawer from './ui/PublishDrawer';
import DraftRecoveryBanner from './ui/DraftRecoveryBanner';
import ConcurrentEditingBanner from './ui/ConcurrentEditingBanner';
import ConfirmDialog from './ui/ConfirmDialog';
import { slugify } from './sections/pageHelpers';
import { labelForType } from './sections/registry';
import { countEntitiesUsingSlot } from './sections/themeHelpers';
import { createInitialCheckState, allChecksPass } from './sections/publishChecks';
import { schemaForType } from './sections/index';
import { defaultsForSchema } from './sections/schemaDefaults';

registerBuilderMocks();

// TODO: replace with the real store/company name once catalog/company APIs
// are wired into this builder — see api/client.js's company service.
const STORE_NAME_PLACEHOLDER = 'My Store';

function createSectionId(type) {
  return `${type}-${crypto.randomUUID()}`;
}

function createPageId(slug) {
  return `page-${slugify(slug)}-${crypto.randomUUID().slice(0, 8)}`;
}

const TEXT_LIKE_FIELD_TYPES = new Set(['text', 'textarea', 'richtext']);
const THEME_PANEL_SELECTION = 'theme-settings';
const MEDIA_PANEL_SELECTION = 'media-library';

export default function SectionBuilder() {
  const { t } = useTranslation();
  const { storeId } = useParams();
  const {
    state,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    undo,
    redo,
    dispatch,
    commitField,
    publish,
    discardDraft,
    dirty,
    wasRestoredFromDraft,
    restoredAt,
  } = useSectionBuilder(storeId);
  const [viewport, setViewport] = useState('desktop');
  const [recoveryBannerDismissed, setRecoveryBannerDismissed] = useState(false);
  const [publishDrawerOpen, setPublishDrawerOpen] = useState(false);
  const [publishCheckState, setPublishCheckState] = useState(createInitialCheckState);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [publishToastOpen, setPublishToastOpen] = useState(false);
  const [mediaPicker, setMediaPicker] = useState(null); // { onPick } | null

  const simulatedEditor = new URLSearchParams(window.location.search).get('simulateEditor');

  useConfirmLeaveIfDirty(dirty);
  useUndoRedoShortcuts(undo, redo);

  const activePage = state.pages.find((p) => p.id === state.activePageId);
  const activePageId = activePage?.id;
  const sections = useMemo(() => activePage?.sections ?? [], [activePage]);
  const selectedId = state.selection.id;

  const selectedEntity =
    selectedId === 'header'
      ? state.header
      : selectedId === 'footer'
      ? state.footer
      : sections.find((s) => s.id === selectedId) ?? null;

  // US-10.2 — Canvas wraps each section's Renderer in React.memo so editing
  // one section doesn't re-render its siblings. That only pays off if the
  // callback props handed to each section stay referentially stable across
  // unrelated state changes, hence useCallback here (deps limited to the
  // active page id + dispatch, both stable) rather than plain arrow
  // functions recreated on every SectionBuilder render.
  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  const select = useCallback((id) => dispatch({ type: ACTIONS.SELECT, id }), [dispatch]);
  const deselect = useCallback(() => dispatch({ type: ACTIONS.DESELECT }), [dispatch]);

  const handleToggleGlobalHidden = (which) =>
    dispatch({
      type: ACTIONS.TOGGLE_GLOBAL_HIDDEN,
      which,
      meta: {
        label: t(
          state[which].hidden
            ? 'sectionBuilder:editor.sectionBuilder.actions.show'
            : 'sectionBuilder:editor.sectionBuilder.actions.hide',
          { label: labelForType(which) }
        ),
      },
    });

  const handleReorder = (orderedIds) =>
    dispatch({
      type: ACTIONS.REORDER_SECTIONS,
      pageId: activePage.id,
      orderedIds,
      meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.reorderSections') },
    });

  const handleAdd = (type) => {
    const currentIndex = sections.findIndex((s) => s.id === selectedId);
    dispatch({
      type: ACTIONS.ADD_SECTION,
      pageId: activePage.id,
      section: { id: createSectionId(type), type, data: defaultsForSchema(schemaForType(type)) },
      index: currentIndex === -1 ? undefined : currentIndex + 1,
      meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.addSection', { type: labelForType(type) }) },
    });
  };

  const handleMoveSection = useCallback(
    (sectionId, direction) =>
      dispatch({
        type: ACTIONS.MOVE_SECTION,
        pageId: activePageId,
        sectionId,
        direction,
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.reorderSections') },
      }),
    [activePageId, dispatch]
  );

  const handleDuplicateSection = useCallback(
    (sectionId) => {
      const original = sectionsRef.current.find((s) => s.id === sectionId);
      dispatch({
        type: ACTIONS.DUPLICATE_SECTION,
        pageId: activePageId,
        sectionId,
        newId: createSectionId('copy'),
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.duplicateSection', { type: labelForType(original?.type) }) },
      });
    },
    [activePageId, dispatch]
  );

  const handleDeleteSection = useCallback(
    (sectionId) => {
      const target = sectionsRef.current.find((s) => s.id === sectionId);
      dispatch({
        type: ACTIONS.REMOVE_SECTION,
        pageId: activePageId,
        sectionId,
        meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.deleteSection', { type: labelForType(target?.type) }) },
      });
    },
    [activePageId, dispatch]
  );

  const handleFieldChange = (key, value, field) => {
    const isGlobal = selectedId === 'header' || selectedId === 'footer';
    const meta = {
      label: t('sectionBuilder:editor.sectionBuilder.actions.fieldChange', {
        type: labelForType(selectedEntity?.type),
        field: field.label,
      }),
    };
    const action = isGlobal
      ? { type: ACTIONS.UPDATE_GLOBAL_DATA, which: selectedId, data: { [key]: value }, meta }
      : { type: ACTIONS.UPDATE_SECTION_DATA, pageId: activePage.id, sectionId: selectedId, data: { [key]: value }, meta };

    if (TEXT_LIKE_FIELD_TYPES.has(field.type)) {
      commitField(`${selectedId}:${key}`, action);
    } else {
      dispatch(action);
    }
  };

  const handleSelectPage = (pageId) => dispatch({ type: ACTIONS.SET_ACTIVE_PAGE, pageId });

  const handleAddPage = ({ name, slug }) =>
    dispatch({
      type: ACTIONS.ADD_PAGE,
      page: { id: createPageId(slug), name, type: 'custom', slug: `/${slug}`, sections: [], seo: {}, hiddenFromNav: false },
      meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.addPage', { name }) },
    });

  const handleRenamePage = (pageId, name) =>
    dispatch({ type: ACTIONS.RENAME_PAGE, pageId, name, meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.renamePage') } });
  const handleDeletePage = (pageId) =>
    dispatch({ type: ACTIONS.DELETE_PAGE, pageId, meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.deletePage') } });
  const handleUpdatePageSeo = (pageId, seo) =>
    dispatch({ type: ACTIONS.UPDATE_PAGE_SEO, pageId, seo, meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.updatePageSeo') } });
  const handleTogglePageNavHidden = (pageId) =>
    dispatch({ type: ACTIONS.TOGGLE_PAGE_NAV_HIDDEN, pageId, meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.togglePageNav') } });

  const handleOpenTheme = () => select(THEME_PANEL_SELECTION);
  const handleOpenMedia = () => select(MEDIA_PANEL_SELECTION);

  const handleAddMedia = (item) => dispatch({ type: ACTIONS.ADD_MEDIA_ITEM, item });
  const handleDeleteMedia = (id) => dispatch({ type: ACTIONS.REMOVE_MEDIA_ITEM, id });
  const handleOpenLibraryPicker = (onPick) => setMediaPicker({ onPick });

  const handleThemeFieldChange = (group, fieldKey, value) => {
    const fieldSchema = getGroupSchema(group).fields[fieldKey];
    const affects = group === 'colors' ? ` (affects ${countEntitiesUsingSlot(state, fieldKey)} sections)` : '';
    dispatch({
      type: ACTIONS.UPDATE_THEME_FIELD,
      group,
      field: fieldKey,
      value,
      meta: { label: `Theme → ${fieldSchema.label}${affects}` },
    });
  };

  const handleApplyThemePreset = (preset) =>
    dispatch({
      type: ACTIONS.APPLY_THEME_PRESET,
      colors: preset.colors,
      typography: preset.typography,
      meta: { label: t('sectionBuilder:editor.sectionBuilder.actions.themePreset', { name: preset.name }) },
    });

  const handlePreview = () => {
    const token = `dev-${Date.now()}`;
    window.open(`/section-builder/${storeId}/preview?token=${token}`, '_blank', 'noopener');
  };

  const runPublish = () => {
    publish();
    setPublishDrawerOpen(false);
    setPublishToastOpen(true);
  };

  const handlePublish = () => {
    if (allChecksPass(publishCheckState)) {
      runPublish();
    } else {
      setPublishDrawerOpen(true);
    }
  };

  const handleToggleCheck = (key) => setPublishCheckState((prev) => ({ ...prev, [key]: true }));

  const handleDiscard = () => setDiscardConfirmOpen(true);
  const confirmDiscard = () => {
    discardDraft();
    setDiscardConfirmOpen(false);
  };

  // Snackbar dismisses itself (animates out, then calls onDismiss) once its
  // action is clicked — no need to flip publishToastOpen manually here.
  const handleViewLiveStore = () => {
    handlePreview();
  };

  return (
    <LocaleProvider locale="en">
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      {wasRestoredFromDraft && !recoveryBannerDismissed && dirty && (
        <DraftRecoveryBanner
          restoredAt={restoredAt}
          onKeep={() => setRecoveryBannerDismissed(true)}
          onDiscard={() => {
            discardDraft();
            setRecoveryBannerDismissed(true);
          }}
        />
      )}
      <ConcurrentEditingBanner editorName={simulatedEditor} />
      <TopBar
        pageName={activePage?.name ?? '—'}
        viewport={viewport}
        onViewportChange={setViewport}
        canUndo={canUndo}
        canRedo={canRedo}
        undoLabel={undoLabel}
        redoLabel={redoLabel}
        onUndo={undo}
        onRedo={redo}
        dirty={dirty}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          header={state.header}
          footer={state.footer}
          sections={sections}
          selectedId={selectedId}
          onSelect={select}
          onToggleGlobalHidden={handleToggleGlobalHidden}
          onReorder={handleReorder}
          onAdd={handleAdd}
          onOpenTheme={handleOpenTheme}
          onOpenMedia={handleOpenMedia}
          pages={state.pages}
          activePageId={state.activePageId}
          storeName={STORE_NAME_PLACEHOLDER}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onRenamePage={handleRenamePage}
          onDeletePage={handleDeletePage}
          onUpdatePageSeo={handleUpdatePageSeo}
          onTogglePageNavHidden={handleTogglePageNavHidden}
        />
        <Canvas
          viewport={viewport}
          header={state.header}
          footer={state.footer}
          sections={sections}
          selectedId={selectedId}
          onSelect={select}
          onDeselect={deselect}
          onMoveSection={handleMoveSection}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={handleDeleteSection}
          theme={state.theme}
          mediaLibrary={state.mediaLibrary}
        />
        {selectedId === THEME_PANEL_SELECTION ? (
          <ThemePanel
            theme={state.theme}
            onFieldChange={handleThemeFieldChange}
            onApplyPreset={handleApplyThemePreset}
          />
        ) : selectedId === MEDIA_PANEL_SELECTION ? (
          <aside className="w-[280px] min-w-[240px] shrink-0 border-l border-gray-200 bg-white">
            <MediaLibraryPanel
              mode="manage"
              mediaLibrary={state.mediaLibrary}
              state={state}
              onUpload={handleAddMedia}
              onDelete={handleDeleteMedia}
            />
          </aside>
        ) : (
          <SettingsPanel
            entity={selectedEntity}
            palette={state.theme.colors}
            onFieldChange={handleFieldChange}
            mediaLibrary={state.mediaLibrary}
            onAddMedia={handleAddMedia}
            onOpenLibrary={handleOpenLibraryPicker}
          />
        )}
      </div>

      <PublishDrawer
        open={publishDrawerOpen}
        checkState={publishCheckState}
        onToggleCheck={handleToggleCheck}
        onPublishAnyway={runPublish}
        onClose={() => setPublishDrawerOpen(false)}
      />

      <ConfirmDialog
        open={discardConfirmOpen}
        title={t('sectionBuilder:editor.sectionBuilder.discardConfirm.title')}
        confirmLabel={t('sectionBuilder:editor.sectionBuilder.discardConfirm.confirmLabel')}
        danger
        onConfirm={confirmDiscard}
        onCancel={() => setDiscardConfirmOpen(false)}
      />

      {publishToastOpen && (
        <Snackbar
          message={t('sectionBuilder:editor.sectionBuilder.publishSuccess.message')}
          variant="success"
          action={{ label: t('sectionBuilder:editor.sectionBuilder.publishSuccess.viewLiveStore'), onClick: handleViewLiveStore }}
          onClose={() => setPublishToastOpen(false)}
        />
      )}

      {mediaPicker && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 border-l border-gray-200 bg-white shadow-xl">
          <MediaLibraryPanel
            mode="picker"
            mediaLibrary={state.mediaLibrary}
            state={state}
            onUpload={handleAddMedia}
            onPick={(item) => {
              mediaPicker.onPick(item);
              setMediaPicker(null);
            }}
            onClose={() => setMediaPicker(null)}
          />
        </div>
      )}
    </div>
    </LocaleProvider>
  );
}
