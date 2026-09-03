import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * @module section-builder/ui/fields/PageLinkCombobox
 * @description A "search or paste a link" combobox for menu item URLs
 * (Content > Menus), mirroring Shopify's link picker: typing filters the
 * current store's pages by name and offers them as selectable suggestions
 * (picking one fills the field with that page's relative `slug`, the same
 * value RepeaterField's `autofillUrlFromActivePage` already uses for an
 * internal link — see that file). Anything that doesn't match a page —
 * a raw path or an external URL — is accepted as free text, exactly like the
 * field it replaces; there is no validation step.
 *
 * The suggestion list is rendered through a portal to `document.body`
 * (same technique as components/ui/Dropdown.jsx) rather than absolutely
 * positioned inside this field's own wrapper — MenuFormDrawer's item list
 * needs `overflow-y: auto` to scroll when there are many items, and an
 * in-flow absolutely-positioned list gets clipped by that same scroll
 * boundary (and by the Popup's own scrollable body) once it would render
 * near the bottom of either. Portaling escapes both.
 *
 * Kept intentionally small and scoped to what MenusManagement.jsx needs
 * (a flat, keyboard-free click list) rather than a general-purpose
 * combobox — reuse from elsewhere is welcome, but this isn't trying to be
 * one.
 */
export default function PageLinkCombobox({ value, onChange, pages, placeholder, className = 'w-1/2', error = false }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState({ top: 0, left: 0, width: 0 });
  const blurTimeout = useRef(null);
  const inputRef = useRef(null);

  const query = value ?? '';
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages.slice(0, 8);
    return pages.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 8);
  }, [pages, query]);

  const updatePlacement = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPlacement({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, []);

  // Recomputed on scroll/resize (capture:true so it catches scrolling from
  // any ancestor, e.g. the menu items list or the modal body — not just
  // window-level scroll) so the portaled list tracks the input instead of
  // freezing at whatever position it had when it opened.
  useEffect(() => {
    if (!open) return undefined;
    updatePlacement();
    window.addEventListener('scroll', updatePlacement, true);
    window.addEventListener('resize', updatePlacement);
    return () => {
      window.removeEventListener('scroll', updatePlacement, true);
      window.removeEventListener('resize', updatePlacement);
    };
  }, [open, updatePlacement]);

  const selectPage = (page) => {
    onChange(page.slug ?? '/');
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay so a click on a suggestion registers before the list unmounts.
          blurTimeout.current = window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        className={`w-full rounded-md border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${
          error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
        }`}
      />
      {open &&
        matches.length > 0 &&
        createPortal(
          <ul
            style={{ position: 'fixed', top: placement.top, left: placement.left, width: placement.width, zIndex: 9999 }}
            className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {matches.map((page) => (
              <li key={page.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectPage(page)}
                  className="flex w-full flex-col items-start px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                >
                  <span className="text-gray-900">{page.name}</span>
                  <span className="text-xs text-gray-400">{page.slug}</span>
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
