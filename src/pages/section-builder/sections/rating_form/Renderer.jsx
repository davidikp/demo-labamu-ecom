import { memo } from 'react';
import { Star } from 'lucide-react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import { resolveFormRecipe } from '../shared/formRecipes';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import EditableText from '../../ui/EditableText';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

// Default falls back to the previous hardcoded value (a universally-
// recognised rating color) when a theme doesn't set `colors.rating` — same
// convention as testimonials/Renderer.jsx.
const DEFAULT_STAR_COLOR = '#F59E0B';

// Demo-only: a real rating-submission flow needs a backend endpoint this
// codebase doesn't have yet, so the stars below are a static, unfilled,
// non-interactive preview (no rating has been "selected"), and the button
// doesn't submit anything — true of both layouts below.
function RatingFormRenderer({ data, theme, onEdit, isMobile, breakpoint }) {
  // Called unconditionally (rules-of-hooks) even though only the 'inline'
  // layout below actually needs it.
  const mobile = useResponsiveMobile(isMobile);
  const starColor = theme?.colors?.rating ?? DEFAULT_STAR_COLOR;
  const buttonStyle = themedButtonStyle(theme.buttons, {
    primary: resolveColor({ slot: 'primary' }, theme.colors),
    primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
  });

  const buttonEl = (
    <span style={buttonStyle} className="w-fit">
      {onEdit ? (
        <EditableText value={data.button_label} placeholder="Give Rating" onCommit={(v) => onEdit('button_label', v)} />
      ) : (
        data.button_label || 'Give Rating'
      )}
    </span>
  );

  if (data.layout !== 'inline') {
    // 'stacked' layout — centered column: stars row first, then a plain
    // (not bold-heading-weight) subtitle line, then full-width Name/Message
    // fields and a centered button, matching Xinear's reference exactly
    // (see get_design_context for node 73:33802) rather than the generic
    // left-aligned block this used to render as.
    const stackedHeading = onEdit ? (
      <EditableText
        as="p"
        className="mb-6 max-w-xl text-center text-lg"
        value={data.heading}
        placeholder="Leave us your thoughts on how do you like our products."
        onCommit={(v) => onEdit('heading', v)}
      />
    ) : (
      <p className="mb-6 max-w-xl text-center text-lg">{data.heading || 'Leave us your thoughts on how do you like our products.'}</p>
    );
    return (
      <section className="flex flex-col items-center px-6 text-center">
        <div className="mb-2 flex" style={{ color: starColor }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={20} fill="none" stroke={starColor} />
          ))}
        </div>
        {stackedHeading}
        <div className="flex w-full max-w-2xl flex-col gap-3">
          <input
            type="text"
            disabled
            placeholder={data.name_field_label || 'Name'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            disabled
            placeholder={data.message_field_label || 'Message'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            rows={3}
          />
          <div className="flex justify-center">{buttonEl}</div>
        </div>
      </section>
    );
  }

  const heading = onEdit ? (
    <EditableText
      as="h2"
      className="mb-6 text-2xl font-bold"
      value={data.heading}
      placeholder="Leave us your thoughts on how do you like our products."
      onCommit={(v) => onEdit('heading', v)}
    />
  ) : (
    <h2 className="mb-6 text-2xl font-bold">{data.heading || 'Leave us your thoughts on how do you like our products.'}</h2>
  );

  // 'inline' layout: Name | Review | Rating side by side on desktop,
  // stacking to one column on mobile — that responsive collapse is
  // structural to what "inline" means (any theme opting into it gets the
  // same behavior), while the desktop column ratio/field geometry comes
  // from the theme's recipe (Houzez's golden-reference values, or the
  // generic default for any other theme). The builder/preview canvas
  // simulates each device as a fixed-width frame inside a real (usually
  // wide) browser, so a `md:` Tailwind breakpoint never reflects the
  // selected device there (see useResponsiveMobile.js) — stack on tablet
  // too, driven by the `breakpoint`/`isMobile` props instead of CSS.
  const stacked = mobile || breakpoint === 'tablet';
  const recipe = resolveFormRecipe(theme);
  const fieldStyle = {
    height: `${recipe.field.height}px`,
    borderRadius: `${recipe.field.radius}px`,
    fontSize: `${recipe.field.fontSize}px`,
    borderColor: recipe.field.borderColor,
  };
  const fieldClass = `w-full border px-4 outline-none ${recipe.field.borderColor ? '' : 'border-gray-300'}`;
  const labelStyle = { fontSize: `${recipe.label.fontSize}px`, color: recipe.label.color };
  const labelClass = `mb-1 block ${recipe.label.color ? '' : 'text-gray-600'}`;

  return (
    <StorefrontContainer as="section" theme={theme}>
      {heading}
      <div
        className={`grid gap-4 ${stacked ? 'items-start' : 'items-end'}`}
        style={{ gridTemplateColumns: stacked ? '1fr' : recipe.inlineColumns, gap: `${recipe.inlineGap}px` }}
      >
        <div>
          <label className={labelClass} style={labelStyle}>{data.name_field_label || 'Name'}</label>
          <input type="text" disabled placeholder={data.name_field_label || 'Name'} className={fieldClass} style={fieldStyle} />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>{data.message_field_label || 'Review'}</label>
          <input type="text" disabled placeholder={data.message_field_label || 'Review'} className={fieldClass} style={fieldStyle} />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Rating</label>
          <div className={`flex items-center gap-2 border px-4 ${recipe.field.borderColor ? '' : 'border-gray-300'}`} style={fieldStyle}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={recipe.starSize} fill="none" stroke={starColor} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">{buttonEl}</div>
    </StorefrontContainer>
  );
}

export default memo(RatingFormRenderer);
