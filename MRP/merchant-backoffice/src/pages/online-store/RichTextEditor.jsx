import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Image } from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Code,
  ChevronDown,
} from 'lucide-react';

const PARAGRAPH_STYLES = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
];

const TEXT_COLORS = ['#282828', '#DA1E28', '#F1820C', '#0E8A00', '#006BFF', '#8A3FFC'];

function ToolbarButton({ active, disabled, title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : active
          ? 'bg-[#E6F0FF] text-[#006BFF]'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function ParagraphStyleDropdown({ editor }) {
  const [open, setOpen] = useState(false);
  if (!editor) return null;

  const current =
    PARAGRAPH_STYLES.find((s) => s.value !== 'paragraph' && editor.isActive('heading', { level: Number(s.value[1]) }))
      ?.label ?? 'Paragraph';

  const applyStyle = (value) => {
    if (value === 'paragraph') editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: Number(value[1]) }).run();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className="h-8 px-2.5 flex items-center gap-1 rounded-md text-sm text-gray-700 hover:bg-gray-100 border border-transparent"
      >
        {current}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 min-w-[140px] bg-white border border-gray-200 rounded-md shadow-lg py-1">
          {PARAGRAPH_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyStyle(s.value)}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorPicker({ editor }) {
  const [open, setOpen] = useState(false);
  if (!editor) return null;
  return (
    <div className="relative">
      <ToolbarButton title="Text color" onClick={() => setOpen((o) => !o)}>
        <Palette size={16} />
      </ToolbarButton>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 flex gap-1.5 bg-white border border-gray-200 rounded-md shadow-lg p-2">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().setColor(color).run();
                setOpen(false);
              }}
              className="w-6 h-6 rounded-full border border-gray-200"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * @component RichTextEditor
 * @description Tiptap-based WYSIWYG editor for the Page editor screen's
 * Content field, styled to match the Shopify mockup's rounded toolbar row.
 * Video/table insertion don't have dedicated extensions installed (kept out
 * of the dependency budget) — their toolbar buttons are visually present but
 * disabled with a "Coming soon" title, per plan.
 */
export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      // StarterKit already bundles Link and Underline — disable its copies so
      // the explicitly-configured ones below (openOnClick/autolink options)
      // don't collide with them (duplicate extension names crash the editor).
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false }),
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[220px] px-4 py-3 outline-none',
        'data-placeholder': placeholder || '',
      },
    },
    onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
  });

  // Keep the editor in sync when `value` is replaced from outside (e.g. a
  // fresh page load) without fighting the user's own typing.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && (value || '') !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', previous || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const insertImage = () => {
    if (!editor) return;
    const url = window.prompt('Image URL');
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-2 py-1.5 bg-gray-50">
        <ParagraphStyleDropdown editor={editor} />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton
          title="Bold"
          active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ColorPicker editor={editor} />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton
          title="Align left"
          active={editor?.isActive({ textAlign: 'left' })}
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          active={editor?.isActive({ textAlign: 'center' })}
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          active={editor?.isActive({ textAlign: 'right' })}
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Justify"
          active={editor?.isActive({ textAlign: 'justify' })}
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustify size={16} />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton title="Link" active={editor?.isActive('link')} onClick={setLink}>
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Image" onClick={insertImage}>
          <ImageIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Video — coming soon" disabled>
          <Video size={16} />
        </ToolbarButton>
        <ToolbarButton title="Table — coming soon" disabled>
          <TableIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          active={editor?.isActive('codeBlock')}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <Code size={16} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
