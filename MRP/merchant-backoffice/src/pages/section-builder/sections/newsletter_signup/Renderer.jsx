import { memo } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';

// TODO(backend): submission/validation/rate-limiting/customer-list storage
// (US-9.1's AC) needs a real endpoint — this renders the form only.
function NewsletterSignupRenderer({ data, theme }) {
  const bg = resolveColor(data.background_color, theme.colors);
  const text = resolveColor(data.text_color, theme.colors);
  const isSplit = data.layout_style === 'split';

  return (
    <section style={{ backgroundColor: bg, color: text }} className={`px-6 py-10 ${isSplit ? '' : 'text-center'}`}>
      <div className={isSplit ? 'flex items-center justify-between gap-6' : 'mx-auto max-w-md'}>
        <div>
          <h2 className="text-xl font-semibold">{data.heading || 'Join our newsletter'}</h2>
          {data.subtext && <p className="mt-1 text-sm opacity-90">{data.subtext}</p>}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            disabled
            placeholder="your@email.com"
            className="flex-1 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm placeholder:text-current/60"
          />
          <span style={themedButtonStyle(theme.buttons, { primary: '#ffffff', primaryText: bg })}>
            {data.button_label || 'Subscribe'}
          </span>
        </div>
        {data.show_disclaimer !== false && (
          <p className="mt-2 text-xs opacity-70">{data.disclaimer_text || 'No spam. Unsubscribe anytime.'}</p>
        )}
      </div>
    </section>
  );
}

export default memo(NewsletterSignupRenderer);
