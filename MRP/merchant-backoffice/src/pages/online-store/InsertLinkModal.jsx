import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, TriangleAlert } from 'lucide-react';
import { MainBtn } from '../../ce-ui';

// Deliberately permissive — accepts bare domains ("example.com") as well as
// full URLs, same leniency `window.prompt` had, just validated instead of
// trusted outright.
function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    try {
      new URL(`https://${value}`);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Rich Text Editor — Insert Link. Replaces the earlier `window.prompt`
 * (a browser-native dialog that can't be styled/localized and is jarring
 * next to the rest of this app's modals) with the same overlay-panel
 * pattern as InsertVideoModal/SelectImageModal. Opened with `existingUrl`
 * set, it doubles as the "edit or remove the existing link" surface.
 */
export default function InsertLinkModal({ open, existingUrl, onApply, onRemove, onClose }) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setUrl(existingUrl || '');
      setError(null);
    }
  }, [open, existingUrl]);

  if (!open) return null;

  const handleApply = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setError(t('sectionBuilder:onlineStore.pageEditor.linkInvalidUrl', 'Enter a valid URL.'));
      return;
    }
    onApply(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[440px] max-w-[95vw] rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {existingUrl
              ? t('sectionBuilder:onlineStore.pageEditor.linkEditHeading', 'Edit link')
              : t('sectionBuilder:onlineStore.pageEditor.linkInsertHeading', 'Insert link')}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            {t('sectionBuilder:onlineStore.pageEditor.linkUrlLabel', 'Link URL')}
          </label>
          <input
            autoFocus
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#006BFF]"
          />
          {error && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              <TriangleAlert size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-5 py-4">
          {existingUrl ? (
            <MainBtn
              variant="danger"
              size="sm"
              label={t('sectionBuilder:onlineStore.pageEditor.linkRemove', 'Remove link')}
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
              existingUrl
                ? t('sectionBuilder:onlineStore.pageEditor.linkUpdate', 'Update link')
                : t('sectionBuilder:onlineStore.pageEditor.linkInsert', 'Insert link')
            }
            onClick={handleApply}
            disabled={!url.trim()}
          />
        </div>
      </div>
    </div>
  );
}
