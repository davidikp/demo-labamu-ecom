const OPTIONS = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
];

/**
 * US-2.1 — switches the canvas reference width; both viewports render the
 * same draft content, so this never triggers a reload.
 */
export default function ViewportToggle({ viewport, onChange }) {
  return (
    <div role="group" aria-label="Viewport" className="inline-flex rounded-md border border-gray-200 p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={viewport === opt.value}
          onClick={() => onChange(opt.value)}
          className={
            'px-3 py-1 text-sm rounded-[5px] transition-colors ' +
            (viewport === opt.value
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100')
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
