import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import { Popup } from '../../ce-ui';

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
 * Rich Text Editor — Insert Link. Built on ce-ui's shared `Popup` (same
 * dialog primitive as the rest of this app) instead of a bespoke overlay —
 * replaces the earlier `window.prompt`, a browser-native dialog that
 * couldn't be styled/localized. Opened with `existingUrl` set, it doubles
 * as the "edit or remove the existing link" surface (Popup's secondary
 * action slot becomes "Remove link" in that case).
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
    <Popup
      open={open}
      onClose={onClose}
      platform="tablet"
      align="left"
      title={
        existingUrl
          ? t('sectionBuilder:onlineStore.pageEditor.linkEditHeading', 'Edit link')
          : t('sectionBuilder:onlineStore.pageEditor.linkInsertHeading', 'Insert link')
      }
      primaryAction={{
        label: existingUrl
          ? t('sectionBuilder:onlineStore.pageEditor.linkUpdate', 'Update link')
          : t('sectionBuilder:onlineStore.pageEditor.linkInsert', 'Insert link'),
        onClick: handleApply,
        disabled: !url.trim(),
      }}
      secondaryAction={
        existingUrl
          ? {
              label: t('sectionBuilder:onlineStore.pageEditor.linkRemove', 'Remove link'),
              onClick: () => {
                onRemove();
                onClose();
              },
            }
          : undefined
      }
    >
      <label className="mb-1.5 block text-xs font-medium text-lb-on-surface-2">
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
    </Popup>
  );
}
