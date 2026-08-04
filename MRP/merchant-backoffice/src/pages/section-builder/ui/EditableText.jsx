import { useEffect, useRef } from 'react';

/**
 * Inline, on-canvas text editing (Shopify-style "edit directly in the
 * content"). Renders a contentEditable element that mirrors `value` and
 * commits back through `onCommit` on blur / Enter. Escape reverts.
 *
 * Renderers opt in by rendering this instead of a plain text node whenever
 * they receive an `onEdit` callback (i.e. in builder mode). The commit is
 * debounced upstream by the field coalescer, so typing produces a single
 * undo entry — the same path used by the settings panel inputs.
 */
export default function EditableText({
  value,
  onCommit,
  as = 'span',
  className = '',
  style,
  placeholder = '',
  multiline = false,
}) {
  const ref = useRef(null);
  const Tag = as;

  // Keep the DOM text in sync when the value changes from the outside
  // (undo/redo, settings panel edits) without clobbering the caret while
  // the user is actively typing in this node.
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== (value ?? '')) {
      el.innerText = value ?? '';
    }
  }, [value]);

  const commit = () => {
    const next = ref.current?.innerText ?? '';
    if (next !== (value ?? '')) onCommit(next);
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder || undefined}
      data-sb-placeholder={placeholder || undefined}
      spellCheck={false}
      // Don't let a click that lands text-editing bubble up to section
      // select / canvas deselect.
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (ref.current) ref.current.innerText = value ?? '';
          ref.current?.blur();
        } else if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          ref.current?.blur();
        }
      }}
      className={'sb-editable ' + className}
      style={style}
    >
      {value ?? ''}
    </Tag>
  );
}
