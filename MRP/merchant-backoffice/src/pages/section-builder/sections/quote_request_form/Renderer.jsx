import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import EditableText from '../../ui/EditableText';

// Demo-only: this is a presentational, static preview of a quote-request
// form — there's no real submission backend, so every field below just
// looks like a control (disabled inputs/textarea) rather than functioning.
function QuoteRequestFormRenderer({ data, theme, onEdit }) {
  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText
          as="h2"
          className="mb-2 text-2xl font-bold"
          value={data.heading}
          placeholder="Request a Quote"
          onCommit={(v) => onEdit('heading', v)}
        />
      ) : (
        <h2 className="mb-2 text-2xl font-bold">{data.heading || 'Request a Quote'}</h2>
      )}
      {onEdit ? (
        <EditableText
          as="p"
          multiline
          className="mb-6 text-sm opacity-80"
          value={data.subtext}
          placeholder="Need a custom tailored clothing for special events? Just let us know what you need!"
          onCommit={(v) => onEdit('subtext', v)}
        />
      ) : (
        <p className="mb-6 text-sm opacity-80">{data.subtext || 'Need a custom tailored clothing for special events? Just let us know what you need!'}</p>
      )}

      <div className="flex max-w-md flex-col gap-3">
        <input type="text" disabled placeholder="Name" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="email" disabled placeholder="Email" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <input type="tel" disabled placeholder="Phone" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <textarea disabled placeholder="Message" rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        <span
          style={themedButtonStyle(theme.buttons, { primary: resolveColor({ slot: 'primary' }, theme.colors), primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) })}
          className="w-fit"
        >
          {onEdit ? (
            <EditableText value={data.button_label} placeholder="Request a Quote" onCommit={(v) => onEdit('button_label', v)} />
          ) : (
            data.button_label || 'Request a Quote'
          )}
        </span>
      </div>
    </section>
  );
}

export default memo(QuoteRequestFormRenderer);
