import { useMemo, useRef, useState } from 'react';

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
 * Kept intentionally small and scoped to what MenusManagement.jsx needs
 * (a flat, keyboard-free click list) rather than a general-purpose
 * combobox — reuse from elsewhere is welcome, but this isn't trying to be
 * one.
 */
export default function PageLinkCombobox({ value, onChange, pages, placeholder, className = 'w-1/2' }) {
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef(null);

  const query = value ?? '';
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages.slice(0, 8);
    return pages.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 8);
  }, [pages, query]);

  const selectPage = (page) => {
    onChange(page.slug ?? '/');
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Delay so a click on a suggestion registers before the list unmounts.
          blurTimeout.current = window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
      {open && matches.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
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
        </ul>
      )}
    </div>
  );
}
