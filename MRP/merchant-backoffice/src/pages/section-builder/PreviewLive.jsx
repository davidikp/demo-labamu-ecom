import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadDraft } from './state/storage';
import Canvas from './ui/Canvas';

/**
 * Chrome-free live preview (US-2.2). Real implementation needs a signed,
 * server-issued token with a 24h expiry; there's no backend yet, so this
 * only checks a token is present in the URL (TODO: replace with real
 * token issuance/verification once a backend exists).
 */
export default function PreviewLive() {
  const { t } = useTranslation();
  const { storeId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const draft = useMemo(() => loadDraft(storeId), [storeId]);
  // Starts on whatever page was active in the builder; clicking a header/
  // footer nav link (see onNavigate below) switches which page is shown,
  // matching the link's URL against each page's slug — this preview has no
  // real routing of its own, just this one in-memory "current page".
  const [currentPageId, setCurrentPageId] = useState(() => draft?.activePageId);

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        {t('sectionBuilder:editor.previewLive.invalidLink')}
      </div>
    );
  }

  const activePage = draft?.pages?.find((p) => p.id === currentPageId) ?? draft?.pages?.[0];
  const sections = activePage?.sections ?? [];

  const handleNavigate = (url) => {
    const target = draft?.pages?.find((p) => p.slug === url);
    if (target) setCurrentPageId(target.id);
  };

  return (
    <Canvas
      viewport="desktop"
      header={draft?.header ?? { type: 'header', hidden: true }}
      footer={draft?.footer ?? { type: 'footer', hidden: true }}
      sections={sections}
      selectedId={null}
      onSelect={() => {}}
      onDeselect={() => {}}
      onMoveSection={() => {}}
      onDuplicateSection={() => {}}
      onDeleteSection={() => {}}
      theme={draft?.theme}
      mediaLibrary={draft?.mediaLibrary ?? []}
      onNavigate={handleNavigate}
      currentPath={activePage?.slug}
      readOnly
    />
  );
}
