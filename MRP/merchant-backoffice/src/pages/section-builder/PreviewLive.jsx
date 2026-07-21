import { useParams, useSearchParams } from 'react-router-dom';
import { loadDraft } from './state/storage';
import Canvas from './ui/Canvas';

/**
 * Chrome-free live preview (US-2.2). Real implementation needs a signed,
 * server-issued token with a 24h expiry; there's no backend yet, so this
 * only checks a token is present in the URL (TODO: replace with real
 * token issuance/verification once a backend exists).
 */
export default function PreviewLive() {
  const { storeId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        This preview link is invalid or has expired.
      </div>
    );
  }

  const draft = loadDraft(storeId);
  const activePage = draft?.pages?.find((p) => p.id === draft.activePageId);
  const sections = activePage?.sections ?? [];

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
      readOnly
    />
  );
}
