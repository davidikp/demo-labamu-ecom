import { resolveSectionScheme } from '../sections/shared/sectionChrome';

/**
 * Wraps every section Renderer's output (Canvas.jsx, SectionPickerModal.jsx)
 * to apply the shared chrome fields — color scheme, padding, full-width —
 * centrally, so individual Renderer.jsx files don't each reimplement it.
 *
 * `data.full_width` defaults to `true` (not the schema's own default of
 * `false`) when the key is altogether absent, so sections that haven't merged
 * SECTION_CHROME_FIELDS into their schema yet keep rendering edge-to-edge
 * exactly as before instead of suddenly gaining an unrequested max-width.
 */
export default function SectionShell({ data = {}, theme, children }) {
  const scheme = resolveSectionScheme(data.color_scheme, theme?.colors);
  const paddingTop = data.padding_top ?? 0;
  const paddingBottom = data.padding_bottom ?? 0;
  const fullWidth = data.full_width ?? true;

  return (
    <div
      style={{
        backgroundColor: scheme.background,
        color: scheme.text,
        paddingTop: paddingTop || undefined,
        paddingBottom: paddingBottom || undefined,
      }}
    >
      <div className={fullWidth ? 'w-full' : 'mx-auto w-full max-w-[1200px]'}>{children}</div>
    </div>
  );
}
