import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';

const COLS_CLASS = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-3' };
const STAR_COLOR = '#F59E0B'; // hardcoded per spec — universally recognised as a rating color

function TestimonialsRenderer({ data, theme }) {
  const bg = resolveColor(data.background_color, theme.colors);
  const quotes = data.quotes ?? [];
  const colsClass = COLS_CLASS[data.columns_desktop] ?? COLS_CLASS['3'];

  return (
    <section style={{ backgroundColor: bg }} className="px-6 py-10">
      {data.show_heading !== false && (
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{data.heading || 'What customers say'}</h2>
      )}
      {quotes.length === 0 ? (
        <p className="text-sm text-gray-400">Add your first quote below</p>
      ) : (
        <div className={`grid grid-cols-1 gap-4 ${colsClass}`}>
          {quotes.map((q) => (
            <div key={q.id} className="rounded-md border border-gray-200 bg-white p-4">
              <p style={{ color: STAR_COLOR }} className="mb-2 text-sm">
                {'★'.repeat(Number(q.star_rating ?? 5))}
              </p>
              <p className="mb-2 text-sm text-gray-700">"{q.quote || 'Great experience!'}"</p>
              <p className="text-xs font-medium text-gray-500">{q.reviewer_name || 'Happy customer'}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(TestimonialsRenderer);
