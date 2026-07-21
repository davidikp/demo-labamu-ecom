import { useState } from 'react';
import { getThemePanelGroups } from '../state/themeSchemaAdapter';
import { THEME_PRESETS } from '../sections/themePresets';
import ThemeSchemaField from './fields/ThemeSchemaField';
import ContrastBadge from './fields/ContrastBadge';
import ConfirmDialog from './ConfirmDialog';

function PresetCard({ preset, onApply }) {
  const swatchKeys = ['primary', 'accent', 'background', 'text_primary'];
  return (
    <div
      title={`${preset.typography.heading_font} / ${preset.typography.body_font}`}
      className="rounded-md border border-gray-200 p-2 hover:border-blue-300"
    >
      <div className="mb-2 flex overflow-hidden rounded">
        {swatchKeys.map((key) => (
          <span key={key} style={{ backgroundColor: preset.colors[key] }} className="h-6 flex-1" />
        ))}
      </div>
      <p className="mb-1 text-xs font-medium text-gray-800">{preset.name}</p>
      <button
        type="button"
        onClick={() => onApply(preset)}
        className="w-full rounded-md border border-gray-200 py-1 text-xs text-gray-700 hover:bg-gray-50"
      >
        Apply
      </button>
    </div>
  );
}

function ButtonSample({ buttons }) {
  return (
    <button
      type="button"
      disabled
      style={{
        borderRadius: buttons.corner_radius,
        paddingLeft: buttons.padding_horizontal,
        paddingRight: buttons.padding_horizontal,
        paddingTop: buttons.padding_vertical,
        paddingBottom: buttons.padding_vertical,
        fontWeight: buttons.font_weight,
        textTransform: buttons.text_transform,
        borderWidth: buttons.border_width,
      }}
      className="border border-gray-900 bg-gray-900 text-sm text-white"
    >
      Add to cart
    </button>
  );
}

/**
 * Theme settings panel (Epic 5). Driven directly by
 * theme-settings-schema.json via themeSchemaAdapter — every field renders
 * through the same generic dispatcher, so adding a schema field here needs
 * no new panel code.
 */
export default function ThemePanel({ theme, onFieldChange, onApplyPreset }) {
  const [pendingPreset, setPendingPreset] = useState(null);
  const groups = getThemePanelGroups();

  return (
    <aside className="w-[280px] min-w-[240px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Theme</h2>

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Presets</p>
        <div className="grid grid-cols-2 gap-2">
          {THEME_PRESETS.map((preset) => (
            <PresetCard key={preset.id} preset={preset} onApply={setPendingPreset} />
          ))}
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.key}>
          <hr className="my-4 border-gray-100" />
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.label}</p>
          <div className="space-y-4">
            {Object.entries(group.fields).map(([key, field]) => (
              <div key={key}>
                <ThemeSchemaField
                  field={field}
                  value={theme[group.key]?.[key]}
                  onChange={(value) => onFieldChange(group.key, key, value)}
                />
                {field.contrastCheck && (
                  <ContrastBadge
                    hexA={theme[group.key]?.[key]}
                    hexB={theme[group.key]?.[field.contrastCheck.against]}
                  />
                )}
              </div>
            ))}
            {group.key === 'buttons' && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-700">Sample</p>
                <ButtonSample buttons={theme.buttons} />
              </div>
            )}
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={Boolean(pendingPreset)}
        title={
          pendingPreset &&
          `Apply ${pendingPreset.name}? This will replace your current fonts and colors. Your section content won't change.`
        }
        confirmLabel="Apply"
        onConfirm={() => {
          onApplyPreset(pendingPreset);
          setPendingPreset(null);
        }}
        onCancel={() => setPendingPreset(null)}
      />
    </aside>
  );
}
