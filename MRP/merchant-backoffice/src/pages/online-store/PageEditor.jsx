import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles } from 'lucide-react';
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
import GenerateTextModal from './GenerateTextModal';

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
    redirects: [],
  };
}

function truncate(text, max) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

// There's no real backend to fail a Save request against — same "type a
// magic marker" convention as GenerateTextModal/PagesManagement's bulk
// actions, so the Edit an Existing Page / Create Page "the request fails on
// the server" negative case is actually reachable instead of unbuildable.
function isForcedSaveFailure(name) {
  return name.trim().toLowerCase().includes('(save fail)');
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

// Duplicate a Page — distinct auto-generated titles ("Copy of X", "Copy of X
// (2)", ...) instead of always appending the same " copy" suffix, so
// duplicating the same page repeatedly doesn't produce indistinguishable
// rows in the Pages list.
function nextCopyTitle(baseName, pages) {
  const existingNames = new Set(pages.map((p) => p.name));
  const base = `Copy of ${baseName}`;
  if (!existingNames.has(base)) return base;
  let n = 2;
  while (existingNames.has(`${base} (${n})`)) n += 1;
  return `${base} (${n})`;
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
    urlHandle: form.urlHandle,
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
      urlHandle: page.slug ? page.slug.replace(/^\//, '') : '',
      redirectOldHandle: true,
    };
    // Only re-derive when we switch which page id is loaded (e.g. right
    // after a first Save on a new page) — not on every draft re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const [form, setForm] = useState(initialForm);
  const [savedSnapshot, setSavedSnapshot] = useState(() => formToSnapshot(initialForm));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generateTitleOpen, setGenerateTitleOpen] = useState(false);
  const [urlHandleError, setUrlHandleError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Edit Search Engine Listing — only meaningful once a handle already
  // exists to redirect *from* (a brand-new page has no prior URL yet).
  const handleChanged = !isCreate && pageId && form.urlHandle !== initialForm.urlHandle;

  // A page opened from the Page List that no longer exists in the draft
  // (deleted elsewhere) — show a not-found state instead of a blank form
  // silently pretending it's a fresh "Add page".
  const notFound = !isCreate && routePageId && !existingPage && pageId === routePageId;

  const isDirty = formToSnapshot(form) !== savedSnapshot;
  // isSaving guards the double-Save-click case (Edit an Existing Page's "a
  // Save request is already in flight" edge case) — Save is disabled the
  // instant it's clicked, so a second click before the (synchronous, but
  // guarded defensively) persist finishes can't create a duplicate.
  const canSave = isDirty && form.name.trim().length > 0 && !isSaving;

  const patchForm = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Persists the form (create or update) and returns the page's id, or
  // `null` if the save was rejected (bad URL handle, or the demo's
  // simulated server-failure marker) — the footer Save button and the
  // "unsaved changes" prompt shown from "Edit in Editor" both call this and
  // branch on that return value.
  const persistPage = () => {
    if (!canSave) return null;
    setUrlHandleError(null);
    setSaveError(null);

    if (isForcedSaveFailure(form.name)) {
      setSaveError(
        t('sectionBuilder:onlineStore.pageEditor.saveFailedBanner', 'Something went wrong saving this page. Please try again.')
      );
      return null;
    }

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
        redirects: [],
      };
      const next = runDraftAction(STORE_ID, { type: ACTIONS.ADD_PAGE, page });
      setDraft(next);
      setPageId(newId);
      setSavedSnapshot(formToSnapshot(form));
      showSnackbar(t('sectionBuilder:onlineStore.pageEditor.savedSnackbar', 'Page successfully saved'), 'green');
      return newId;
    }

    // Edit Search Engine Listing — URL handle: normalize spaces to dashes
    // and reject a handle already used by another page instead of silently
    // colliding with it.
    const normalizedHandle = slugify(form.urlHandle) || slugify(form.name);
    if (isSlugTaken(normalizedHandle, draft.pages, pageId)) {
      setUrlHandleError(t('sectionBuilder:onlineStore.pageEditor.urlHandleTaken', 'This URL handle is already in use by another page.'));
      return null;
    }

    const oldSlug = existingPage?.slug;
    const newSlug = `/${normalizedHandle}`;
    const redirects =
      handleChanged && form.redirectOldHandle && oldSlug && oldSlug !== newSlug
        ? [...(existingPage?.redirects ?? []), oldSlug]
        : existingPage?.redirects ?? [];

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
        slug: newSlug,
        redirects,
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
    setIsSaving(true);
    const result = persistPage();
    setIsSaving(false);
    if (result) navigate('/online-store/pages');
  };

  const handleUploadMedia = (item) => {
    const next = runDraftAction(STORE_ID, { type: ACTIONS.ADD_MEDIA_ITEM, item });
    setDraft(next);
  };

  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = () => {
    if (!pageId || !existingPage || isDuplicating) return;
    setIsDuplicating(true);
    const newName = nextCopyTitle(existingPage.name, draft.pages);
    const newId = createPageId(newName);
    const baseSlug = slugify(newName);
    const slug = isSlugTaken(baseSlug, draft.pages) ? `${baseSlug}-${newId.slice(-8)}` : baseSlug;
    const page = {
      ...existingPage,
      id: newId,
      name: newName,
      slug: `/${slug}`,
      // Duplicate a Page: visibility always defaults to Hidden regardless of
      // the original's state, and any scheduled publish date is dropped
      // rather than carried over.
      visibility: 'hidden',
      visibleFrom: null,
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
    // No `noopener`/`noreferrer` here on purpose: this app's route guard
    // (App.jsx's ProtectedRoute) checks `sessionStorage`, which the browser
    // only clones into a same-origin tab opened via window.open() when it
    // keeps the opener relationship. With noopener set, the new tab got a
    // blank sessionStorage and bounced straight to /login instead of
    // showing the preview. This link is our own internal route, not
    // third-party content, so there's no tab-nabbing risk being traded away.
    window.open(`/online-store/pages/${pageId}/preview`, '_blank');
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
    if (id) goToEditor(id);
  };

  const pageModeTitle =
    isCreate && !pageId
      ? t('sectionBuilder:onlineStore.pageEditor.addNewPageTitle', 'Add New Page')
      : t('sectionBuilder:onlineStore.pageEditor.editPageTitle', 'Edit Page');

  const handleBackNavigation = () => navigate('/online-store/pages');

  if (notFound) {
    return (
      <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
          <h1 className="text-xl font-bold text-gray-800">
            {t('sectionBuilder:onlineStore.pageEditor.notFoundTitle', 'This page no longer exists')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('sectionBuilder:onlineStore.pageEditor.notFoundDescription', 'It may have been deleted by someone else.')}
          </p>
          <MainBtn
            variant="primary"
            size="sm"
            label={t('sectionBuilder:onlineStore.pages.heading', 'Pages')}
            onClick={handleBackNavigation}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#F4F4F4',
        height: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {/* Own scroll region, separate from the sticky footer below — Layout's
          shared Outlet wrapper (`flex:1, overflowY:auto`) is sized to
          exactly this box's height, so nesting a second `overflow-y:auto`
          region here (rather than relying on that outer one) is what lets
          the footer stay a plain, always-visible flex sibling instead of a
          `position: fixed`/`sticky` bar that has to fight the sidebar's
          stacking context or leave dead space reserved beneath the content. */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
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

      <div className="w-full px-6 py-6">
        {saveError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main column */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-800">
                  {t('sectionBuilder:onlineStore.pageEditor.titleLabel', 'Title')}
                </label>
                <button
                  type="button"
                  onClick={() => setGenerateTitleOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium text-[#8A3FFC] hover:underline"
                >
                  <Sparkles size={12} />
                  {t('sectionBuilder:onlineStore.pageEditor.generateText', 'Generate text')}
                </button>
              </div>
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
              <RichTextEditor
                value={form.content}
                onChange={(html) => patchForm({ content: html })}
                mediaLibrary={draft.mediaLibrary}
                onUploadMedia={handleUploadMedia}
              />
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
                  {truncate(form.metaTitle || form.name, 70) || t('sectionBuilder:onlineStore.pageEditor.untitled', 'Untitled page')}
                </div>
                <div className="text-[13px] text-gray-600 line-clamp-2">
                  {form.metaDescription
                    ? truncate(form.metaDescription, 160)
                    : t('sectionBuilder:onlineStore.pageEditor.noDescription', 'Add a description to see how this page might appear in search results.')}
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#006BFF] resize-none mb-3"
              />
              {!isCreate && pageId && (
                <>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('sectionBuilder:onlineStore.pageEditor.urlHandle', 'URL handle')}
                  </label>
                  <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-[#006BFF] overflow-hidden">
                    <span className="pl-3 text-sm text-gray-400">/</span>
                    <input
                      type="text"
                      value={form.urlHandle}
                      onChange={(e) => patchForm({ urlHandle: e.target.value })}
                      onBlur={(e) => patchForm({ urlHandle: slugify(e.target.value) })}
                      className="flex-1 h-10 px-1.5 text-sm text-gray-800 outline-none"
                    />
                  </div>
                  {urlHandleError && <p className="mt-1 text-xs text-red-600">{urlHandleError}</p>}
                  {handleChanged && (
                    <label className="mt-2 flex items-start gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={form.redirectOldHandle}
                        onChange={(e) => patchForm({ redirectOldHandle: e.target.checked })}
                        className="mt-0.5"
                      />
                      {t(
                        'sectionBuilder:onlineStore.pageEditor.redirectOldHandle',
                        'Create a redirect from the old URL ({{old}})',
                        { old: existingPage?.slug ?? '' }
                      )}
                    </label>
                  )}
                </>
              )}
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
      </div>

      {/* Footer action bar — Delete (edit mode only) sits on the left,
          opposite Duplicate/Preview/Save(-changes) on the right. A plain
          flex sibling of the scroll region above (not `position: fixed`/
          `sticky`), so it's always visible without needing to fight the
          sidebar's stacking context (see the scroll-region comment above)
          or reserve dead space under the content for it to float over. */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between gap-2">
        {!isCreate && pageId ? (
          <MainBtn
            variant="danger-tertiary"
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

      <GenerateTextModal
        open={generateTitleOpen}
        mode="title"
        onApply={(text) => patchForm({ name: text })}
        onClose={() => setGenerateTitleOpen(false)}
      />
    </div>
  );
}
