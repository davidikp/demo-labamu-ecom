import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { labelForType } from '../sections/registry';

/**
 * Sortable sidebar row (US-3.1, US-3.2, US-3.3). Drag handle only shows on
 * hover/focus; mouse + touch dragging come from @dnd-kit/sortable.
 */
export default function SectionListItem({ section, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={
        'group flex items-center gap-2 rounded-md px-2 py-2 text-sm ' +
        (selected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50')
      }
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab touch-none text-gray-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 truncate text-left">
        {labelForType(section.type)}
      </button>
    </li>
  );
}
