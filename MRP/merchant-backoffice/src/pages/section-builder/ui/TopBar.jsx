import { useEffect, useState } from 'react';
import { Undo2, Redo2, MoreVertical } from 'lucide-react';
import { MainBtn, IconBtn, Tooltip } from '../../../ce-ui';
import ViewportToggle from './ViewportToggle';

/**
 * Persistent top bar (US-1.2) — never scrolls, never hides its controls
 * regardless of builder state.
 */
export default function TopBar({
  pageName,
  viewport,
  onViewportChange,
  canUndo,
  canRedo,
  undoLabel,
  redoLabel,
  onUndo,
  onRedo,
  dirty,
  onPreview,
  onPublish,
  onDiscard,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-semibold text-gray-900 truncate">Storefront Builder</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 truncate">{pageName}</span>
        {dirty && (
          <span
            title="You have unsaved changes"
            className="ml-1 inline-block h-2 w-2 rounded-full bg-amber-500"
            aria-label="Unsaved changes"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <ViewportToggle viewport={viewport} onChange={onViewportChange} />

        <div className="flex items-center gap-1">
          <Tooltip content={undoLabel ? `Undo: ${undoLabel}` : 'Undo'}>
            <IconBtn
              icon={<Undo2 size={16} />}
              variant="ghost"
              size="sm"
              aria-label="Undo"
              disabled={!canUndo}
              onClick={onUndo}
            />
          </Tooltip>
          <Tooltip content={redoLabel ? `Redo: ${redoLabel}` : 'Redo'}>
            <IconBtn
              icon={<Redo2 size={16} />}
              variant="ghost"
              size="sm"
              aria-label="Redo"
              disabled={!canRedo}
              onClick={onRedo}
            />
          </Tooltip>
        </div>

        <MainBtn label="Preview" variant="secondary" size="sm" onClick={onPreview} />
        <MainBtn label="Publish" variant="primary" size="sm" onClick={onPublish} />

        <div className="relative">
          <IconBtn
            icon={<MoreVertical size={16} />}
            variant="ghost"
            size="sm"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div role="menu" className="absolute right-0 z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDiscard();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Discard changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
