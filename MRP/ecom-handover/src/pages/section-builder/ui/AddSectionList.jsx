import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SECTION_REGISTRY, SECTION_CATEGORIES } from '../sections/registry';
import { MAX_SECTIONS_PER_PAGE, SECTION_WARNING_THRESHOLD } from '../state/builderReducer';

/**
 * "Add section" list (US-3.5, US-3.8). Header/footer are excluded — they're
 * global singletons, always present (US-3.6).
 */
export default function AddSectionList({ sectionCount, onAdd }) {
  const { t } = useTranslation();
  const [bannerDismissedAt, setBannerDismissedAt] = useState(-1);
  const atCap = sectionCount >= MAX_SECTIONS_PER_PAGE;
  const showWarning =
    sectionCount >= SECTION_WARNING_THRESHOLD && sectionCount !== bannerDismissedAt;

  const grouped = SECTION_REGISTRY.reduce((acc, entry) => {
    (acc[entry.category] ??= []).push(entry);
    return acc;
  }, {});

  return (
    <div className="border-t border-gray-100 p-2">
      <h3 className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {t('sectionBuilder:editor.addSectionList.addSection')}
      </h3>

      {showWarning && (
        <div className="mx-1 mb-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800">
          {t('sectionBuilder:editor.addSectionList.pageGettingLong')}
          <button
            type="button"
            onClick={() => setBannerDismissedAt(sectionCount)}
            className="ml-2 font-medium underline"
          >
            {t('sectionBuilder:editor.addSectionList.dismiss')}
          </button>
        </div>
      )}

      <div className="max-h-64 overflow-y-auto">
        {Object.entries(grouped).map(([category, entries]) => (
          <div key={category} className="mb-2">
            <p className="px-2 pb-1 text-[11px] font-medium text-gray-400">
              {SECTION_CATEGORIES[category]}
            </p>
            <ul>
              {entries.map((entry) => (
                <li key={entry.type}>
                  <button
                    type="button"
                    disabled={atCap}
                    title={atCap ? t('sectionBuilder:editor.addSectionList.removeToAddMore', { n: MAX_SECTIONS_PER_PAGE }) : undefined}
                    onClick={() => onAdd(entry.type)}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                  >
                    {entry.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
