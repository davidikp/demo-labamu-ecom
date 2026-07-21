import { labelForType } from '../sections/registry';
import { schemaForType } from '../sections/index';
import SchemaField from './fields/SchemaField';
import ContrastBadge from './fields/ContrastBadge';
import { groupFieldsInOrder, isFieldVisible } from './fields/fieldHelpers';
import { resolveColor } from './fields/colorValue';

/**
 * Right settings panel (US-4.1, US-4.2, US-4.8, US-4.9). Generic — every
 * field type dispatches through SchemaField, so any section's schema (real
 * ones land in Phase 9) plugs in without new panel code.
 */
export default function SettingsPanel({ entity, palette, onFieldChange, mediaLibrary, onAddMedia, onOpenLibrary }) {
  if (!entity) {
    return (
      <aside className="w-[280px] min-w-[240px] shrink-0 border-l border-gray-200 bg-white">
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="text-2xl">🎛️</div>
          <p className="text-sm font-medium text-gray-900">Select a section to edit</p>
          <p className="text-xs text-gray-500">
            Click any section on the canvas or in the sidebar to open its settings
          </p>
        </div>
      </aside>
    );
  }

  const schema = schemaForType(entity.type);
  const data = entity.data ?? {};
  const groups = groupFieldsInOrder(schema);

  return (
    <aside className="w-[280px] min-w-[240px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">{labelForType(entity.type)}</h2>

      {groups.map((groupEntry, groupIndex) => (
        <div key={groupEntry.group}>
          {groupIndex > 0 && <hr className="my-4 border-gray-100" />}
          <div className="space-y-4">
            {groupEntry.fields
              .filter(([, field]) => isFieldVisible(field, data))
              .map(([key, field]) => (
                <div key={key}>
                  <SchemaField
                    field={field}
                    value={data[key]}
                    onChange={(value) => onFieldChange(key, value, field)}
                    palette={palette}
                    mediaLibrary={mediaLibrary}
                    onAddMedia={onAddMedia}
                    onOpenLibrary={onOpenLibrary}
                  />
                  {field.contrastCheck && (
                    <ContrastBadge
                      hexA={resolveColor(data[key], palette)}
                      hexB={resolveColor(data[field.contrastCheck.against], palette)}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
