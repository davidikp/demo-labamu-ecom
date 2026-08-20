import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, TriangleAlert } from 'lucide-react';
import { MainBtn } from '../../ce-ui';

// Loose but deliberate: only accepts an <iframe ...> tag with a src, so a
// pasted <script> or plain text is rejected rather than silently embedded.
const IFRAME_SRC_RE = /<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*><\/iframe>|<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*\/>/i;

export function extractIframeSrc(snippet) {
  const match = String(snippet || '').match(IFRAME_SRC_RE);
  return match ? match[1] || match[2] : null;
}

/**
 * Rich Text Editor — Insert Video. Accepts a pasted iframe embed snippet
 * (the PRD's flow — no upload/transcoding pipeline in this demo) and
 * doubles as the edit surface when a video already exists in the content:
 * opened with `existingSrc` set, it offers Replace/Remove instead of Insert.
 */
export default function InsertVideoModal({ open, existingSrc, onInsert, onRemove, onClose }) {
  const { t } = useTranslation();
  const [snippet, setSnippet] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setSnippet(existingSrc ? `<iframe src="${existingSrc}"></iframe>` : '');
      setError(null);
    }
  }, [open, existingSrc]);

  if (!open) return null;

  const handleInsert = () => {
    if (!snippet.trim()) return;
    const src = extractIframeSrc(snippet);
    if (!src) {
      setError(t('sectionBuilder:onlineStore.pageEditor.videoInvalidSnippet', 'That doesn’t look like a valid embed snippet. Paste the full <iframe> code.'));
      return;
    }
    onInsert(src);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[480px] max-w-[95vw] rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {existingSrc
              ? t('sectionBuilder:onlineStore.pageEditor.videoEditHeading', 'Edit embedded video')
              : t('sectionBuilder:onlineStore.pageEditor.videoInsertHeading', 'Insert video')}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            {t('sectionBuilder:onlineStore.pageEditor.videoSnippetLabel', 'Embed snippet')}
          </label>
          <textarea
            autoFocus
            rows={4}
            value={snippet}
            onChange={(e) => {
              setSnippet(e.target.value);
              setError(null);
            }}
            placeholder='<iframe src="https://www.youtube.com/embed/…"></iframe>'
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs text-gray-800 outline-none focus:border-[#006BFF]"
          />
          {error && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              <TriangleAlert size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-5 py-4">
          {existingSrc ? (
            <MainBtn
              variant="danger"
              size="sm"
              label={t('sectionBuilder:onlineStore.pageEditor.videoRemove', 'Remove video')}
              onClick={() => {
                onRemove();
                onClose();
              }}
            />
          ) : (
            <span />
          )}
          <MainBtn
            variant="primary"
            size="sm"
            label={
              existingSrc
                ? t('sectionBuilder:onlineStore.pageEditor.videoReplace', 'Replace video')
                : t('sectionBuilder:onlineStore.pageEditor.videoInsert', 'Insert video')
            }
            onClick={handleInsert}
            disabled={!snippet.trim()}
          />
        </div>
      </div>
    </div>
  );
}
