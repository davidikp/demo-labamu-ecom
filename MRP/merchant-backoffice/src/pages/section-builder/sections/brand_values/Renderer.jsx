import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';

// Simplification: the spec calls for a curated 40-icon picker; no icon
// picker field type exists yet, so the merchant types an emoji instead.
function BrandValuesRenderer({ data, theme }) {
  const bg = resolveColor(data.background_color, theme.colors);
  const iconColor = resolveColor(data.icon_color, theme.colors);
  const values = data.values ?? [];

  return (
    <section style={{ backgroundColor: bg }} className="px-6 py-10">
      {data.show_heading !== false && (
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{data.heading || 'Why shop with us'}</h2>
      )}
      {values.length === 0 ? (
        <p className="text-sm text-gray-400">Add your first brand value below</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {values.map((v) => (
            <div key={v.id} className="max-w-[180px] text-center">
              <span style={{ color: iconColor }} className="mb-2 block text-2xl">{v.icon || '⭐'}</span>
              <p className="text-sm font-medium text-gray-900">{v.label || 'Value'}</p>
              {v.description && <p className="text-xs text-gray-500">{v.description}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(BrandValuesRenderer);
