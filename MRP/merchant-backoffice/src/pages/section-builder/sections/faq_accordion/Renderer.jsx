import { useState, memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-gray-100 py-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-sm font-medium text-gray-900"
      >
        {item.question || 'Question'}
        <span className="ml-2 text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div
          className="prose prose-sm mt-2 text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: item.answer || '<p>Answer goes here.</p>' }}
        />
      )}
    </div>
  );
}

// TODO(security): sanitize `item.answer` before public rendering — same
// caveat as rich_text/Renderer.jsx.
function FaqAccordionRenderer({ data, theme }) {
  const bg = resolveColor(data.background_color, theme.colors);
  const items = data.faq_items ?? [];
  const [openIds, setOpenIds] = useState(new Set());

  const toggle = (id) =>
    setOpenIds((prev) => {
      const allowMultiple = data.allow_multiple_open;
      const next = allowMultiple ? new Set(prev) : new Set();
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section style={{ backgroundColor: bg }} className="px-6 py-10">
      {data.show_heading !== false && (
        <h2 className="mb-4 text-xl font-semibold text-gray-900">{data.heading || 'Frequently asked questions'}</h2>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Add your first FAQ below</p>
      ) : (
        <div>
          {items.map((item) => (
            <FaqItem key={item.id} item={item} open={openIds.has(item.id)} onToggle={() => toggle(item.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(FaqAccordionRenderer);
