/**
 * Wraps a single block's markup on the canvas so it can be individually
 * selected (Shopify-style). No-op passthrough when not in builder mode
 * (`onSelect` absent) so the live storefront renders the block untouched.
 */
export default function BlockBoundary({ selected, onSelect, label, children }) {
  if (!onSelect) return children;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={'relative cursor-pointer ' + (selected ? 'z-10' : '')}
    >
      {selected && (
        <>
          <div className="pointer-events-none absolute inset-0 z-20 border-2 border-blue-500" />
          {label && (
            <span className="absolute left-1 top-1 z-20 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {label}
            </span>
          )}
        </>
      )}
      {children}
    </div>
  );
}
