import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { matchesSearch } from '../section-builder/sections/mediaHelpers';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

function probeDimensions(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = src;
  });
}

/**
 * Insert-image picker for the Rich Text Editor's Content field (Rich Text
 * Editor — Insert Image). Shares the site's draft `mediaLibrary` (the same
 * array Section Builder's Media panel reads/writes) so an image uploaded
 * here shows up there too, and vice versa. Filtering is scoped to filename
 * search — the PRD's "Used in: Catalog Media" / "Used in: Published Site" /
 * product filters would need catalog + live-site data this demo doesn't
 * have wired up, so they're left out rather than faked.
 */
export default function SelectImageModal({ open, mediaLibrary = [], onUpload, onPick, onClose }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [urlError, setUrlError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const visible = mediaLibrary.filter((item) => matchesSearch(item, query));

  const handleClose = () => {
    setQuery('');
    setUrlValue('');
    setUrlError(null);
    setUploadError(null);
    setSelectedId(null);
    onClose();
  };

  const handlePick = (item) => {
    onPick(item.url);
    handleClose();
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError(t('sectionBuilder:onlineStore.pageEditor.imageUnsupportedType', 'That file type isn’t supported. Please upload an image.'));
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError(t('sectionBuilder:onlineStore.pageEditor.imageTooLarge', 'That image is too large (max 10MB).'));
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const src = reader.result;
      const { width, height } = await probeDimensions(src);
      const item = {
        id: crypto.randomUUID(),
        filename: file.name,
        url: src,
        width,
        height,
        uploadedAt: new Date().toISOString(),
      };
      onUpload(item);
      onPick(item.url);
      handleClose();
    };
    reader.readAsDataURL(file);
  };

  const handleAddFromUrl = () => {
    const url = urlValue.trim();
    if (!url) return;
    const img = new Image();
    img.onload = () => {
      setUrlError(null);
      onPick(url);
      handleClose();
    };
    img.onerror = () => {
      setUrlError(t('sectionBuilder:onlineStore.pageEditor.imageUrlInvalid', 'That URL doesn’t point to a valid image.'));
    };
    img.src = url;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" role="dialog" aria-label={t('sectionBuilder:onlineStore.pageEditor.selectImageHeading', 'Select image')}>
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative flex h-[560px] max-h-[90vh] w-[720px] max-w-[95vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {t('sectionBuilder:onlineStore.pageEditor.selectImageHeading', 'Select image')}
          </h2>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('sectionBuilder:onlineStore.pageEditor.imageSearchPlaceholder', 'Search by filename')}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <UploadCloud size={14} />
            {t('sectionBuilder:onlineStore.pageEditor.imageUpload', 'Upload')}
          </button>
        </div>
        {uploadError && <p className="px-5 pt-2 text-xs text-red-600">{uploadError}</p>}

        <div className="flex-1 overflow-y-auto p-5">
          {mediaLibrary.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t('sectionBuilder:onlineStore.pageEditor.imageEmptyLibrary', 'No images in your library yet.')}
            </p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t('sectionBuilder:onlineStore.pageEditor.imageNoResults', 'No results found for "{{query}}".', { query })}
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  onDoubleClick={() => handlePick(item)}
                  className={`overflow-hidden rounded-lg border p-1 text-left ${
                    selectedId === item.id ? 'border-[#006BFF] ring-2 ring-blue-500/30' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={item.url} alt={item.filename} className="aspect-square w-full rounded object-cover" />
                  <p className="mt-1 truncate text-[11px] text-gray-600">{item.filename}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <LinkIcon size={12} />
            {t('sectionBuilder:onlineStore.pageEditor.imageAddFromUrl', 'Add from URL')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#006BFF]"
            />
            <button
              type="button"
              onClick={handleAddFromUrl}
              disabled={!urlValue.trim()}
              className="rounded-lg bg-[#006BFF] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {t('sectionBuilder:onlineStore.pageEditor.imageAdd', 'Add')}
            </button>
          </div>
          {urlError && <p className="mt-1 text-xs text-red-600">{urlError}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button type="button" onClick={handleClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            {t('sectionBuilder:editor.common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            disabled={!selectedId}
            onClick={() => handlePick(mediaLibrary.find((m) => m.id === selectedId))}
            className="rounded-lg bg-[#006BFF] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {t('sectionBuilder:onlineStore.pageEditor.imageDone', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
}
