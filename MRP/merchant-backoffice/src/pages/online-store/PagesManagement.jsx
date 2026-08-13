import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, StatusBadge, MainBtn } from '../../ce-ui';
import { loadDraft } from '../section-builder/state/storage';
import { createFreshState } from '../section-builder/state/useSectionBuilder';
import { formatRelativeTime } from './timeUtils';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// ThemeGallery.jsx.
const STORE_ID = 'demo';

/**
 * Derives the "Content" column preview from the Page editor's persisted
 * `page.content` HTML (always present — even as `''` for untouched pages,
 * see createDefaultPages() and PageEditor.jsx's blankPage()).
 */
function stripHtmlAndTruncate(html, max) {
  const text = String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function contentPreview(page) {
  return page.content ? stripHtmlAndTruncate(page.content, 60) : '—';
}

/**
 * Resolves a page's visibility "bucket" — the same three states shown as
 * badges in the table and tallied by the stat cards above it.
 */
function visibilityBucket(page) {
  if (page.visibility === 'visible' && page.visibleFrom && page.visibleFrom > Date.now()) {
    return 'scheduled';
  }
  if (page.visibility === 'hidden') return 'hidden';
  return 'visible';
}

function visibilityBadge(page, t) {
  const bucket = visibilityBucket(page);
  if (bucket === 'scheduled') {
    return <StatusBadge label={t('sectionBuilder:onlineStore.pages.scheduled', 'Scheduled')} color="blue" tone="soft" />;
  }
  if (bucket === 'hidden') {
    return <StatusBadge label={t('sectionBuilder:onlineStore.pages.hidden', 'Hidden')} color="grey" tone="soft" />;
  }
  return <StatusBadge label={t('sectionBuilder:onlineStore.pages.visible', 'Visible')} color="green" tone="soft" />;
}

/**
 * @module pages/online-store/PagesManagement
 * @description Online Store > Pages — Shopify-style table list of every page
 * on the site. This screen is read-only: it loads the persisted draft just to
 * render Title/Visibility/Content/Updated, then navigates into a dedicated
 * page-editor screen (`/online-store/pages/:pageId`, built in a later phase)
 * for every mutation — add/rename/delete/SEO/visibility all move there.
 */
export default function PagesManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [draft] = useState(() => loadDraft(STORE_ID) ?? createFreshState(STORE_ID));

  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const pages = useMemo(() => draft.pages ?? [], [draft.pages]);

  const filteredPages = useMemo(() => {
    let rows = pages;
    if (visibilityFilter !== 'all') {
      rows = rows.filter((p) => visibilityBucket(p) === visibilityFilter);
    }
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      rows = rows.filter((p) => (p.name ?? '').toLowerCase().includes(needle));
    }
    if (sortKey === 'name' && sortDirection) {
      rows = [...rows].sort((a, b) => {
        const cmp = String(a.name ?? '').localeCompare(String(b.name ?? ''));
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [pages, visibilityFilter, search, sortKey, sortDirection]);

  const pagedPages = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredPages.slice(start, start + perPage);
  }, [filteredPages, page, perPage]);

  const columns = [
    {
      key: 'name',
      header: t('sectionBuilder:onlineStore.pages.columnTitle', 'Title'),
      sortable: true,
      render: (value) => <span style={{ fontWeight: 700, color: '#282828' }}>{value}</span>,
    },
    {
      key: 'visibility',
      header: t('sectionBuilder:onlineStore.pages.columnVisibility', 'Visibility'),
      render: (_value, row) => visibilityBadge(row, t),
    },
    {
      key: 'sections',
      header: t('sectionBuilder:onlineStore.pages.columnContent', 'Content'),
      width: '50%',
      render: (_value, row) => (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
          {contentPreview(row)}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: t('sectionBuilder:onlineStore.pages.columnUpdated', 'Updated'),
      render: (value) => (value ? formatRelativeTime(value) : '—'),
    },
  ];

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828' }}>
            {t('sectionBuilder:editor.pagesPanel.heading')}
          </h1>
          <MainBtn
            variant="primary"
            size="sm"
            label={t('sectionBuilder:onlineStore.pages.addPage', 'Add page')}
            onClick={() => navigate('/online-store/pages/new')}
          />
        </div>

        <div className="pages-table-wrapper" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9' }}>
          <Table
            columns={columns}
            data={pagedPages}
            onRowClick={(row) => navigate(`/online-store/pages/${row.id}`)}
            totalRows={filteredPages.length}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={(key, direction) => {
              setSortKey(key);
              setSortDirection(direction);
            }}
            hidePaginationOnSinglePage
            filters={{
              search: {
                value: search,
                onChange: (value) => {
                  setSearch(value);
                  setPage(1);
                },
                placeholder: t('sectionBuilder:onlineStore.pages.searchPlaceholder', 'Search by page title'),
              },
              singleSelect: {
                label: t('sectionBuilder:onlineStore.pages.filterVisibility', 'Visibility'),
                options: [
                  { value: 'visible', label: t('sectionBuilder:onlineStore.pages.visible', 'Visible') },
                  { value: 'hidden', label: t('sectionBuilder:onlineStore.pages.hidden', 'Hidden') },
                  { value: 'scheduled', label: t('sectionBuilder:onlineStore.pages.scheduled', 'Scheduled') },
                ],
                value: visibilityFilter === 'all' ? undefined : visibilityFilter,
                onChange: (value) => {
                  setVisibilityFilter(value ?? 'all');
                  setPage(1);
                },
                allValue: 'all',
              },
              rowsPerPage: {
                onChange: (nextPerPage) => {
                  setPerPage(nextPerPage);
                  setPage(1);
                },
              },
            }}
            emptyStateTitle={t('sectionBuilder:onlineStore.pages.noPages', 'No pages yet')}
          />
        </div>
      </div>
      {/*
        Table (ce-ui) already sets `hover:bg-lb-brand-light` + `cursor-pointer`
        on each <tr> when `onRowClick` is passed, but every <td> also paints
        its own opaque `bg-lb-surface`/`bg-lb-brand-light` background — which,
        being on the cell itself, fully occludes the row's hover background.
        Table exposes no `rowClassName`/`hoverable` prop to override this, so
        we target its actual rendered DOM (tbody > tr > td) from here with a
        higher-specificity scoped selector, matching this codebase's existing
        convention of inline `<style>` blocks with scoped class selectors
        (see ThemeGallery.jsx's `.template-card:hover`).
      */}
      <style>{`
        .pages-table-wrapper tbody tr:hover td {
          background-color: #F9FAFB;
        }
      `}</style>
    </div>
  );
}
