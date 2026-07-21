import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';

// TODO(security): sanitize `data.content` (e.g. via sanitize-html) before
// this renders on the public storefront — react-simple-wysiwyg's own docs
// call this out as the consumer's responsibility. Low risk in the builder
// itself (only the merchant authoring their own content sees it), but a
// real XSS vector once shoppers load the published page.
function RichTextRenderer({ data, theme }) {
  const bg = resolveColor(data.background_color, theme.colors);
  const text = resolveColor(data.text_color, theme.colors);
  const width = data.content_width ?? '680';

  return (
    <div style={{ backgroundColor: bg, color: text, textAlign: data.text_alignment ?? 'left' }} className="px-6 py-10">
      <div
        style={{ maxWidth: `${width}px`, margin: data.text_alignment === 'center' ? '0 auto' : undefined }}
        className="prose prose-sm"
        dangerouslySetInnerHTML={{ __html: data.content || '<p>Add content to this section.</p>' }}
      />
    </div>
  );
}

export default memo(RichTextRenderer);
