import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PagesPanel from '../section-builder/ui/PagesPanel';
import { ACTIONS } from '../section-builder/state/builderReducer';
import { loadDraft } from '../section-builder/state/storage';
import { createFreshState } from '../section-builder/state/useSectionBuilder';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { slugify } from '../section-builder/sections/pageHelpers';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// ThemeGallery.jsx.
const STORE_ID = 'demo';
const STORE_NAME_PLACEHOLDER = 'My Store';

function createPageId(slug) {
  return `page-${slugify(slug)}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * @module pages/online-store/PagesManagement
 * @description Online Store > Pages — structural site management, separate
 * from Online Store > Theme. Reuses the builder's own PagesPanel (US-6.1..6.6)
 * so add/rename/delete/reorder/SEO/nav-visibility behave identically here and
 * inside the builder's Pages tab — the only difference is this screen has no
 * live useSectionBuilder instance, so every action runs via runDraftAction
 * straight against the persisted draft, and selecting a page navigates into
 * the section-builder scoped to that page instead of just switching tabs.
 */
export default function PagesManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => loadDraft(STORE_ID) ?? createFreshState(STORE_ID));

  const dispatch = (action) => setDraft(runDraftAction(STORE_ID, action));

  const handleSelectPage = (pageId) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_PAGE, pageId });
    navigate(`/section-builder/${STORE_ID}/pages/${pageId}`);
  };

  const handleAddPage = ({ name, slug }) =>
    dispatch({
      type: ACTIONS.ADD_PAGE,
      page: { id: createPageId(slug), name, type: 'custom', slug: `/${slug}`, sections: [], seo: {}, hiddenFromNav: false },
    });

  const handleRenamePage = (pageId, name) => dispatch({ type: ACTIONS.RENAME_PAGE, pageId, name });
  const handleDeletePage = (pageId) => dispatch({ type: ACTIONS.DELETE_PAGE, pageId });
  const handleUpdatePageSeo = (pageId, seo) => dispatch({ type: ACTIONS.UPDATE_PAGE_SEO, pageId, seo });
  const handleTogglePageNavHidden = (pageId) => dispatch({ type: ACTIONS.TOGGLE_PAGE_NAV_HIDDEN, pageId });
  const handleReorderPages = (orderedIds) => dispatch({ type: ACTIONS.REORDER_PAGES, orderedIds });

  return (
    <div style={{ background: '#F4F4F4', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, maxWidth: '720px', width: '100%', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 20px', fontSize: '26px', fontWeight: 700, color: '#282828', flexShrink: 0 }}>
          {t('sectionBuilder:editor.pagesPanel.heading')}
        </h1>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', flex: 1, minHeight: 0, overflow: 'auto' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #D4D4D4' }}>
            <p style={{ fontSize: '15px', color: '#6B7280', margin: 0 }}>
              {t('sectionBuilder:editor.pagesPanel.managementSubtitle')}
            </p>
          </div>
          <PagesPanel
            pages={draft.pages}
            activePageId={draft.activePageId}
            storeName={STORE_NAME_PLACEHOLDER}
            onSelectPage={handleSelectPage}
            onAddPage={handleAddPage}
            onRenamePage={handleRenamePage}
            onDeletePage={handleDeletePage}
            onUpdateSeo={handleUpdatePageSeo}
            onToggleNavHidden={handleTogglePageNavHidden}
            onReorderPages={handleReorderPages}
          />
        </div>
      </div>
    </div>
  );
}
