import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';

function AnnouncementBarRenderer({ data, theme }) {
  const bg = resolveColor(data.background_color, theme.colors);
  const text = resolveColor(data.text_color, theme.colors);

  return (
    <div
      style={{ backgroundColor: bg, color: text, textAlign: data.text_alignment ?? 'center' }}
      className="px-4 py-2 text-sm"
    >
      {data.message || 'Free shipping on orders over $50'}
      {data.show_link && data.link_label && <span className="ml-2 underline">{data.link_label}</span>}
    </div>
  );
}

export default memo(AnnouncementBarRenderer);
