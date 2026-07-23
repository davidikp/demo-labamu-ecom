import { useTranslation } from 'react-i18next';

/**
 * US-2.1 — switches the canvas reference width; both viewports render the
 * same draft content, so this never triggers a reload.
 */
export default function ViewportToggle({ viewport, onChange }) {
  const { t } = useTranslation();
  const OPTIONS = [
    { value: 'desktop', label: t('sectionBuilder:editor.viewportToggle.desktop') },
    { value: 'mobile', label: t('sectionBuilder:editor.viewportToggle.mobile') },
  ];
  return (
    <div role="group" aria-label={t('sectionBuilder:editor.viewportToggle.ariaLabel')} className="inline-flex rounded-md border border-gray-200 p-0.5">
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
