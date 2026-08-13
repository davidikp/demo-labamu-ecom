import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { RadioButton, Dropdown, MainBtn, Popup } from '../../ce-ui';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { loadDraft } from '../section-builder/state/storage';
import { createFreshState } from '../section-builder/state/useSectionBuilder';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS } from '../section-builder/state/builderReducer';
import { slugify, isSlugTaken, createPageId } from '../section-builder/sections/pageHelpers';
import { schemaForType } from '../section-builder/sections/index';
import { defaultsForSchema } from '../section-builder/sections/schemaDefaults';
import { makeBlock } from '../section-builder/sections/blockHelpers';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';
import RichTextEditor from './RichTextEditor';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used across online-store/*.
const STORE_ID = 'demo';

const TEMPLATE_OPTIONS = [
  { value: 'default-page', label: 'Default page' },
  { value: 'contact', label: 'Contact' },
  { value: 'faq', label: 'FAQ' },
];

function blankPage() {
  return {
    id: null,
    name: '',
    type: 'custom',
    slug: '',
    sections: [],
    content: '',
    seo: {},
    hiddenFromNav: false,
    visibility: 'visible',
    visibleFrom: null,
    template: 'default-page',
  };
}

function toDatetimeLocal(epochMs) {
  if (!epochMs) return '';
  const d = new Date(epochMs);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value) {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

// Stable id for the single auto-generated `rich_text` section that mirrors
// this page's Title+Content fields — keyed off the page id so it can be
// found/replaced idempotently on every save (never duplicated) instead of
// being regenerated with a random uuid each time.
function contentSyncSectionId(pageId) {
  return `${pageId}-content-sync`;
}

// Splits the RichTextEditor's Tiptap HTML into plain-text paragraphs, one
// per block-level element (<p>, <h1-6>, <li>, ...). The section-builder's
// own text-block editor (`EditableText`) is a plain contenteditable field,
// not an HTML renderer — feeding it raw HTML would show literal "<p>" tags
// while editing (it only gets interpreted as HTML in the site's read-only
// render). Stripping tags per-paragraph keeps paragraph breaks (as separate
// blocks) while avoiding that literal-markup artifact in the editor.
function splitContentIntoParagraphs(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks = Array.from(doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li'));
  const source = blocks.length ? blocks : [doc.body];
  return source
    .map((el) => el.textContent.trim())
    .filter(Boolean);
}

// Builds/refreshes the auto-managed rich_text section mirroring Title
// (heading block) + Content (one text block per paragraph) so "Edit in
// Editor" and the section-builder preview show something in sync with the
// Page Editor fields, not an empty canvas.
function buildContentSyncSection(pageId, form) {
  const headingBlock = makeBlock('rich_text', 'heading');
  headingBlock.data = { ...headingBlock.data, text: form.name };

  const paragraphs = splitContentIntoParagraphs(form.content);
  const textBlocks = (paragraphs.length ? paragraphs : ['']).map((text) => {
    const block = makeBlock('rich_text', 'text');
    block.data = { ...block.data, content: text };
    return block;
  });

  return {
    id: contentSyncSectionId(pageId),
    type: 'rich_text',
    data: defaultsForSchema(schemaForType('rich_text')),
    blocks: [headingBlock, ...textBlocks],
  };
}

// Replaces (or inserts) the auto-managed content-sync section within an
// existing sections array — kept as the FIRST section (matching the
// natural reading order of a custom page's own Title/Content, ahead of
// any other authored sections), leaving every other section untouched.
function syncSectionsWithContent(sections, pageId, form) {
  const syncId = contentSyncSectionId(pageId);
  const withoutSync = (sections ?? []).filter((s) => s.id !== syncId);
  return [buildContentSyncSection(pageId, form), ...withoutSync];
}

function formToSnapshot(form) {
  return JSON.stringify({
    name: form.name,
    content: form.content,
    template: form.template,
    visibility: form.visibility,
    visibleFrom: form.visibleFrom,
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
  });
}

/**
 * @module pages/online-store/PageEditor
 * @description Online Store > Pages > dedicated page editor. Handles both
 * create (`/online-store/pages/new`) and edit (`/online-store/pages/:pageId`)
 * — a brand-new page is only persisted (ADD_PAGE) on first Save, at which
 * point the screen switches in place to edit mode for the new id.
 */
export default function PageEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pageId: routePageId } = useParams();
  const { showSnackbar } = useSnackbar();
  const isCreate = routePageId === undefined;

  const [draft, setDraft] = useState(() => loadDraft(STORE_ID) ?? createFreshState(STORE_ID));
  const [pageId, setPageId] = useState(routePageId ?? null);
  const existingPage = useMemo(() => draft.pages.find((p) => p.id === pageId) ?? null, [draft, pageId]);

  const initialForm = useMemo(() => {
    const page = existingPage ?? blankPage();
    return {
      name: page.name ?? '',
      content: page.content ?? '',
      template: page.template ?? 'default-page',
      visibility: page.visibility ?? 'visible',
      visibleFrom: page.visibleFrom ?? null,
      metaTitle: page.seo?.metaTitle ?? '',
      metaDescription: page.seo?.metaDescription ?? '',
    };
    // Only re-derive when we switch which page id is loaded (e.g. right
    // after a first Save on a new page) — not on every draft re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const [form, setForm] = useState(initialForm);
  const [savedSnapshot, setSavedSnapshot] = useState(() => formToSnapshot(initialForm));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isDirty = formToSnapshot(form) !== savedSnapshot;
  const canSave = isDirty && form.name.trim().length > 0;

  const patchForm = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Persists the form (create or update) and returns the page's id — shared
  // by the footer Save button and the "unsaved changes" prompt shown from
  // "Edit in Editor", which each navigate somewhere different afterward.
  const persistPage = () => {
    if (!canSave) return pageId;
    const seo = { metaTitle: form.metaTitle, metaDescription: form.metaDescription };

    if (isCreate && !pageId) {
      const newId = createPageId(form.name);
      const slug = isSlugTaken(slugify(form.name), draft.pages)
        ? `${slugify(form.name)}-${newId.slice(-8)}`
        : slugify(form.name);
      const page = {
        id: newId,
        name: form.name.trim(),
        type: 'custom',
        slug: `/${slug}`,
        sections: syncSectionsWithContent([], newId, form),
        content: form.content,
        seo,
        hiddenFromNav: false,
        visibility: form.visibility,
        visibleFrom: form.visibility === 'visible' ? form.visibleFrom : null,
        template: form.template,
      };
      const next = runDraftAction(STORE_ID, { type: ACTIONS.ADD_PAGE, page });
      setDraft(next);
      setPageId(newId);
      setSavedSnapshot(formToSnapshot(form));
      showSnackbar(t('sectionBuilder:onlineStore.pageEditor.savedSnackbar', 'Page successfully saved'), 'green');
      return newId;
    }

    const next = runDraftAction(STORE_ID, {
      type: ACTIONS.UPDATE_PAGE,
      pageId,
      patch: {
        name: form.name.trim(),
        content: form.content,
        template: form.template,
        visibility: form.visibility,
        visibleFrom: form.visibility === 'visible' ? form.visibleFrom : null,
        seo,
        sections: syncSectionsWithContent(existingPage?.sections, pageId, form),
      },
    });
    setDraft(next);
    setSavedSnapshot(formToSnapshot(form));
    showSnackbar(t('sectionBuilder:onlineStore.pageEditor.savedSnackbar', 'Page successfully saved'), 'green');
    return pageId;
  };

  const handleSave = () => {
    if (!canSave) return;
    persistPage();
    navigate('/online-store/pages');
  };

  const handleDuplicate = () => {
    if (!pageId || !existingPage) return;
    const newId = createPageId(`${existingPage.name} copy`);
    const baseSlug = slugify(`${existingPage.name}-copy`);
    const slug = isSlugTaken(baseSlug, draft.pages) ? `${baseSlug}-${newId.slice(-8)}` : baseSlug;
    const page = {
      ...existingPage,
      id: newId,
      name: `${existingPage.name} copy`,
      slug: `/${slug}`,
    };
    runDraftAction(STORE_ID, { type: ACTIONS.ADD_PAGE, page });
    showSnackbar(t('sectionBuilder:onlineStore.pageEditor.duplicatedSnackbar', 'Page successfully duplicated'), 'green');
    navigate(`/online-store/pages/${newId}`);
  };

  const handleDelete = () => {
    if (!pageId) return;
    runDraftAction(STORE_ID, { type: ACTIONS.DELETE_PAGE, pageId });
    setConfirmDelete(false);
    navigate('/online-store/pages');
  };

  const handlePreview = () => {
    if (!pageId) return;
    window.open(`/online-store/pages/${pageId}/preview`, '_blank', 'noopener,noreferrer');
  };

  const [confirmUnsavedEditor, setConfirmUnsavedEditor] = useState(false);

  const goToEditor = (id) => navigate(`/section-builder/${STORE_ID}/pages/${id}`);

  const handleEditInEditor = () => {
    if (!pageId) return;
    if (isDirty) {
      setConfirmUnsavedEditor(true);
      return;
    }
    goToEditor(pageId);
  };

  const handleSaveThenEditInEditor = () => {
    const id = persistPage();
    setConfirmUnsavedEditor(false);
    goToEditor(id);
  };

  const pageModeTitle =
    isCreate && !pageId
      ? t('sectionBuilder:onlineStore.pageEditor.addNewPageTitle', 'Add New Page')
      : t('sectionBuilder:onlineStore.pageEditor.editPageTitle', 'Edit Page');

  const handleBackNavigation = () => navigate('/online-store/pages');

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginLeft: '-4px' }}
            onClick={handleBackNavigation}
          >
            <ArrowLeft size={28} />
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828' }}>
              {pageModeTitle}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{ color: '#6B7280', cursor: 'pointer' }} onClick={handleBackNavigation}>
              {t('sectionBuilder:onlineStore.pages.heading', 'Pages')}
            </span>
            <span style={{ color: '#9CA3AF' }}>/</span>
            <span style={{ color: '#9CA3AF' }}>{pageModeTitle}</span>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main column */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                {t('sectionBuilder:onlineStore.pageEditor.titleLabel', 'Title')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => patchForm({ name: e.target.value })}
                  placeholder={t('sectionBuilder:onlineStore.pageEditor.titlePlaceholder', 'e.g. About us')}
                  className="w-full h-11 rounded-lg border border-gray-300 pl-4 pr-4 text-[15px] text-gray-800 outline-none focus:border-[#006BFF] focus:shadow-[0_0_0_3px_rgba(0,107,255,0.12)]"
                />
              </div>

              <label className="block text-sm font-semibold text-gray-800 mt-5 mb-1.5">
                {t('sectionBuilder:onlineStore.pageEditor.contentLabel', 'Content')}
              </label>
              <RichTextEditor value={form.content} onChange={(html) => patchForm({ content: html })} />
            </div>

            {/* Search engine listing */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                {t('sectionBuilder:onlineStore.pageEditor.seoHeading', 'Search engine listing')}
              </h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 mb-4">
                <div className="text-[13px] text-gray-500 truncate">
                  {t('sectionBuilder:onlineStore.pageEditor.storeName', 'Your store')} ›{' '}
                  {form.name ? `${slugify(form.name)}` : 'page'}
                </div>
                <div className="text-[16px] text-[#1a0dab] truncate">
                  {form.metaTitle || form.name || t('sectionBuilder:onlineStore.pageEditor.untitled', 'Untitled page')}
                </div>
                <div className="text-[13px] text-gray-600 line-clamp-2">
                  {form.metaDescription || t('sectionBuilder:onlineStore.pageEditor.noDescription', 'Add a description to see how this page might appear in search results.')}
                </div>
              </div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('sectionBuilder:onlineStore.pageEditor.metaTitle', 'Page title')}
              </label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => patchForm({ metaTitle: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-[#006BFF] mb-3"
              />
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('sectionBuilder:onlineStore.pageEditor.metaDescription', 'Meta description')}
              </label>
              <textarea
                rows={3}
                value={form.metaDescription}
                onChange={(e) => patchForm({ metaDescription: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#006BFF] resize-none"
              />
            </div>
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                {t('sectionBuilder:onlineStore.pageEditor.visibilityHeading', 'Visibility')}
              </h3>
              <div className="flex flex-col gap-3">
                <RadioButton
                  label={t('sectionBuilder:onlineStore.pages.hidden', 'Hidden')}
                  checked={form.visibility === 'hidden'}
                  onChange={() => patchForm({ visibility: 'hidden', visibleFrom: null })}
                />
                <RadioButton
                  label={t('sectionBuilder:onlineStore.pages.visible', 'Visible')}
                  checked={form.visibility === 'visible'}
                  onChange={() => patchForm({ visibility: 'visible' })}
                />
                {form.visibility === 'visible' && (
                  <div className="pl-9">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {t('sectionBuilder:onlineStore.pageEditor.visibleAsOf', 'Visible as of (optional)')}
                    </label>
                    <input
                      type="datetime-local"
                      value={toDatetimeLocal(form.visibleFrom)}
                      onChange={(e) => patchForm({ visibleFrom: fromDatetimeLocal(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none focus:border-[#006BFF]"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                {t('sectionBuilder:onlineStore.pageEditor.templateHeading', 'Template')}
              </h3>
              <Dropdown
                options={TEMPLATE_OPTIONS}
                value={form.template}
                onChange={(v) => patchForm({ template: v })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer action bar — Delete (edit mode only) sits on the left,
          opposite Duplicate/Preview/Save(-changes) on the right. */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between gap-2 z-20">
        {!isCreate && pageId ? (
          <MainBtn
            variant="danger"
            size="lg"
            label={t('sectionBuilder:onlineStore.pageEditor.delete', 'Delete')}
            onClick={() => setConfirmDelete(true)}
          />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {!isCreate && pageId && (
            <MainBtn
              variant="secondary"
              size="lg"
              label={t('sectionBuilder:onlineStore.pageEditor.duplicate', 'Duplicate')}
              onClick={handleDuplicate}
            />
          )}
          {!isCreate && pageId && (
            <MainBtn
              variant="secondary"
              size="lg"
              label={t('sectionBuilder:onlineStore.pageEditor.preview', 'Preview')}
              onClick={handlePreview}
            />
          )}
          {!isCreate && pageId && (
            <MainBtn
              variant="secondary"
              size="lg"
              label={t('sectionBuilder:onlineStore.pageEditor.editInEditor', 'Edit in Editor')}
              onClick={handleEditInEditor}
            />
          )}
          <MainBtn
            variant="primary"
            size="lg"
            label={
              !isCreate && pageId
                ? t('sectionBuilder:onlineStore.pageEditor.saveChanges', 'Save changes')
                : t('sectionBuilder:onlineStore.pageEditor.save', 'Save')
            }
            onClick={handleSave}
            disabled={!canSave}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t('sectionBuilder:onlineStore.pageEditor.deleteConfirmTitle', 'Delete this page?')}
        description={t(
          'sectionBuilder:onlineStore.pageEditor.deleteConfirmDescription',
          'This can’t be undone.'
        )}
        confirmLabel={t('sectionBuilder:onlineStore.pageEditor.delete', 'Delete page')}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Popup
        open={confirmUnsavedEditor}
        onClose={() => setConfirmUnsavedEditor(false)}
        title={t('sectionBuilder:onlineStore.pageEditor.unsavedEditorTitle', 'You have unsaved changes')}
        description={t(
          'sectionBuilder:onlineStore.pageEditor.unsavedEditorDescription',
          'Save your changes before opening the section editor, or keep editing here.'
        )}
        platform="desktop"
        primaryAction={{
          label: t('sectionBuilder:onlineStore.pageEditor.saveAndContinue', 'Save changes'),
          onClick: handleSaveThenEditInEditor,
        }}
        secondaryAction={{
          label: t('sectionBuilder:onlineStore.pageEditor.keepEditing', 'Keep editing'),
          onClick: () => setConfirmUnsavedEditor(false),
        }}
      />
    </div>
  );
}
